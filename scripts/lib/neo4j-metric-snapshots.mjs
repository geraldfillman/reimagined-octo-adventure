const SUPPORTED_CADENCES = new Set(['bod', 'eod']);
const SUPPORTED_TARGETS = new Set(['Stock', 'Sector', 'MacroIndicator', 'Commodity']);
const SUPPORTED_KEYS = new Set(['id', 'ticker', 'symbol', 'name']);

export function normalizeCadence(value = 'eod') {
  const cadence = String(value || 'eod').trim().toLowerCase();
  if (!SUPPORTED_CADENCES.has(cadence)) {
    throw new Error(`Unsupported Neo4j metric cadence "${value}". Supported values: bod, eod`);
  }
  return cadence;
}

export function normalizeTickers(value) {
  const raw = Array.isArray(value) ? value : String(value || '').split(',');
  return [...new Set(raw.map(item => String(item || '').trim().toUpperCase()).filter(Boolean))];
}

export function buildDataPullMeta({
  cadence = 'eod',
  asOfDate = today(),
  datePulled = new Date().toISOString(),
  status = 'ok',
} = {}) {
  const normalizedCadence = normalizeCadence(cadence);
  const dataType = normalizedCadence === 'bod' ? 'quote_premarket' : 'quote_close';
  const provider = 'financial_modeling_prep';
  return {
    id: `datapull:${provider}:${dataType}:${normalizedCadence}:${asOfDate}`,
    provider,
    source: 'fmp_quote',
    dataType,
    frequency: normalizedCadence,
    asOfDate,
    datePulled,
    status,
  };
}

export function quoteToMetricSnapshots(quote = {}, { cadence = 'eod', asof = new Date().toISOString() } = {}) {
  const normalizedCadence = normalizeCadence(cadence);
  const metrics = normalizedCadence === 'bod'
    ? [
        metric('price_premarket', quote.price, 'USD', asof),
        metric('premarket_volume', quote.volume, 'sh', asof),
        metric('premarket_change_pct', quote.changesPercentage, 'pct', asof),
      ]
    : [
        metric('price_close', quote.price, 'USD', asof),
        metric('volume', quote.volume, 'sh', asof),
        metric('market_cap', quote.marketCap, 'USD', asof),
        metric('pe_ratio', quote.pe, 'x', asof),
        metric('eps', quote.eps, 'USD', asof),
        metric('day_change_pct', quote.changesPercentage, 'pct', asof),
      ];
  return metrics.filter(item => item.value !== null && item.value !== undefined && item.value !== '');
}

export function buildDryRunPlan({
  tickers,
  cadence = 'eod',
  asOfDate = today(),
  datePulled = new Date().toISOString(),
} = {}) {
  const normalizedTickers = normalizeTickers(tickers);
  return {
    dryRun: true,
    dataPull: buildDataPullMeta({ cadence, asOfDate, datePulled, status: 'ok' }),
    targets: normalizedTickers.map(ticker => ({
      label: 'Stock',
      key: 'ticker',
      keyValue: ticker,
    })),
  };
}

export function buildWriteDataPullCypher() {
  return `MERGE (d:DataPull {id: $id})
ON CREATE SET d.created_at = datetime()
SET d.provider = $provider,
    d.source = $source,
    d.dataType = $dataType,
    d.frequency = $frequency,
    d.asOfDate = date($asOfDate),
    d.datePulled = datetime($datePulled),
    d.status = $status
RETURN d.id AS id`;
}

export function buildWriteMetricSnapshotsCypher(target) {
  const label = safeTargetLabel(target?.label);
  const key = safeTargetKey(target?.key);
  return `UNWIND $metrics AS row
MATCH (t:\`${label}\` { ${key}: $keyValue })
MATCH (d:DataPull {id: $dataPullId})
MERGE (m:MetricSnapshot {
  target_id: coalesce(t.id, $keyValue),
  metric_name: row.metric_name,
  asof: datetime(row.asof)
})
ON CREATE SET m.created_at = datetime()
SET m.value = row.value,
    m.unit = row.unit,
    m.source = $source
MERGE (d)-[:PRODUCED]->(m)
MERGE (m)-[:OBSERVES]->(t)
WITH t, m, row
WITH t, m, row,
     'latest_' + row.metric_name AS valueKey,
     'latest_' + row.metric_name + '_asof' AS asofKey
WITH t, m, row, valueKey, asofKey,
     coalesce(t[asofKey], datetime('1900-01-01T00:00:00Z')) AS priorAsof
WHERE m.asof >= priorAsof
CALL apoc.create.setProperty(t, valueKey, row.value) YIELD node AS n1
CALL apoc.create.setProperty(n1, asofKey, m.asof) YIELD node AS n2
RETURN count(n2) AS updated`;
}

export async function writeDataPull(session, batchMeta) {
  const result = await session.run(buildWriteDataPullCypher(), batchMeta);
  return result.records[0]?.get('id') ?? batchMeta.id;
}

export async function writeMetricSnapshots(session, dataPullId, target, metrics) {
  if (!metrics?.length) return 0;
  const result = await session.run(buildWriteMetricSnapshotsCypher(target), {
    metrics,
    dataPullId,
    keyValue: target.keyValue,
    source: 'financial_modeling_prep',
  });
  const value = result.records[0]?.get('updated');
  return typeof value?.toNumber === 'function' ? value.toNumber() : Number(value ?? 0);
}

function metric(metricName, value, unit, asof) {
  return {
    metric_name: metricName,
    value,
    unit,
    asof,
  };
}

function safeTargetLabel(value) {
  const label = String(value || '');
  if (!SUPPORTED_TARGETS.has(label)) throw new Error(`Unsupported MetricSnapshot target label "${value}"`);
  return label;
}

function safeTargetKey(value) {
  const key = String(value || '');
  if (!SUPPORTED_KEYS.has(key)) throw new Error(`Unsupported MetricSnapshot target key "${value}"`);
  return key;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}
