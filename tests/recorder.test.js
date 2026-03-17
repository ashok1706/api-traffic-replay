import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { apiReplay } from '../src/middleware/recorder.js';
import { setRecordingsDir } from '../src/core/storage.js';

const testDir = path.join(process.cwd(), 'test-recordings-middleware');

describe('apiReplay middleware', () => {
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

  function mockReq(overrides = {}) {
    return {
      method: 'GET',
      originalUrl: '/api/test',
      headers: { 'content-type': 'application/json' },
      body: null,
      query: {},
      ...overrides
    };
  }

  function mockRes() {
    const res = {
      statusCode: 200,
      send: function (body) { return body; },
      json: function (body) { return body; }
    };
    return res;
  }

  it('records a request/response via res.json', () => {
    return new Promise((resolve) => {
      const middleware = apiReplay({ maskHeaders: ['authorization'] });
      const req = mockReq({ headers: { authorization: 'Bearer token', 'content-type': 'application/json' } });
      const res = mockRes();

      middleware(req, res, () => {
        res.json({ message: 'hello' });

        const files = fs.readdirSync(testDir);
        expect(files).toHaveLength(1);

        const data = JSON.parse(fs.readFileSync(path.join(testDir, files[0]), 'utf-8'));
        expect(data.request.method).toBe('GET');
        expect(data.request.url).toBe('/api/test');
        expect(data.request.headers.authorization).toBe('***');
        expect(data.response.status).toBe(200);
        expect(data.response.body).toEqual({ message: 'hello' });
        resolve();
      });
    });
  });

  it('skips ignored routes', () => {
    return new Promise((resolve) => {
      const middleware = apiReplay({ ignore: ['/health'] });
      const req = mockReq({ originalUrl: '/health' });
      const res = mockRes();

      middleware(req, res, () => {
        const exists = fs.existsSync(testDir) && fs.readdirSync(testDir).length > 0;
        expect(exists).toBe(false);
        resolve();
      });
    });
  });

  it('records via res.send with string body', () => {
    return new Promise((resolve) => {
      const middleware = apiReplay();
      const req = mockReq();
      const res = mockRes();

      middleware(req, res, () => {
        res.send(JSON.stringify({ ok: true }));

        const files = fs.readdirSync(testDir);
        expect(files).toHaveLength(1);

        const data = JSON.parse(fs.readFileSync(path.join(testDir, files[0]), 'utf-8'));
        expect(data.response.body).toEqual({ ok: true });
        resolve();
      });
    });
  });
});
