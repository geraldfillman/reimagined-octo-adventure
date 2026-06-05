export const CONFIDENCE = Object.freeze({
  observed: 'observed',
  high: 'derived_high_confidence',
  medium: 'derived_medium_confidence',
  low: 'derived_low_confidence',
  manual: 'manual_or_paid_required',
});

export function confidenceLabel(value) {
  return Object.values(CONFIDENCE).includes(value) ? value : CONFIDENCE.low;
}

export function withProvenance(record, {
  sourceName,
  sourceUrl = '',
  sourceFile = '',
  asOfDate = '',
  modelVersion = 'institutional-positioning-v1',
  signalConfidence = CONFIDENCE.low,
  knownLimitations = [],
} = {}) {
  return Object.freeze({
    ...record,
    source_name: sourceName ?? record.source_name ?? '',
    source_url: sourceUrl || record.source_url || '',
    source_file: sourceFile || record.source_file || '',
    as_of_date: asOfDate || record.as_of_date || '',
    model_version: modelVersion,
    signal_confidence: confidenceLabel(signalConfidence),
    known_limitations: [...new Set([...(record.known_limitations ?? []), ...knownLimitations].filter(Boolean))],
  });
}

export function manualRequired(sourceName, notes) {
  return withProvenance({
    source: sourceName,
    status: 'manual/API setup required',
    notes,
  }, {
    sourceName,
    signalConfidence: CONFIDENCE.manual,
    knownLimitations: [notes],
  });
}
