import { generateId } from '../utils/id.js';
import { sanitizeHeaders, sanitizeBody } from '../core/sanitizer.js';
import { saveRecording, setRecordingsDir } from '../core/storage.js';

function tryParse(body) {
  if (typeof body === 'string') {
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }
  return body;
}

export function apiReplay(options = {}) {
  if (options.recordingsDir) {
    setRecordingsDir(options.recordingsDir);
  }

  const ignoreRoutes = options.ignore || [];

  return function recorder(req, res, next) {
    // Skip ignored routes
    for (const route of ignoreRoutes) {
      if (req.originalUrl.startsWith(route)) {
        return next();
      }
    }

    const start = Date.now();
    const id = generateId();

    const requestData = {
      id,
      method: req.method,
      url: req.originalUrl,
      headers: sanitizeHeaders(req.headers, options),
      body: sanitizeBody(req.body, options),
      query: req.query,
      timestamp: new Date().toISOString()
    };

    // Hook res.send
    const originalSend = res.send;
    res.send = function (body) {
      const duration = Date.now() - start;

      const recording = {
        request: requestData,
        response: {
          status: res.statusCode,
          body: tryParse(body),
          duration
        }
      };

      try {
        saveRecording(recording);
      } catch {
        // Don't break the response if storage fails
      }

      return originalSend.call(this, body);
    };

    // Hook res.json
    const originalJson = res.json;
    res.json = function (body) {
      const duration = Date.now() - start;

      const recording = {
        request: requestData,
        response: {
          status: res.statusCode,
          body,
          duration
        }
      };

      try {
        saveRecording(recording);
      } catch {
        // Don't break the response if storage fails
      }

      return originalJson.call(this, body);
    };

    next();
  };
}
