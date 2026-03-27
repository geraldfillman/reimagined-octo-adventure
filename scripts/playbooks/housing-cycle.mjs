/**
 * housing-cycle.mjs — Housing Cycle Playbook
 *
 * Orchestrates multiple pullers to assess the housing market regime.
 * Pulls housing, rates, labor, FEMA, and news data, then generates
 * a synthesis note with regime assessment.
 *
 * Usage:
 *   node run.mjs playbook housing-cycle
 */

import { join } from 'path';
import { getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { buildNote, buildTable, writeNote, formatNumber, today, dateStampedFilename } from '../lib/markdown.mjs';
import { highestSeverity, formatSignalsSection } from '../lib/signals.mjs';

export async function run(flags = {}) {
  console.log('🏠 Housing Cycle Playbook');
  console.log('========================');
  console.log('Question: Is housing expanding, stable, cooling, or contracting?\n');

  const allSignals = [];
  const pullResults = {};

  // Step 1: FRED Housing
  console.log('Step 1/5: FRED Housing Group');
  console.log('----------------------------');
  try {
    const { pull } = await import('../pullers/fred.mjs');
    const result = await pull({ group: 'housing' }) || {};
    pullResults.housing = result;
    if (result.signals) allSignals.push(...result.signals);
  } catch (e) {
    console.error(`  ❌ Failed: ${e.message}`);
    pullResults.housing = { error: e.message };
  }

  // Step 2: FRED Rates
  console.log('\nStep 2/5: FRED Rates Group');
  console.log('--------------------------');
  try {
    const { pull } = await import('../pullers/fred.mjs');
    const result = await pull({ group: 'rates' }) || {};
    pullResults.rates = result;
    if (result.signals) allSignals.push(...result.signals);
  } catch (e) {
    console.error(`  ❌ Failed: ${e.message}`);
    pullResults.rates = { error: e.message };
  }

  // Step 3: FRED Labor
  console.log('\nStep 3/5: FRED Labor Group');
  console.log('--------------------------');
  try {
    const { pull } = await import('../pullers/fred.mjs');
    const result = await pull({ group: 'labor' }) || {};
    pullResults.labor = result;
    if (result.signals) allSignals.push(...result.signals);
  } catch (e) {
    console.error(`  ❌ Failed: ${e.message}`);
    pullResults.labor = { error: e.message };
  }

  // Step 4: OpenFEMA
  console.log('\nStep 4/5: OpenFEMA Disaster Declarations');
  console.log('-----------------------------------------');
  try {
    const { pull } = await import('../pullers/openfema.mjs');
    const result = await pull({ recent: true }) || {};
    pullResults.fema = result;
    if (result.signals && result.signals.length > 0) {
      allSignals.push(...result.signals);
    }
  } catch (e) {
    console.error(`  ❌ Failed: ${e.message}`);
    pullResults.fema = { error: e.message };
  }

  // Step 5: News
  console.log('\nStep 5/5: Business Headlines');
  console.log('----------------------------');
  try {
    const { pull } = await import('../pullers/newsapi.mjs');
    const result = await pull({ topic: 'housing' });
    pullResults.news = result;
  } catch (e) {
    console.error(`  ❌ Failed: ${e.message}`);
    pullResults.news = { error: e.message };
  }

  // === Synthesis ===
  console.log('\n========================================');
  console.log('📊 Generating Housing Cycle Synthesis...');
  console.log('========================================\n');

  const overallStatus = highestSeverity(allSignals);
  const successCount = Object.values(pullResults).filter(r => !r.error).length;
  const failCount = Object.values(pullResults).filter(r => r.error).length;

  // Determine regime based on signals
  const regime = assessRegime(allSignals);

  console.log(`Regime Assessment: ${regime.name}`);
  console.log(`Confidence: ${regime.confidence}`);
  console.log(`Signals fired: ${allSignals.length}`);
  console.log(`Pulls: ${successCount} succeeded, ${failCount} failed`);

  // Build synthesis sections
  const signalSummaryRows = allSignals.map(s => {
    const icon = { critical: '🔴', alert: '🟠', watch: '🟡' }[s.severity] || '⚪';
    return [icon, s.name, s.domain, s.message.slice(0, 80)];
  });

  const pullStatusRows = Object.entries(pullResults).map(([name, r]) => [
    name,
    r.error ? '❌ Failed' : '✅ Success',
    r.error || (r.filePath?.split(/[\\/]/).pop() || 'OK'),
  ]);

  const sections = [
    {
      heading: `Housing Regime Assessment: ${regime.name}`,
      content: [
        `**Confidence**: ${regime.confidence}`,
        `**Overall Signal Status**: ${overallStatus === 'clear' ? '⚪ Clear' : overallStatus.toUpperCase()}`,
        '',
        regime.summary,
        '',
        '**Key Drivers:**',
        ...regime.drivers.map(d => `- ${d}`),
        '',
        '**Implication:**',
        regime.implication,
      ].join('\n'),
    },
  ];

  if (allSignals.length > 0) {
    sections.push({
      heading: 'Active Signals',
      content: buildTable(['', 'Signal', 'Domain', 'Message'], signalSummaryRows),
    });
    sections.push({
      heading: 'Signal Details',
      content: formatSignalsSection(allSignals),
    });
  }

  sections.push({
    heading: 'Pull Status',
    content: buildTable(['Source', 'Status', 'Detail'], pullStatusRows),
  });

  sections.push({
    heading: 'Action Matrix',
    content: [
      '| Condition | Action |',
      '|-----------|--------|',
      '| Starts down + Rates up | Underweight builders, avoid rate-sensitive REITs |',
      '| Starts down + Rates down | Watch for recovery — rates cutting into weakness |',
      '| Prices falling + Inventory rising | Buyer\'s market forming — watch for entry |',
      '| FEMA spike in growth markets | Overweight insurers, avoid regional banks |',
      '| Unemployment spike + Starts flat | Demand destruction — reduce housing exposure |',
    ].join('\n'),
  });

  sections.push({
    heading: 'Next Steps',
    content: [
      '- Review [[Signal Board]] for any new alerts',
      '- Check [[Macro Regime]] for rate environment context',
      '- Run again in 2-4 weeks: `node run.mjs playbook housing-cycle`',
      '- For deeper analysis, run: `node run.mjs fred --group credit`',
    ].join('\n'),
  });

  sections.push({
    heading: 'Source',
    content: `- **Playbook**: Housing Cycle\n- **Pulls**: ${successCount} sources\n- **Signals**: ${allSignals.length} fired\n- **Generated**: ${today()}`,
  });

  const note = buildNote({
    frontmatter: {
      title: `Housing Cycle Report — ${today()}`,
      source: 'Playbook: Housing Cycle',
      date_pulled: today(),
      domain: 'housing',
      data_type: 'synthesis',
      frequency: 'on-demand',
      regime: regime.name,
      regime_confidence: regime.confidence,
      signal_status: overallStatus,
      signals: allSignals.map(s => ({ id: s.id, severity: s.severity, message: s.message })),
      tags: ['playbook', 'housing', 'synthesis', 'regime-assessment'],
      related_pulls: Object.values(pullResults)
        .filter(r => r.filePath)
        .map(r => r.filePath.split(/[\\/]/).pop()),
    },
    sections,
  });

  const filePath = join(getPullsDir(), 'Housing', dateStampedFilename('Housing_Cycle_Report'));
  writeNote(filePath, note);
  console.log(`\n📝 Synthesis: ${filePath}`);

  return { filePath, signals: allSignals, regime };
}

/**
 * Assess the housing regime based on fired signals.
 */
function assessRegime(signals) {
  const signalIds = new Set(signals.map(s => s.id));
  const hasCritical = signals.some(s => s.severity === 'critical');
  const hasAlert = signals.some(s => s.severity === 'alert');

  // Contraction signals
  if (signalIds.has('HOUSING_STARTS_DROP') && signalIds.has('UNEMPLOYMENT_SPIKE')) {
    return {
      name: 'Contraction',
      confidence: 'High',
      summary: 'Housing starts declining alongside rising unemployment — demand destruction underway.',
      drivers: ['Housing starts sharp decline', 'Labor market weakening', 'Demand destruction likely'],
      implication: 'Reduce housing exposure. Avoid builders and rate-sensitive REITs. Watch for policy response.',
    };
  }

  // Cooling signals
  if (signalIds.has('HOUSING_STARTS_DROP') || signalIds.has('MORTGAGE_RATE_SPIKE')) {
    return {
      name: 'Cooling',
      confidence: signalIds.has('HOUSING_STARTS_DROP') && signalIds.has('MORTGAGE_RATE_SPIKE') ? 'High' : 'Medium',
      summary: 'Rate sensitivity or builder pullback detected — housing market decelerating.',
      drivers: [
        signalIds.has('HOUSING_STARTS_DROP') ? 'Housing starts declining' : null,
        signalIds.has('MORTGAGE_RATE_SPIKE') ? 'Mortgage rates spiking' : null,
        signalIds.has('YIELD_CURVE_FLATTENING') ? 'Yield curve flattening — late cycle' : null,
      ].filter(Boolean),
      implication: 'Underweight builders. Monitor permits for confirmation. Check if rate-driven or demand-driven.',
    };
  }

  // Late cycle / peak signals
  if (signalIds.has('YIELD_CURVE_INVERSION') || signalIds.has('YIELD_CURVE_FLATTENING')) {
    return {
      name: 'Late Cycle / Peak Risk',
      confidence: signalIds.has('YIELD_CURVE_INVERSION') ? 'High' : 'Medium',
      summary: 'Macro signals suggest late cycle — housing may be approaching a peak.',
      drivers: [
        signalIds.has('YIELD_CURVE_INVERSION') ? 'Yield curve inverted — recession risk 12-18mo' : 'Yield curve flattening',
        signalIds.has('CPI_ABOVE_TARGET') ? 'Inflation above target — rates stay high' : null,
      ].filter(Boolean),
      implication: 'Housing still expanding but macro headwinds building. Begin reviewing defensive positions.',
    };
  }

  // Regional risk
  if (signalIds.has('FEMA_SPIKE')) {
    return {
      name: 'Stable with Regional Risk',
      confidence: 'Medium',
      summary: 'Broad housing market stable but elevated disaster activity creates regional risk pockets.',
      drivers: [
        'FEMA disaster declarations elevated',
        'Regional insurance costs likely rising',
        'Affected metros may see price pressure',
      ],
      implication: 'National thesis intact. Avoid concentrated exposure in disaster-affected metros. Check insurance sector.',
    };
  }

  // No signals — stable/expansion
  if (signals.length === 0) {
    return {
      name: 'Stable / Expansion',
      confidence: 'Medium',
      summary: 'No warning signals detected. Housing indicators within normal ranges.',
      drivers: [
        'Housing starts within normal range',
        'Mortgage rates stable month-over-month',
        'No yield curve stress',
        'Labor market holding',
      ],
      implication: 'Maintain current housing allocation. Continue monitoring for emerging signals.',
    };
  }

  // Default — mixed signals
  return {
    name: 'Mixed / Transitional',
    confidence: 'Low',
    summary: 'Multiple signals fired but no clear directional pattern. Market in transition.',
    drivers: signals.map(s => s.message.slice(0, 60)),
    implication: 'Reduce position sizing until direction clarifies. Increase monitoring frequency.',
  };
}
