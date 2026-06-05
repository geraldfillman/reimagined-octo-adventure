import assert from 'node:assert/strict';

import { getBaseUrl, getPullsDir, getSourceName, listSources } from '../lib/config.mjs';
import {
  buildFmpStableEndpointUrl,
  filterEnglishFmpNewsArticles,
  normalizeFmpMarketMover,
  normalizeFmpNewsArticle,
} from '../pullers/fmp.mjs';
import {
  buildAlphaVantageUrl,
  filterEnglishAlphaNewsItems,
  normalizeAlphaMover,
  normalizeAlphaNewsItem,
} from '../pullers/alpha-vantage.mjs';

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

runTest('registers Alpha Vantage in the API source registry', () => {
  assert.equal(getSourceName('alphavantage'), 'Alpha Vantage');
  assert.equal(getBaseUrl('alphavantage'), 'https://www.alphavantage.co/query');
  assert.equal(listSources().some(source => source.id === 'alphavantage' && source.requiresKey), true);
});

runTest('keeps raw pull output rooted in My_Data', () => {
  assert.match(getPullsDir().replace(/\\/g, '/'), /My_Data\/05_Data_Pulls$/);
});

runTest('builds FMP stable endpoint URLs', () => {
  const url = buildFmpStableEndpointUrl('https://financialmodelingprep.com/stable', 'news/general-latest', {
    page: 0,
    limit: 5,
  }, 'abc123');
  const parsed = new URL(url);
  assert.equal(parsed.pathname, '/stable/news/general-latest');
  assert.equal(parsed.searchParams.get('limit'), '5');
  assert.equal(parsed.searchParams.get('apikey'), 'abc123');
});

runTest('normalizes FMP market movers and general news rows', () => {
  const mover = normalizeFmpMarketMover({
    symbol: 'ABC',
    price: '12.50',
    changesPercentage: '25.5',
    volume: '12345',
  });
  assert.equal(mover.symbol, 'ABC');
  assert.equal(mover.price, 12.5);
  assert.equal(mover.changesPercentage, 25.5);
  assert.equal(mover.volume, 12345);

  const article = normalizeFmpNewsArticle({
    publishedDate: '2026-05-06 09:30:00',
    site: 'Example',
    title: 'Headline',
    url: 'https://example.com',
  });
  assert.equal(article.date, '2026-05-06');
  assert.equal(article.source, 'Example');
});

runTest('filters FMP news articles to likely English content', () => {
  const articles = filterEnglishFmpNewsArticles([
    { title: 'Federal Reserve keeps rates unchanged', source: 'Example' },
    { title: 'El banco central sube las tasas de interes', source: 'Example' },
  ]);

  assert.deepEqual(articles.map(article => article.title), ['Federal Reserve keeps rates unchanged']);
});

runTest('builds Alpha Vantage URLs and normalizes sidecar rows', () => {
  const url = buildAlphaVantageUrl('https://www.alphavantage.co/query', {
    function: 'NEWS_SENTIMENT',
    tickers: 'SPY',
    limit: 10,
  }, 'abc123');
  const parsed = new URL(url);
  assert.equal(parsed.searchParams.get('function'), 'NEWS_SENTIMENT');
  assert.equal(parsed.searchParams.get('tickers'), 'SPY');
  assert.equal(parsed.searchParams.get('apikey'), 'abc123');

  const news = normalizeAlphaNewsItem({
    time_published: '20260506T093000',
    source: 'Example',
    title: 'Alpha headline',
    overall_sentiment_score: '-0.25',
    overall_sentiment_label: 'Bearish',
  });
  assert.equal(news.date, '20260506');
  assert.equal(news.overallSentimentScore, -0.25);

  const mover = normalizeAlphaMover({
    ticker: 'XYZ',
    price: '10.00',
    change_percentage: '12.5%',
    volume: '5000',
  });
  assert.equal(mover.symbol, 'XYZ');
  assert.equal(mover.changePercentage, 12.5);
});

runTest('filters Alpha Vantage news items to likely English content', () => {
  const articles = filterEnglishAlphaNewsItems([
    { title: 'Federal Reserve keeps rates unchanged', source: 'Example' },
    { title: 'El banco central sube las tasas de interes', source: 'Example' },
  ]);

  assert.deepEqual(articles.map(article => article.title), ['Federal Reserve keeps rates unchanged']);
});
