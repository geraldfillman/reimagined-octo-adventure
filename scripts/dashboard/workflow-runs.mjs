import { spawn } from 'child_process';
import { resolve } from 'path';

import { getRoutinePlan, listRoutineDefinitions } from '../routines/cadence.mjs';

const SCRIPTS_DIR = resolve(import.meta.dirname, '..');
const workflowRuns = new Map();
const workflowRunOrder = [];

export function handleRoutines() {
  return {
    cadences: listRoutineDefinitions(),
    defaults: { dryRun: true, continueOnError: true },
  };
}

export function handleRuns() {
  return workflowRunOrder
    .map(id => workflowRuns.get(id))
    .filter(Boolean)
    .slice(-25)
    .reverse()
    .map(run => ({
      id: run.id,
      cadence: run.cadence,
      status: run.status,
      dryRun: run.dryRun,
      startedAt: run.startedAt,
      finishedAt: run.finishedAt,
      taskCount: run.tasks.length,
      completed: run.tasks.filter(task => task.status === 'complete' || task.status === 'dry-run').length,
      failed: run.tasks.filter(task => task.status === 'failed').length,
    }));
}

export function startWorkflowRun(body = {}) {
  const cadence = String(body.cadence || 'daily');
  const flags = normalizeRoutineFlags(body);
  const plan = getRoutinePlan(cadence, flags);
  const run = {
    id: makeRunId(cadence),
    cadence,
    plan,
    flags,
    dryRun: Boolean(flags['dry-run']),
    continueOnError: body.continueOnError !== false,
    status: 'queued',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    updatedAt: new Date().toISOString(),
    currentTaskId: null,
    currentProcess: null,
    pauseRequested: false,
    listeners: new Set(),
    events: [],
    logs: [],
    advancing: false,
    tasks: plan.tasks.map(task => ({
      ...task,
      status: 'queued',
      attempts: 0,
      startedAt: null,
      finishedAt: null,
      durationMs: null,
      exitCode: null,
      logs: [],
      skipRequested: Boolean(task.skipFlag && flags[task.skipFlag]),
    })),
  };

  workflowRuns.set(run.id, run);
  workflowRunOrder.push(run.id);
  while (workflowRunOrder.length > 50) {
    const oldId = workflowRunOrder.shift();
    if (oldId) workflowRuns.delete(oldId);
  }

  emitWorkflowEvent(run, 'run-created', { graph: buildRunGraph(run) });
  setImmediate(() => advanceWorkflowRun(run));
  return buildRunGraph(run);
}

export function getWorkflowRunGraph(id) {
  const run = workflowRuns.get(id);
  if (!run) return null;
  return buildRunGraph(run);
}

export function controlWorkflowRun(id, action) {
  const run = workflowRuns.get(id);
  if (!run) return null;
  if (action === 'pause') return pauseWorkflowRun(run);
  if (action === 'resume') return resumeWorkflowRun(run);
  if (action === 'retry') return retryWorkflowRun(run);
  if (action === 'cancel') return cancelWorkflowRun(run);
  throw new Error(`Unknown run action: ${action}`);
}

export function streamWorkflowRunEvents(res, id) {
  const run = workflowRuns.get(id);
  if (!run) {
    res.writeHead(404);
    res.end('Run not found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });

  for (const event of run.events) {
    res.write(`event: workflow\ndata: ${JSON.stringify(event)}\n\n`);
  }

  if (isTerminalRunStatus(run.status)) {
    res.write(`event: end\ndata: ${JSON.stringify({ runId: run.id, status: run.status })}\n\n`);
    res.end();
    return;
  }

  const send = chunk => res.write(chunk);
  run.listeners.add(send);
  res.on('close', () => {
    run.listeners.delete(send);
  });
}

function normalizeRoutineFlags(body = {}) {
  const flags = { ...(body.flags || {}) };
  for (const key of ['month', 'skip-sector-scan', 'skip-agent-scan', 'skip-validate']) {
    if (body[key] != null) flags[key] = body[key];
  }
  if (body.dryRun || body['dry-run']) flags['dry-run'] = true;
  return flags;
}

async function advanceWorkflowRun(run) {
  if (run.advancing || isTerminalRunStatus(run.status)) return;
  run.advancing = true;
  try {
    if (run.status === 'queued') {
      run.status = 'running';
      emitWorkflowEvent(run, 'run-started', {});
    }

    while (run.status === 'running') {
      if (run.pauseRequested) {
        run.status = 'paused';
        run.updatedAt = new Date().toISOString();
        emitWorkflowEvent(run, 'run-paused', { graph: buildRunGraph(run) });
        return;
      }

      const task = run.tasks.find(item => item.status === 'queued');
      if (!task) {
        finishWorkflowRun(run);
        return;
      }

      if (task.skipRequested) {
        task.status = 'skipped';
        task.finishedAt = new Date().toISOString();
        run.updatedAt = task.finishedAt;
        emitWorkflowEvent(run, 'task-skipped', { taskId: task.id, label: task.label, graph: buildRunGraph(run) });
        continue;
      }

      await runWorkflowTask(run, task);
      if (task.status === 'failed' && !run.continueOnError) {
        run.status = 'failed';
        run.finishedAt = new Date().toISOString();
        run.updatedAt = run.finishedAt;
        emitWorkflowEvent(run, 'run-failed', { taskId: task.id, graph: buildRunGraph(run) });
        endWorkflowStreams(run);
        return;
      }
    }
  } finally {
    run.advancing = false;
  }
}

function runWorkflowTask(run, task) {
  return new Promise(resolveTask => {
    task.status = 'running';
    task.attempts += 1;
    task.startedAt = new Date().toISOString();
    task.finishedAt = null;
    task.exitCode = null;
    task.logs = [];
    run.currentTaskId = task.id;
    run.updatedAt = task.startedAt;
    emitWorkflowEvent(run, 'task-started', { taskId: task.id, label: task.label, command: task.command, graph: buildRunGraph(run) });

    if (run.dryRun) {
      pushWorkflowLine(run, task, `[dry-run] ${task.command}`, 'stdout');
      setTimeout(() => {
        task.status = 'dry-run';
        task.exitCode = 0;
        task.finishedAt = new Date().toISOString();
        task.durationMs = new Date(task.finishedAt) - new Date(task.startedAt);
        run.currentTaskId = null;
        run.updatedAt = task.finishedAt;
        emitWorkflowEvent(run, 'task-completed', { taskId: task.id, label: task.label, dryRun: true, graph: buildRunGraph(run) });
        resolveTask();
      }, 120);
      return;
    }

    const proc = spawn(process.execPath, ['run.mjs', ...task.args], {
      cwd: SCRIPTS_DIR,
      shell: true,
      env: { ...process.env },
    });
    run.currentProcess = proc;

    proc.stdout.on('data', chunk => pushWorkflowLine(run, task, chunk.toString(), 'stdout'));
    proc.stderr.on('data', chunk => pushWorkflowLine(run, task, chunk.toString(), 'stderr'));
    proc.on('error', error => pushWorkflowLine(run, task, error.message, 'stderr'));
    proc.on('exit', code => {
      task.exitCode = code ?? 0;
      task.status = task.exitCode === 0 ? 'complete' : 'failed';
      task.finishedAt = new Date().toISOString();
      task.durationMs = new Date(task.finishedAt) - new Date(task.startedAt);
      run.currentProcess = null;
      run.currentTaskId = null;
      run.updatedAt = task.finishedAt;
      emitWorkflowEvent(run, task.status === 'complete' ? 'task-completed' : 'task-failed', {
        taskId: task.id,
        label: task.label,
        exitCode: task.exitCode,
        graph: buildRunGraph(run),
      });
      resolveTask();
    });
  });
}

function pushWorkflowLine(run, task, text, stream) {
  const lines = String(text).split(/\r?\n/).filter(line => line.length > 0);
  for (const line of lines) {
    const row = { ts: new Date().toISOString(), taskId: task.id, taskLabel: task.label, stream, text: line };
    task.logs.push(row);
    run.logs.push(row);
    if (task.logs.length > 200) task.logs.shift();
    if (run.logs.length > 600) run.logs.shift();
    emitWorkflowEvent(run, 'task-line', row);
  }
}

function finishWorkflowRun(run) {
  const hasFailures = run.tasks.some(task => task.status === 'failed');
  run.status = hasFailures ? 'completed_with_failures' : 'completed';
  run.finishedAt = new Date().toISOString();
  run.updatedAt = run.finishedAt;
  emitWorkflowEvent(run, 'run-completed', { graph: buildRunGraph(run) });
  endWorkflowStreams(run);
}

function pauseWorkflowRun(run) {
  if (isTerminalRunStatus(run.status)) return buildRunGraph(run);
  run.pauseRequested = true;
  if (run.status === 'queued') run.status = 'paused';
  emitWorkflowEvent(run, 'pause-requested', { graph: buildRunGraph(run) });
  return buildRunGraph(run);
}

function resumeWorkflowRun(run) {
  if (run.status !== 'paused') return buildRunGraph(run);
  run.pauseRequested = false;
  run.status = 'running';
  run.updatedAt = new Date().toISOString();
  emitWorkflowEvent(run, 'run-resumed', { graph: buildRunGraph(run) });
  setImmediate(() => advanceWorkflowRun(run));
  return buildRunGraph(run);
}

function retryWorkflowRun(run) {
  if (run.status === 'running') return buildRunGraph(run);
  const failedTasks = run.tasks.filter(task => task.status === 'failed');
  for (const task of failedTasks) {
    task.status = 'queued';
    task.startedAt = null;
    task.finishedAt = null;
    task.durationMs = null;
    task.exitCode = null;
  }
  if (failedTasks.length > 0) {
    run.pauseRequested = false;
    run.status = 'running';
    run.finishedAt = null;
    run.updatedAt = new Date().toISOString();
    emitWorkflowEvent(run, 'run-retry', { taskIds: failedTasks.map(task => task.id), graph: buildRunGraph(run) });
    setImmediate(() => advanceWorkflowRun(run));
  }
  return buildRunGraph(run);
}

function cancelWorkflowRun(run) {
  if (isTerminalRunStatus(run.status)) return buildRunGraph(run);
  if (run.currentProcess) run.currentProcess.kill();
  for (const task of run.tasks) {
    if (task.status === 'queued') task.status = 'canceled';
  }
  run.status = 'canceled';
  run.finishedAt = new Date().toISOString();
  run.updatedAt = run.finishedAt;
  emitWorkflowEvent(run, 'run-canceled', { graph: buildRunGraph(run) });
  endWorkflowStreams(run);
  return buildRunGraph(run);
}

function emitWorkflowEvent(run, type, data = {}) {
  const event = { id: run.events.length + 1, ts: new Date().toISOString(), runId: run.id, type, ...data };
  run.events.push(event);
  if (run.events.length > 1200) run.events.shift();
  const payload = `event: workflow\ndata: ${JSON.stringify(event)}\n\n`;
  for (const send of run.listeners) send(payload);
}

function endWorkflowStreams(run) {
  const payload = `event: end\ndata: ${JSON.stringify({ runId: run.id, status: run.status })}\n\n`;
  for (const send of run.listeners) send(payload);
}

function buildRunGraph(run) {
  const tasks = run.tasks.map(task => ({
    id: task.id,
    label: task.label,
    phase: task.phase,
    agent: task.agent,
    command: task.command,
    status: task.status,
    attempts: task.attempts,
    startedAt: task.startedAt,
    finishedAt: task.finishedAt,
    durationMs: task.durationMs,
    exitCode: task.exitCode,
    artifactLinks: task.artifactLinks,
    critical: task.critical,
  }));

  return {
    id: run.id,
    cadence: run.cadence,
    status: run.status,
    dryRun: run.dryRun,
    continueOnError: run.continueOnError,
    startedAt: run.startedAt,
    finishedAt: run.finishedAt,
    updatedAt: run.updatedAt,
    phases: run.plan.phases.map(phase => ({
      id: phase.id,
      name: phase.name,
      tasks: tasks.filter(task => task.phase === phase.name),
    })),
    nodes: tasks,
    edges: run.plan.graph.edges,
    agentLanes: buildAgentLanes(tasks),
    scorecards: buildAgentScorecards(tasks),
    etaSeconds: estimateRunEtaSeconds(run),
    criticalPath: tasks.filter(task => task.critical && ['queued', 'running'].includes(task.status)).map(task => task.id),
    changeSummary: summarizeChangeSinceLastRun(run),
    recentLogs: run.logs.slice(-120),
  };
}

function buildAgentLanes(tasks) {
  const lanes = new Map();
  for (const task of tasks) {
    if (!lanes.has(task.agent)) lanes.set(task.agent, { agent: task.agent, tasks: [], status: 'queued' });
    lanes.get(task.agent).tasks.push(task);
  }
  return Array.from(lanes.values()).map(lane => {
    lane.status = rollupStatus(lane.tasks.map(task => task.status));
    lane.completed = lane.tasks.filter(task => ['complete', 'dry-run'].includes(task.status)).length;
    lane.failed = lane.tasks.filter(task => task.status === 'failed').length;
    return lane;
  });
}

function buildAgentScorecards(tasks) {
  return buildAgentLanes(tasks).map(lane => {
    const attempted = lane.tasks.filter(task => task.attempts > 0).length;
    const failures = lane.failed;
    const completed = lane.completed;
    const artifactVolume = lane.tasks
      .filter(task => ['complete', 'dry-run'].includes(task.status))
      .reduce((sum, task) => sum + (task.artifactLinks?.length || 0), 0);
    const sourceReliability = attempted > 0 ? Math.round(((attempted - failures) / attempted) * 100) : 100;
    const freshness = lane.tasks.some(task => task.status === 'running') ? 100 : completed > 0 ? 85 : 35;
    const falsePositives = 0;
    return {
      agent: lane.agent,
      freshness,
      failures,
      signalQuality: Math.max(0, Math.min(100, sourceReliability - falsePositives * 10)),
      falsePositives,
      falsePositiveBasis: 'manual labels not yet tracked',
      sourceReliability,
      artifactVolume,
      taskCount: lane.tasks.length,
      status: lane.status,
    };
  });
}

function rollupStatus(statuses) {
  if (statuses.includes('running')) return 'running';
  if (statuses.includes('failed')) return 'failed';
  if (statuses.includes('queued')) return 'queued';
  if (statuses.includes('paused')) return 'paused';
  if (statuses.every(status => status === 'skipped')) return 'skipped';
  if (statuses.includes('dry-run')) return 'dry-run';
  if (statuses.includes('complete')) return 'complete';
  return statuses[0] || 'queued';
}

function estimateRunEtaSeconds(run) {
  if (isTerminalRunStatus(run.status)) return 0;
  const completedDurations = run.tasks
    .filter(task => Number.isFinite(task.durationMs) && task.durationMs > 0)
    .map(task => task.durationMs);
  const averageMs = completedDurations.length
    ? completedDurations.reduce((sum, value) => sum + value, 0) / completedDurations.length
    : (run.dryRun ? 120 : 30_000);
  const remaining = run.tasks.filter(task => task.status === 'queued').length;
  const running = run.tasks.find(task => task.status === 'running');
  const runningRemaining = running && running.startedAt
    ? Math.max(0, averageMs - (Date.now() - new Date(running.startedAt).getTime()))
    : 0;
  return Math.round((remaining * averageMs + runningRemaining) / 1000);
}

function summarizeChangeSinceLastRun(run) {
  const previous = [...workflowRunOrder]
    .reverse()
    .map(id => workflowRuns.get(id))
    .find(item => item && item.id !== run.id && item.cadence === run.cadence && isTerminalRunStatus(item.status));

  if (!previous) {
    return { headline: `No previous ${run.cadence} run in this dashboard session.`, newFailures: [], resolvedFailures: [], artifactDelta: 0 };
  }

  const currentFailures = new Set(run.tasks.filter(task => task.status === 'failed').map(task => task.label));
  const previousFailures = new Set(previous.tasks.filter(task => task.status === 'failed').map(task => task.label));
  const currentArtifacts = run.tasks
    .filter(task => ['complete', 'dry-run'].includes(task.status))
    .reduce((sum, task) => sum + (task.artifactLinks?.length || 0), 0);
  const previousArtifacts = previous.tasks
    .filter(task => ['complete', 'dry-run'].includes(task.status))
    .reduce((sum, task) => sum + (task.artifactLinks?.length || 0), 0);

  return {
    headline: `Previous ${run.cadence} run: ${previous.status}.`,
    newFailures: [...currentFailures].filter(label => !previousFailures.has(label)),
    resolvedFailures: [...previousFailures].filter(label => !currentFailures.has(label)),
    artifactDelta: currentArtifacts - previousArtifacts,
  };
}

function isTerminalRunStatus(status) {
  return ['completed', 'completed_with_failures', 'failed', 'canceled'].includes(status);
}

function makeRunId(cadence = 'routine') {
  return `run_${cadence}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}
