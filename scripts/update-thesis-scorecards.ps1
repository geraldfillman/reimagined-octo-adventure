[CmdletBinding()]
param(
  [switch]$DryRun,
  [switch]$ApplySignals,
  [int]$Window = 7
)

$ErrorActionPreference = 'Stop'

$vaultRoot = Split-Path $PSScriptRoot -Parent
$thesesDir = Join-Path $vaultRoot '10_Theses'
$sectorPullsDir = Join-Path $vaultRoot '05_Data_Pulls\Sectors'

$thesisData = @{
  'AI Power Infrastructure' = @{
    allocation_priority = 'high'
    allocation_rank = 1
    why_now = 'Hyperscaler capex and power scarcity are creating visible pricing power for dispatchable generation and grid equipment.'
    variant_perception = 'The market still treats this as a temporary AI capex burst instead of a multi-year power bottleneck.'
    next_catalyst = 'Power-contract announcements and grid-equipment backlog updates through 2026.'
    disconfirming_evidence = 'Power-per-FLOP falls fast enough that hyperscaler load growth stops outrunning grid capacity.'
    expected_upside = 'Multi-year rerating plus earnings revisions in utilities and grid-infrastructure names.'
    expected_downside = 'Capex pause or faster supply normalization compresses the scarcity premium.'
    position_sizing = 'Core 3-6% theme basket centered on GEV, VST, NRG, ETN, and STRL.'
    required_sources = @('[[EIA_Electricity]]', '[[SEC EDGAR API]]', '[[USASpending API]]')
    required_pull_families = @('eia --all', 'sec --aipower', 'usaspending --recent')
  }
  'Alzheimers Disease Modification' = @{
    allocation_priority = 'medium'
    allocation_rank = 2
    why_now = 'Disease-modifying Alzheimer''s therapies are entering a stage where real adoption and outcomes can finally be measured.'
    variant_perception = 'Investors still distrust the space after decades of failures, which leaves upside if efficacy and access improve.'
    next_catalyst = 'Label changes, payer access, and confirmatory-trial data over the next 12-18 months.'
    disconfirming_evidence = 'Efficacy remains marginal or safety burdens prevent broad adoption.'
    expected_upside = 'A validated disease-modification story could reset revenue expectations across the category.'
    expected_downside = 'Trial disappointment or slow uptake keeps the thesis a value trap.'
    position_sizing = 'Satellite 0.5-2% sleeve with disciplined event-risk sizing.'
    required_sources = @('[[FDA open data Drugs@FDA]]', '[[ClinicalTrials API]]', '[[PubMed API]]', '[[NewsAPI]]')
    required_pull_families = @('fda --recent-approvals', 'clinicaltrials --alzheimers', 'pubmed --alzheimers', 'newsapi --topic business')
  }
  'Antimicrobial Resistance Pipeline' = @{
    allocation_priority = 'medium'
    allocation_rank = 2
    why_now = 'AMR remains an underfunded but urgent therapeutic area where regulation and public funding can quickly shift sentiment.'
    variant_perception = 'Most investors ignore AMR because commercial models have been poor, leaving room for asymmetric upside if incentives improve.'
    next_catalyst = 'Clinical readouts, BARDA-style support, and FDA progress in resistant-pathogen programs.'
    disconfirming_evidence = 'Clinical failures or policy inaction keep the category commercially uninvestable.'
    expected_upside = 'A small number of winners can rerate hard if incentives and efficacy data align.'
    expected_downside = 'Binary clinical and reimbursement risk can impair the whole sleeve.'
    position_sizing = 'Satellite 0.5-2% basket diversified across pipelines rather than concentrated in one name.'
    required_sources = @('[[FDA open data Drugs@FDA]]', '[[ClinicalTrials API]]', '[[PubMed API]]', '[[NewsAPI]]')
    required_pull_families = @('fda --recent-approvals', 'clinicaltrials --amr', 'pubmed --amr', 'arxiv --amr')
  }
  'Defense AI Autonomous Warfare' = @{
    allocation_priority = 'high'
    allocation_rank = 1
    why_now = 'Real-world conflict is accelerating software-defined warfare and the procurement system is funding AI and autonomy at scale.'
    variant_perception = 'Investors still underweight the durability of software and cloud capture inside defense budgets.'
    next_catalyst = 'Maven, JWCC, DARPA, SOCOM, and NDAA budget updates over the next 12 months.'
    disconfirming_evidence = 'Congress or the DoD freezes autonomous-systems adoption after political or operational backlash.'
    expected_upside = 'Sustained contract flow and multiple expansion for software-first defense winners.'
    expected_downside = 'Binary contract losses or a peace-dividend narrative hits multiples before revenue catches up.'
    position_sizing = 'Core 3-6% defense-AI basket with PLTR and integrators as anchors.'
    required_sources = @('[[USASpending API]]', '[[SAM_Gov]]', '[[SEC EDGAR API]]', '[[NewsAPI]]')
    required_pull_families = @('usaspending --recent', 'sam --opportunities', 'sec --defenseai', 'newsapi --topic business')
  }
  'Dollar Debasement Hard Money' = @{
    allocation_priority = 'high'
    allocation_rank = 1
    why_now = 'Fiscal dominance, debt issuance, and monetary accommodation continue to support hard-asset outperformance.'
    variant_perception = 'Many investors still assume inflation has normalized enough to preserve fiat purchasing power.'
    next_catalyst = 'Treasury issuance, real-rate direction, and fiscal-deficit updates over 2026.'
    disconfirming_evidence = 'Real yields rise materially and fiscal discipline returns faster than expected.'
    expected_upside = 'Gold, hard-money equities, and scarce real assets reprice higher on sustained fiat skepticism.'
    expected_downside = 'Disinflation plus high real yields compress the hard-money narrative.'
    position_sizing = 'Core 3-5% hard-money sleeve with gold-linked and scarce-asset exposure.'
    required_sources = @('[[FRED API]]', '[[Treasury Direct API]]', '[[US Treasury Data]]', '[[BEA API]]')
    required_pull_families = @('fred --group rates', 'treasury --yields', 'bea --gdp', 'newsapi --topic business')
  }
  'Drone Autonomous Systems Revolution' = @{
    allocation_priority = 'medium'
    allocation_rank = 2
    why_now = 'Cheap autonomous drones are becoming the new battlefield and surveillance standard, with procurement moving from experimentation to scaled buying.'
    variant_perception = 'The market still underestimates how much modernization flows through drones, autonomy, and counter-drone stacks.'
    next_catalyst = 'Replicator, DIU, and allied procurement awards plus visible platform adoption.'
    disconfirming_evidence = 'Drone procurement fragments without durable software or integrator winners.'
    expected_upside = 'Winners in autonomy, ISR, and counter-UAS can rerate on recurring procurement.'
    expected_downside = 'Hardware commoditization can keep value capture low for many players.'
    position_sizing = 'Medium 1-3% sleeve with emphasis on software and integration over commodity hardware.'
    required_sources = @('[[USASpending API]]', '[[SAM_Gov]]', '[[SEC EDGAR API]]', '[[NewsAPI]]')
    required_pull_families = @('usaspending --recent', 'sam --opportunities', 'arxiv --drones', 'newsapi --topic business')
  }
  'Gene Editing CRISPR Therapeutics' = @{
    allocation_priority = 'medium'
    allocation_rank = 2
    why_now = 'First-wave commercial gene-editing approvals are shifting the category from proof-of-concept to platform economics.'
    variant_perception = 'The market still prices gene editing as perpetual science optionality instead of a maturing therapeutic platform.'
    next_catalyst = 'Additional indications, manufacturing scale, and reimbursement evidence.'
    disconfirming_evidence = 'Durability, safety, or manufacturability issues prevent the platform from scaling.'
    expected_upside = 'Platform validation can drive multi-year rerating across the leaders.'
    expected_downside = 'Binary trial setbacks remain severe and can impair the whole group.'
    position_sizing = 'Satellite 1-2% basket with strict single-name limits.'
    required_sources = @('[[FDA open data Drugs@FDA]]', '[[ClinicalTrials API]]', '[[PubMed API]]', '[[SEC EDGAR API]]')
    required_pull_families = @('fda --recent-approvals', 'clinicaltrials --geneediting', 'pubmed --geneediting', 'sec --biotech')
  }
  'GLP-1 Metabolic Disease Revolution' = @{
    allocation_priority = 'medium'
    allocation_rank = 2
    why_now = 'GLP-1 demand, label expansion, and second-generation metabolic therapeutics are still broadening the obesity and cardiometabolic market.'
    variant_perception = 'Consensus appreciates the incumbents but may still underprice the breadth of second-order winners and losers.'
    next_catalyst = 'Label-expansion data, supply normalization, and payer-coverage trends.'
    disconfirming_evidence = 'Safety, reimbursement, or supply issues materially cap market expansion.'
    expected_upside = 'Sustained adoption and adjacent-metabolic innovation expand the addressable market.'
    expected_downside = 'Crowding and valuation risk are high if growth merely normalizes.'
    position_sizing = 'Medium 1-3% sleeve focused on proven commercial leaders and differentiated challengers.'
    required_sources = @('[[FDA open data Drugs@FDA]]', '[[ClinicalTrials API]]', '[[PubMed API]]', '[[NewsAPI]]')
    required_pull_families = @('fda --recent-approvals', 'clinicaltrials --glp1', 'pubmed --glp1', 'newsapi --topic business')
  }
  'Grid-Scale Battery Storage' = @{
    allocation_priority = 'medium'
    allocation_rank = 2
    why_now = 'Storage economics are improving as AI load, renewables penetration, and grid instability all increase the value of flexibility.'
    variant_perception = 'The market still sees storage as a commoditized renewable add-on rather than a grid-control asset.'
    next_catalyst = 'Battery deployment data, utility procurement, and interconnection-driven grid stress.'
    disconfirming_evidence = 'Battery oversupply crushes margins without corresponding project uptake.'
    expected_upside = 'Storage operators and key suppliers gain from rising grid-balancing demand.'
    expected_downside = 'Commodity pricing and execution risk keep value capture thin.'
    position_sizing = 'Satellite 1-3% sleeve sized only where project economics are visible.'
    required_sources = @('[[EIA_Electricity]]', '[[IRENA]]', '[[SEC EDGAR API]]')
    required_pull_families = @('eia --generation-mix', 'eia --regional-load', 'sec --battery', 'newsapi --topic business')
  }
  'Housing Supply Correction' = @{
    allocation_priority = 'high'
    allocation_rank = 1
    why_now = 'Rate cuts, lock-in relief, and chronic underbuilding can re-open demand while keeping supply structurally tight.'
    variant_perception = 'Consensus still frames housing as a pure rate trade instead of a prolonged supply-shortage cycle.'
    next_catalyst = 'Mortgage-rate moves, builder confidence, and housing starts through the next Fed easing steps.'
    disconfirming_evidence = 'Unemployment-led demand destruction overwhelms the structural supply shortage.'
    expected_upside = 'Earnings and multiple expansion for builders as qualified-buyer volume reaccelerates.'
    expected_downside = 'A recession or persistent 7%+ mortgage rates would hit volumes and margins together.'
    position_sizing = 'Core 3-5% housing basket led by DHI and NVR, with smaller exposures in LEN, TOL, TMHC, and SKY.'
    required_sources = @('[[FRED Housing Series]]', '[[Census Bureau Housing Data]]', '[[FHFA House Price Index]]', '[[OpenFEMA API]]')
    required_pull_families = @('fred --group housing', 'fred --group rates', 'openfema --recent', 'playbook housing-cycle')
  }
  'Humanoid Robotics' = @{
    allocation_priority = 'watch'
    allocation_rank = 3
    why_now = 'Model quality, actuator costs, and manufacturing ambition are converging enough to keep humanoids investable as a watchlist theme.'
    variant_perception = 'The market alternates between dismissing the category as sci-fi and extrapolating commercialization far too early.'
    next_catalyst = 'Factory deployments, unit economics, and model-performance demos from the leading entrants.'
    disconfirming_evidence = 'Real-world deployment fails to move beyond demo-stage novelty.'
    expected_upside = 'A real commercial deployment curve would create large optionality upside.'
    expected_downside = 'Most names remain narrative-driven and vulnerable to severe de-rating.'
    position_sizing = 'Optional <1% sleeve, preferably indirect through enablers.'
    required_sources = @('[[SEC EDGAR API]]', '[[NewsAPI]]', '[[Financial Modeling Prep]]')
    required_pull_families = @('sec --robotics', 'newsapi --topic business', 'fmp --quote TSLA')
  }
  'Hypersonic Weapons Advanced Defense' = @{
    allocation_priority = 'medium'
    allocation_rank = 2
    why_now = 'Hypersonics remain a strategic catch-up race where a small set of primes and suppliers can benefit from sustained urgency.'
    variant_perception = 'Investors often treat hypersonics as a one-off program rather than a continuing national-security capability gap.'
    next_catalyst = 'Missile-test milestones, program-of-record updates, and defense-budget allocations.'
    disconfirming_evidence = 'Repeated technical failures or treaty pressure reduce procurement momentum.'
    expected_upside = 'Successful milestones can expand the valuation premium on the exposed defense names.'
    expected_downside = 'Program slip and cost blowouts can keep the thesis trapped in headlines only.'
    position_sizing = 'Medium 1-2.5% sleeve via diversified defense exposure.'
    required_sources = @('[[USASpending API]]', '[[SAM_Gov]]', '[[SEC EDGAR API]]', '[[NewsAPI]]')
    required_pull_families = @('usaspending --recent', 'sam --opportunities', 'sec --defense', 'newsapi --topic business')
  }
  'Longevity Aging Biology' = @{
    allocation_priority = 'medium'
    allocation_rank = 2
    why_now = 'Aging-biology narratives are attracting more capital as biomarker tools and platform science improve.'
    variant_perception = 'The market still treats longevity as fringe science rather than an emerging capital-allocation bucket.'
    next_catalyst = 'Early human data, biomarker validation, and capital raises in credible programs.'
    disconfirming_evidence = 'The field remains scientifically interesting but commercially unmonetizable.'
    expected_upside = 'A credible platform winner could rerate sharply as the category institutionalizes.'
    expected_downside = 'Long timelines and weak endpoints keep capital returns poor.'
    position_sizing = 'Small 0.5-1.5% optionality sleeve only.'
    required_sources = @('[[ClinicalTrials API]]', '[[PubMed API]]', '[[SEC EDGAR Search]]', '[[NewsAPI]]')
    required_pull_families = @('clinicaltrials --longevity', 'pubmed --longevity', 'sec --longevity', 'arxiv --longevity')
  }
  'Nuclear Renaissance SMRs' = @{
    allocation_priority = 'high'
    allocation_rank = 1
    why_now = 'Power scarcity, grid reliability needs, and energy-security policy are reviving nuclear as dispatchable clean baseload.'
    variant_perception = 'Markets still treat nuclear as politically stalled rather than as the cleanest answer to rising power demand.'
    next_catalyst = 'SMR licensing, utility procurement, and data-center power deals.'
    disconfirming_evidence = 'Permitting delays or cost overruns keep nuclear out of real project pipelines.'
    expected_upside = 'Utilities, fuel, and nuclear-enablement names rerate as projects move from concept to funded build.'
    expected_downside = 'The thesis remains too early and capital gets trapped in long-duration promises.'
    position_sizing = 'Core 2-4% thematic sleeve, scaled only on real permitting or procurement progress.'
    required_sources = @('[[EIA_Electricity]]', '[[USASpending API]]', '[[SEC EDGAR API]]')
    required_pull_families = @('eia --all', 'usaspending --recent', 'sec --nuclear', 'newsapi --topic business')
  }
  'Psychedelic Mental Health Revolution' = @{
    allocation_priority = 'watch'
    allocation_rank = 3
    why_now = 'Mental-health burden and regulatory openness keep the category alive, but capital markets remain selective.'
    variant_perception = 'The market still swings between dismissing psychedelics entirely and overpricing single-trial optimism.'
    next_catalyst = 'Phase readouts, FDA scheduling progress, and payer-reimbursement clarity.'
    disconfirming_evidence = 'Clinical setbacks or regulatory pushback stall commercialization.'
    expected_upside = 'Strong efficacy and workable delivery models can drive sharp asymmetric upside.'
    expected_downside = 'Binary trial and regulatory risk remain very high.'
    position_sizing = 'Optional 0.25-1% sleeve only.'
    required_sources = @('[[FDA open data Drugs@FDA]]', '[[ClinicalTrials API]]', '[[PubMed API]]', '[[NewsAPI]]')
    required_pull_families = @('clinicaltrials --psychedelics', 'pubmed --psychedelics', 'fda --recent-approvals', 'newsapi --topic business')
  }
  'Quantum Computing' = @{
    allocation_priority = 'watch'
    allocation_rank = 3
    why_now = 'Government contracts and cloud access keep the category investable while hardware milestones continue.'
    variant_perception = 'The market alternates between dismissing quantum as too early and overpaying for every milestone headline.'
    next_catalyst = 'Hardware error-correction milestones and government contract awards over the next year.'
    disconfirming_evidence = 'Commercial traction fails to emerge and hardware milestones stop translating into useful systems.'
    expected_upside = 'A real logical-qubit or major-government-contract milestone could drive outsized rerating.'
    expected_downside = 'Long timelines and speculative multiples can destroy capital in risk-off regimes.'
    position_sizing = 'Optional 0.5-1.5% sleeve, preferably via diversified exposure.'
    required_sources = @('[[USASpending API]]', '[[SEC EDGAR API]]', '[[PubMed API]]', '[[NewsAPI]]')
    required_pull_families = @('usaspending --recent', 'sec --quantum', 'arxiv --quantum', 'newsapi --topic business')
  }
  'Semiconductor Sovereignty CHIPS Act' = @{
    allocation_priority = 'high'
    allocation_rank = 1
    why_now = 'Industrial policy, export controls, and AI compute demand are keeping domestic semiconductor capacity strategically scarce.'
    variant_perception = 'The market underestimates how persistent policy support and geopolitical fragmentation will be.'
    next_catalyst = 'CHIPS disbursements, export-control changes, and AI server demand updates.'
    disconfirming_evidence = 'Capacity ramps ahead of demand and policy urgency fades without further restrictions.'
    expected_upside = 'Foundry, equipment, and sovereign-supply-chain beneficiaries earn premium multiples.'
    expected_downside = 'Cyclical oversupply or subsidy disappointments cut the sovereign-premium narrative.'
    position_sizing = 'Core 2-4% semiconductor sovereignty sleeve focused on strategic bottlenecks.'
    required_sources = @('[[USASpending API]]', '[[SEC EDGAR API]]', '[[NewsAPI]]', '[[Financial Modeling Prep]]')
    required_pull_families = @('usaspending --recent', 'sec --semi', 'newsapi --topic business', 'fmp --quote SOXX')
  }
  'Space Domain Awareness' = @{
    allocation_priority = 'medium'
    allocation_rank = 2
    why_now = 'Space is becoming a funded defense and commercial infrastructure layer, with SDA as one of the clearest government-backed monetization paths.'
    variant_perception = 'Many investors still bucket space as speculative hype instead of persistent national-security infrastructure.'
    next_catalyst = 'SDA contract awards, launch cadence, and defense-budget line items.'
    disconfirming_evidence = 'Program delays or budget shifts keep the economics trapped in prototypes.'
    expected_upside = 'Program-of-record wins can create steep rerating in the narrow set of relevant names.'
    expected_downside = 'Execution slippage and dependence on government budgets keep the thesis fragile.'
    position_sizing = 'Medium 1-3% sleeve, sized around contract visibility rather than narrative alone.'
    required_sources = @('[[USASpending API]]', '[[SAM_Gov]]', '[[SEC EDGAR API]]', '[[NewsAPI]]')
    required_pull_families = @('usaspending --recent', 'sam --opportunities', 'sec --space', 'newsapi --topic business')
  }
  'AI Power Defense Stack' = @{
    allocation_priority = 'watch'
    allocation_rank = 3
    why_now = 'AI infrastructure and defense autonomy are drawing on the same constrained stack: power, compute, cloud, and secure software.'
    variant_perception = 'The market often values power infrastructure, defense software, and semiconductor policy separately even when budgets and bottlenecks are converging.'
    next_catalyst = 'Data-center power deals, defense AI contract awards, and incremental semiconductor-policy support.'
    disconfirming_evidence = 'Power bottlenecks ease quickly or defense AI procurement slows before infrastructure scarcity monetizes.'
    expected_upside = 'Bridge thesis that can surface second-order winners across utilities, semis, cloud, and defense software.'
    expected_downside = 'Too-early bridge thesis that stays intellectually right but untradeable.'
    position_sizing = 'Watchlist bridge thesis; use it to coordinate sizing across adjacent core theses rather than as a standalone allocation.'
    required_sources = @('[[EIA_Electricity]]', '[[USASpending API]]', '[[SAM_Gov]]', '[[SEC EDGAR API]]')
    required_pull_families = @('eia --all', 'usaspending --recent', 'sam --opportunities', 'sec --aipower')
  }
  'Biosecurity Compute Convergence' = @{
    allocation_priority = 'watch'
    allocation_rank = 3
    why_now = 'Biotech platform winners increasingly depend on compute, data, and automation infrastructure that traditional biotech analysis underweights.'
    variant_perception = 'The market often values therapeutic innovation separately from the compute and infrastructure layers that accelerate it.'
    next_catalyst = 'Clinical productivity signals, AI-enabled drug-discovery partnerships, and capital formation in biotech platforms.'
    disconfirming_evidence = 'Biotech productivity does not improve despite larger compute and automation spending.'
    expected_upside = 'Bridge thesis for spotting where infrastructure and platform biology reinforce one another before the market prices the linkage.'
    expected_downside = 'The connection stays conceptually true but too indirect for public-market monetization.'
    position_sizing = 'Watchlist bridge thesis; use it to connect biotech sleeves with infrastructure and compute evidence.'
    required_sources = @('[[ClinicalTrials API]]', '[[PubMed API]]', '[[SEC EDGAR Search]]', '[[EIA_Electricity]]')
    required_pull_families = @('clinicaltrials --all', 'pubmed --all', 'sec --biotech', 'eia --all')
  }
  'Fiscal Scarcity Rearmament' = @{
    allocation_priority = 'watch'
    allocation_rank = 3
    why_now = 'Housing scarcity, fiscal strain, and defense rearmament are all fighting over the same public balance sheet and real resources.'
    variant_perception = 'The market still tends to analyze rates, housing, gold, and defense procurement in separate silos.'
    next_catalyst = 'Treasury issuance, defense-budget updates, and housing-demand data as rate cuts arrive.'
    disconfirming_evidence = 'Fiscal pressure eases without reacceleration in defense or housing-sensitive spending.'
    expected_upside = 'Bridge thesis for identifying where real-asset scarcity and fiscal stress reinforce one another.'
    expected_downside = 'The thesis remains macro-correct but too diffuse to monetize without a sharper trigger.'
    position_sizing = 'Watchlist bridge thesis used to frame relative sizing across housing, hard-money, and defense sleeves.'
    required_sources = @('[[FRED Housing Series]]', '[[Treasury Direct API]]', '[[US Treasury Data]]', '[[USASpending API]]')
    required_pull_families = @('fred --group housing', 'treasury --yields', 'usaspending --recent', 'bea --gdp')
  }
}

function Build-InlineArray {
  param([string[]]$Items)
  return '[' + (($Items | ForEach-Object { '"' + $_ + '"' }) -join ', ') + ']'
}

function Quote-YamlString {
  param([AllowNull()][string]$Value)

  if ($null -eq $Value) { $Value = '' }
  return '"' + (($Value -replace '"', '\"')) + '"'
}

function Get-FrontmatterScalar {
  param(
    [string]$Frontmatter,
    [string]$Field
  )

  $pattern = '(?m)^' + [regex]::Escape($Field) + ':\s*(.+)$'
  $match = [regex]::Match($Frontmatter, $pattern)
  if (-not $match.Success) { return '' }
  return $match.Groups[1].Value.Trim().Trim('"')
}

function Set-FrontmatterField {
  param(
    [string]$Frontmatter,
    [string]$Field,
    [string]$RenderedValue,
    [string]$InsertAfter = 'monitor_action'
  )

  $pattern = '(?m)^' + [regex]::Escape($Field) + ':\s*.*$'
  if ([regex]::IsMatch($Frontmatter, $pattern)) {
    return [regex]::Replace($Frontmatter, $pattern, ($Field + ': ' + $RenderedValue), 1)
  }

  if ($InsertAfter) {
    $anchorPattern = '(?m)^' + [regex]::Escape($InsertAfter) + ':\s*.*$'
    if ([regex]::IsMatch($Frontmatter, $anchorPattern)) {
      return [regex]::Replace($Frontmatter, $anchorPattern, ('$0' + "`r`n" + $Field + ': ' + $RenderedValue), 1)
    }
  }

  return $Frontmatter.TrimEnd() + "`r`n" + $Field + ': ' + $RenderedValue
}

function Get-LatestConvictionDeltaLink {
  if (-not (Test-Path $sectorPullsDir)) { return '' }

  $latest = Get-ChildItem $sectorPullsDir -File -Filter '*_Conviction_Delta*.md' |
    Sort-Object Name -Descending |
    Select-Object -First 1

  if ($null -eq $latest) { return '' }
  return '[[' + [System.IO.Path]::GetFileNameWithoutExtension($latest.Name) + ']]'
}

function Get-ConvictionSummary {
  param([int]$WindowDays)

  Push-Location $PSScriptRoot
  try {
    $output = & node run.mjs scan conviction --window $WindowDays --dry-run --json
    if ($LASTEXITCODE -ne 0) {
      throw 'scan conviction command failed.'
    }

    return (($output -join "`n") | ConvertFrom-Json)
  } finally {
    Pop-Location
  }
}

function Build-MonitorChangeSummary {
  param(
    $Rollup,
    [int]$WindowDays,
    [string]$ProvenanceLink
  )

  if ($null -eq $Rollup) {
    $summary = 'Machine update: no recent sector-scan conviction signals in the last ' + $WindowDays + ' day(s).'
    if ($ProvenanceLink) {
      $summary += ' Source ' + $ProvenanceLink + '.'
    }
    return $summary
  }

  $scoreText = if ([int]$Rollup.netScore -ge 0) { '+' + [int]$Rollup.netScore } else { [string][int]$Rollup.netScore }
  $summary = 'Machine update: rolling conviction ' + $scoreText + ' across ' + [int]$Rollup.signalCount + ' signal(s); ' + $Rollup.actionSummary + '.'
  if ($ProvenanceLink) {
    $summary += ' Source ' + $ProvenanceLink + '.'
  }
  return $summary
}

function Apply-SignalSuggestions {
  param([int]$WindowDays)

  $summary = Get-ConvictionSummary -WindowDays $WindowDays
  $provenanceLink = Get-LatestConvictionDeltaLink
  $rollupMap = @{}

  foreach ($rollup in @($summary.rollups)) {
    $rollupMap[$rollup.thesisFileBase] = $rollup
  }

  $changed = 0

  foreach ($file in Get-ChildItem $thesesDir -File -Filter *.md) {
    $content = Get-Content $file.FullName -Raw
    $match = [regex]::Match($content, '(?s)^---\r?\n(.*?)\r?\n---\r?\n')
    if (-not $match.Success) { continue }

    $frontmatter = $match.Groups[1].Value
    $body = $content.Substring($match.Length)
    $currentStatus = Get-FrontmatterScalar -Frontmatter $frontmatter -Field 'status'
    if ($currentStatus -eq 'Draft') { continue }

    $rollup = $rollupMap[$file.BaseName]
    $hasMachineFields = ($frontmatter -match '(?m)^conviction_rolling_score_7d:') -or ($frontmatter -match '(?m)^suggested_conviction:')
    if (($null -eq $rollup) -and (-not $hasMachineFields)) { continue }

    $rollingScore = if ($null -ne $rollup) { [string][int]$rollup.netScore } else { '0' }
    $signalCount = if ($null -ne $rollup) { [string][int]$rollup.signalCount } else { '0' }
    $lastSignalDate = if ($null -ne $rollup) { [string]$rollup.latestSignalDate } else { '' }
    $suggestedConviction = if ($null -ne $rollup) { [string]$rollup.suggestedConviction } else { '' }
    $suggestedPriority = if ($null -ne $rollup) { [string]$rollup.suggestedAllocationPriority } else { '' }

    $frontmatter = Set-FrontmatterField -Frontmatter $frontmatter -Field 'conviction_rolling_score_7d' -RenderedValue $rollingScore
    $frontmatter = Set-FrontmatterField -Frontmatter $frontmatter -Field 'conviction_signal_count_7d' -RenderedValue $signalCount
    $frontmatter = Set-FrontmatterField -Frontmatter $frontmatter -Field 'conviction_last_signal_date' -RenderedValue (Quote-YamlString $lastSignalDate)
    $frontmatter = Set-FrontmatterField -Frontmatter $frontmatter -Field 'suggested_conviction' -RenderedValue (Quote-YamlString $suggestedConviction)
    $frontmatter = Set-FrontmatterField -Frontmatter $frontmatter -Field 'suggested_allocation_priority' -RenderedValue (Quote-YamlString $suggestedPriority)

    if ($null -ne $rollup) {
      $frontmatter = Set-FrontmatterField -Frontmatter $frontmatter -Field 'monitor_change' -RenderedValue (Quote-YamlString (Build-MonitorChangeSummary -Rollup $rollup -WindowDays $WindowDays -ProvenanceLink $provenanceLink))
      if ([int]$rollup.netScore -ge 3) {
        $frontmatter = Set-FrontmatterField -Frontmatter $frontmatter -Field 'monitor_status' -RenderedValue (Quote-YamlString 'strengthening')
      }
      if ([int]$rollup.netScore -le -3) {
        $frontmatter = Set-FrontmatterField -Frontmatter $frontmatter -Field 'break_risk_status' -RenderedValue (Quote-YamlString 'watch')
      }
      if ([int]$rollup.netScore -le -5) {
        $frontmatter = Set-FrontmatterField -Frontmatter $frontmatter -Field 'status' -RenderedValue (Quote-YamlString 'On Hold')
      }
    }

    $updated = "---`r`n$frontmatter`r`n---`r`n$body"
    if ($updated -eq $content) { continue }

    $changed++
    if ($DryRun) {
      Write-Host ('[dry-run] would update signal fields in ' + $file.Name)
    } else {
      Set-Content -LiteralPath $file.FullName -Value $updated -Encoding utf8
    }
  }

  $modeLabel = if ($DryRun) { 'dry run' } else { 'live' }
  Write-Host ('Signal scorecard update complete (' + $modeLabel + '): ' + $changed + ' thesis note(s).')
}

if ($ApplySignals) {
  Apply-SignalSuggestions -WindowDays $Window
  return
}

foreach ($file in Get-ChildItem $thesesDir -File -Filter *.md) {
  $base = $file.BaseName
  if (-not $thesisData.ContainsKey($base)) { continue }

  $data = $thesisData[$base]
  $content = Get-Content $file.FullName -Raw
  $match = [regex]::Match($content, '(?s)^---\r?\n(.*?)\r?\n---\r?\n')
  if (-not $match.Success) { continue }

  $frontmatter = $match.Groups[1].Value
  $body = $content.Substring($match.Length)

  if ($frontmatter -notmatch '(?m)^allocation_priority:') {
    $scoreFields = @(
      ('allocation_priority: "' + $data.allocation_priority + '"'),
      ('allocation_rank: ' + $data.allocation_rank),
      ('why_now: "' + $data.why_now + '"'),
      ('variant_perception: "' + $data.variant_perception + '"'),
      ('next_catalyst: "' + $data.next_catalyst + '"'),
      ('disconfirming_evidence: "' + $data.disconfirming_evidence + '"'),
      ('expected_upside: "' + $data.expected_upside + '"'),
      ('expected_downside: "' + $data.expected_downside + '"'),
      ('position_sizing: "' + $data.position_sizing + '"'),
      ('required_sources: ' + (Build-InlineArray $data.required_sources)),
      ('required_pull_families: ' + (Build-InlineArray $data.required_pull_families))
    ) -join "`r`n"
    $frontmatter = [regex]::Replace($frontmatter, '(?m)^timeframe:\s*"[^"]+"\s*$', "`$0`r`n$scoreFields", 1)
  }

  if ($body -notmatch '(?m)^## Investment Scorecard') {
    $scorecardBlock = @(
      '## Investment Scorecard',
      '',
      ('- **Allocation Priority**: ' + $data.allocation_priority + ' (' + $data.allocation_rank + ')'),
      ('- **Why now**: ' + $data.why_now),
      ('- **Variant perception**: ' + $data.variant_perception),
      ('- **Next catalyst**: ' + $data.next_catalyst),
      ('- **Disconfirming evidence**: ' + $data.disconfirming_evidence),
      ('- **Expected upside**: ' + $data.expected_upside),
      ('- **Expected downside**: ' + $data.expected_downside),
      ('- **Sizing rule**: ' + $data.position_sizing),
      '',
      '## Required Evidence',
      '',
      ('- **Source notes**: ' + ($data.required_sources -join ', ')),
      ('- **Pull families**: ' + ($data.required_pull_families -join ', ')),
      ''
    ) -join "`r`n"
    $body = [regex]::Replace($body, '(?m)^## Position Sizing & Risk', "$scorecardBlock`r`n## Position Sizing & Risk", 1)
  }

  $updated = "---`r`n$frontmatter`r`n---`r`n$body"
  if ($DryRun) {
    Write-Host ('[dry-run] would backfill scorecard fields in ' + $file.Name)
  } else {
    Set-Content -LiteralPath $file.FullName -Value $updated -Encoding utf8
  }
}
