/**
 * sam.mjs — SAM.gov puller
 *
 * Pulls government entity registrations and contract opportunities
 * from SAM.gov APIs. Covers pre-award data complementing USASpending.
 *
 * Usage:
 *   node run.mjs sam --entities 541715
 *   node run.mjs sam --opportunities defense
 *   node run.mjs sam --all
 */

import { join } from 'path';
import { getApiKey, getPullsDir, getSignalsDir } from '../lib/config.mjs';
import { getJson } from '../lib/fetcher.mjs';
import {
  buildNote, buildTable, writeNote, formatNumber,
  today, dateStampedFilename,
} from '../lib/markdown.mjs';
import {
  evaluateLargeOpportunity, evaluateOpportunityCluster,
  highestSeverity, formatSignalsSection,
} from '../lib/signals.mjs';

/**
 * Entry point. Routes to sub-pullers based on flags.
 * @param {Object} flags - CLI flags: entities, opportunities, all
 * @returns {Promise<{ filePath: string, signals: Array }>}
 */
export async function pull(flags = {}) {
  const apiKey = getApiKey('sam');
  let lastFilePath = '';
  const allSignals = [];

  if (flags.all) {
    const naicsCode = typeof flags.entities === 'string' ? flags.entities : '541715';
    const keyword = typeof flags.opportunities === 'string' ? flags.opportunities : 'defense technology';

    const entitiesResult = await pullEntities(naicsCode, apiKey);
    lastFilePath = entitiesResult.filePath;

    const oppsResult = await pullOpportunities(keyword, apiKey);
    lastFilePath = oppsResult.filePath;
    allSignals.push(...oppsResult.signals);

  } else if (flags.entities !== undefined) {
    const naicsCode = typeof flags.entities === 'string' ? flags.entities : '541715';
    const result = await pullEntities(naicsCode, apiKey);
    lastFilePath = result.filePath;

  } else if (flags.opportunities !== undefined) {
    const keyword = typeof flags.opportunities === 'string' ? flags.opportunities : 'defense technology';
    const result = await pullOpportunities(keyword, apiKey);
    lastFilePath = result.filePath;
    allSignals.push(...result.signals);

  } else {
    throw new Error('Specify --entities [naics], --opportunities [keyword], or --all');
  }

  return Object.freeze({ filePath: lastFilePath, signals: Object.freeze(allSignals) });
}

/**
 * Pulls active entity registrations by NAICS code.
 * @param {string} naicsCode - NAICS code to filter by
 * @param {string} apiKey - SAM.gov API key
 * @returns {Promise<{ filePath: string, signals: Array }>}
 */
async function pullEntities(naicsCode, apiKey) {
  console.log('📋 SAM.gov: Pulling entities for NAICS ' + naicsCode);

  try {
    const url = `https://api.sam.gov/entity-information/v4/entities?api_key=${apiKey}&naicsCode=${naicsCode}&samRegistered=Yes&registrationStatus=A&includeSections=entityRegistration,coreData&page=0&size=10`;
    const response = await getJson(url);

    const entityData = response?.entityData ?? [];
    console.log(`  ${entityData.length} entities found`);

    const rows = entityData.map(entity => {
      const reg = entity?.entityRegistration ?? {};
      const core = entity?.coreData ?? {};
      return Object.freeze([
        reg.ueiSAM ?? 'N/A',
        reg.legalBusinessName ?? 'N/A',
        reg.registrationStatus ?? 'N/A',
        core?.physicalAddress?.stateOrProvinceCode ?? 'N/A',
        reg.registrationDate ?? 'N/A',
      ]);
    });

    const note = buildNote({
      frontmatter: Object.freeze({
        title: `SAM.gov Entity Registrations — NAICS ${naicsCode}`,
        source: 'SAM.gov Entity API',
        date_pulled: today(),
        naics_code: naicsCode,
        domain: 'government',
        data_type: 'entity_list',
        frequency: 'on-demand',
        signal_status: 'clear',
        signals: [],
        tags: ['sam-gov', 'entities', naicsCode],
      }),
      sections: [
        {
          heading: `Active Registrations — NAICS ${naicsCode}`,
          content: buildTable(['UEI', 'Legal Name', 'Status', 'State', 'Reg Date'], rows),
        },
        {
          heading: 'Source',
          content: `- **API**: SAM.gov Entity Information v3\n- **Filter**: NAICS ${naicsCode}, Active registrations\n- **Auth**: API key (query param)\n- **Auto-pulled**: ${today()}`,
        },
      ],
    });

    const filePath = join(getPullsDir(), 'Government', dateStampedFilename('SAM_Entities'));
    writeNote(filePath, note);
    console.log(`📝 Wrote: ${filePath}`);

    return Object.freeze({ filePath, signals: Object.freeze([]) });

  } catch (err) {
    console.error(`  ❌ pullEntities failed: ${err.message}`);
    throw new Error(`SAM entity pull failed: ${err.message}`);
  }
}

/**
 * Pulls contract opportunities posted in the last 30 days.
 * @param {string} keyword - Search keyword
 * @param {string} apiKey - SAM.gov API key (sent as x-api-key header)
 * @returns {Promise<{ filePath: string, signals: Array }>}
 */
async function pullOpportunities(keyword, apiKey) {
  console.log('📋 SAM.gov: Pulling opportunities for "' + keyword + '"');

  try {
    const postedFrom = (() => {
      const d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    })();
    const postedTo = (() => {
      const d = new Date();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const yyyy = d.getFullYear();
      return `${mm}/${dd}/${yyyy}`;
    })();

    const url = `https://api.sam.gov/prod/opportunities/v2/search?limit=25&offset=0&api_key=${apiKey}&postedFrom=${postedFrom}&postedTo=${postedTo}&title=${encodeURIComponent(keyword)}`;
    const response = await getJson(url);

    const opportunitiesData = response?.opportunitiesData ?? [];
    console.log(`  ${opportunitiesData.length} opportunities found`);

    // Evaluate signals
    const signals = [];

    for (const opp of opportunitiesData) {
      const amount = opp?.award?.amount;
      if (amount != null) {
        const signal = evaluateLargeOpportunity(amount);
        if (signal) signals.push(Object.freeze(signal));
      }
    }

    // Group by NAICS code for cluster signals
    const byNaics = {};
    for (const opp of opportunitiesData) {
      const naics = opp?.naicsCode ?? 'unknown';
      byNaics[naics] = (byNaics[naics] ?? 0) + 1;
    }
    for (const [naics, count] of Object.entries(byNaics)) {
      if (count >= 5) {
        const signal = evaluateOpportunityCluster(count, naics);
        if (signal) signals.push(Object.freeze(signal));
      }
    }

    if (signals.length > 0) {
      console.log(`\n⚡ ${signals.length} opportunity signal(s):`);
      signals.forEach(s => console.log(`  🟡 ${s.message}`));
    }

    const rows = opportunitiesData.map(opp => Object.freeze([
      (opp?.title ?? 'N/A').slice(0, 60),
      opp?.solicitationNumber ?? 'N/A',
      opp?.type ?? 'N/A',
      opp?.naicsCode ?? 'N/A',
      opp?.postedDate ?? 'N/A',
      opp?.responseDeadLine ?? 'N/A',
    ]));

    const note = buildNote({
      frontmatter: Object.freeze({
        title: `SAM.gov Opportunities — "${keyword}"`,
        source: 'SAM.gov Opportunities API v2',
        date_pulled: today(),
        keyword,
        posted_from: postedFrom,
        posted_to: postedTo,
        domain: 'government',
        data_type: 'opportunity_list',
        frequency: 'on-demand',
        signal_status: highestSeverity(signals),
        signals: signals.map(s => Object.freeze({ id: s.id, severity: s.severity, message: s.message })),
        tags: ['sam-gov', 'opportunities', 'contracts', 'pre-award'],
      }),
      sections: [
        {
          heading: `Contract Opportunities — "${keyword}" (Last 30 Days)`,
          content: buildTable(['Title', 'Sol #', 'Type', 'NAICS', 'Posted', 'Deadline'], rows),
        },
        ...(signals.length > 0 ? [{ heading: 'Signals', content: formatSignalsSection(signals) }] : []),
        {
          heading: 'Source',
          content: `- **API**: SAM.gov Opportunities v2\n- **Filter**: title="${keyword}", posted ${postedFrom} to ${postedTo}\n- **Auth**: api_key query parameter\n- **Auto-pulled**: ${today()}`,
        },
      ],
    });

    const filePath = join(getPullsDir(), 'Government', dateStampedFilename('SAM_Opportunities'));
    writeNote(filePath, note);
    console.log(`📝 Wrote: ${filePath}`);

    // Log signals file if any fired
    if (signals.length > 0) {
      const signalsDir = getSignalsDir();
      const signalFilePath = join(signalsDir, dateStampedFilename('SAM_Signals'));
      const signalNote = buildNote({
        frontmatter: Object.freeze({
          title: 'SAM.gov Signals',
          date_pulled: today(),
          signal_status: highestSeverity(signals),
          tags: ['sam-gov', 'signals'],
        }),
        sections: [{ heading: 'Signals', content: formatSignalsSection(signals) }],
      });
      writeNote(signalFilePath, signalNote);
      console.log(`⚡ Signals written: ${signalFilePath}`);
    }

    return Object.freeze({ filePath, signals: Object.freeze(signals) });

  } catch (err) {
    console.error(`  ❌ pullOpportunities failed: ${err.message}`);
    throw new Error(`SAM opportunities pull failed: ${err.message}`);
  }
}
