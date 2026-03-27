/**
 * newsapi.mjs — NewsAPI headlines puller
 *
 * Usage:
 *   node run.mjs newsapi --topic "housing market"
 *   node run.mjs newsapi --topic "fed rates"
 *   node run.mjs newsapi --topic "biotech fda"
 */

import { join } from 'path';
import { getApiKey, getPullsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import { buildNote, buildTable, writeNote, today, dateStampedFilename } from '../lib/markdown.mjs';

export async function pull(flags = {}) {
  const apiKey = getApiKey('newsapi');
  const topic = flags.topic || 'economy';
  const pageSize = parseInt(flags.limit) || 15;

  console.log(`📰 NewsAPI: Fetching headlines for "${topic}"...`);

  const q = encodeURIComponent(topic);
  // Free tier: top-headlines only. Map topics to NewsAPI categories.
  // q= search is very narrow on this endpoint, so we use category filters instead.
  const categoryMap = {
    business: 'business', economy: 'business', housing: 'business', market: 'business',
    finance: 'business', stocks: 'business', fed: 'business', rates: 'business',
    tech: 'technology', technology: 'technology', ai: 'technology',
    health: 'health', biotech: 'health', fda: 'health', pharma: 'health',
    science: 'science', energy: 'science', climate: 'science',
    general: 'general',
  };
  const topicKey = topic.toLowerCase().split(/\s+/)[0];
  const category = categoryMap[topicKey] || 'business';
  const url = `https://newsapi.org/v2/top-headlines?category=${category}&pageSize=${pageSize}&country=us&apiKey=${apiKey}`;
  const data = await getJson(url);

  if (data.status !== 'ok') {
    throw new Error(`NewsAPI error: ${data.message || JSON.stringify(data).slice(0, 200)}`);
  }

  const articles = data.articles || [];
  console.log(`  ${articles.length} articles found`);

  // Determine domain from topic
  const topicLower = topic.toLowerCase();
  let domain = 'macro';
  if (topicLower.includes('housing') || topicLower.includes('real estate') || topicLower.includes('mortgage')) domain = 'housing';
  else if (topicLower.includes('biotech') || topicLower.includes('fda') || topicLower.includes('drug')) domain = 'biotech';
  else if (topicLower.includes('energy') || topicLower.includes('oil') || topicLower.includes('solar')) domain = 'energy';
  else if (topicLower.includes('contract') || topicLower.includes('government') || topicLower.includes('federal')) domain = 'government';

  const rows = articles.map(a => {
    const date = a.publishedAt?.slice(0, 10) || 'N/A';
    const source = a.source?.name || 'Unknown';
    const title = (a.title || 'No title').slice(0, 80);
    return [date, source, title];
  });

  articles.slice(0, 5).forEach(a => {
    console.log(`  ${a.publishedAt?.slice(0, 10)}: ${a.source?.name} — ${(a.title || '').slice(0, 60)}`);
  });

  const topicSlug = topic.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '');

  const note = buildNote({
    frontmatter: {
      title: `News: ${topic}`,
      source: 'NewsAPI',
      topic: topic,
      date_pulled: today(),
      domain: domain,
      data_type: 'event_list',
      frequency: 'on-demand',
      signal_status: 'clear',
      signals: [],
      tags: ['news', 'sentiment', topicSlug.toLowerCase(), 'newsapi'],
    },
    sections: [
      {
        heading: `Headlines: "${topic}"`,
        content: buildTable(['Date', 'Source', 'Title'], rows),
      },
      {
        heading: 'Source',
        content: `- **API**: NewsAPI (top-headlines endpoint)\n- **Topic**: "${topic}"\n- **Articles**: ${articles.length}\n- **Country**: us\n- **Auto-pulled**: ${today()}`,
      },
    ],
  });

  const pullDomain = domain.charAt(0).toUpperCase() + domain.slice(1);
  const filePath = join(getPullsDir(), pullDomain, dateStampedFilename(`News_${topicSlug}`));
  writeNote(filePath, note);
  console.log(`📝 Wrote: ${filePath}`);
  return { filePath, signals: [] };
}
