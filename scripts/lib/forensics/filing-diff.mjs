import { EDGAR_USER_AGENT, fetchRecentFilings, fetchTickerMap } from '../edgar.mjs';

const SECTION_PATTERNS = Object.freeze({
  riskFactors: {
    label: 'Risk Factors',
    start: /item\s+1a\.?\s+risk\s+factors/i,
    end: /item\s+1b\.?|item\s+2\.?/i,
  },
  mda: {
    label: 'MD&A',
    start: /item\s+7\.?\s+management'?s\s+discussion\s+and\s+analysis/i,
    end: /item\s+7a\.?|item\s+8\.?/i,
  },
});

export async function diffLatestAnnualFilingSections(symbol, { sections = ['riskFactors', 'mda'] } = {}) {
  const tickerMap = await fetchTickerMap();
  const entry = tickerMap.get(String(symbol).toUpperCase());
  if (!entry?.cik) throw new Error(`No SEC CIK found for ${symbol}.`);
  const filings = await fetchRecentFilings(entry.cik, { formTypes: ['10-K', '10-K/A'], limit: 6 });
  const [latest, prior] = filings.filter(filing => filing.primaryDoc).slice(0, 2);
  if (!latest || !prior) throw new Error(`Need two annual filings to diff ${symbol}.`);

  const [latestText, priorText] = await Promise.all([
    fetchFilingDocumentText(entry.cik, latest),
    fetchFilingDocumentText(entry.cik, prior),
  ]);

  const diffs = sections.map(sectionId => {
    const definition = SECTION_PATTERNS[sectionId];
    const currentSection = extractSection(latestText, definition);
    const priorSection = extractSection(priorText, definition);
    return buildDeterministicSectionDiff({
      sectionId,
      label: definition.label,
      currentText: currentSection,
      priorText: priorSection,
    });
  });

  return {
    symbol: String(symbol).toUpperCase(),
    latestFiling: filingSummary(entry.cik, latest),
    priorFiling: filingSummary(entry.cik, prior),
    llmStatus: process.env.ANTHROPIC_API_KEY ? 'not_configured_in_v1' : 'skipped_no_model_key',
    diffs,
  };
}

export function extractSection(documentText, definition) {
  const normalized = normalizeFilingText(documentText);
  const start = normalized.search(definition.start);
  if (start < 0) return '';
  const tail = normalized.slice(start);
  const endMatch = tail.slice(50).search(definition.end);
  const section = endMatch >= 0 ? tail.slice(0, endMatch + 50) : tail;
  return section.slice(0, 80_000).trim();
}

export function buildDeterministicSectionDiff({ sectionId, label, currentText, priorText }) {
  const currentSentences = sentenceSet(currentText);
  const priorSentences = sentenceSet(priorText);
  const added = [...currentSentences].filter(sentence => !priorSentences.has(sentence)).slice(0, 8);
  const removed = [...priorSentences].filter(sentence => !currentSentences.has(sentence)).slice(0, 8);
  return {
    sectionId,
    label,
    currentAvailable: currentSentences.size > 0,
    priorAvailable: priorSentences.size > 0,
    added,
    removed,
    changedRiskProfile: added.length + removed.length >= 5 ? 'review' : 'no-obvious-change',
  };
}

function sentenceSet(text) {
  return new Set(
    String(text || '')
      .split(/(?<=[.!?])\s+/)
      .map(sentence => sentence.replace(/\s+/g, ' ').trim())
      .filter(sentence => sentence.length >= 80 && sentence.length <= 600),
  );
}

function normalizeFilingText(text) {
  return String(text || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/\s+/g, ' ');
}

async function fetchFilingDocumentText(cik, filing) {
  const accession = filing.accession || String(filing.accessionRaw || '').replace(/-/g, '');
  const cleanCik = String(Number(cik));
  const url = `https://www.sec.gov/Archives/edgar/data/${cleanCik}/${accession}/${filing.primaryDoc}`;
  const response = await fetch(url, {
    headers: {
      'User-Agent': EDGAR_USER_AGENT,
      Accept: 'text/html,text/plain,application/xhtml+xml',
    },
  });
  if (!response.ok) throw new Error(`SEC filing fetch failed ${response.status} for ${url}`);
  return response.text();
}

function filingSummary(cik, filing) {
  const accession = filing.accession || String(filing.accessionRaw || '').replace(/-/g, '');
  const cleanCik = String(Number(cik));
  return {
    formType: filing.formType,
    filingDate: filing.filingDate,
    accession: filing.accessionRaw || accession,
    primaryDoc: filing.primaryDoc,
    url: `https://www.sec.gov/Archives/edgar/data/${cleanCik}/${accession}/${filing.primaryDoc}`,
  };
}
