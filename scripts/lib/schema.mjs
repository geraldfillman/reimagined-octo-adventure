/**
 * schema.mjs - Shared vault schema definitions for notes and validation.
 */

export const SOURCE_CATEGORY_FOLDERS = Object.freeze([
  'Biotech_Healthcare',
  'Climate_Energy',
  'Developer_Code',
  'Frontier_Science',
  'Fundamentals',
  'Geospatial',
  'Government_Contracts',
  'Housing_Real_Estate',
  'Legal_Courts',
  'Macro',
  'Market_Data',
  'News_Media',
  'Prediction_Markets',
  'Private_Markets_VC',
  'Social_Sentiment',
  'Supply_Chain_Trade',
]);

export const REQUIRED_SOURCE_FIELDS = Object.freeze([
  'name',
  'category',
  'type',
  'provider',
  'pricing',
  'status',
  'priority',
  'url',
  'provides',
  'best_use_cases',
  'tags',
  'related_sources',
  'key_location',
  'integrated',
  'notes',
]);

export const RECOMMENDED_SOURCE_FIELDS = Object.freeze([
  'linked_puller',
  'update_frequency',
  'owner',
  'last_reviewed',
]);

export const REQUIRED_PULL_FIELDS = Object.freeze([
  'title',
  'source',
  'date_pulled',
  'domain',
  'data_type',
  'frequency',
  'signal_status',
  'signals',
  'tags',
]);

export const VALID_SIGNAL_STATUSES = Object.freeze([
  'clear',
  'watch',
  'alert',
  'critical',
]);

export function sourceCategoryFromPath(relativePath) {
  const [category] = relativePath.split(/[\\/]/);
  return category || '';
}

