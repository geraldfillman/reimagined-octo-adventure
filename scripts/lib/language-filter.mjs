const ENGLISH_LANGUAGE_VALUES = new Set([
  'en',
  'eng',
  'english',
]);

const ENGLISH_MARKERS = new Set([
  'a',
  'about',
  'after',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'data',
  'fed',
  'for',
  'from',
  'in',
  'inflation',
  'is',
  'market',
  'markets',
  'new',
  'of',
  'on',
  'policy',
  'rates',
  'report',
  'research',
  'risk',
  'says',
  'stress',
  'the',
  'to',
  'unchanged',
  'us',
  'with',
]);

const NON_ENGLISH_MARKERS = new Set([
  'banco',
  'central',
  'de',
  'del',
  'el',
  'en',
  'et',
  'la',
  'las',
  'le',
  'les',
  'los',
  'para',
  'politica',
  'politique',
  'por',
  'que',
  'sobre',
  'tasas',
  'und',
]);

const NON_ENGLISH_DIACRITIC_RE = /[áéíóúñ¿¡çãõâêîôûàèìòùäöüßøåæ]/i;

export function keepEnglishContent(record = {}, options = {}) {
  const languageFields = options.languageFields || ['language', 'lang', 'sourceLanguage', 'source_language'];
  for (const field of languageFields) {
    const value = record?.[field];
    if (!value) continue;
    return isEnglishLanguageValue(value);
  }

  const textFields = options.textFields || ['title', 'description', 'summary', 'abstract', 'content'];
  const text = textFields.map(field => record?.[field]).filter(Boolean).join(' ');
  return isLikelyEnglishText(text);
}

export function isEnglishLanguageValue(value) {
  const normalized = normalizeLanguageValue(value);
  return ENGLISH_LANGUAGE_VALUES.has(normalized) || normalized.startsWith('en') || normalized.startsWith('english');
}

export function isLikelyEnglishText(value) {
  const text = String(value || '').trim();
  if (!text) return true;

  const words = tokenize(text);
  if (words.length < 3) return true;

  const englishCount = words.filter(word => ENGLISH_MARKERS.has(word)).length;
  const nonEnglishCount = words.filter(word => NON_ENGLISH_MARKERS.has(word)).length;

  if (NON_ENGLISH_DIACRITIC_RE.test(text) && englishCount === 0) return false;
  if (nonEnglishCount >= 3 && englishCount <= 1) return false;
  if (nonEnglishCount >= 2 && englishCount === 0) return false;

  return true;
}

function normalizeLanguageValue(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z]+/g, '');
}

function tokenize(value) {
  return String(value || '')
    .toLowerCase()
    .match(/[a-z]+/g) || [];
}
