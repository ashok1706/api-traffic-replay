# api-traffic-replay

[![npm version](https://img.shields.io/npm/v/api-traffic-replay.svg)](https://www.npmjs.com/package/api-traffic-replay)
[![CI](https://github.com/ashok1706/api-traffic-replay/actions/workflows/ci.yml/badge.svg)](https://github.com/ashok1706/api-traffic-replay/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)

> Record real API traffic, replay it anywhere, and instantly spot what changed.

**api-traffic-replay** is a lightweight Node.js tool that records real API requests (in production or staging), replays them against any environment, and diffs the responses to detect breaking changes or unexpected behavior.

---

## Why?

Debugging APIs is painful because:

- Bugs often happen **only in production**
- Reproducing exact requests is hard (headers, auth, payload)
- Logs don't tell the full story

**api-traffic-replay** turns real traffic into reproducible test cases — automatically.

---

## Install

```bash
npm install api-traffic-replay
```

---

## Quick Start

### 1. Record API traffic

```js
import express from 'express';
import { apiReplay } from 'api-traffic-replay';

const app = express();

// Important: add body parser BEFORE apiReplay
app.use(express.json());

app.use(apiReplay({
  maskHeaders: ['authorization', 'cookie'],
  maskBody: ['password', 'token', 'secret'],
  ignore: ['/health', '/metrics'],
}));

app.get('/api/users', (req, res) => {
  res.json({ users: [{ id: 1, name: 'Alice' }] });
});

app.listen(3000);
```

Every request/response is saved as a JSON file in `./recordings/`.

### 2. List and inspect recordings

```bash
npx api-traffic-replay list
# abc123def456  GET    /api/users  [200]  2026-03-17T10:30:00.000Z

npx api-traffic-replay show abc123def456
```

### 3. Replay against another environment

```bash
npx api-traffic-replay replay abc123def456 --base-url http://localhost:3000
```

```
--- API Replay Diff ---

Status: 200 (unchanged)
Duration: 42ms → 38ms

No body changes detected.
```

### 4. Spot differences instantly

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

---

## API

### `apiReplay(options?)`

Express middleware that records all requests/responses.

```js
app.use(apiReplay(options));
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `maskHeaders` | `string[]` | `[]` | Header names to mask with `***` |
| `maskBody` | `string[]` | `[]` | Body field names to deep-mask with `***` |
| `ignore` | `string[]` | `[]` | Route prefixes to skip recording |
| `recordingsDir` | `string` | `./recordings` | Custom storage directory |
| `onError` | `function` | `noop` | Callback when recording fails: `(err, recording) => {}` |

> **Note:** The middleware hooks `res.send()`, `res.json()`, and `res.end()` to capture responses. Add `express.json()` before `apiReplay()` to capture request bodies.

### `replay(id, options?)`

Replay a recorded request against a target environment.

```js
import { replay } from 'api-traffic-replay';

const result = await replay('abc123', {
  baseUrl: 'http://localhost:3000',
  timeout: 5000,
  overrides: {
    body: { price: 200 },
    headers: { 'x-debug': 'true' },
    query: { page: '2' },
  },
});

console.log(result.status);   // 200
console.log(result.body);     // { ... }
console.log(result.original); // original recorded response
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `baseUrl` | `string` | — | Target base URL (required for replay) |
| `timeout` | `number` | `30000` | Request timeout in ms |
| `overrides.headers` | `object` | — | Merge with original headers |
| `overrides.body` | `any` | — | Replace original body |
| `overrides.query` | `object` | — | Add/override query params |

### `diff(original, replayed)`

Deep-diff two responses.

```js
import { diff, formatDiff } from 'api-traffic-replay';

const result = diff(originalResponse, replayedResponse);

console.log(result.hasChanges);    // true/false
console.log(result.statusChanged); // true/false
console.log(result.body);          // { 'field.path': { before, after, type? } }

// Pretty-print for terminal
console.log(formatDiff(result));
```

### `loadRecording(id)` / `listRecordings()`

```js
import { loadRecording, listRecordings } from 'api-traffic-replay';

const recordings = listRecordings();
const recording = loadRecording('abc123');
```

### `setRecordingsDir(dir)` / `setMaxBodySize(bytes)`

```js
import { setRecordingsDir, setMaxBodySize } from 'api-traffic-replay';

setRecordingsDir('/var/data/recordings');
setMaxBodySize(5 * 1024 * 1024); // 5MB (default: 1MB)
```

Bodies exceeding the max size are automatically truncated with a preview.

---

## CLI

```
api-traffic-replay <command> [options]

Commands:
  list                         List all recordings
  show  <id>                   Show a stored recording
  replay <id> [options]        Replay a request and show diff

Options:
  --base-url <url>             Target base URL for replay
  --timeout <ms>               Request timeout (default: 30000)
```

---

## Use Cases

| Use Case | How |
|----------|-----|
| Debug production-only bugs | Replay the exact failing request locally |
| Validate API changes | Replay old traffic against new code, spot diffs |
| Regression testing | Turn recordings into reusable test cases |
| Detect breaking changes in CI | Automate replay + diff in your pipeline |
| Investigate third-party APIs | Record and compare payment/webhook calls |

---

## Production Safety

- **Async I/O** — recordings are saved asynchronously, never blocking request handlers
- **Body size limits** — large bodies are auto-truncated (configurable, default 1MB)
- **Deep masking** — `maskHeaders` and `maskBody` work on deeply nested objects and arrays
- **Error isolation** — recording failures never crash your app (use `onError` callback)
- **Path traversal protection** — recording IDs are sanitized before file access
- **Circular reference handling** — safe JSON serialization for edge cases

---

## Requirements

- Node.js >= 18.0.0
- Express (for middleware recording)

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for development setup and guidelines.

## Security

See [SECURITY.md](SECURITY.md) for reporting vulnerabilities.

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history.

## License

[MIT](LICENSE) — made by [@ashok1706](https://github.com/ashok1706)
