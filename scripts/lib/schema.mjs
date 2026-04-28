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
  'OSINT',
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

export const VALID_SIGNAL_STATES = Object.freeze([
  'new',
  'confirmed',
  'resolved',
  'expired',
]);

export const SIGNAL_LIFECYCLE_FIELDS = Object.freeze([
  'signal_state',
  'confirmed_date',
  'resolved_date',
  'resolution_note',
]);

export const VALID_THESIS_CONVICTIONS = Object.freeze([
  'low',
  'medium',
  'high',
]);

export const REQUIRED_THESIS_FIELDS = Object.freeze([
  'node_type',
  'conviction',
  'timeframe',
  'core_entities',
  'supporting_regimes',
  'invalidation_triggers',
]);

export const VALID_ALLOCATION_PRIORITIES = Object.freeze([
  'watch',
  'medium',
  'high',
]);

export const QLIB_REPORT_SCHEMA_VERSION = 2;

export const QUANT_REQUIRED_FIELDS_BY_TYPE = Object.freeze({
  factor_analysis: Object.freeze([
    'qlib_schema_version',
    'best_factor',
    'best_ic',
    'positive_factor_count',
    'total_factor_count',
    'avg_ic',
    'universe_size',
    'benchmark',
    'start_date',
    'end_date',
    'skipped_tickers',
  ]),
  factor_scores: Object.freeze([
    'qlib_schema_version',
    'universe_size',
    'scoring_date',
    'alert_count',
    'top_ticker',
    'top_score',
    'strong_buy_count',
    'buy_count',
    'watch_count',
    'avoid_count',
    'top_factor',
    'top_factor_weight',
  ]),
  backtest: Object.freeze([
    'qlib_schema_version',
    'universe_size',
    'win_rate',
    'avg_turnover',
    'total_trades',
    'topk',
    'n_drop',
    'train_ratio',
    'train_window',
    'test_window',
    'skipped_tickers',
    'benchmark',
  ]),
});

export const THESIS_QLIB_CORE_FIELDS = Object.freeze([
  'qlib_best_ic',
  'qlib_positive_factor_count',
  'qlib_universe_size',
  'qlib_last_score_date',
  'qlib_signal_status',
  'qlib_last_run',
]);

export const THESIS_QLIB_OPTIONAL_BACKTEST_FIELDS = Object.freeze([
  'qlib_backtest_sharpe',
  'qlib_last_backtest_date',
]);

export const DEPRECATED_THESIS_QLIB_FIELDS = Object.freeze([
  'qlib_alpha_score',
  'qlib_factor_count',
]);

export const VALID_TECHNICAL_BIASES = Object.freeze([
  'bullish',
  'mixed',
  'bearish',
]);

export const VALID_MOMENTUM_STATES = Object.freeze([
  'overbought',
  'positive',
  'neutral',
  'soft',
  'oversold',
  'unknown',
]);

export const THESIS_FMP_DATE_FIELDS = Object.freeze([
  'fmp_primary_fundamentals_cached_at',
  'fmp_primary_snapshot_date',
  'fmp_calendar_pull_date',
  'fmp_next_earnings_date',
  'fmp_last_sync',
]);

export const THESIS_FMP_NUMERIC_FIELDS = Object.freeze([
  'fmp_primary_market_cap',
  'fmp_primary_trailing_pe',
  'fmp_primary_price_to_sales',
  'fmp_primary_price_to_book',
  'fmp_primary_ev_to_sales',
  'fmp_primary_ev_to_ebitda',
  'fmp_primary_roe_pct',
  'fmp_primary_roic_pct',
  'fmp_primary_operating_margin_pct',
  'fmp_primary_net_margin_pct',
  'fmp_primary_current_ratio',
  'fmp_primary_debt_to_equity',
  'fmp_primary_price_target',
  'fmp_primary_target_upside_pct',
  'fmp_primary_rsi14',
  'fmp_primary_price_vs_sma200_pct',
]);

export const THESIS_FMP_COUNT_FIELDS = Object.freeze([
  'fmp_primary_analyst_count',
  'fmp_watchlist_symbol_count',
  'fmp_technical_symbol_count',
  'fmp_technical_nonclear_count',
  'fmp_technical_bearish_count',
  'fmp_technical_overbought_count',
  'fmp_technical_oversold_count',
  'fmp_calendar_symbol_count',
]);

export function sourceCategoryFromPath(relativePath) {
  const [category] = relativePath.split(/[\\/]/);
  return category || '';
}
