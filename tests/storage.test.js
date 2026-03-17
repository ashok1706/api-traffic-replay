import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { saveRecording, loadRecording, listRecordings, setRecordingsDir } from '../src/core/storage.js';

const testDir = path.join(process.cwd(), 'test-recordings');

describe('storage', () => {
  beforeEach(() => {
    setRecordingsDir(testDir);
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  afterEach(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true });
    }
  });

  const mockRecording = {
    request: {
      id: 'test-123',
      method: 'GET',
      url: '/api/users',
      headers: {},
      body: null,
      query: {},
      timestamp: '2025-01-01T00:00:00.000Z'
    },
    response: {
      status: 200,
      body: { users: [] },
      duration: 42
    }
  };

  it('saves and loads a recording', () => {
    saveRecording(mockRecording);
    const loaded = loadRecording('test-123');
    expect(loaded).toEqual(mockRecording);
  });

  it('creates directory if missing', () => {
    expect(fs.existsSync(testDir)).toBe(false);
    saveRecording(mockRecording);
    expect(fs.existsSync(testDir)).toBe(true);
  });

  it('throws when loading non-existent recording', () => {
    expect(() => loadRecording('nope')).toThrow('Recording not found');
  });

  it('lists recordings', () => {
    saveRecording(mockRecording);
    const list = listRecordings();
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe('test-123');
    expect(list[0].method).toBe('GET');
    expect(list[0].url).toBe('/api/users');
  });
});
