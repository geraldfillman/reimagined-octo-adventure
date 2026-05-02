import { getApiKey, getBaseUrl } from './lib/config.mjs';
import { getJson } from './lib/fetcher.mjs';

const apiKey = getApiKey('fmp');
const stable = getBaseUrl('fmp').replace(/\/api\/v\d+$/, '/stable');

const positions = [
  { sym:'CNC',  dir:'LONG',  entry:52.62,  stop:52.44,  shares:1420, confirmed:false },
  { sym:'GM',   dir:'SHORT', entry:76.12,  stop:76.34,  shares:1146, confirmed:false },
  { sym:'UPS',  dir:'SHORT', entry:100.50, stop:100.74, shares:995,  confirmed:false },
  { sym:'KO',   dir:'LONG',  entry:79.83,  stop:79.69,  shares:1252, confirmed:true  },
  { sym:'NUE',  dir:'LONG',  entry:226.84, stop:226.29, shares:440,  confirmed:false },
  { sym:'PCAR', dir:'SHORT', entry:119.59, stop:119.94, shares:716,  confirmed:false },
  { sym:'YUM',  dir:'LONG',  entry:163.34, stop:163.05, shares:612,  confirmed:false },
  { sym:'GLW',  dir:'SHORT', entry:149.75, stop:150.65, shares:279,  confirmed:false },
  { sym:'AIG',  dir:'SHORT', entry:73.97,  stop:74.13,  shares:1351, confirmed:false },
  { sym:'AMAT', dir:'SHORT', entry:380.51, stop:381.85, shares:186,  confirmed:false },
  { sym:'FTAI', dir:'SHORT', entry:214.33, stop:215.82, shares:167,  confirmed:false },
  { sym:'EXR',  dir:'SHORT', entry:139.97, stop:140.27, shares:714,  confirmed:false },
  { sym:'CDNS', dir:'SHORT', entry:320.83, stop:322.26, shares:174,  confirmed:false },
  { sym:'BRO',  dir:'SHORT', entry:63.00,  stop:63.18,  shares:1358, confirmed:false },
  { sym:'VTR',  dir:'LONG',  entry:88.17,  stop:87.96,  shares:1134, confirmed:false },
  { sym:'SOXX', dir:'SHORT', entry:434.30, stop:435.49, shares:210,  confirmed:false },
  { sym:'OMC',  dir:'SHORT', entry:74.80,  stop:74.99,  shares:1308, confirmed:false },
  { sym:'AMKR', dir:'SHORT', entry:65.00,  stop:65.43,  shares:576,  confirmed:false },
  { sym:'QCOM', dir:'SHORT', entry:144.00, stop:144.51, shares:489,  confirmed:true  },
  { sym:'SBUX', dir:'LONG',  entry:102.08, stop:101.89, shares:979,  confirmed:true  },
];

const syms = positions.map(p => p.sym).join(',');
const quotes = await getJson(`${stable}/batch-quote-short?symbols=${syms}&apikey=${apiKey}`);
const priceMap = Object.fromEntries((Array.isArray(quotes) ? quotes : []).map(q => [q.symbol, q.price]));

const now = new Date().toLocaleTimeString('en-US', { timeZone: 'America/New_York', hour: '2-digit', minute: '2-digit' });
console.log(`\nPosition Snapshot -- ${now} ET\n`);
console.log('     Symbol  Dir    Entry     Current   P&L/sh    Total P&L   Stop      Dist-to-Stop  Status');
console.log('     ------  -----  --------  --------  --------  ----------  --------  ------------  ----------');

let totalPnl = 0;
for (const p of positions) {
  const cur = priceMap[p.sym];
  if (!cur) { console.log(`     ${p.sym.padEnd(6)}  no quote`); continue; }
  const pnlPerShare = p.dir === 'LONG' ? cur - p.entry : p.entry - cur;
  const totalPos    = pnlPerShare * p.shares;
  const distToStop  = p.dir === 'LONG' ? cur - p.stop : p.stop - cur;
  totalPnl += totalPos;
  const tag    = p.confirmed ? '[C] ' : '    ';
  const rMove  = Math.abs(p.entry - p.stop);
  const status = distToStop < 0         ? 'STOPPED'
               : distToStop < rMove * 0.25 ? 'NEAR-STOP'
               : pnlPerShare > 0            ? 'winning'
               :                             'losing';
  console.log(
    `     ${tag}${p.sym.padEnd(4)}  ${p.dir.padEnd(5)}  $${p.entry.toFixed(2).padStart(6)}  ` +
    `$${cur.toFixed(2).padStart(6)}  ` +
    `${pnlPerShare >= 0 ? '+' : '-'}$${Math.abs(pnlPerShare).toFixed(2).padStart(5)}  ` +
    `${totalPos >= 0 ? '+' : '-'}$${Math.abs(totalPos).toFixed(0).padStart(8)}  ` +
    `$${p.stop.toFixed(2).padStart(6)}  ` +
    `${distToStop >= 0 ? '+' : '-'}$${Math.abs(distToStop).toFixed(2).padStart(5)}        ${status}`
  );
}
console.log(`\n     Total unrealized P&L: ${totalPnl >= 0 ? '+' : '-'}$${Math.abs(totalPnl).toFixed(0)}  (all 20 positions, $25K account)`);
console.log(`     [C] = entropy-confirmed setup\n`);
