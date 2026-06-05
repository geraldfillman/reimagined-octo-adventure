import assert from 'node:assert/strict';
import { buildSourceWatchNote, classifySignalStatus, dedupePosts, filterEnglishPosts } from '../pullers/source-watch.mjs';

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

runTest('dedupes posts by normalized URL', () => {
  const posts = dedupePosts([
    { url: 'https://example.com/a?utm_source=x', title: 'A' },
    { url: 'https://example.com/a', title: 'A duplicate' },
  ]);
  assert.equal(posts.length, 1);
});

runTest('classifies watch when new posts exist', () => {
  assert.equal(classifySignalStatus([]), 'clear');
  assert.equal(classifySignalStatus([{ title: 'New post' }]), 'watch');
});

runTest('filters source-watch posts to likely English content', () => {
  const posts = filterEnglishPosts([
    { title: 'Federal Reserve keeps rates unchanged', summary: 'Markets watch the policy path.' },
    { title: 'El banco central sube las tasas de interes', summary: 'Informe de politica monetaria.' },
  ]);

  assert.deepEqual(posts.map(post => post.title), ['Federal Reserve keeps rates unchanged']);
});

runTest('builds a freshness-compatible pull note', () => {
  const note = buildSourceWatchNote({
    posts: [{ source: 'Carbon Brief', sourceId: 'carbon-brief', title: 'Climate update', url: 'https://example.com/climate', publishedAt: '2026-05-06', category: 'energy_transition', sourceUrl: 'https://www.carbonbrief.org' }],
    statuses: [{ source: 'Carbon Brief', status: 'ok', feedUrl: 'https://example.com/feed', postCount: 1 }],
    options: { lookbackDays: 7 },
  });
  assert.match(note, /type: "pull_note"/);
  assert.match(note, /source: "Source Watch"/);
  assert.match(note, /data_type: "updated_posts"/);
  assert.match(note, /\[Climate update\]\(https:\/\/example.com\/climate\)/);
});
