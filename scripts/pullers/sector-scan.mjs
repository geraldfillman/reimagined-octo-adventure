/**
 * sector-scan.mjs - Sector-to-thesis research pipeline.
 *
 * Outputs:
 *   - 05_Data_Pulls/Sectors/{date}_{Sector}.md
 *   - 05_Data_Pulls/Sectors/{date}_Sector_Scan_Summary.md
 *   - 06_Signals/{date}_CONFIRM_{thesis}.md
 *   - 06_Signals/{date}_CONTRADICT_{thesis}.md
 *   - 10_Theses/{stub}.md
 */

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { getPullsDir, getSignalsDir, getVaultRoot } from '../lib/config.mjs';
import { buildNote, dateStampedFilename, today } from '../lib/markdown.mjs';
import { listPullFiles } from '../lib/history.mjs';
import { findSector, SECTOR_MAP } from '../lib/sector-map.mjs';
import {
  buildRoutingTable,
  createBridgeNotes,
  scoreFindings,
  shouldCreateStub,
  upsertEmergingPatternStub,
  writeRoutingSignal,
} from '../lib/thesis-router.mjs';

function log(message) {
  console.log(`[sector-scan] ${message}`);
}

const EMERGING_PATTERN_STOPWORDS = new Set([
  'clean', 'energy', 'technology', 'consumer', 'industrial', 'industrials',
  'financials', 'healthcare', 'housing', 'real', 'estate', 'utilities',
  'materials', 'communication', 'services', 'sector', 'market', 'markets',
  'filings', 'filing', 'item', 'items', 'event', 'events', 'earnings',
  'disclosure', 'departure', 'executive', 'regulation', 'risk', 'valuation',
  'liquidity', 'target', 'upside', 'revenue', 'margin', 'order', 'orders',
  'quality', 'growth', 'price', 'prices', 'supply', 'demand', 'utility',
  'utilities', 'screen', 'search', 'ticker', 'tickers', 'large', 'small',
  'micro', 'mid', 'cap', 'caps', 'gross', 'passed', 'universe', 'filters',
  'active', 'material', 'other', 'preview', 'update', 'tracked', 'companies',
]);

function topicSlug(value) {
  return String(value || '')
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
}

function newsDomainForTopic(topic) {
  const topicLower = String(topic || '').toLowerCase();
  if (topicLower.includes('housing') || topicLower.includes('real estate') || topicLower.includes('mortgage')) return 'Housing';
  if (topicLower.includes('biotech') || topicLower.includes('fda') || topicLower.includes('drug') || topicLower.includes('health')) return 'Biotech';
  if (topicLower.includes('energy') || topicLower.includes('oil') || topicLower.includes('solar')) return 'Energy';
  if (topicLower.includes('contract') || topicLower.includes('government') || topicLower.includes('federal')) return 'Government';
  return 'Macro';
}

function findTodayPull(domain, matcher) {
  return listPullFiles(domain)
    .filter(entry => entry.datePrefix === today())
    .find(entry => matcher(entry));
}

function sectorSecSnapshotPath(sectorsDir, sector) {
  return join(sectorsDir, dateStampedFilename(`SEC_${sector.slug}_Overview`));
}

function cleanFindingText(value) {
  return String(value || '')
    .replace(/[|#*`\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function splitSections(body) {
  const sections = new Map();
  let currentHeading = '';
  let currentLines = [];

  function flush() {
    if (!currentHeading) return;
    sections.set(currentHeading, currentLines.join('\n').trim());
  }

  for (const line of body.split('\n')) {
    const headingMatch = line.match(/^##\s+(.+)$/);
    if (headingMatch) {
      flush();
      currentHeading = headingMatch[1].trim();
      currentLines = [];
      continue;
    }
    currentLines.push(line);
  }

  flush();
  return sections;
}

function parseMarkdownTable(sectionContent) {
  const rows = [];
  for (const line of String(sectionContent || '').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed.startsWith('|')) continue;
    if (/^\|\s*-/.test(trimmed)) continue;

    const cells = trimmed
      .split('|')
      .slice(1, -1)
      .map(cell => cleanFindingText(cell));
    if (cells.length > 0) {
      rows.push(cells);
    }
  }

  return rows.slice(1);
}

function extractEventListText(sections) {
  const headlineSection = [...sections.entries()].find(([heading]) => heading.startsWith('Headlines:'));
  if (!headlineSection) return '';
  return parseMarkdownTable(headlineSection[1])
    .map(cells => cells[cells.length - 1])
    .filter(Boolean)
    .join(' ');
}

function extractScreenText(sections) {
  const pieces = [];

  for (const [heading, content] of sections.entries()) {
    if (heading === 'Priority Board') {
      for (const cells of parseMarkdownTable(content)) {
        pieces.push([cells[2], cells[5]].filter(Boolean).join(' '));
      }
    }
    if (heading.endsWith('Research Picks')) {
      for (const cells of parseMarkdownTable(content)) {
        pieces.push([cells[0], cells[3]].filter(Boolean).join(' '));
      }
    }
    if (heading === 'Special Situation') {
      pieces.push(cleanFindingText(content));
    }
  }

  return pieces.join(' ');
}

function extractSectorOverviewText(sections) {
  const pieces = [];

  if (sections.has('TL;DR')) {
    pieces.push(cleanFindingText(sections.get('TL;DR')));
  }

  for (const [heading, content] of sections.entries()) {
    if (heading === '8-K Item Mix') {
      for (const cells of parseMarkdownTable(content)) {
        pieces.push([cells[0], cells[1]].filter(Boolean).join(' '));
      }
    }
    if (/^Recent Filings\b/i.test(heading)) {
      for (const cells of parseMarkdownTable(content)) {
        pieces.push([cells[0], cells[1], cells[5], cells[6]].filter(Boolean).join(' '));
      }
    }
    if (/\(\d+\s+events\)$/i.test(heading)) {
      for (const cells of parseMarkdownTable(content)) {
        pieces.push([cells[0], cells[4], cells[5]].filter(Boolean).join(' '));
      }
    }
  }

  return pieces.join(' ');
}

function extractFindingsText(filePath) {
  if (!filePath || !existsSync(filePath)) return '';
  const content = readFileSync(filePath, 'utf-8').replace(/\r\n/g, '\n');
  let frontmatter = {};
  const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n/);
  if (frontmatterMatch) {
    frontmatter = Object.fromEntries(
      frontmatterMatch[1]
        .split('\n')
        .filter(line => line.includes(':'))
        .map(line => {
          const index = line.indexOf(':');
          return [line.slice(0, index).trim(), line.slice(index + 1).trim().replace(/^"|"$/g, '')];
        })
    );

    if (frontmatter.data_type === '8k_sector_overview' && Number(frontmatter.total_filings || '0') === 0) {
      return '';
    }
  }
  const bodyMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  const body = bodyMatch ? bodyMatch[1] : content;
  const sections = splitSections(body);

  if (frontmatter.data_type === 'event_list') {
    return extractEventListText(sections);
  }
  if (frontmatter.data_type === 'screen') {
    return extractScreenText(sections);
  }
  if (frontmatter.data_type === '8k_sector_overview') {
    return extractSectorOverviewText(sections);
  }

  return cleanFindingText(body);
}

async function tryPull(modulePath, flags, label) {
  try {
    const module = await import(modulePath);
    return await module.pull(flags);
  } catch (error) {
    log(`  WARN: ${label} pull failed - ${error.message}`);
    return null;
  }
}

function collectEvidencePaths({ sector, sectorsDir, secResult, newsResult, fmpResult, noFmp }) {
  const evidencePaths = [];
  const secSnapshot = sectorSecSnapshotPath(sectorsDir, sector);
  const secPath = existsSync(secSnapshot)
    ? secSnapshot
    : (secResult?.filePath
      ?? findTodayPull('Government', entry => entry.file.includes('SEC_Sectors'))?.path);
  const newsPath = newsResult?.filePath
    ?? findTodayPull(newsDomainForTopic(sector.newsTopic), entry => entry.file.includes(`News_${topicSlug(sector.newsTopic)}`))?.path;
  const fmpPath = noFmp
    ? null
    : fmpResult?.filePath
      ?? findTodayPull('Market', entry => entry.file.includes(`${sector.fmpSector.replace(/\s+/g, '_')}_Micro_Small_Cap_Search`))?.path
      ?? findTodayPull('Market', entry => entry.file.includes(`_${sector.fmpSector.replace(/\s+/g, '_')}_Micro_Small_Cap_Search`))?.path;

  for (const path of [secPath, newsPath, fmpPath]) {
    if (path && !evidencePaths.includes(path)) {
      evidencePaths.push(path);
    }
  }

  return evidencePaths;
}

function topTermsFromText(text) {
  const counts = new Map();
  for (const token of String(text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(value => value.length >= 5 && !EMERGING_PATTERN_STOPWORDS.has(value) && !/\d/.test(value))) {
    counts.set(token, (counts.get(token) || 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= 3)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 8)
    .map(([term]) => term);
}

export async function pull(flags = {}) {
  const dryRun = Boolean(flags['dry-run']);
  const newThesisOnly = Boolean(flags['new-thesis-only']);
  const noFmp = Boolean(flags['no-fmp']);
  const sectorFilter = flags.sector ? String(flags.sector) : null;
  const vaultRoot = getVaultRoot();
  const sectorsDir = join(getPullsDir(), 'Sectors');
  const signalsDir = getSignalsDir();
  const thesesDir = join(vaultRoot, '10_Theses');
  const currentDate = today();

  let sectors = SECTOR_MAP;
  if (sectorFilter) {
    const match = findSector(sectorFilter);
    if (!match) {
      throw new Error(`Unknown sector "${sectorFilter}". Valid slugs: ${SECTOR_MAP.map(sector => sector.slug).join(', ')}`);
    }
    sectors = [match];
  }

  let routingTable = buildRoutingTable();
  log(`Building thesis routing table...`);
  log(`  Loaded ${routingTable.size} active theses`);
  if (dryRun) {
    log('  Dry run mode - no API calls or file writes.');
  }

  if (!dryRun) {
    mkdirSync(sectorsDir, { recursive: true });
  }

  const summaryRows = [];
  const allSignalsWritten = [];
  const allStubsTouched = [];
  const allBridgeNotes = [];

  for (const sector of sectors) {
    log(`Scanning: ${sector.basket}`);

    let secResult = null;
    let newsResult = null;
    let fmpResult = null;

    if (!dryRun) {
      log(`  SEC 8-Ks -> --sectors ${sector.secAlias}`);
      secResult = await tryPull('../pullers/sec.mjs', { sectors: sector.secAlias }, `SEC/${sector.secAlias}`);
      if (secResult?.filePath && existsSync(secResult.filePath)) {
        copyFileSync(secResult.filePath, sectorSecSnapshotPath(sectorsDir, sector));
      }

      log(`  NewsAPI -> --topic ${sector.newsTopic}`);
      newsResult = await tryPull('../pullers/newsapi.mjs', { topic: sector.newsTopic, limit: 20 }, `newsapi/${sector.newsTopic}`);

      if (!noFmp) {
        log(`  FMP screening -> --micro-small --sector "${sector.fmpSector}"`);
        fmpResult = await tryPull('../pullers/fmp.mjs', { 'micro-small': true, sector: sector.fmpSector }, `FMP/${sector.fmpSector}`);
      }
    }

    const evidencePaths = collectEvidencePaths({ sector, sectorsDir, secResult, newsResult, fmpResult, noFmp });
    const findingsText = evidencePaths
      .map(path => extractFindingsText(path))
      .filter(Boolean)
      .join(' ');

    if (evidencePaths.length === 0) {
      log('  No local evidence files found for routing.');
    } else {
      log(`  Evidence files: ${evidencePaths.map(path => path.split(/[\\/]/).pop()).join(', ')}`);
    }

    const routingResults = findingsText ? scoreFindings(findingsText, routingTable) : [];
    log(`  Routing hits: ${routingResults.length}`);

    const signalsWritten = [];
    if (!newThesisOnly) {
      for (const result of routingResults) {
        const signalPath = writeRoutingSignal(result, sector.basket, signalsDir, dryRun);
        signalsWritten.push({ result, path: signalPath });
        allSignalsWritten.push(signalPath);
        log(`  ${dryRun ? 'would write' : 'wrote'} ${result.direction.toUpperCase()} [score=${result.score}] -> ${result.thesisName}`);
      }
    }

    let stubInfo = null;
    const bridgeNotes = [];
    const emergingTerms = topTermsFromText(findingsText);
    if (newThesisOnly && findingsText && emergingTerms.length >= 2 && shouldCreateStub(findingsText, routingTable)) {
      const sectorLabel = sector.basket.replace(/ Sector Basket$/i, ' Sector');
      stubInfo = upsertEmergingPatternStub(sectorLabel, emergingTerms, thesesDir, dryRun);
      allStubsTouched.push(stubInfo.filePath);
      log(`  ${dryRun ? 'would update' : 'updated'} stub -> ${stubInfo.name} (${stubInfo.action})`);

      if (stubInfo.promoted) {
        for (const bridgeNote of createBridgeNotes(stubInfo, thesesDir, dryRun)) {
          bridgeNotes.push(bridgeNote);
          allBridgeNotes.push(bridgeNote.filePath);
          log(`  ${dryRun ? 'would create' : bridgeNote.action === 'created' ? 'created' : 'kept'} bridge -> ${bridgeNote.name}`);
        }
        routingTable = buildRoutingTable();
      }
    }

    const contradictCount = routingResults.filter(result => result.direction === 'contradict').length;
    const confirmCount = routingResults.filter(result => result.direction === 'confirm').length;

    if (!dryRun) {
      const sectorFrontmatter = {
        title: `${sector.basket} - ${currentDate}`,
        source: noFmp ? 'SEC EDGAR + NewsAPI' : 'SEC EDGAR + NewsAPI + FMP',
        date_pulled: currentDate,
        domain: 'sectors',
        data_type: 'sector_scan',
        frequency: 'on-demand',
        signal_status: contradictCount > 0 ? 'alert' : confirmCount > 0 ? 'watch' : 'clear',
        signals: routingResults.map(result => `${result.direction.toUpperCase()}:${result.thesisName}`),
        sector: sector.basket,
        sector_slug: sector.slug,
        thesis_hits: routingResults.length,
        confirms: confirmCount,
        contradicts: contradictCount,
        tags: ['sector', sector.slug, 'sector-scan'],
      };

      const routingTableMarkdown = routingResults.length === 0
        ? 'No thesis routing hits above threshold.'
        : [
            '| Thesis | Score | Direction | Matched Terms |',
            '| --- | --- | --- | --- |',
            ...routingResults.map(result => `| ${result.thesisName} | ${result.score >= 0 ? '+' : ''}${result.score} | ${result.direction} | ${result.matched.slice(0, 5).join(', ')} |`),
          ].join('\n');

      const sectorBody = [
        '## Evidence Files',
        '',
        evidencePaths.length === 0 ? 'None found.' : evidencePaths.map(path => `- ${path.split(/[\\/]/).pop()}`).join('\n'),
        '',
        '## Routing Results',
        '',
        routingTableMarkdown,
        '',
        '## Signals Written',
        '',
        signalsWritten.length === 0
          ? 'None.'
          : signalsWritten.map(signal => `- [[${signal.path.split(/[\\/]/).pop().replace(/\.md$/i, '')}]]`).join('\n'),
        '',
        '## Emerging Pattern Actions',
        '',
        stubInfo ? `- ${stubInfo.action}: [[${stubInfo.fileName.replace(/\.md$/i, '')}]]` : 'None.',
        ...(bridgeNotes.length > 0
          ? ['', '## Bridge Notes', '', bridgeNotes.map(note => `- [[${note.filePath.split(/[\\/]/).pop().replace(/\.md$/i, '')}]]`).join('\n')]
          : []),
        '',
      ].join('\n');

      const filePath = join(sectorsDir, dateStampedFilename(sector.basket.replace(/ Sector Basket$/i, '_Sector').replace(/\s+/g, '_')));
      writeFileSync(filePath, buildNote({ frontmatter: sectorFrontmatter, sections: [] }) + sectorBody, 'utf-8');
    }

    summaryRows.push({
      basket: sector.basket,
      hits: routingResults.length,
      confirms: confirmCount,
      contradicts: contradictCount,
      stubAction: stubInfo?.action || 'none',
      bridgeCount: bridgeNotes.length,
    });
  }

  const totalConfirms = summaryRows.reduce((sum, row) => sum + row.confirms, 0);
  const totalContradicts = summaryRows.reduce((sum, row) => sum + row.contradicts, 0);
  const uniqueSignalsWritten = [...new Set(allSignalsWritten)];

  if (!dryRun) {
    const summaryFrontmatter = {
      title: `Sector Scan Summary - ${currentDate}`,
      source: 'sector-scan',
      date_pulled: currentDate,
      domain: 'sectors',
      data_type: 'sector_scan',
      frequency: 'on-demand',
      signal_status: totalContradicts > 0 ? 'alert' : totalConfirms > 0 ? 'watch' : 'clear',
      signals: [],
      sectors_scanned: summaryRows.length,
      total_confirms: totalConfirms,
      total_contradicts: totalContradicts,
      stub_actions: allStubsTouched.length,
      bridge_notes: allBridgeNotes.length,
      tags: ['sector', 'sector-scan', 'summary'],
    };

    const summaryTable = [
      '| Sector | Confirms | Contradicts | Total Hits | Stub Action | Bridge Notes |',
      '| --- | --- | --- | --- | --- | --- |',
      ...summaryRows.map(row => `| ${row.basket} | ${row.confirms} | ${row.contradicts} | ${row.hits} | ${row.stubAction} | ${row.bridgeCount} |`),
    ].join('\n');

    const summaryBody = [
      '## Sector Routing Summary',
      '',
      summaryTable,
      '',
      '## Signals Written',
      '',
      uniqueSignalsWritten.length === 0
        ? 'None.'
        : uniqueSignalsWritten.map(path => `- [[${path.split(/[\\/]/).pop().replace(/\.md$/i, '')}]]`).join('\n'),
      '',
      '## Stub Actions',
      '',
      allStubsTouched.length === 0
        ? 'None.'
        : allStubsTouched.map(path => `- [[${path.split(/[\\/]/).pop().replace(/\.md$/i, '')}]]`).join('\n'),
      '',
      '## Bridge Notes',
      '',
      allBridgeNotes.length === 0
        ? 'None.'
        : allBridgeNotes.map(path => `- [[${path.split(/[\\/]/).pop().replace(/\.md$/i, '')}]]`).join('\n'),
      '',
    ].join('\n');

    const summaryFile = join(sectorsDir, dateStampedFilename('Sector_Scan_Summary'));
    writeFileSync(summaryFile, buildNote({ frontmatter: summaryFrontmatter, sections: [] }) + summaryBody, 'utf-8');
  }

  log(`Done. ${summaryRows.length} sector(s) scanned. Confirms: ${totalConfirms}, Contradicts: ${totalContradicts}, Stub actions: ${allStubsTouched.length}, Bridges: ${allBridgeNotes.length}`);

  return {
    dryRun,
    sectors: summaryRows.length,
    confirms: totalConfirms,
    contradicts: totalContradicts,
    stubs: allStubsTouched.length,
    bridges: allBridgeNotes.length,
    signalsWritten: allSignalsWritten,
  };
}
