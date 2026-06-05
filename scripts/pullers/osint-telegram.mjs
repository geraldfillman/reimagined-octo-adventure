/**
 * osint-telegram.mjs - Telegram public channel monitor (Telethon/MTProto)
 *
 * Usage:
 *   node run.mjs scan osint-telegram --channel durov
 *   node run.mjs scan osint-telegram --channel <username> --limit 100
 *   node run.mjs scan osint-telegram --channel <username> --query "supply chain"
 *   node run.mjs scan osint-telegram --dry-run
 *
 * Requires:
 *   pip install telethon
 *   TELEGRAM_API_ID and TELEGRAM_API_HASH set in .env
 *   One-time phone verification on first run creates telegram.session
 *
 * Output: 05_Data_Pulls/osint/telegram-<channel>-<date>.json + .md pull note
 *
 * Note: Reads any public channel without joining it.
 * The session file stores your auth credentials; keep it in .gitignore.
 */

import { spawnSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync, unlinkSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

import { getPullsDir, resolveEnginePath } from '../lib/config.mjs';

const OUTPUT_DIR = join(getPullsDir(), 'osint');
const SCRIPTS_DIR = resolveEnginePath('scripts');
const SESSION_FILE = join(SCRIPTS_DIR, 'telegram.session');

function buildPythonScript(channel, limit, query, outputPath, apiId, apiHash) {
  return `
import asyncio, json
from telethon.sync import TelegramClient

API_ID = ${apiId}
API_HASH = "${apiHash}"
SESSION = r"${SESSION_FILE.replace(/\\/g, '\\\\')}"

async def main():
    client = TelegramClient(SESSION, API_ID, API_HASH)
    await client.start()

    try:
        entity = await client.get_entity("${channel}")
        channel_info = {
            "id": entity.id,
            "title": getattr(entity, "title", "${channel}"),
            "username": getattr(entity, "username", "${channel}"),
            "participants_count": getattr(entity, "participants_count", None),
        }
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        await client.disconnect()
        return

    messages = []
    async for msg in client.iter_messages(entity, limit=${limit}):
        if msg.text:
            text = msg.text or ""
            ${query ? `if "${query}".lower() not in text.lower(): continue` : ''}
            messages.append({
                "id": msg.id,
                "date": msg.date.isoformat() if msg.date else None,
                "text": text[:1000],
                "views": getattr(msg, "views", None),
                "forwards": getattr(msg, "forwards", None),
                "reply_count": getattr(getattr(msg, "replies", None), "replies", None),
            })

    result = {"channel": channel_info, "messages": messages, "fetched": len(messages)}
    with open(r"${outputPath.replace(/\\/g, '\\\\')}", "w", encoding="utf-8") as f:
        json.dump(result, f, ensure_ascii=False, indent=2, default=str)

    print(f"Fetched {len(messages)} messages from {channel_info['title']}")
    await client.disconnect()

asyncio.run(main())
`;
}

export async function pull(flags = {}) {
  const channel = flags.channel;
  if (!channel) {
    console.error('Error: --channel <username> is required.');
    console.error('Example: node run.mjs scan osint-telegram --channel durov');
    process.exit(1);
  }

  const limit = parseInt(flags.limit ?? '100', 10);
  const query = flags.query ?? null;
  const dryRun = Boolean(flags['dry-run']);
  const pulledDate = new Date().toISOString().slice(0, 10);
  const outputJson = join(OUTPUT_DIR, `telegram-${channel}-${pulledDate}.json`);
  const outputMd = join(OUTPUT_DIR, `${pulledDate}_telegram-${channel}.md`);

  if (dryRun) {
    console.log('\n[dry-run] Would fetch:');
    console.log(`  Channel: @${channel}`);
    console.log(`  Limit:   ${limit} messages`);
    if (query) console.log(`  Filter:  "${query}"`);
    console.log(`  Output:  ${outputJson}`);
    return { filePath: null, signals: [] };
  }

  const apiId = process.env.TELEGRAM_API_ID?.trim();
  const apiHash = process.env.TELEGRAM_API_HASH?.trim();

  if (!apiId || !apiHash) {
    console.error('Error: TELEGRAM_API_ID and TELEGRAM_API_HASH are required.');
    console.error('Register at https://my.telegram.org/apps and add both values to .env.');
    process.exit(1);
  }

  if (!existsSync(OUTPUT_DIR)) mkdirSync(OUTPUT_DIR, { recursive: true });

  const checkResult = spawnSync('python', ['-c', 'import telethon'], { encoding: 'utf8' });
  if (checkResult.status !== 0) {
    console.error('Error: Telethon not installed. Run: pip install telethon');
    process.exit(1);
  }

  const pythonScript = buildPythonScript(channel, limit, query, outputJson, apiId, apiHash);
  const scriptFile = join(tmpdir(), `telegram-fetch-${Date.now()}.py`);
  writeFileSync(scriptFile, pythonScript, 'utf8');

  console.log(`\nFetching Telegram channel: @${channel}`);
  if (!existsSync(SESSION_FILE)) {
    console.log('\nFirst run: Telegram will prompt for your phone number.');
    console.log('Enter it in international format, for example +15551234567.');
    console.log('A session file will be saved for future runs.\n');
  }

  const result = spawnSync('python', [scriptFile], {
    stdio: 'inherit',
    encoding: 'utf8',
    timeout: 3 * 60 * 1000,
  });

  try {
    unlinkSync(scriptFile);
  } catch {}

  if (result.error || result.status !== 0) {
    console.error('Error: Telegram fetch failed. Check credentials and channel name.');
    process.exit(1);
  }

  if (!existsSync(outputJson)) {
    console.error('Error: no output file produced.');
    process.exit(1);
  }

  const data = JSON.parse(readFileSync(outputJson, 'utf8'));
  if (data.error) {
    console.error(`Error: channel fetch failed: ${data.error}`);
    process.exit(1);
  }

  const { channel: meta, messages } = data;
  const topMessages = messages.slice(0, 8).map(m =>
    `- **${m.date?.slice(0, 10) ?? '?'}** - ${m.text?.slice(0, 120).replace(/\n/g, ' ')}... (views: ${m.views ?? '?'})`
  ).join('\n');

  const pullNote = `---
title: "Telegram - @${channel}"
source: "Telegram Channel Monitor"
date_pulled: "${pulledDate}"
domain: "social_sentiment"
data_type: "channel_messages"
frequency: "weekly"
signal_status: "clear"
signals: []
tags:
  - telegram
  - osint
  - social-sentiment
  - ${channel.toLowerCase()}
---

## @${channel}${meta?.title ? ` - ${meta.title}` : ''}

**Pulled:** ${pulledDate}
**Messages fetched:** ${messages.length}${query ? `\n**Filter:** "${query}"` : ''}
**Subscribers:** ${meta?.participants_count ?? 'unknown'}

## Recent Messages

${topMessages || '_No messages found._'}

## Raw Data

Saved to: \`05_Data_Pulls/osint/telegram-${channel}-${pulledDate}.json\`
`;

  writeFileSync(outputMd, pullNote, 'utf8');
  console.log(`\nSaved ${messages.length} messages to ${outputMd}`);

  return data;
}
