import { loadRecording } from './storage.js';

export async function replay(id, options = {}) {
  const recording = loadRecording(id);
  const { request } = recording;

  // Build target URL
  let url = request.url;
  if (options.baseUrl) {
    const parsed = new URL(request.url, 'http://localhost');
    url = `${options.baseUrl.replace(/\/$/, '')}${parsed.pathname}${parsed.search}`;
  }

  // Apply overrides
  const headers = { ...request.headers, ...options.overrides?.headers };
  const body = options.overrides?.body ?? request.body;
  const method = request.method;

  // Remove host header (will be set by fetch)
  delete headers.host;

  // Build fetch options
  const fetchOptions = { method, headers };

  if (method !== 'GET' && method !== 'HEAD' && body) {
    fetchOptions.body = JSON.stringify(body);
    if (!headers['content-type']) {
      headers['content-type'] = 'application/json';
    }
  }

  const start = Date.now();
  const res = await fetch(url, fetchOptions);
  const duration = Date.now() - start;

  let responseBody;
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    responseBody = await res.json();
  } else {
    responseBody = await res.text();
  }

  return {
    status: res.status,
    body: responseBody,
    duration,
    original: recording.response
  };
}
