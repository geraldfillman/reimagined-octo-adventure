const COMMON_FEED_PATHS = [
  '/feed',
  '/feed/',
  '/rss',
  '/rss.xml',
  '/atom.xml',
  '/blog/feed',
  '/insights/feed',
  '/latest-insights/feed',
];

export async function discoverFeedUrls(source, options = {}) {
  const candidates = [];
  if (source.feedUrl) candidates.push(resolveUrl(source.feedUrl, source.url));
  if (isLikelyFeedUrl(source.url)) candidates.push(source.url);

  try {
    const html = await fetchText(source.url, { timeoutMs: options.timeoutMs || 8000, accept: 'text/html,application/xhtml+xml' });
    candidates.push(...extractAlternateFeeds(html, source.url));
  } catch {
    // Homepage discovery is best effort; common feed paths still get tried.
  }

  for (const path of COMMON_FEED_PATHS) {
    candidates.push(resolveUrl(path, source.url));
  }
  return unique(candidates).slice(0, options.maxCandidates || 10);
}

export async function fetchFeed(feedUrl, options = {}) {
  const text = await fetchText(feedUrl, {
    timeoutMs: options.timeoutMs || 12000,
    accept: 'application/rss+xml,application/atom+xml,application/xml,text/xml,*/*',
  });
  if (!looksLikeFeed(text)) {
    throw new Error(`Response is not RSS/Atom: ${feedUrl}`);
  }
  return text;
}

export function parseFeedItems(xmlText, source = {}) {
  const text = String(xmlText || '');
  const rssItems = splitBlocks(text, 'item').map(block => parseRssItem(block, source));
  const atomItems = splitBlocks(text, 'entry').map(block => parseAtomEntry(block, source));
  return [...rssItems, ...atomItems]
    .filter(post => post.title || post.url)
    .map(post => ({ ...post, url: normalizePostUrl(post.url) }));
}

export function normalizePostUrl(url) {
  if (!url) return '';
  try {
    const parsed = new URL(String(url).trim());
    for (const key of [...parsed.searchParams.keys()]) {
      if (/^utm_/i.test(key) || ['fbclid', 'gclid', 'mc_cid', 'mc_eid'].includes(key.toLowerCase())) {
        parsed.searchParams.delete(key);
      }
    }
    parsed.hash = '';
    return parsed.toString().replace(/\?$/, '');
  } catch {
    return String(url || '').trim();
  }
}

export function isLikelyFeedUrl(url) {
  return /(?:feed|rss|atom)(?:\.xml)?\/?(?:\?|$)/i.test(String(url || ''));
}

export function filterRecentPosts(posts, options = {}) {
  const lookbackDays = Math.max(1, Number(options.lookbackDays) || 90);
  const now = options.now ? new Date(options.now) : new Date();
  const cutoff = now.getTime() - lookbackDays * 24 * 60 * 60 * 1000;
  return posts.filter(post => {
    if (!post.publishedAt) return true;
    const time = Date.parse(post.publishedAt);
    if (!Number.isFinite(time)) return true;
    return time >= cutoff && time <= now.getTime() + 24 * 60 * 60 * 1000;
  });
}

function parseRssItem(block, source) {
  const title = cleanText(extractTag(block, 'title'));
  const url = cleanText(extractTag(block, 'link') || extractTag(block, 'guid'));
  const publishedAt = normalizeDate(extractTag(block, 'pubDate') || extractTag(block, 'dc:date') || extractTag(block, 'updated'));
  const summary = cleanText(stripHtml(extractTag(block, 'description') || extractTag(block, 'content:encoded')));
  return basePost(source, { title, url, publishedAt, summary });
}

function parseAtomEntry(block, source) {
  const title = cleanText(extractTag(block, 'title'));
  const url = extractAtomLink(block) || cleanText(extractTag(block, 'id'));
  const publishedAt = normalizeDate(extractTag(block, 'published') || extractTag(block, 'updated'));
  const summary = cleanText(stripHtml(extractTag(block, 'summary') || extractTag(block, 'content')));
  return basePost(source, { title, url, publishedAt, summary });
}

function basePost(source, post) {
  return {
    sourceId: source.id || source.sourceId || '',
    source: source.source || source.sourceName || '',
    sourceUrl: source.url || source.sourceUrl || '',
    category: source.category || 'general_research',
    focus: Array.isArray(source.focus) ? source.focus.join('; ') : String(source.focus || ''),
    ...post,
  };
}

function extractAlternateFeeds(html, baseUrl) {
  const feeds = [];
  const linkRe = /<link\b[^>]*>/gi;
  const hrefRe = /\bhref\s*=\s*['"]([^'"]+)['"]/i;
  const typeRe = /\btype\s*=\s*['"]([^'"]+)['"]/i;
  const relRe = /\brel\s*=\s*['"]([^'"]+)['"]/i;
  for (const match of html.matchAll(linkRe)) {
    const tag = match[0];
    const href = tag.match(hrefRe)?.[1];
    const type = tag.match(typeRe)?.[1] || '';
    const rel = tag.match(relRe)?.[1] || '';
    if (!href) continue;
    if (/alternate/i.test(rel) && /(rss|atom|xml)/i.test(type)) feeds.push(resolveUrl(href, baseUrl));
  }
  return feeds;
}

async function fetchText(url, options = {}) {
  if (typeof fetch !== 'function') throw new Error('global fetch is not available in this Node runtime');
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs || 12000);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'MyData-SourceWatch/1.0',
        'Accept': options.accept || '*/*',
      },
      signal: controller.signal,
      redirect: 'follow',
    });
    const text = await response.text();
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${url}`);
    return text;
  } catch (error) {
    if (error?.name === 'AbortError') throw new Error(`Request timed out: ${url}`);
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

function splitBlocks(text, tag) {
  const re = new RegExp(`<${escapeRegExp(tag)}\\b[\\s\\S]*?<\\/${escapeRegExp(tag)}>`, 'gi');
  return [...String(text || '').matchAll(re)].map(match => match[0]);
}

function extractTag(block, tag) {
  const re = new RegExp(`<${escapeRegExp(tag)}(?:\\s[^>]*)?>([\\s\\S]*?)<\\/${escapeRegExp(tag)}>`, 'i');
  const value = String(block || '').match(re)?.[1] || '';
  return decodeEntities(stripCdata(value));
}

function extractAtomLink(block) {
  const links = [...String(block || '').matchAll(/<link\b[^>]*>/gi)].map(match => match[0]);
  const hrefRe = /\bhref\s*=\s*['"]([^'"]+)['"]/i;
  const relRe = /\brel\s*=\s*['"]([^'"]+)['"]/i;
  const alternate = links.find(tag => !relRe.test(tag) || /alternate/i.test(tag.match(relRe)?.[1] || ''));
  return alternate?.match(hrefRe)?.[1] || '';
}

function normalizeDate(value) {
  const raw = cleanText(value);
  if (!raw) return '';
  const time = Date.parse(raw);
  return Number.isFinite(time) ? new Date(time).toISOString() : '';
}

function looksLikeFeed(text) {
  return /<(rss|feed|rdf:RDF)\b/i.test(String(text || ''));
}

function resolveUrl(href, base) {
  try { return new URL(href, base).toString(); } catch { return String(href || ''); }
}

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function stripCdata(value) {
  return String(value || '').replace(/^\s*<!\[CDATA\[/, '').replace(/\]\]>\s*$/, '');
}

function stripHtml(value) {
  return String(value || '').replace(/<[^>]+>/g, ' ');
}

function cleanText(value) {
  return decodeEntities(String(value || '').replace(/\s+/g, ' ').trim());
}

function decodeEntities(value) {
  return normalizePunctuation(repairMojibake(String(value || '')
    .replace(/&#x([0-9a-f]+);/gi, (_match, hex) => String.fromCodePoint(Number.parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCodePoint(Number.parseInt(dec, 10)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#39;/g, "'")));
}

function repairMojibake(value) {
  return String(value || '')
    .replace(/\u00e2\u20ac\u2122/g, "'")
    .replace(/\u00e2\u20ac\u02dc/g, "'")
    .replace(/\u00e2\u20ac\u0153/g, '"')
    .replace(/\u00e2\u20ac\u009d/g, '"')
    .replace(/\u00e2\u20ac\u201c/g, '-')
    .replace(/\u00e2\u20ac\u201d/g, '-');
}

function normalizePunctuation(value) {
  return String(value || '')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201c\u201d]/g, '"')
    .replace(/[\u2013\u2014]/g, '-')
    .replace(/\u00a0/g, ' ');
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

