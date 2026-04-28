/**
 * markdown-table.mjs - Lightweight markdown table parsing helpers.
 */

export function parseFirstMarkdownTable(content) {
  if (!content) return null;

  const lines = String(content).split(/\r?\n/);
  for (let index = 0; index < lines.length - 1; index += 1) {
    if (!isMarkdownTableLine(lines[index]) || !isMarkdownSeparatorLine(lines[index + 1])) {
      continue;
    }

    const tableLines = [lines[index], lines[index + 1]];
    let cursor = index + 2;
    while (cursor < lines.length && isMarkdownTableLine(lines[cursor])) {
      tableLines.push(lines[cursor]);
      cursor += 1;
    }

    return parseMarkdownTableLines(tableLines);
  }

  return null;
}

export function parseMarkdownTableLines(lines) {
  if (!Array.isArray(lines) || lines.length < 2) return null;

  const headers = splitMarkdownRow(lines[0]);
  const rows = [];

  for (const line of lines.slice(2)) {
    const values = splitMarkdownRow(line);
    if (values.length === 0 || values.every(value => value === '')) continue;
    const row = {};
    headers.forEach((header, index) => {
      row[header] = values[index] ?? '';
    });
    rows.push(row);
  }

  return { headers, rows };
}

function splitMarkdownRow(line) {
  return String(line)
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim().replace(/\\\|/g, '|'));
}

function isMarkdownTableLine(line) {
  return /^\|.*\|$/.test(String(line).trim());
}

function isMarkdownSeparatorLine(line) {
  return splitMarkdownRow(line).every(cell => /^:?-{3,}:?$/.test(cell));
}
