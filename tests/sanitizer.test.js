import { describe, it, expect } from 'vitest';
import { sanitizeHeaders, sanitizeBody } from '../src/core/sanitizer.js';

describe('sanitizeHeaders', () => {
  it('masks specified headers', () => {
    const headers = { authorization: 'Bearer secret', 'content-type': 'application/json' };
    const result = sanitizeHeaders(headers, { maskHeaders: ['authorization'] });
    expect(result.authorization).toBe('***');
    expect(result['content-type']).toBe('application/json');
  });

  it('returns headers unchanged when no maskHeaders', () => {
    const headers = { authorization: 'Bearer secret' };
    expect(sanitizeHeaders(headers)).toEqual(headers);
    expect(sanitizeHeaders(headers, {})).toEqual(headers);
  });

  it('handles null/undefined headers', () => {
    expect(sanitizeHeaders(null, { maskHeaders: ['auth'] })).toBeNull();
    expect(sanitizeHeaders(undefined)).toBeUndefined();
  });

  it('is case-insensitive for header keys', () => {
    const headers = { authorization: 'secret' };
    const result = sanitizeHeaders(headers, { maskHeaders: ['Authorization'] });
    expect(result.authorization).toBe('***');
  });
});

describe('sanitizeBody', () => {
  it('masks specified body fields', () => {
    const body = { password: '123', name: 'john' };
    const result = sanitizeBody(body, { maskBody: ['password'] });
    expect(result.password).toBe('***');
    expect(result.name).toBe('john');
  });

  it('does not mutate original body', () => {
    const body = { password: '123' };
    sanitizeBody(body, { maskBody: ['password'] });
    expect(body.password).toBe('123');
  });

  it('returns body unchanged when no maskBody', () => {
    const body = { name: 'john' };
    expect(sanitizeBody(body)).toEqual(body);
  });
});
