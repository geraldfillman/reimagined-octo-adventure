const DEFAULT_CONNECTION_LIMIT = 12;
const SIGNAL_RANK = Object.freeze({ clear: 0, watch: 1, alert: 2, critical: 3 });

export function buildConnectionCandidates({
  date,
  items = [],
  trends = [],
  localEvidence = [],
  limit = DEFAULT_CONNECTION_LIMIT,
} = {}) {
  const candidates = [];
  const seen = new Map();

  for (const trend of arrayFrom(trends)) {
    const trendItems = arrayFrom(trend.items).length ? arrayFrom(trend.items) : arrayFrom(items);
    const relatedScenarios = uniqueValues(trend.scenarios || trend.relatedScenarios);
    const matchedEvidence = matchEvidenceForTrend(trend, localEvidence);
    const candidateType = classifyCandidate({ relatedScenarios, matchedEvidence });
    const status = candidateStatus(matchedEvidence);
    const route = suggestedRoute({ candidateType, trend, status });
    const title = candidateTitle({ candidateType, trend });
    const commands = uniqueValues([
      ...arrayFrom(trend.commands),
      ...relatedScenarios.map(scenario => `node run.mjs pull event-research --scenario ${scenario} --dry-run`),
    ]);
    const score =
      Number(trend.score || 0) +
      trendItems.length * 3 +
      arrayFrom(trend.matchedTerms).length +
      relatedScenarios.length * 2 +
      matchedEvidence.length * 4 +
      Math.max(0, ...matchedEvidence.map(row => rankSignal(row.signalStatus)));

    const candidate = {
      candidate_id: stableId([date, candidateType, trend.id || trend.label, relatedScenarios.join('-')]),
      candidate_type: candidateType,
      status,
      title,
      date: String(date || '').slice(0, 10),
      score,
      suggested_route: route,
      review_question: reviewQuestion({ candidateType, trend, route }),
      matched_trends: [String(trend.label || trend.id || 'Inbox trend')],
      matched_terms: uniqueValues(trend.matchedTerms).slice(0, 8),
      related_scenarios: relatedScenarios,
      source_items: trendItems.map(item => ({
        title: item.title || item.relativePath || 'Inbox item',
        relative_path: item.relativePath || item.path || '',
        route: item.route || '',
      })),
      evidence_links: matchedEvidence.slice(0, 5).map(evidenceToLink),
      commands: commands.length ? commands : ['node run.mjs bridge ingest-world-inbox --dry-run'],
    };

    const prior = seen.get(candidate.candidate_id);
    if (!prior || candidate.score > prior.score) {
      seen.set(candidate.candidate_id, candidate);
    }
  }

  candidates.push(...seen.values());
  return candidates
    .sort((left, right) =>
      statusRank(right.status) - statusRank(left.status) ||
      right.score - left.score ||
      typeRank(left.candidate_type) - typeRank(right.candidate_type) ||
      left.title.localeCompare(right.title)
    )
    .slice(0, Math.max(1, Number(limit) || DEFAULT_CONNECTION_LIMIT));
}

export function renderConnectionCandidatesSection(candidates = []) {
  const rows = arrayFrom(candidates);
  const lines = [
    '',
    '## Current Event Connection Candidates',
    '',
  ];

  if (rows.length === 0) {
    lines.push('No current-event connection candidates were generated for this inbox batch.');
    return lines;
  }

  lines.push('| Candidate | Type | Status | Route | Evidence | Review |');
  lines.push('|---|---|---|---|---|---|');
  for (const candidate of rows) {
    const evidence = candidate.evidence_links?.length
      ? candidate.evidence_links.map(link => formatWikiLink(link.rel_path, link.label)).join(', ')
      : 'No local evidence link';
    lines.push([
      escapePipe(candidate.title),
      escapePipe(candidate.candidate_type),
      escapePipe(candidate.status),
      `\`${escapePipe(candidate.suggested_route)}\``,
      escapePipe(evidence),
      escapePipe(candidate.review_question),
    ].join(' | ').replace(/^/, '| ').replace(/$/, ' |'));
  }

  return lines;
}

export function renderMermaidConnectionMap(candidates = [], { limit = DEFAULT_CONNECTION_LIMIT } = {}) {
  const rows = arrayFrom(candidates).slice(0, Math.max(1, Number(limit) || DEFAULT_CONNECTION_LIMIT));
  if (rows.length === 0) {
    return [
      '```mermaid',
      'flowchart LR',
      '  empty_0["No event connection candidates"]',
      '```',
    ].join('\n');
  }

  const lines = ['```mermaid', 'flowchart LR'];
  const nodes = new Set();
  const edges = new Set();

  for (const candidate of rows) {
    const item = candidate.source_items?.[0] || {};
    const trendLabel = candidate.matched_trends?.[0] || candidate.title;
    const scenarioLabel = candidate.related_scenarios?.[0] || 'Emerging event';
    const routeLabel = candidate.suggested_route || 'Review route';

    const itemId = mermaidId('item', item.title || item.relative_path || candidate.title);
    const trendId = mermaidId('trend', trendLabel);
    const scenarioId = mermaidId('scenario', scenarioLabel);
    const routeId = mermaidId('route', routeLabel);

    addNode(lines, nodes, itemId, item.title || item.relative_path || 'Inbox item');
    addNode(lines, nodes, trendId, trendLabel);
    addNode(lines, nodes, scenarioId, scenarioLabel);
    addNode(lines, nodes, routeId, routeLabel);
    addEdge(lines, edges, itemId, trendId);
    addEdge(lines, edges, trendId, scenarioId);
    addEdge(lines, edges, scenarioId, routeId);
  }

  lines.push('```');
  return lines.join('\n');
}

export function renderPlotlyEventConnectionsHtml({ date, candidates = [] } = {}) {
  const rows = arrayFrom(candidates).map(candidate => ({
    id: candidate.candidate_id,
    title: candidate.title,
    label: synthesizeCandidateLabel(candidate),
    type: candidate.candidate_type,
    status: candidate.status,
    score: candidate.score,
    route: candidate.suggested_route,
    trends: arrayFrom(candidate.matched_trends),
    scenarios: arrayFrom(candidate.related_scenarios),
    source_count: arrayFrom(candidate.source_items).length,
    evidence_count: arrayFrom(candidate.evidence_links).length,
    source_summary: summarizeLabels(arrayFrom(candidate.source_items).map(item => item.title || item.relative_path)),
    evidence_summary: summarizeLabels(arrayFrom(candidate.evidence_links).map(link => link.label || link.rel_path)),
    source_items: arrayFrom(candidate.source_items).map(item => ({
      title: item.title,
      relative_path: item.relative_path,
      route: item.route,
    })),
    evidence_links: arrayFrom(candidate.evidence_links).map(link => ({
      label: link.label,
      rel_path: link.rel_path,
      url: `obsidian://open?vault=My_Data&file=${encodeURIComponent(link.rel_path || '')}`,
    })),
    commands: arrayFrom(candidate.commands),
  }));
  const payload = {
    graph_schema_version: 1,
    date: String(date || '').slice(0, 10),
    candidates: rows,
    manual_nodes: [],
    manual_edges: [],
    node_reviews: {},
    hide_not_relevant: false,
    deleted_node_ids: [],
    deleted_edge_ids: [],
  };
  const safePayload = JSON.stringify(payload).replace(/</g, '\\u003c');
  const totalSources = uniqueValues(rows.flatMap(row => row.source_items.map(item => item.relative_path || item.title))).length;
  const totalEvidence = uniqueValues(rows.flatMap(row => row.evidence_links.map(link => link.rel_path || link.label))).length;

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Inbox Event Connections ${escapeHtml(payload.date)}</title>
<script src="https://cdn.plot.ly/plotly-2.35.2.min.js"></script>
<style>
body{margin:0;background:#f6f8f7;color:#17212b;font:14px/1.5 -apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif}
main{max-width:1320px;margin:0 auto;padding:28px}
h1{margin:0 0 8px;font-size:30px}
.meta{color:#66727d;margin-bottom:20px}
.grid{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:18px;align-items:start}
.panel{background:#fff;border:1px solid #dce3df;border-radius:8px;padding:16px}
.panel h2{font-size:16px;margin:0 0 12px}
.network-panel{min-width:0}
#table{grid-column:1 / -1}
.stack{display:grid;gap:14px}
.field{display:grid;gap:5px;margin-bottom:10px}
label{font-weight:600;font-size:12px;color:#53606a}
input,select,textarea{width:100%;box-sizing:border-box;border:1px solid #cfd8d4;border-radius:6px;padding:8px;background:#fff;color:#17212b;font:13px/1.4 inherit}
textarea{min-height:120px;resize:vertical}
.button-row{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}
button{border:1px solid #aebbb6;background:#f8faf9;color:#17212b;border-radius:6px;padding:8px 10px;font-weight:600;cursor:pointer}
button.primary{background:#246a73;color:#fff;border-color:#246a73}
button.danger{border-color:#b66;background:#fff6f5;color:#8b2f2f}
.hint{color:#66727d;font-size:12px;margin-top:6px}
.selected{padding:8px;border:1px solid #dce3df;border-radius:6px;background:#f8faf9;color:#31404d;min-height:20px}
.detail{padding:10px;border:1px solid #dce3df;border-radius:6px;background:#fff;margin:10px 0;font-size:13px}
.detail h3{font-size:14px;margin:0 0 8px}
.detail ul{margin:6px 0 0;padding-left:18px}
.detail a{color:#246a73;text-decoration:none}
.review-controls{display:grid;gap:8px;margin:10px 0}
.checkline{display:flex;align-items:center;gap:8px;font-size:13px}
.checkline input{width:auto}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{border-top:1px solid #e3e8e5;padding:8px;text-align:left;vertical-align:top}
th{background:#eef3f1}
@media(max-width:850px){.grid{grid-template-columns:1fr}}
</style>
</head>
<body>
<main>
<h1>Inbox Event Connections</h1>
<div class="meta">${escapeHtml(payload.date)} &middot; ${rows.length} synthesized candidate(s) &middot; ${totalSources} inbox source(s) &middot; ${totalEvidence} local evidence link(s)</div>
<div class="grid">
  <section class="panel network-panel"><div id="network" style="height:620px"></div></section>
  <aside class="stack">
    <section class="panel">
      <h2>Manual Overlay</h2>
      <div class="selected" id="selected-node">Select a node in the graph.</div>
      <div class="detail" id="selected-details">Node details and My_Data links will appear here.</div>
      <div class="review-controls">
        <label class="checkline"><input type="checkbox" id="mark-not-relevant"> Mark selected node not relevant</label>
        <label class="checkline"><input type="checkbox" id="hide-not-relevant"> Hide not relevant nodes</label>
        <div class="button-row">
          <button id="mark-relevant">Mark Relevant</button>
          <button id="mark-needs-review">Needs Review</button>
        </div>
      </div>
      <div class="field">
        <label for="manual-node-label">Node label</label>
        <input id="manual-node-label" placeholder="Manual node title">
      </div>
      <div class="field">
        <label for="manual-node-type">Node type</label>
        <select id="manual-node-type">
          <option value="manual_observation">Manual observation</option>
          <option value="event">Event</option>
          <option value="entity">Entity</option>
          <option value="thesis">Thesis</option>
          <option value="source">Source</option>
        </select>
      </div>
      <button class="primary" id="add-node">Add Node</button>
      <div class="hint">Manual edits are stored in this browser's localStorage for this artifact date.</div>
    </section>
    <section class="panel">
      <h2>Manual Connection</h2>
      <div class="field">
        <label for="edge-source">From</label>
        <select id="edge-source"></select>
      </div>
      <div class="field">
        <label for="edge-target">To</label>
        <select id="edge-target"></select>
      </div>
      <div class="field">
        <label for="edge-label">Connection label</label>
        <input id="edge-label" placeholder="supports, contradicts, routes to">
      </div>
      <div class="button-row">
        <button class="primary" id="add-edge">Add Edge</button>
        <button class="danger" id="delete-selected">Delete Selected</button>
        <button id="reset-manual">Reset Manual</button>
      </div>
    </section>
    <section class="panel">
      <h2>Export Manual Edits</h2>
      <textarea id="manual-export" readonly></textarea>
      <div class="button-row"><button id="refresh-export">Refresh Export</button></div>
    </section>
    <section class="panel"><div id="scores" style="height:260px"></div></section>
  </aside>
  <section id="table" class="panel"></section>
</div>
</main>
<script>
window.INBOX_EVENT_CONNECTIONS = ${safePayload};
const payload = window.INBOX_EVENT_CONNECTIONS;
const storageKey = 'inbox-event-network:' + payload.date;
let selectedNodeId = null;
let manualState = loadManualState();
let currentGraph = null;

renderNetwork();
Plotly.newPlot('scores', [{
  type: 'bar',
  orientation: 'h',
  x: payload.candidates.map(c => c.score || 0),
  y: payload.candidates.map(c => c.title),
  marker: { color: payload.candidates.map(c => c.status === 'alert' ? '#a44' : '#246a73') }
}], { title: 'Candidate Scores', margin: { t: 40, l: 160, r: 8, b: 30 }, paper_bgcolor: '#fff', plot_bgcolor: '#fff' }, { responsive: true });
document.getElementById('table').innerHTML = '<h2>Candidate Review Table</h2><table><thead><tr><th>Candidate</th><th>Status</th><th>Type</th><th>Route</th><th>Evidence</th></tr></thead><tbody>' +
  payload.candidates.map(c => '<tr><td>' + esc(c.title) + '</td><td>' + esc(c.status) + '</td><td>' + esc(c.type) + '</td><td><code>' + esc(c.route) + '</code></td><td>' + c.evidence_links.map(e => esc(e.label)).join(', ') + '</td></tr>').join('') +
  '</tbody></table>';

document.getElementById('add-node').addEventListener('click', () => {
  const label = document.getElementById('manual-node-label').value.trim();
  if (!label) return;
  const type = document.getElementById('manual-node-type').value;
  manualState.manual_nodes.push({
    id: 'manual-node-' + slug(label) + '-' + Date.now().toString(36),
    label,
    type,
    source: 'manual',
  });
  document.getElementById('manual-node-label').value = '';
  saveManualState();
  renderNetwork();
});

document.getElementById('mark-not-relevant').addEventListener('change', event => {
  if (!selectedNodeId) {
    event.target.checked = false;
    return;
  }
  setSelectedReview(event.target.checked ? 'not_relevant' : 'needs_review');
});

document.getElementById('mark-relevant').addEventListener('click', () => setSelectedReview('relevant'));
document.getElementById('mark-needs-review').addEventListener('click', () => setSelectedReview('needs_review'));
document.getElementById('hide-not-relevant').addEventListener('change', event => {
  manualState.hide_not_relevant = Boolean(event.target.checked);
  saveManualState();
  renderNetwork();
});

document.getElementById('add-edge').addEventListener('click', () => {
  const from = document.getElementById('edge-source').value;
  const to = document.getElementById('edge-target').value;
  if (!from || !to || from === to) return;
  const label = document.getElementById('edge-label').value.trim() || 'manual connection';
  manualState.manual_edges.push({
    id: 'manual-edge-' + slug(from + '-' + to + '-' + label) + '-' + Date.now().toString(36),
    from,
    to,
    label,
    source: 'manual',
  });
  document.getElementById('edge-label').value = '';
  saveManualState();
  renderNetwork();
});

document.getElementById('delete-selected').addEventListener('click', () => {
  if (!selectedNodeId) return;
  const selected = currentGraph.nodes.find(node => node.id === selectedNodeId);
  if (!selected) return;
  if (selected.source === 'manual') {
    manualState.manual_nodes = manualState.manual_nodes.filter(node => node.id !== selectedNodeId);
    manualState.manual_edges = manualState.manual_edges.filter(edge => edge.from !== selectedNodeId && edge.to !== selectedNodeId);
  } else {
    manualState.deleted_node_ids.push(selectedNodeId);
    manualState.manual_edges = manualState.manual_edges.filter(edge => edge.from !== selectedNodeId && edge.to !== selectedNodeId);
  }
  selectedNodeId = null;
  saveManualState();
  renderNetwork();
});

document.getElementById('reset-manual').addEventListener('click', () => {
  manualState = emptyManualState();
  selectedNodeId = null;
  saveManualState();
  renderNetwork();
});
document.getElementById('refresh-export').addEventListener('click', updateExport);

function renderNetwork() {
  const fullGraph = buildGraph();
  const visibleNodeIds = new Set(fullGraph.nodes
    .filter(node => !(manualState.hide_not_relevant && nodeReview(node.id).relevance === 'not_relevant'))
    .map(node => node.id));
  currentGraph = {
    nodes: fullGraph.nodes.filter(node => visibleNodeIds.has(node.id)),
    edges: fullGraph.edges.filter(edge => visibleNodeIds.has(edge.from) && visibleNodeIds.has(edge.to)),
  };
  if (selectedNodeId && !visibleNodeIds.has(selectedNodeId)) selectedNodeId = null;
  const positions = layoutNodes(currentGraph.nodes);
  const edgeX = [];
  const edgeY = [];
  const edgeText = [];
  for (const edge of currentGraph.edges) {
    const from = positions.get(edge.from);
    const to = positions.get(edge.to);
    if (!from || !to) continue;
    edgeX.push(from.x, to.x, null);
    edgeY.push(from.y, to.y, null);
    edgeText.push(edge.label || '', edge.label || '', '');
  }
  const nodeX = [];
  const nodeY = [];
  const nodeText = [];
  const nodeHover = [];
  const nodeColor = [];
  const nodeOpacity = [];
  const nodeSize = [];
  const nodeIds = [];
  for (const node of currentGraph.nodes) {
    const pos = positions.get(node.id);
    nodeX.push(pos.x);
    nodeY.push(pos.y);
    nodeText.push(node.label);
    nodeHover.push(nodeHoverText(node));
    nodeColor.push(nodeColorFor(node));
    nodeOpacity.push(nodeReview(node.id).relevance === 'not_relevant' ? 0.22 : 1);
    nodeSize.push(node.source === 'manual' ? 18 : Math.min(28, 12 + Math.max(0, Number(node.score || 0)) / 45));
    nodeIds.push(node.id);
  }
  Plotly.newPlot('network', [
    {
      type: 'scatter',
      mode: 'lines',
      x: edgeX,
      y: edgeY,
      hoverinfo: 'text',
      text: edgeText,
      line: { color: 'rgba(42,76,86,.28)', width: 1.5 },
    },
    {
      type: 'scatter',
      mode: 'markers+text',
      x: nodeX,
      y: nodeY,
      text: nodeText,
      customdata: nodeIds,
      hovertext: nodeHover,
      hoverinfo: 'text',
      textposition: 'top center',
      marker: {
        color: nodeColor,
        opacity: nodeOpacity,
        size: nodeSize,
        line: { color: '#fff', width: 1.5 },
      },
    },
  ], {
    title: 'Event Connection Network',
    showlegend: false,
    margin: { t: 42, l: 18, r: 18, b: 18 },
    paper_bgcolor: '#fff',
    plot_bgcolor: '#fff',
    xaxis: { visible: false, range: [0, 1] },
    yaxis: { visible: false, range: [0, 1] },
    hovermode: 'closest',
  }, { responsive: true });
  const graphDiv = document.getElementById('network');
  graphDiv.on('plotly_click', event => {
    const point = event?.points?.[0];
    if (!point || point.curveNumber !== 1) return;
    selectedNodeId = point.customdata;
    const selected = currentGraph.nodes.find(node => node.id === selectedNodeId);
    document.getElementById('selected-node').textContent = selected ? selected.label + ' (' + selected.type + ', ' + selected.source + ')' : 'Select a node in the graph.';
    renderSelectedNodeDetails(selected);
  });
  if (!selectedNodeId) renderSelectedNodeDetails(null);
  populateEdgeSelects();
  updateExport();
}

function buildGraph() {
  const nodes = new Map();
  const edges = new Map();
  const deletedNodes = new Set(manualState.deleted_node_ids || []);
  const deletedEdges = new Set(manualState.deleted_edge_ids || []);
  function node(id, label, type, extra = {}) {
    if (!id || deletedNodes.has(id) || nodes.has(id)) return;
    nodes.set(id, { id, label, type, source: 'automated', ...extra });
  }
  function edge(id, from, to, label, extra = {}) {
    if (!from || !to || from === to || deletedEdges.has(id) || deletedNodes.has(from) || deletedNodes.has(to)) return;
    if (!nodes.has(from) || !nodes.has(to) || edges.has(id)) return;
    edges.set(id, { id, from, to, label, source: 'automated', ...extra });
  }
  const batchId = 'batch-' + slug(payload.date || 'inbox-batch');
  node(batchId, 'Inbox batch ' + payload.date, 'batch', {
    source_count: uniqueStrings(payload.candidates.flatMap(c => (c.source_items || []).map(item => item.relative_path || item.title))).length,
  });
  for (const c of payload.candidates) {
    const candidateId = 'candidate-' + c.id;
    node(candidateId, c.label || c.title, 'candidate', {
      status: c.status,
      score: c.score,
      candidate_type: c.type,
      source_count: c.source_count || 0,
      evidence_count: c.evidence_count || 0,
      source_summary: c.source_summary || '',
      evidence_summary: c.evidence_summary || '',
      evidence_links: c.evidence_links || [],
      source_items: c.source_items || [],
      commands: c.commands || [],
      full_title: c.title,
    });
    edge('edge-' + batchId + '-' + candidateId, batchId, candidateId, 'candidate');
    for (const trend of c.trends || []) {
      const id = 'trend-' + slug(trend);
      node(id, trend, 'trend');
      edge('edge-' + id + '-' + candidateId, id, candidateId, 'synthesizes');
    }
    for (const scenario of c.scenarios || []) {
      const id = 'scenario-' + slug(scenario);
      node(id, scenario, 'scenario');
      edge('edge-' + candidateId + '-' + id, candidateId, id, 'scenario');
    }
    const routeId = 'route-' + slug(c.route || 'review');
    node(routeId, c.route || 'Review route', 'route');
    edge('edge-' + candidateId + '-' + routeId, candidateId, routeId, 'review route');
  }
  for (const manualNode of manualState.manual_nodes || []) {
    if (!deletedNodes.has(manualNode.id)) nodes.set(manualNode.id, { ...manualNode, source: 'manual' });
  }
  for (const manualEdge of manualState.manual_edges || []) {
    if (!deletedEdges.has(manualEdge.id) && nodes.has(manualEdge.from) && nodes.has(manualEdge.to)) edges.set(manualEdge.id, { ...manualEdge, source: 'manual' });
  }
  return { nodes: [...nodes.values()], edges: [...edges.values()] };
}

function layoutNodes(nodes) {
  const groups = new Map();
  const xByType = {
    batch: 0.08,
    trend: 0.26,
    candidate: 0.48,
    scenario: 0.72,
    route: 0.92,
    manual_observation: 0.48,
    event: 0.68,
    entity: 0.28,
    thesis: 0.82,
    source: 0.18,
  };
  for (const node of nodes) {
    const key = node.type || 'manual_observation';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(node);
  }
  const positions = new Map();
  for (const [type, group] of groups) {
    const ordered = [...group].sort((left, right) => String(left.label).localeCompare(String(right.label)));
    const step = 1 / (ordered.length + 1);
    ordered.forEach((node, index) => {
      positions.set(node.id, { x: xByType[type] ?? 0.5, y: 1 - step * (index + 1) });
    });
  }
  return positions;
}

function populateEdgeSelects() {
  const options = currentGraph.nodes
    .map(node => '<option value="' + escAttr(node.id) + '">' + esc(node.label) + '</option>')
    .join('');
  document.getElementById('edge-source').innerHTML = options;
  document.getElementById('edge-target').innerHTML = options;
}

function updateExport() {
  document.getElementById('manual-export').value = JSON.stringify(manualState, null, 2);
}

function setSelectedReview(relevance) {
  if (!selectedNodeId) return;
  manualState.node_reviews[selectedNodeId] = {
    ...(manualState.node_reviews[selectedNodeId] || {}),
    relevance,
    reviewed_at: new Date().toISOString(),
  };
  saveManualState();
  renderNetwork();
  const selected = currentGraph.nodes.find(node => node.id === selectedNodeId);
  renderSelectedNodeDetails(selected || null);
}

function renderSelectedNodeDetails(node) {
  document.getElementById('hide-not-relevant').checked = Boolean(manualState.hide_not_relevant);
  const checkbox = document.getElementById('mark-not-relevant');
  if (!node) {
    checkbox.checked = false;
    document.getElementById('selected-details').innerHTML = 'Node details and My_Data links will appear here.';
    return;
  }
  const review = nodeReview(node.id);
  checkbox.checked = review.relevance === 'not_relevant';
  const evidence = Array.isArray(node.evidence_links) && node.evidence_links.length
    ? '<h4>My_Data Evidence</h4><ul>' + node.evidence_links.map(link => '<li><a href="' + escAttr(link.url || '') + '">' + esc(link.label || link.rel_path) + '</a></li>').join('') + '</ul>'
    : '<h4>My_Data Evidence</h4><p>No direct My_Data evidence links on this node.</p>';
  const sources = Array.isArray(node.source_items) && node.source_items.length
    ? '<h4>Inbox Sources</h4><ul>' + node.source_items.slice(0, 6).map(item => '<li>' + esc(item.title || item.relative_path) + '</li>').join('') + (node.source_items.length > 6 ? '<li>+' + esc(node.source_items.length - 6) + ' more</li>' : '') + '</ul>'
    : '';
  const commands = Array.isArray(node.commands) && node.commands.length
    ? '<h4>Dry-Run Commands</h4><ul>' + node.commands.map(command => '<li><code>' + esc(command) + '</code></li>').join('') + '</ul>'
    : '';
  document.getElementById('selected-details').innerHTML =
    '<h3>' + esc(node.full_title || node.label) + '</h3>' +
    '<p><strong>Review:</strong> ' + esc(review.relevance || 'needs_review') + '</p>' +
    '<p><strong>Type:</strong> ' + esc(node.type) + (node.status ? ' &middot; <strong>Status:</strong> ' + esc(node.status) : '') + '</p>' +
    (node.source_summary ? '<p><strong>Sources:</strong> ' + esc(node.source_summary) + '</p>' : '') +
    (node.evidence_summary ? '<p><strong>Evidence:</strong> ' + esc(node.evidence_summary) + '</p>' : '') +
    evidence + sources + commands;
}

function loadManualState() {
  try {
    const stored = JSON.parse(localStorage.getItem(storageKey) || 'null');
    return normalizeManualState(stored || payload);
  } catch (_error) {
    return emptyManualState();
  }
}

function saveManualState() {
  manualState = normalizeManualState(manualState);
  localStorage.setItem(storageKey, JSON.stringify(manualState));
}

function normalizeManualState(value) {
  return {
    graph_schema_version: 1,
    manual_nodes: Array.isArray(value?.manual_nodes) ? value.manual_nodes : [],
    manual_edges: Array.isArray(value?.manual_edges) ? value.manual_edges : [],
    node_reviews: normalizeNodeReviews(value?.node_reviews),
    hide_not_relevant: Boolean(value?.hide_not_relevant),
    deleted_node_ids: uniqueStrings(value?.deleted_node_ids),
    deleted_edge_ids: uniqueStrings(value?.deleted_edge_ids),
  };
}

function emptyManualState() {
  return { graph_schema_version: 1, manual_nodes: [], manual_edges: [], node_reviews: {}, hide_not_relevant: false, deleted_node_ids: [], deleted_edge_ids: [] };
}

function nodeReview(id) {
  return manualState.node_reviews?.[id] || { relevance: 'needs_review' };
}

function normalizeNodeReviews(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const out = {};
  for (const [id, review] of Object.entries(value)) {
    if (!id || !review || typeof review !== 'object') continue;
    const relevance = ['relevant', 'not_relevant', 'needs_review'].includes(review.relevance) ? review.relevance : 'needs_review';
    out[id] = { relevance, reviewed_at: review.reviewed_at || null };
  }
  return out;
}

function nodeHoverText(node) {
  let text = esc(node.full_title || node.label) + '<br>type: ' + esc(node.type) + '<br>source: ' + esc(node.source || 'automated');
  if (node.status) text += '<br>status: ' + esc(node.status);
  if (node.source_count !== undefined) text += '<br>inbox sources: ' + esc(node.source_count);
  if (node.evidence_count !== undefined) text += '<br>local evidence links: ' + esc(node.evidence_count);
  if (node.source_summary) text += '<br>source summary: ' + esc(node.source_summary);
  if (node.evidence_summary) text += '<br>evidence summary: ' + esc(node.evidence_summary);
  return text;
}

function nodeColorFor(node) {
  if (node.source === 'manual') return '#7b5ea7';
  if (node.status === 'critical') return '#842029';
  if (node.status === 'alert') return '#a44';
  return {
    batch: '#6f8f9f',
    candidate: '#246a73',
    trend: '#d19a3a',
    scenario: '#4f6fa8',
    route: '#6d7580',
  }[node.type] || '#6d7580';
}

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
}
function escAttr(value) {
  return esc(value).replace(/'/g, '&#39;');
}
function slug(value) {
  return String(value == null ? '' : value).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 80) || 'node';
}
function uniqueStrings(values) {
  return [...new Set(Array.isArray(values) ? values.map(value => String(value || '').trim()).filter(Boolean) : [])];
}
</script>
</body>
</html>
`;
}

function matchEvidenceForTrend(trend, localEvidence = []) {
  const terms = uniqueValues([
    trend.label,
    trend.id,
    ...arrayFrom(trend.matchedTerms),
    ...arrayFrom(trend.scenarios),
  ]).map(normalizeText).filter(term => term.length >= 3);

  return arrayFrom(localEvidence)
    .map(evidence => {
      const text = normalizeText([
        evidence.title,
        evidence.relPath,
        evidence.rel_path,
        evidence.text,
        evidence.signalStatus,
      ].join(' '));
      const hits = terms.filter(term => text.includes(term));
      return { ...evidence, _hits: hits.length };
    })
    .filter(evidence => evidence._hits > 0)
    .sort((left, right) => rankSignal(right.signalStatus) - rankSignal(left.signalStatus) || right._hits - left._hits);
}

function classifyCandidate({ relatedScenarios, matchedEvidence }) {
  if (relatedScenarios.length > 0 && matchedEvidence.length === 0) return 'source_gap_followup';
  if (relatedScenarios.length > 0) return 'existing_scenario_connection';
  return 'emerging_event_candidate';
}

function candidateStatus(evidenceRows) {
  const max = Math.max(1, ...arrayFrom(evidenceRows).map(row => rankSignal(row.signalStatus)));
  if (max >= SIGNAL_RANK.critical) return 'critical';
  if (max >= SIGNAL_RANK.alert) return 'alert';
  return 'watch';
}

function suggestedRoute({ candidateType, trend, status }) {
  if (candidateType === 'source_gap_followup') return 'Reports/Source Gap Register.md';
  if (status === 'alert') return '02_Strategy_Development/Watchpoints';
  const label = normalizeText(trend.label || trend.id);
  if (/policy|legal|liability|geopolitic|capital access/.test(label)) return 'Policy/Observations';
  return '03_Macro_and_Economy/Observations';
}

function candidateTitle({ candidateType, trend }) {
  const label = String(trend.label || trend.id || 'Inbox Event Connection').trim();
  if (candidateType === 'source_gap_followup') return `${label} source-gap follow-up`;
  if (candidateType === 'emerging_event_candidate') return `${label} emerging event candidate`;
  return `${label} current-event connection`;
}

function synthesizeCandidateLabel(candidate) {
  const trend = arrayFrom(candidate.matched_trends)[0];
  if (trend) return String(trend);
  return String(candidate.title || 'Event candidate')
    .replace(/\s+(current-event connection|emerging event candidate|source-gap follow-up)$/i, '')
    .trim();
}

function summarizeLabels(values, limit = 3) {
  const labels = uniqueValues(values).slice(0, limit);
  const extra = uniqueValues(values).length - labels.length;
  if (labels.length === 0) return 'none';
  return extra > 0 ? `${labels.join(', ')} +${extra} more` : labels.join(', ');
}

function reviewQuestion({ candidateType, trend, route }) {
  const label = String(trend.label || trend.id || 'this inbox trend').trim();
  if (candidateType === 'source_gap_followup') {
    return `Which missing local evidence source should confirm ${label} before routing to ${route}?`;
  }
  if (candidateType === 'emerging_event_candidate') {
    return `Does ${label} connect to an existing World_Machine object, or should it remain narrative context?`;
  }
  return `Does ${label} deserve a World_Machine observation, watchpoint, or no-action review?`;
}

function evidenceToLink(evidence) {
  const relPath = evidence.relPath || evidence.rel_path || evidence.path || '';
  return {
    vault: evidence.vault || 'My_Data',
    rel_path: relPath,
    label: evidence.title || relPath.split(/[\\/]/).pop()?.replace(/\.md$/i, '') || 'Evidence',
    signal_status: normalizeSignalStatus(evidence.signalStatus),
  };
}

function addNode(lines, nodes, id, label) {
  if (nodes.has(id)) return;
  nodes.add(id);
  lines.push(`  ${id}["${escapeMermaid(label)}"]`);
}

function addEdge(lines, edges, from, to) {
  const key = `${from}->${to}`;
  if (edges.has(key)) return;
  edges.add(key);
  lines.push(`  ${from} --> ${to}`);
}

function mermaidId(prefix, value) {
  return `${prefix}_${stableId([value]).replace(/-/g, '_')}`;
}

function stableId(parts) {
  return String(arrayFrom(parts).join(' '))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72) || 'candidate';
}

function formatWikiLink(path, label) {
  const cleanPath = String(path || '').replace(/\.md$/i, '');
  return `[[${cleanPath}|${label || cleanPath.split('/').pop()}]]`;
}

function rankSignal(status) {
  return SIGNAL_RANK[normalizeSignalStatus(status)] ?? 0;
}

function normalizeSignalStatus(status) {
  const normalized = String(status || 'clear').toLowerCase().trim();
  return Object.prototype.hasOwnProperty.call(SIGNAL_RANK, normalized) ? normalized : 'clear';
}

function statusRank(status) {
  return rankSignal(status);
}

function typeRank(type) {
  return {
    existing_scenario_connection: 0,
    emerging_event_candidate: 1,
    source_gap_followup: 2,
  }[type] ?? 9;
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[_-]+/g, ' ')
    .replace(/[^a-z0-9\s.]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueValues(values) {
  return [...new Set(arrayFrom(values).map(value => String(value || '').trim()).filter(Boolean))];
}

function arrayFrom(value) {
  if (Array.isArray(value)) return value.filter(item => item !== null && item !== undefined && item !== '');
  if (value === null || value === undefined || value === '') return [];
  return [value];
}

function escapePipe(value) {
  return String(value || '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
}

function escapeMermaid(value) {
  return String(value || '').replace(/["\\]/g, '').replace(/\s+/g, ' ').trim();
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"]/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[char]));
}
