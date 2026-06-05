import { relative, sep } from 'node:path';

export function normalizeVaultPath(value) {
  return String(value || '').replace(/\\/g, '/').replace(/^\/+/, '');
}

export function relativeVaultPath(root, absPath) {
  return normalizeVaultPath(relative(root, absPath).split(sep).join('/'));
}

export function obsidianOpenUrl(vaultName, vaultRelativePath) {
  const rel = normalizeVaultPath(vaultRelativePath);
  return `obsidian://open?vault=${encodeURIComponent(vaultName)}&file=${encodeURIComponent(rel)}`;
}

export function evidenceLink({ vaultName, vaultRoot, filePath, label }) {
  const relPath = relativeVaultPath(vaultRoot, filePath);
  return {
    vault: vaultName,
    rel_path: relPath,
    label: label || relPath.replace(/\.md$/i, ''),
    url: obsidianOpenUrl(vaultName, relPath),
  };
}
