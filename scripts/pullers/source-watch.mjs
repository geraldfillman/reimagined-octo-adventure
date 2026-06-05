import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';

import { getEngineCacheDir, getPullsDir } from '../lib/config.mjs';
import { keepEnglishContent } from '../lib/language-filter.mjs';
import { buildNote, buildTable, dateStampedFilename, today, writeNote } from '../lib/markdown.mjs';
import { loadRegistry, selectSources } from '../lib/source-watch-registry.mjs';
import { discoverFeedUrls, fetchFeed, filterRecentPosts, normalizePostUrl, parseFeedItems } from '../lib/source-watch-feeds.mjs';

const DEFAULT_LOOKBACK_DAYS = 90;
const DEFAULT_CONCURRENCY = 4;

export async function pull(flags = {}) {
  const lookbackDays = resolveLookbackDays(flags);
  const registry = loadRegistry(flags);
  const sources = selectSources(registry, flags);
  const concurrency = Math.max(1, Number.parseInt(flags.concurrency, 10) || DEFAULT_CONCURRENCY);
  const dryRun = Boolean(flags['dry-run']);

  if (dryRun) {
    const output = {
      source: 'Source Watch',
      dryRun: true,
      selectedSources: sources.length,
      lookbackDays,
      includeDisabled: Boolean(flags['include-disabled']),
      sources: sources.map(source => ({ id: source.id, source: source.source, category: source.category, access: source.access })),
    };
    if (flags.json) console.log(JSON.stringify(output, null, 2));
    else console.log(`Source Watch dry run: selected ${sources.length} source(s), lookback ${lookbackDays} days`);
    return output;
  }

  console.log(`Source Watch: selected ${sources.length} source(s), lookback ${lookbackDays} days`);
  const state = loadState();
  const results = await mapLimit(sources, concurrency, source => fetchSource(source, { lookbackDays, timeoutMs: Number(flags['timeout-ms']) || 12000 }));
  const statuses = results.map(result => result.status);
  const fetchedPosts = dedupePosts(results.flatMap(result => result.posts));
  const englishPosts = filterEnglishPosts(fetchedPosts);
  const filteredLanguageCount = fetchedPosts.length - englishPosts.length;
  const recentPosts = filterRecentPosts(englishPosts, { lookbackDays });
  const outputPosts = Boolean(flags.rescan)
    ? recentPosts
    : recentPosts.filter(post => !state.seen_urls[normalizePostUrl(post.url)]);
  const sortedPosts = sortPosts(outputPosts);

  updateState(state, recentPosts);
  saveState(state);

  const note = buildSourceWatchNote({
    posts: sortedPosts,
    statuses,
    options: { lookbackDays },
    filteredLanguageCount,
  });
  const filePath = join(getPullsDir(), 'SourceWatch', dateStampedFilename('Source_Watch_Posts'));
  writeNote(filePath, note);
  console.log(`Wrote: ${filePath}`);

  const output = {
    filePath,
    selectedSources: sources.length,
    fetchedPosts: fetchedPosts.length,
    filteredLanguageCount,
    recentPosts: recentPosts.length,
    newPosts: sortedPosts.length,
    manualReviewCount: statuses.filter(status => status.status !== 'ok').length,
    statuses,
    ...(flags.includePosts ? { posts: sortedPosts } : {}),
  };
  if (flags.json) console.log(JSON.stringify(output, null, 2));
  return output;
}

export function dedupePosts(posts) {
  const seen = new Set();
  const out = [];
  for (const post of posts) {
    const url = normalizePostUrl(post.url);
    const key = url || `${post.source}|${post.title}|${post.publishedAt}`;
    if (!key || seen.has(key)) continue;
    seen.add(key);
    out.push({ ...post, url });
  }
  return out;
}

export function classifySignalStatus(posts) {
  return posts.length > 0 ? 'watch' : 'clear';
}

export function filterEnglishPosts(posts = []) {
  return posts.filter(post => keepEnglishContent(post, {
    textFields: ['title', 'summary'],
  }));
}

export function buildSourceWatchNote({ posts, statuses, options = {}, filteredLanguageCount = 0 }) {
  const lookbackDays = Number(options.lookbackDays) || DEFAULT_LOOKBACK_DAYS;
  const manualReviewCount = statuses.filter(status => status.status !== 'ok').length;
  const postRows = posts.map(post => [
    post.source || '',
    post.sourceId || '',
    post.category || '',
    displayDate(post.publishedAt),
    markdownLink(post.title || post.url || 'Untitled', post.url),
    post.url || '',
    post.sourceUrl || '',
    post.focus || '',
  ]);
  const statusRows = statuses.map(status => [
    status.source || '',
    status.status || 'unknown',
    status.feedUrl || '',
    String(status.postCount ?? 0),
    status.note || '',
  ]);

  return buildNote({
    frontmatter: {
      type: 'pull_note',
      title: 'Source Watch Updated Posts',
      source: 'Source Watch',
      domain: 'source_watch',
      data_type: 'updated_posts',
      date_pulled: today(),
      cadence: 'daily',
      frequency: 'daily',
      signal_status: classifySignalStatus(posts),
      signals: posts.length ? ['SOURCE_WATCH_POSTS'] : [],
      source_count: statuses.length,
      post_count: posts.length,
      manual_review_count: manualReviewCount,
      lookback_days: lookbackDays,
      language_filter: 'english',
      language_filtered_count: filteredLanguageCount,
      tags: ['source-watch', 'my-data-review', 'content-candidate-input'],
    },
    sections: [
      {
        heading: 'Updated Posts',
        content: postRows.length
          ? buildTable(['Source', 'Source ID', 'Category', 'Published', 'Title', 'Link', 'Source URL', 'Focus'], postRows)
          : '_No new source-watch posts found inside the lookback window._',
      },
      {
        heading: 'Source Status',
        content: statusRows.length
          ? buildTable(['Source', 'Status', 'Feed', 'Posts', 'Note'], statusRows)
          : '_No sources selected._',
      },
      {
        heading: 'Use',
        content: [
          '- This is a link-first source-watch pull note.',
          '- Discuss posts in chat after human review before promotion.',
          `- Non-English posts filtered from this run: ${filteredLanguageCount}.`,
          `- Dated posts older than ${lookbackDays} days are excluded from this run.`,
        ].join('\n'),
      },
    ],
  });
}

async function fetchSource(source, options) {
  const status = {
    source: source.source,
    sourceId: source.id,
    status: 'manual_review',
    feedUrl: '',
    postCount: 0,
    note: '',
  };

  if (!source.enabled) {
    status.note = 'disabled or premium source';
    return { status, posts: [] };
  }

  try {
    const feedUrls = await discoverFeedUrls(source, { timeoutMs: options.timeoutMs });
    let lastError = '';
    for (const feedUrl of feedUrls) {
      try {
        const xml = await fetchFeed(feedUrl, { timeoutMs: options.timeoutMs });
        const posts = filterRecentPosts(parseFeedItems(xml, source), { lookbackDays: options.lookbackDays });
        status.status = 'ok';
        status.feedUrl = feedUrl;
        status.postCount = posts.length;
        status.note = posts.length ? 'feed parsed' : 'feed parsed with no recent posts';
        return { status, posts };
      } catch (error) {
        lastError = error?.message || String(error);
      }
    }
    status.status = 'manual_review';
    status.note = lastError || 'no RSS or Atom feed discovered';
    return { status, posts: [] };
  } catch (error) {
    status.status = 'manual_review';
    status.note = error?.message || String(error);
    return { status, posts: [] };
  }
}

function loadState() {
  const path = statePath();
  if (!existsSync(path)) return { schema_version: 1, last_run_at: '', seen_urls: {} };
  try {
    const state = JSON.parse(readFileSync(path, 'utf-8'));
    return { schema_version: 1, last_run_at: state.last_run_at || '', seen_urls: state.seen_urls || {} };
  } catch {
    return { schema_version: 1, last_run_at: '', seen_urls: {} };
  }
}

function saveState(state) {
  const path = statePath();
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(state, null, 2), 'utf-8');
}

function statePath() {
  return join(getEngineCacheDir('source-watch'), 'state.json');
}

function updateState(state, posts) {
  const now = new Date().toISOString();
  state.last_run_at = now;
  for (const post of posts) {
    const url = normalizePostUrl(post.url);
    if (!url) continue;
    const previous = state.seen_urls[url];
    state.seen_urls[url] = {
      source_id: post.sourceId || previous?.source_id || '',
      first_seen_at: previous?.first_seen_at || now,
      last_seen_at: now,
    };
  }
}

function sortPosts(posts) {
  return [...posts].sort((left, right) => {
    const rightTime = Date.parse(right.publishedAt || '') || 0;
    const leftTime = Date.parse(left.publishedAt || '') || 0;
    return rightTime - leftTime || String(left.source).localeCompare(String(right.source));
  });
}

async function mapLimit(items, limit, worker) {
  const results = new Array(items.length);
  let next = 0;
  const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await worker(items[index], index);
      const status = results[index]?.status;
      if (status) console.log(`  ${status.source}: ${status.status} (${status.postCount || 0})`);
    }
  });
  await Promise.all(runners);
  return results;
}

function resolveLookbackDays(flags) {
  return Math.max(1, Number.parseInt(flags['lookback-days'] || flags.lookbackDays, 10) || DEFAULT_LOOKBACK_DAYS);
}

function displayDate(value) {
  if (!value) return 'unknown';
  const time = Date.parse(value);
  return Number.isFinite(time) ? new Date(time).toISOString().slice(0, 10) : 'unknown';
}

function markdownLink(label, url) {
  if (!url) return String(label || 'Untitled');
  return `[${String(label || 'Untitled').replace(/\]/g, '\\]')}](${url})`;
}



