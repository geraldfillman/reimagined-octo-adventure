/**
 * gdelt.mjs - GDELT DOC 2.0 article monitor.
 *
 * Usage:
 *   node run.mjs pull gdelt --topic markets
 *   node run.mjs pull gdelt --all --timespan 15min --limit 75
 *   node run.mjs pull gdelt --query "\"Federal Reserve\" OR inflation"
 *   node run.mjs pull gdelt --dry-run
 */

import { join } from 'node:path';

import { getBaseUrl, getPullsDir } from '../lib/config.mjs';
import { sleep } from '../lib/fetcher.mjs';
import { keepEnglishContent } from '../lib/language-filter.mjs';
import { buildNote, buildTable, today, writeNote } from '../lib/markdown.mjs';
import { withRetry, RateLimitError, parseRetryAfter } from '../lib/retry.mjs';

const DEFAULT_TIMESPAN = '15min';
const DEFAULT_LIMIT = 75;
const MAX_RECORDS = 250;
const GDELT_REQUEST_INTERVAL_MS = 30_000;
const GDELT_RETRY_DELAY_MS = 30_000;
const GDELT_MAX_ATTEMPTS = 3;
let lastGdeltRequestAt = 0;

const TOPIC_QUERIES = Object.freeze({
  markets: {
    label: 'Markets',
    query: '"stock market"',
    domainHint: 'market',
  },
  macro: {
    label: 'Macro / Fed',
    query: '"Federal Reserve"',
    domainHint: 'macro',
  },
  credit: {
    label: 'Credit Stress',
    query: '"bank stress"',
    domainHint: 'macro',
  },
  energy: {
    label: 'Energy Shock',
    query: '"oil prices"',
    domainHint: 'energy',
  },
  housing: {
    label: 'Housing',
    query: '"housing market"',
    domainHint: 'housing',
  },
  defense: {
    label: 'Defense / Autonomy',
    query: '"missile defense"',
    domainHint: 'government',
  },
  biotech: {
    label: 'Biotech / FDA',
    query: '"clinical trial"',
    domainHint: 'biotech',
  },
  aipower: {
    label: 'AI Power Infrastructure',
    query: '"AI data center"',
    domainHint: 'market',
  },
  dilution: {
    label: 'Small-Cap Dilution',
    query: '"stock offering"',
    domainHint: 'fundamentals',
  },
});

export async function pull(flags = {}) {
  const timespan = normalizeTimespan(flags.timespan || flags.window || DEFAULT_TIMESPAN);
  const limit = Math.min(MAX_RECORDS, Math.max(1, Number(flags.limit) || DEFAULT_LIMIT));
  const topics = resolveTopics(flags);
  const alertThreshold = Math.max(1, Number(flags['alert-threshold']) || 60);
  const maxAttempts = resolveMaxAttempts(flags['max-attempts']);
  const dryRun = Boolean(flags['dry-run']);
  const englishOnly = !Boolean(flags['all-languages'] || flags.allLanguages);

  if (dryRun) {
    const plan = {
      source: 'GDELT DOC API',
      timespan,
      limit,
      language: englishOnly ? 'english' : 'all',
      topics: topics.map(topic => ({
        id: topic.id,
        label: topic.label,
        query: englishOnly ? appendGdeltEnglishFilter(topic.query) : topic.query,
      })),
      command: `node run.mjs pull gdelt ${flags.all ? '--all ' : ''}--timespan ${timespan} --limit ${limit}`,
    };
    console.log(JSON.stringify(plan, null, 2));
    return { filePath: null, topics: topics.length, dryRun: true };
  }

  console.log(`GDELT: fetching ${topics.length} topic(s), timespan ${timespan}, limit ${limit}...`);

  const results = [];
  for (let index = 0; index < topics.length; index += 1) {
    const topic = topics[index];
    try {
      const articles = await fetchTopic(topic, { timespan, limit, maxAttempts, englishOnly });
      results.push({ ...topic, articles, error: null });
      console.log(`  ${topic.label}: ${articles.length} article(s)`);
    } catch (error) {
      const message = error?.message || String(error);
      results.push({ ...topic, articles: [], error: message });
      console.warn(`  ${topic.label}: fetch failed (${message})`);
    }
    if (topics.length > 1 && index < topics.length - 1) {
      await sleep(750);
    }
  }

  const allArticles = dedupeArticles(results.flatMap(topic => topic.articles.map(article => ({
    ...article,
    topic_id: topic.id,
    topic_label: topic.label,
    domain_hint: topic.domainHint,
  }))));
  const fetchErrors = results.filter(result => result.error);
  const signalStatus = fetchErrors.length && allArticles.length === 0
    ? 'watch'
    : classifySignalStatus(allArticles.length, alertThreshold);
  const signals = buildSignals(results, allArticles, alertThreshold, fetchErrors);
  const note = buildGdeltNote({
    results,
    allArticles,
    timespan,
    limit,
    signalStatus,
    signals,
    alertThreshold,
    fetchErrors,
  });
  const filePath = join(getPullsDir(), 'News', timestampedFilename('GDELT_News_Monitor'));
  writeNote(filePath, note);
  console.log(`Wrote: ${filePath}`);

  const output = {
    filePath,
    topics: results.length,
    articles: allArticles.length,
    signalStatus,
    errors: fetchErrors.length,
  };
  if (flags.json) console.log(JSON.stringify(output, null, 2));
  return output;
}

async function fetchTopic(topic, { timespan, limit, maxAttempts = GDELT_MAX_ATTEMPTS, englishOnly = true }) {
  const url = buildGdeltDocUrl({
    baseUrl: getBaseUrl('gdelt'),
    query: topic.query,
    timespan,
    limit,
    englishOnly,
  });
  const data = await fetchGdeltJson(url, { maxAttempts });
  return normalizeArticles(Array.isArray(data?.articles) ? data.articles : []);
}

export function buildGdeltDocUrl({ baseUrl = getBaseUrl('gdelt'), query, timespan, limit, englishOnly = true }) {
  const params = new URLSearchParams({
    query: englishOnly ? appendGdeltEnglishFilter(query) : query,
    mode: 'artlist',
    format: 'json',
    timespan,
    maxrecords: String(limit),
    sort: 'datedesc',
  });
  return `${baseUrl}?${params.toString()}`;
}

export function appendGdeltEnglishFilter(query) {
  const text = String(query || '').trim();
  if (!text) return 'sourcelang:english';
  if (/\bsourcelang:/i.test(text)) return text;
  return `${text} sourcelang:english`;
}

async function fetchGdeltJson(url, { maxAttempts = GDELT_MAX_ATTEMPTS } = {}) {
  return withRetry(
    async () => {
      await waitForGdeltSlot();
      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), 45_000);
        const response = await fetch(url, {
          headers: { 'User-Agent': 'MyData-Vault/1.0 (GDELT DOC monitor)' },
          signal: controller.signal,
        });
        clearTimeout(timer);

        if (response.status === 429) {
          const body = cleanText(await response.text().catch(() => ''));
          const retryAfterMs = parseRetryAfter(response.headers.get('Retry-After')) ?? GDELT_RETRY_DELAY_MS;
          throw new RateLimitError(retryAfterMs, body || 'GDELT rate limit');
        }

        const text = await response.text();
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${cleanText(text).slice(0, 200)}`);
        }
        try {
          return JSON.parse(text);
        } catch (error) {
          throw new Error(`Invalid JSON from GDELT: ${error.message}; body=${cleanText(text).slice(0, 200)}`);
        }
      } catch (error) {
        if (error?.name === 'AbortError') throw new Error(`Request timed out after 45000ms: ${url}`);
        throw error;
      } finally {
        markGdeltRequestFinished();
      }
    },
    {
      maxAttempts,
      baseDelayMs: GDELT_RETRY_DELAY_MS,
      onRetry: (err, attempt, waitMs) => {
        const wait = Math.round(waitMs / 1000);
        if (err instanceof RateLimitError) {
          console.warn(`  GDELT rate limited (429). Waiting ${wait}s before retry...`);
        } else {
          console.warn(`  GDELT fetch error: ${err.message}. Retry ${attempt}/${maxAttempts - 1} in ${wait}s...`);
        }
      },
    }
  );
}

function resolveMaxAttempts(value) {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isInteger(parsed) || parsed <= 0) return GDELT_MAX_ATTEMPTS;
  return Math.min(parsed, GDELT_MAX_ATTEMPTS);
}

export const resolveGdeltMaxAttemptsForTest = resolveMaxAttempts;

async function waitForGdeltSlot() {
  const elapsed = Date.now() - lastGdeltRequestAt;
  if (lastGdeltRequestAt && elapsed < GDELT_REQUEST_INTERVAL_MS) {
    await sleep(GDELT_REQUEST_INTERVAL_MS - elapsed);
  }
}

function markGdeltRequestFinished() {
  lastGdeltRequestAt = Date.now();
}

function buildGdeltNote({ results, allArticles, timespan, limit, signalStatus, signals, alertThreshold, fetchErrors }) {
  const topicRows = results.map(topic => [
    topic.label,
    String(topic.articles.length),
    topDomain(topic.articles),
    latestSeen(topic.articles),
    topic.error || '',
    topic.query,
  ]);

  const articleRows = allArticles.slice(0, 80).map(article => [
    article.seen_at,
    article.topic_label,
    article.domain || 'N/A',
    article.sourcecountry || 'N/A',
    article.language || 'N/A',
    markdownLink(article.title || 'Untitled', article.url),
  ]);

  return buildNote({
    frontmatter: {
      title: `GDELT News Monitor (${timespan})`,
      source: 'GDELT DOC API',
      date_pulled: today(),
      domain: 'news',
      data_type: 'gdelt_news_monitor',
      frequency: '15min',
      signal_status: signalStatus,
      signals,
      timespan,
      topic_count: results.length,
      article_count: allArticles.length,
      fetch_error_count: fetchErrors.length,
      alert_threshold: alertThreshold,
      tags: ['news', 'gdelt', 'event-monitor', 'orchestrator-input'],
    },
    sections: [
      {
        heading: 'Topic Summary',
        content: buildTable(['Topic', 'Articles', 'Top Domain', 'Latest Seen', 'Fetch Error', 'Query'], topicRows),
      },
      {
        heading: 'Latest Articles',
        content: articleRows.length
          ? buildTable(['Seen', 'Topic', 'Domain', 'Country', 'Lang', 'Article'], articleRows)
          : '_No GDELT articles matched the configured topics in this interval._',
      },
      {
        heading: 'Monitor Use',
        content: [
          '- Treat this as a news radar input, not a verified signal by itself.',
          '- Promote an item only when it connects to a thesis, catalyst, filing, macro event, or repeated source cluster.',
          '- Pair fast headlines with slower evidence: SEC filings, FRED/Fed reports, company releases, and thesis notes.',
          '- The 15-minute loop should write small interval notes; the Streamline Report then decides what deserves review.',
        ].join('\n'),
      },
      {
        heading: 'Source',
        content: [
          '- **API**: GDELT DOC 2.0 API, Article List mode',
          `- **Timespan**: ${timespan}`,
          `- **Max records per topic**: ${limit}`,
          `- **Fetch errors**: ${fetchErrors.length}`,
          '- **Official docs**: https://blog.gdeltproject.org/gdelt-doc-2-0-api-debuts/',
          `- **Auto-pulled**: ${today()}`,
        ].join('\n'),
      },
    ],
  });
}

export function resolveTopics(flags) {
  if (flags.query) {
    return [{
      id: slugify(flags.topic || 'custom'),
      label: String(flags.topic || 'Custom Query'),
      query: String(flags.query),
      domainHint: 'news',
    }];
  }

  if (flags.all) {
    return Object.entries(TOPIC_QUERIES).map(([id, topic]) => ({ id, ...topic }));
  }

  const csv = flags.topics || flags.topic;
  if (csv) {
    return String(csv)
      .split(',')
      .map(item => item.trim().toLowerCase())
      .filter(Boolean)
      .map(id => {
        const topic = TOPIC_QUERIES[id];
        if (topic) return { id, ...topic };
        return { id: slugify(id), label: titleCase(id), query: id, domainHint: 'news' };
      });
  }

  return [{ id: 'markets', ...TOPIC_QUERIES.markets }];
}

function normalizeArticles(articles) {
  return articles.map(article => ({
    url: String(article.url || article.url_mobile || '').trim(),
    title: cleanText(article.title || 'Untitled'),
    seen_at: normalizeSeenDate(article.seendate),
    raw_seendate: article.seendate || '',
    domain: String(article.domain || '').trim(),
    language: String(article.language || '').trim(),
    sourcecountry: String(article.sourcecountry || '').trim(),
    socialimage: String(article.socialimage || '').trim(),
  }))
    .filter(article => article.url || article.title)
    .filter(article => keepEnglishContent(article, {
      languageFields: ['language'],
      textFields: ['title'],
    }));
}

export const normalizeGdeltArticlesForTest = normalizeArticles;

function dedupeArticles(articles) {
  const seen = new Set();
  const out = [];
  for (const article of articles) {
    const key = article.url || `${article.title}|${article.domain}|${article.raw_seendate}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(article);
  }
  return out.sort((left, right) =>
    String(right.raw_seendate || '').localeCompare(String(left.raw_seendate || '')) ||
    String(left.topic_label || '').localeCompare(String(right.topic_label || ''))
  );
}

function classifySignalStatus(articleCount, alertThreshold) {
  if (articleCount >= alertThreshold) return 'alert';
  if (articleCount > 0) return 'watch';
  return 'clear';
}

function buildSignals(results, allArticles, alertThreshold, fetchErrors = []) {
  const signals = [];
  if (allArticles.length > 0) signals.push('GDELT_NEWS_HITS');
  if (allArticles.length >= alertThreshold) signals.push('GDELT_NEWS_SURGE');
  if (fetchErrors.length > 0) signals.push('GDELT_FETCH_ERROR');
  for (const result of results) {
    if (result.articles.length > 0) signals.push(`GDELT_TOPIC_${slugify(result.id).toUpperCase()}`);
  }
  return signals.slice(0, 24);
}

export function normalizeTimespan(value) {
  const text = String(value || DEFAULT_TIMESPAN).trim();
  if (/^\d+(min|h|hours|d|days|w|weeks|m|months)$/i.test(text)) return text;
  if (/^\d+$/.test(text)) return `${text}min`;
  return DEFAULT_TIMESPAN;
}

export function getGdeltRetryDelayMs(retryAfter, _attempt = 0) {
  return parseRetryAfter(retryAfter) ?? GDELT_RETRY_DELAY_MS;
}

function normalizeSeenDate(value) {
  const text = String(value || '');
  const match = text.match(/^(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})$/);
  if (match) return `${match[1]}-${match[2]}-${match[3]} ${match[4]}:${match[5]} UTC`;
  return text || 'N/A';
}

function latestSeen(articles) {
  return normalizeSeenDate([...articles].sort((a, b) =>
    String(b.raw_seendate || '').localeCompare(String(a.raw_seendate || ''))
  )[0]?.raw_seendate);
}

function topDomain(articles) {
  const counts = new Map();
  for (const article of articles) {
    if (!article.domain) continue;
    counts.set(article.domain, (counts.get(article.domain) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
}

function timestampedFilename(name) {
  const now = new Date();
  const hh = String(now.getHours()).padStart(2, '0');
  const mm = String(now.getMinutes()).padStart(2, '0');
  return `${today()}_${hh}${mm}_${sanitizeFilename(name)}.md`;
}

function markdownLink(label, url) {
  if (!url) return cleanText(label);
  return `[${cleanText(label).replace(/\]/g, ')')}](${url})`;
}

function cleanText(value) {
  return String(value || '').replace(/\s+/g, ' ').trim();
}

function sanitizeFilename(value) {
  return String(value)
    .replace(/[<>:"/\\|?*]+/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '');
}

function slugify(value) {
  return sanitizeFilename(value).toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'topic';
}

function titleCase(value) {
  return String(value).replace(/[-_]+/g, ' ').replace(/\b\w/g, char => char.toUpperCase());
}
