export function sanitizeHeaders(headers, options = {}) {
  if (!headers || !options.maskHeaders?.length) return headers;

  const masked = { ...headers };

  for (const key of options.maskHeaders) {
    const lower = key.toLowerCase();
    if (masked[lower] !== undefined) {
      masked[lower] = '***';
    }
  }

  return masked;
}

export function sanitizeBody(body, options = {}) {
  if (!body || !options.maskBody?.length) return body;

  const masked = structuredClone(body);

  for (const key of options.maskBody) {
    if (masked[key] !== undefined) {
      masked[key] = '***';
    }
  }

  return masked;
}
