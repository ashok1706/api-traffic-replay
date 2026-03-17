import fs from 'fs';
import path from 'path';

let recordingsDir = path.join(process.cwd(), 'recordings');

export function setRecordingsDir(dir) {
  recordingsDir = dir;
}

export function getRecordingsDir() {
  return recordingsDir;
}

function ensureDir() {
  if (!fs.existsSync(recordingsDir)) {
    fs.mkdirSync(recordingsDir, { recursive: true });
  }
}

export function saveRecording(data) {
  ensureDir();
  const file = path.join(recordingsDir, `${data.request.id}.json`);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
  return file;
}

export function loadRecording(id) {
  const file = path.join(recordingsDir, `${id}.json`);
  if (!fs.existsSync(file)) {
    throw new Error(`Recording not found: ${id}`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf-8'));
}

export function listRecordings() {
  ensureDir();
  return fs.readdirSync(recordingsDir)
    .filter(f => f.endsWith('.json'))
    .map(f => {
      const data = JSON.parse(fs.readFileSync(path.join(recordingsDir, f), 'utf-8'));
      return {
        id: path.basename(f, '.json'),
        method: data.request.method,
        url: data.request.url,
        status: data.response.status,
        timestamp: data.request.timestamp
      };
    });
}
