# api-replay

> Record real API traffic, replay it anywhere, and instantly spot what changed.

**api-replay** is a lightweight Node.js tool that lets you record real API requests (in production or staging), replay them locally, and diff the responses to detect breaking changes or unexpected behavior.

## Why

- Bugs often happen only in production
- Reproducing exact requests is hard (headers, auth, payload)
- Logs don't tell the full story

**api-replay** turns real traffic into reproducible test cases.

## Install

```bash
npm install api-replay
```

## Quick Start

### 1. Record API traffic

Add the middleware to your Express app:

```js
import express from 'express';
import { apiReplay } from 'api-replay';

const app = express();

app.use(apiReplay({
  maskHeaders: ['authorization', 'cookie'],
  ignore: ['/health', '/metrics'],
}));

app.get('/api/users', (req, res) => {
  res.json({ users: [{ id: 1, name: 'Alice' }] });
});

app.listen(3000);
```

Every request/response is saved as a JSON file in `./recordings/`.

### 2. Replay a request

```bash
npx api-replay list
# abc123def456  GET    /api/users  [200]  2025-01-15T10:30:00.000Z

npx api-replay replay abc123def456 --base-url http://localhost:3000
```

Output:

```
--- API Replay Diff ---

Status: 200 (unchanged)
Duration: 42ms → 38ms

No body changes detected.
```

### 3. Detect differences

If the response changed:

```
--- API Replay Diff ---

Status: 200 (unchanged)
Duration: 42ms → 55ms

2 change(s) detected:

  ~ users[0].name
    - "Alice"
    + "Alicia"
  + users[0].email: "alicia@example.com"
```

## API

### Middleware

```js
import { apiReplay } from 'api-replay';

app.use(apiReplay(options));
```

#### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maskHeaders` | `string[]` | `[]` | Header names to mask with `***` |
| `maskBody` | `string[]` | `[]` | Body field names to mask with `***` |
| `ignore` | `string[]` | `[]` | Route prefixes to skip |
| `recordingsDir` | `string` | `./recordings` | Custom storage directory |

### Replay

```js
import { replay } from 'api-replay';

const result = await replay('abc123', {
  baseUrl: 'http://localhost:3000',
  overrides: {
    body: { price: 200 },
    headers: { 'x-debug': 'true' },
  },
});

console.log(result.status);   // 200
console.log(result.body);     // { ... }
console.log(result.original); // original recorded response
```

### Diff

```js
import { diff, formatDiff } from 'api-replay';

const result = diff(originalResponse, replayedResponse);

console.log(result.hasChanges);    // true/false
console.log(result.statusChanged); // true/false
console.log(result.body);          // { 'field.path': { before, after } }

// Pretty-print for terminal
console.log(formatDiff(result));
```

### Storage

```js
import { loadRecording, listRecordings, setRecordingsDir } from 'api-replay';

// Change recordings directory
setRecordingsDir('/path/to/recordings');

// List all recordings
const recordings = listRecordings();

// Load a specific recording
const recording = loadRecording('abc123');
```

## CLI

```
api-replay <command> [options]

Commands:
  list                    List all recordings
  show  <id>              Show a stored recording
  replay <id> [options]   Replay a request and show diff

Options:
  --base-url <url>        Target base URL for replay
```

## Use Cases

- **Debug production-only bugs** — replay the exact failing request locally
- **Validate API changes** — replay old traffic against new code, spot diffs
- **Reuse real requests for testing** — turn recordings into regression tests
- **Detect breaking changes in CI** — automate replay + diff in your pipeline
- **Investigate third-party API issues** — record and compare payment/webhook calls

## Requirements

- Node.js >= 18.0.0
- Express (for middleware recording)

## License

MIT
