#!/usr/bin/env node

import { replay } from '../core/replay.js';
import { diff, formatDiff } from '../core/diff.js';
import { loadRecording, listRecordings } from '../core/storage.js';

const bold = s => `\x1b[1m${s}\x1b[0m`;
const dim = s => `\x1b[2m${s}\x1b[0m`;
const cyan = s => `\x1b[36m${s}\x1b[0m`;
const red = s => `\x1b[31m${s}\x1b[0m`;

const args = process.argv.slice(2);
const command = args[0];

function showHelp() {
  console.log(`
${bold('api-replay')} — Record, replay & diff API traffic

${bold('Usage:')}
  api-replay ${cyan('<command>')} [options]

${bold('Commands:')}
  ${cyan('list')}                    List all recordings
  ${cyan('show')}  ${dim('<id>')}              Show a stored recording
  ${cyan('replay')} ${dim('<id>')} [options]   Replay a request and show diff

${bold('Replay Options:')}
  --base-url ${dim('<url>')}        Target base URL (e.g., http://localhost:3000)

${bold('Examples:')}
  api-replay list
  api-replay show abc123
  api-replay replay abc123 --base-url http://localhost:3000
`);
}

function parseFlags(args) {
  const flags = {};
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--base-url' && args[i + 1]) {
      flags.baseUrl = args[++i];
    }
  }
  return flags;
}

async function run() {
  if (!command || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  if (command === 'list') {
    try {
      const recordings = listRecordings();
      if (recordings.length === 0) {
        console.log(dim('No recordings found.'));
        return;
      }
      console.log(bold(`${recordings.length} recording(s):\n`));
      for (const rec of recordings) {
        const method = rec.method.padEnd(6);
        console.log(`  ${cyan(rec.id)}  ${method} ${rec.url}  ${dim(`[${rec.status}]`)}  ${dim(rec.timestamp)}`);
      }
      console.log('');
    } catch (err) {
      console.error(red(`Error: ${err.message}`));
      process.exit(1);
    }
    return;
  }

  if (command === 'show') {
    const id = args[1];
    if (!id) {
      console.error(red('Error: Please provide a recording ID'));
      console.error(dim('Usage: api-replay show <id>'));
      process.exit(1);
    }
    try {
      const recording = loadRecording(id);
      console.log(JSON.stringify(recording, null, 2));
    } catch (err) {
      console.error(red(`Error: ${err.message}`));
      process.exit(1);
    }
    return;
  }

  if (command === 'replay') {
    const id = args[1];
    if (!id) {
      console.error(red('Error: Please provide a recording ID'));
      console.error(dim('Usage: api-replay replay <id> --base-url <url>'));
      process.exit(1);
    }

    const flags = parseFlags(args.slice(2));

    try {
      console.log(dim(`Replaying ${id}...`));
      console.log('');

      const result = await replay(id, { baseUrl: flags.baseUrl });
      const diffResult = diff(result.original, {
        status: result.status,
        body: result.body,
        duration: result.duration
      });

      console.log(formatDiff(diffResult));
    } catch (err) {
      console.error(red(`Error: ${err.message}`));
      process.exit(1);
    }
    return;
  }

  console.error(red(`Unknown command: ${command}`));
  showHelp();
  process.exit(1);
}

run();
