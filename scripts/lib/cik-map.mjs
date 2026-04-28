/**
 * cik-map.mjs — Shared CIK lookup for all SEC/EDGAR pullers.
 *
 * Extracted from pullers/sec.mjs so dilution-monitor, filing-digest,
 * capital-raise, dd-report, and smallcap-screen can all share one source
 * of truth for ticker → CIK mapping.
 *
 * CIKs are pre-resolved for speed — verified 2026-03-25 via
 * data.sec.gov/files/company_tickers.json
 *
 * Two shapes exposed:
 *   THESIS_COMPANIES   — flat map: ticker → { name, cik, thesis }
 *   SECTOR_COMPANIES   — grouped: sectorName → [{ ticker, cik, name, cap }]
 *
 * Everything frozen to prevent accidental mutation.
 */

export const THESIS_COMPANIES = Object.freeze({
  // Drones / eVTOL
  KTOS:  { name: 'Kratos Defense',    cik: '0001069258', thesis: 'drones' },
  AVAV:  { name: 'AeroVironment',     cik: '0001368622', thesis: 'drones' },
  RCAT:  { name: 'Red Cat Holdings',  cik: '0001590418', thesis: 'drones' },
  ONDS:  { name: 'Ondas Holdings',    cik: '0001713539', thesis: 'drones' },
  ACHR:  { name: 'Archer Aviation',   cik: '0001779128', thesis: 'drones' },
  JOBY:  { name: 'Joby Aviation',     cik: '0001819989', thesis: 'drones' },
  // Defense AI
  PLTR:  { name: 'Palantir',          cik: '0001321655', thesis: 'defense' },
  BBAI:  { name: 'BigBear.ai',        cik: '0001836935', thesis: 'defense' },
  LDOS:  { name: 'Leidos',            cik: '0001336920', thesis: 'defense' },
  BAH:   { name: 'Booz Allen Hamilton', cik: '0001443646', thesis: 'defense' },
  NOC:   { name: 'Northrop Grumman',  cik: '0001133421', thesis: 'defense' },
  LMT:   { name: 'Lockheed Martin',   cik: '0000936468', thesis: 'defense' },
  GD:    { name: 'General Dynamics',  cik: '0000040533', thesis: 'defense' },
  // AMR
  INVA:  { name: 'Innoviva',          cik: '0001080014', thesis: 'amr' },
  SPRO:  { name: 'Spero Therapeutics',cik: '0001701108', thesis: 'amr' },
  // Psychedelics
  CMPS:  { name: 'COMPASS Pathways',  cik: '0001816590', thesis: 'psychedelics' },
  ATAI:  { name: 'ATAI Life Sciences',cik: '0001840904', thesis: 'psychedelics' },
  ALKS:  { name: 'Alkermes',          cik: '0001520262', thesis: 'psychedelics' },
  NBIX:  { name: 'Neurocrine Bio',    cik: '0000914475', thesis: 'psychedelics' },
  GHRS:  { name: 'GH Research',       cik: '0001855129', thesis: 'psychedelics' },
  DFTX:  { name: 'Definium Therapeutics', cik: '0001813814', thesis: 'psychedelics' },
  NRXP:  { name: 'NRx Pharmaceuticals',cik: '0001719406', thesis: 'psychedelics' },
  // GLP-1
  LLY:   { name: 'Eli Lilly',           cik: '0000059478', thesis: 'glp1' },
  VKTX:  { name: 'Viking Therapeutics', cik: '0001607678', thesis: 'glp1' },
  ALVO:  { name: 'Altimmune',           cik: '0001898416', thesis: 'glp1' },
  HIMS:  { name: 'Hims & Hers Health',  cik: '0001773751', thesis: 'glp1' },
  AMGN:  { name: 'Amgen',               cik: '0000318154', thesis: 'glp1' },
  // Gene Editing
  NTLA:  { name: 'Intellia Therapeutics', cik: '0001652130', thesis: 'geneediting' },
  BEAM:  { name: 'Beam Therapeutics',     cik: '0001745999', thesis: 'geneediting' },
  EDIT:  { name: 'Editas Medicine',       cik: '0001650664', thesis: 'geneediting' },
  CRSP:  { name: 'CRISPR Therapeutics',   cik: '0001674416', thesis: 'geneediting' },
  // Alzheimer's
  BIIB:  { name: 'Biogen',                cik: '0000875045', thesis: 'alzheimers' },
  PRTA:  { name: 'Prothena',              cik: '0001559053', thesis: 'alzheimers' },
  ACAD:  { name: 'Acadia Pharmaceuticals',cik: '0001070494', thesis: 'alzheimers' },
  // Longevity
  UNTY:  { name: 'Unity Biotechnology',   cik: '0000920427', thesis: 'longevity' },
  XOMA:  { name: 'XOMA Royalty',          cik: '0000791908', thesis: 'longevity' },
  // Nuclear
  NNE:   { name: 'Nano Nuclear Energy',   cik: '0001923891', thesis: 'nuclear' },
  SMR:   { name: 'NuScale Power',         cik: '0001822966', thesis: 'nuclear' },
  OKLO:  { name: 'Oklo',                  cik: '0001849056', thesis: 'nuclear' },
  CEG:   { name: 'Constellation Energy',  cik: '0001868275', thesis: 'nuclear' },
  VST:   { name: 'Vistra Corp',           cik: '0001692819', thesis: 'nuclear' },
  CCJ:   { name: 'Cameco',                cik: '0001009001', thesis: 'nuclear' },
  // Battery Storage
  FLNC:  { name: 'Fluence Energy',        cik: '0001868941', thesis: 'storage' },
  STEM:  { name: 'Stem',                  cik: '0001758766', thesis: 'storage' },
  ENVX:  { name: 'Enovix',                cik: '0001828318', thesis: 'storage' },
  // AI Power
  NRG:   { name: 'NRG Energy',            cik: '0001013871', thesis: 'aipower' },
  GEV:   { name: 'GE Vernova',            cik: '0001996810', thesis: 'aipower' },
  ETN:   { name: 'Eaton Corp',            cik: '0001551182', thesis: 'aipower' },
  STRL:  { name: 'Sterling Infrastructure', cik: '0000874238', thesis: 'aipower' },
  HUBB:  { name: 'Hubbell',                cik: '0000048898', thesis: 'gridequipment' },
  POWL:  { name: 'Powell Industries',      cik: '0000080420', thesis: 'gridequipment' },
  PWR:   { name: 'Quanta Services',        cik: '0001050915', thesis: 'gridequipment' },
  MTZ:   { name: 'MasTec',                 cik: '0000015615', thesis: 'gridequipment' },
  MYRG:  { name: 'MYR Group',              cik: '0000700923', thesis: 'gridequipment' },
  AMSC:  { name: 'American Superconductor', cik: '0000880807', thesis: 'gridequipment' },
  WCC:   { name: 'WESCO International',    cik: '0000929008', thesis: 'gridequipment' },
  // Capital Raise Survivors / Small-Cap Inflection
  BW:    { name: 'Babcock & Wilcox',        cik: '0001630805', thesis: 'smallcap-survivors' },
  TNC:   { name: 'Tennant',                 cik: '0000097134', thesis: 'smallcap-survivors' },
  PPIH:  { name: 'Perma-Pipe International', cik: '0000914122', thesis: 'smallcap-survivors' },
  ECPG:  { name: 'Encore Capital Group',    cik: '0001084961', thesis: 'smallcap-survivors' },
  PRKS:  { name: 'United Parks & Resorts',  cik: '0001564902', thesis: 'smallcap-survivors' },
  BRBR:  { name: 'BellRing Brands',         cik: '0001772016', thesis: 'smallcap-survivors' },
  IIPR:  { name: 'Innovative Industrial Properties', cik: '0001677576', thesis: 'smallcap-survivors' },
  NKTR:  { name: 'Nektar Therapeutics',     cik: '0000906709', thesis: 'smallcap-survivors' },
  UFPT:  { name: 'UFP Technologies',        cik: '0000914156', thesis: 'smallcap-survivors' },
  PDFS:  { name: 'PDF Solutions',           cik: '0001120914', thesis: 'smallcap-survivors' },
  // Humanoid Robotics
  TSLA:  { name: 'Tesla',                 cik: '0001318605', thesis: 'humanoid' },
  GOOGL: { name: 'Alphabet',              cik: '0001652044', thesis: 'humanoid' },
  NVDA:  { name: 'NVIDIA',                cik: '0001045810', thesis: 'humanoid' },
  // Quantum
  IONQ:  { name: 'IonQ',                  cik: '0001824920', thesis: 'quantum' },
  RGTI:  { name: 'Rigetti Computing',     cik: '0001838359', thesis: 'quantum' },
  QUBT:  { name: 'Quantum Computing Inc.',cik: '0001758009', thesis: 'quantum' },
  // Semiconductors
  AMAT:  { name: 'Applied Materials',     cik: '0000006951', thesis: 'semis' },
  KLAC:  { name: 'KLA Corporation',       cik: '0000319201', thesis: 'semis' },
  LRCX:  { name: 'Lam Research',          cik: '0000707549', thesis: 'semis' },
  ON:    { name: 'ON Semiconductor',      cik: '0001097864', thesis: 'semis' },
  WOLF:  { name: 'Wolfspeed',             cik: '0000895419', thesis: 'semis' },
  ONTO:  { name: 'Onto Innovation',       cik: '0000704532', thesis: 'semis' },
  // Housing
  DHI:   { name: 'D.R. Horton',           cik: '0000882184', thesis: 'housing' },
  LEN:   { name: 'Lennar',                cik: '0000920760', thesis: 'housing' },
  NVR:   { name: 'NVR',                   cik: '0000906163', thesis: 'housing' },
  TOL:   { name: 'Toll Brothers',         cik: '0000794170', thesis: 'housing' },
  TMHC:  { name: 'Taylor Morrison Home',  cik: '0001562476', thesis: 'housing' },
  SKY:   { name: 'Skyline Champion',      cik: '0000090896', thesis: 'housing' },
  // Hard Money
  GOLD:  { name: 'Barrick Gold',          cik: '0001591588', thesis: 'hardmoney' },
  NEM:   { name: 'Newmont',               cik: '0001164727', thesis: 'hardmoney' },
  WPM:   { name: 'Wheaton Precious Metals', cik: '0001323404', thesis: 'hardmoney' },
  MSTR:  { name: 'MicroStrategy',         cik: '0001050446', thesis: 'hardmoney' },
  COIN:  { name: 'Coinbase',              cik: '0001679788', thesis: 'hardmoney' },
  // Space
  RKLB:  { name: 'Rocket Lab',            cik: '0001819994', thesis: 'space' },
  PL:    { name: 'Planet Labs',           cik: '0001836833', thesis: 'space' },
  ASTS:  { name: 'AST SpaceMobile',       cik: '0001780312', thesis: 'space' },
  BKSY:  { name: 'BlackSky Technology',   cik: '0001753539', thesis: 'space' },
  SPIR:  { name: 'Spire Global',          cik: '0001816017', thesis: 'space' },
  MNTS:  { name: 'Momentus Space',        cik: '0001781162', thesis: 'space' },
  // Hypersonics
  RTX:   { name: 'RTX (Raytheon)',        cik: '0000101829', thesis: 'hypersonics' },
  LHX:   { name: 'L3Harris Technologies', cik: '0000202058', thesis: 'hypersonics' },
});

export const SECTOR_COMPANIES = Object.freeze({
  Technology: [
    { ticker: 'MSFT', cik: '0000789019', name: 'Microsoft',        cap: 'large' },
    { ticker: 'NVDA', cik: '0001045810', name: 'NVIDIA',           cap: 'large' },
    { ticker: 'DDOG', cik: '0001561550', name: 'Datadog',          cap: 'mid'   },
    { ticker: 'CRWD', cik: '0001535527', name: 'CrowdStrike',      cap: 'mid'   },
    { ticker: 'IONQ', cik: '0001824920', name: 'IonQ',             cap: 'small' },
    { ticker: 'SOUN', cik: '0001840856', name: 'SoundHound AI',    cap: 'small' },
  ],
  Healthcare: [
    { ticker: 'JNJ',  cik: '0000200406', name: 'Johnson & Johnson', cap: 'large' },
    { ticker: 'LLY',  cik: '0000059478', name: 'Eli Lilly',         cap: 'large' },
    { ticker: 'VRTX', cik: '0000875320', name: 'Vertex Pharma',     cap: 'large' },
    { ticker: 'MDGL', cik: '0001157601', name: 'Madrigal Pharma',   cap: 'mid'   },
    { ticker: 'ROIV', cik: '0001635088', name: 'Roivant Sciences',  cap: 'mid'   },
  ],
  Energy: [
    { ticker: 'XOM',  cik: '0000034088', name: 'ExxonMobil',       cap: 'large' },
    { ticker: 'COP',  cik: '0001163165', name: 'ConocoPhillips',   cap: 'large' },
    { ticker: 'DVN',  cik: '0001090012', name: 'Devon Energy',     cap: 'mid'   },
    { ticker: 'CTRA', cik: '0000858470', name: 'Coterra Energy',   cap: 'mid'   },
    { ticker: 'AR',   cik: '0001433270', name: 'Antero Resources', cap: 'small' },
  ],
  Financials: [
    { ticker: 'JPM',  cik: '0000019617', name: 'JPMorgan Chase',   cap: 'large' },
    { ticker: 'GS',   cik: '0000886982', name: 'Goldman Sachs',    cap: 'large' },
    { ticker: 'COF',  cik: '0000927628', name: 'Capital One',      cap: 'large' },
    { ticker: 'WAL',  cik: '0001212545', name: 'Western Alliance', cap: 'mid'   },
    { ticker: 'MBIN', cik: '0001629019', name: 'Merchants Bancorp',cap: 'small' },
  ],
  Industrials: [
    { ticker: 'CAT',  cik: '0000018230', name: 'Caterpillar',      cap: 'large' },
    { ticker: 'HON',  cik: '0000773840', name: 'Honeywell',        cap: 'large' },
    { ticker: 'GNRC', cik: '0001474735', name: 'Generac',          cap: 'mid'   },
    { ticker: 'ASTE', cik: '0000792987', name: 'Astec Industries', cap: 'mid'   },
    { ticker: 'POWL', cik: '0000080420', name: 'Powell Industries',cap: 'small' },
  ],
  Consumer: [
    { ticker: 'AMZN', cik: '0001018724', name: 'Amazon',           cap: 'large' },
    { ticker: 'TSLA', cik: '0001318605', name: 'Tesla',            cap: 'large' },
    { ticker: 'FIVE', cik: '0001177609', name: 'Five Below',       cap: 'mid'   },
    { ticker: 'BOOT', cik: '0001610250', name: 'Boot Barn',        cap: 'mid'   },
    { ticker: 'PRPL', cik: '0001643953', name: 'Purple Innovation',cap: 'small' },
  ],
  'Real Estate': [
    { ticker: 'PLD',  cik: '0001045609', name: 'Prologis',         cap: 'large' },
    { ticker: 'AMT',  cik: '0001053507', name: 'American Tower',   cap: 'large' },
    { ticker: 'IIPR', cik: '0001677576', name: 'Innov. Industrial',cap: 'mid'   },
    { ticker: 'ADC',  cik: '0000917251', name: 'Agree Realty',     cap: 'mid'   },
    { ticker: 'GOOD', cik: '0001234006', name: 'Gladstone Comm.',  cap: 'small' },
  ],
  'Clean Energy': [
    { ticker: 'NEE',  cik: '0000753308', name: 'NextEra Energy',   cap: 'large' },
    { ticker: 'ENPH', cik: '0001463101', name: 'Enphase Energy',   cap: 'mid'   },
    { ticker: 'ARRY', cik: '0001820721', name: 'Array Technologies',cap: 'mid'  },
    { ticker: 'HASI', cik: '0001561894', name: 'HA Sustainable Infra',cap: 'mid'},
    { ticker: 'CLNE', cik: '0001368265', name: 'Clean Energy Fuels',cap: 'small'},
  ],
});

export const SECTOR_ALIASES = Object.freeze({
  tech: 'Technology', technology: 'Technology',
  health: 'Healthcare', healthcare: 'Healthcare',
  energy: 'Energy',
  finance: 'Financials', financials: 'Financials', financial: 'Financials',
  industrial: 'Industrials', industrials: 'Industrials',
  consumer: 'Consumer',
  realestate: 'Real Estate', 're': 'Real Estate', 'real-estate': 'Real Estate',
  clean: 'Clean Energy', cleanenergy: 'Clean Energy', renewable: 'Clean Energy',
});

/** Resolve a ticker to { ticker, cik, name, thesis?, sector?, cap? } — or null if unknown. */
export function getByTicker(ticker) {
  const key = ticker.toUpperCase();
  if (THESIS_COMPANIES[key]) {
    return { ticker: key, ...THESIS_COMPANIES[key] };
  }
  for (const [sector, list] of Object.entries(SECTOR_COMPANIES)) {
    const hit = list.find(c => c.ticker === key);
    if (hit) return { ...hit, sector };
  }
  return null;
}

/** Filter thesis companies by thesis tag. */
export function getThesisTickers(thesis) {
  return Object.entries(THESIS_COMPANIES)
    .filter(([, v]) => v.thesis === thesis)
    .map(([ticker, v]) => ({ ticker, ...v }));
}

/** Return the company list for a sector name (or alias). Empty array if unknown. */
export function getSectorTickers(sectorNameOrAlias) {
  const canonical = SECTOR_ALIASES[sectorNameOrAlias?.toLowerCase?.()] ?? sectorNameOrAlias;
  const list = SECTOR_COMPANIES[canonical];
  return list ? list.map(c => ({ ...c, sector: canonical })) : [];
}

/** All known tickers (thesis + sector, de-duplicated, alphabetical). */
export function getAllTickers() {
  const s = new Set(Object.keys(THESIS_COMPANIES));
  for (const list of Object.values(SECTOR_COMPANIES)) {
    for (const c of list) s.add(c.ticker);
  }
  return [...s].sort();
}

/** Normalize a CIK to the SEC's 10-digit zero-padded form. */
export function padCik(cik) {
  return String(cik).replace(/^0+/, '').padStart(10, '0');
}

/** Strip leading zeros — SEC filing URLs want the bare integer form. */
export function stripCik(cik) {
  return String(cik).replace(/^0+/, '');
}
