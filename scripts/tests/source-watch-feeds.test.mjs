import assert from 'node:assert/strict';
import { isLikelyFeedUrl, normalizePostUrl, parseFeedItems } from '../lib/source-watch-feeds.mjs';

function runTest(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (error) {
    console.error(`not ok - ${name}`);
    console.error(error);
    process.exitCode = 1;
  }
}

runTest('parses RSS items into normalized posts', () => {
  const rss = `<?xml version="1.0"?><rss><channel><item><title>Grid update</title><link>https://example.com/grid?utm_source=x</link><pubDate>Wed, 06 May 2026 12:00:00 GMT</pubDate><description>Short summary</description></item></channel></rss>`;
  const posts = parseFeedItems(rss, { id: 'example', source: 'Example Source', url: 'https://example.com' });
  assert.equal(posts.length, 1);
  assert.equal(posts[0].title, 'Grid update');
  assert.equal(posts[0].url, 'https://example.com/grid');
  assert.equal(posts[0].publishedAt.slice(0, 10), '2026-05-06');
});

runTest('parses Atom entries into normalized posts', () => {
  const atom = `<?xml version="1.0"?><feed><entry><title>Macro note</title><link href="https://example.org/macro"/><updated>2026-05-06T09:00:00Z</updated><summary>Summary text</summary></entry></feed>`;
  const posts = parseFeedItems(atom, { id: 'example-org', source: 'Example Org', url: 'https://example.org' });
  assert.equal(posts[0].url, 'https://example.org/macro');
  assert.equal(posts[0].summary, 'Summary text');
});

runTest('recognizes likely feed URLs and strips tracking parameters', () => {
  assert.equal(isLikelyFeedUrl('https://example.com/feed.xml'), true);
  assert.equal(normalizePostUrl('https://example.com/a?utm_campaign=x&id=1'), 'https://example.com/a?id=1');
});
