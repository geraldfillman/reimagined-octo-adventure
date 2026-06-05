#!/usr/bin/env node
/**
 * Neo4j MCP compatibility wrapper for Codex tool discovery.
 *
 * neo4j-mcp-server v1.5.x advertises hyphenated tool names such as
 * read-cypher. Some Codex tool surfaces expect identifier-safe names. This
 * wrapper keeps the official server as the backend and maps only tool names.
 */

import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';

const TOOL_NAME_TO_BACKEND = new Map([
  ['get_schema', 'get-schema'],
  ['list_gds_procedures', 'list-gds-procedures'],
  ['read_cypher', 'read-cypher'],
  ['write_cypher', 'write-cypher'],
]);
const TOOL_NAME_FROM_BACKEND = new Map(
  [...TOOL_NAME_TO_BACKEND.entries()].map(([front, back]) => [back, front]),
);

const backend = spawn('python', ['-m', 'neo4j_mcp_server'], {
  env: process.env,
  stdio: ['pipe', 'pipe', 'pipe'],
});

const pending = new Map();
let nextBackendId = 1;

backend.stderr.on('data', chunk => {
  process.stderr.write(chunk);
});

backend.on('exit', (code, signal) => {
  process.stderr.write(`[neo4j-mcp-wrapper] backend exited code=${code ?? ''} signal=${signal ?? ''}\n`);
  process.exit(code ?? 1);
});

const backendLines = createInterface({ input: backend.stdout });
backendLines.on('line', line => {
  if (!line.trim()) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch (error) {
    process.stderr.write(`[neo4j-mcp-wrapper] ignored invalid backend JSON: ${error.message}\n`);
    return;
  }

  if (Object.prototype.hasOwnProperty.call(message, 'id') && pending.has(message.id)) {
    const request = pending.get(message.id);
    pending.delete(message.id);
    message.id = request.parentId;
    if (request.method === 'tools/list' && message.result?.tools) {
      message.result.tools = message.result.tools.map(tool => ({
        ...tool,
        name: TOOL_NAME_FROM_BACKEND.get(tool.name) || tool.name,
        description: tool.description
          ? `${tool.description}\n\nBackend tool: ${tool.name}`
          : `Backend tool: ${tool.name}`,
      }));
    }
  }

  sendToParent(message);
});

const parentLines = createInterface({ input: process.stdin });
parentLines.on('line', line => {
  if (!line.trim()) return;
  let message;
  try {
    message = JSON.parse(line);
  } catch (error) {
    process.stderr.write(`[neo4j-mcp-wrapper] ignored invalid parent JSON: ${error.message}\n`);
    return;
  }

  if (message.method === 'tools/call' && message.params?.name) {
    message = {
      ...message,
      params: {
        ...message.params,
        name: TOOL_NAME_TO_BACKEND.get(message.params.name) || message.params.name,
      },
    };
  }

  if (Object.prototype.hasOwnProperty.call(message, 'id')) {
    const backendId = `codex-wrapper-${nextBackendId++}`;
    pending.set(backendId, {
      parentId: message.id,
      method: message.method,
    });
    message = {
      ...message,
      id: backendId,
    };
  }

  backend.stdin.write(`${JSON.stringify(message)}\n`);
});

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

function sendToParent(message) {
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

function shutdown() {
  backend.kill();
  process.exit(0);
}
