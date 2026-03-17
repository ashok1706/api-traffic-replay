import { describe, it, expect } from 'vitest';
import { diff } from '../src/core/diff.js';

describe('diff', () => {
  it('detects no changes for identical responses', () => {
    const original = { status: 200, body: { name: 'john' }, duration: 50 };
    const replayed = { status: 200, body: { name: 'john' }, duration: 45 };
    const result = diff(original, replayed);
    expect(result.statusChanged).toBe(false);
    expect(result.hasChanges).toBe(false);
    expect(Object.keys(result.body)).toHaveLength(0);
  });

  it('detects status change', () => {
    const original = { status: 200, body: {}, duration: 50 };
    const replayed = { status: 500, body: {}, duration: 50 };
    const result = diff(original, replayed);
    expect(result.statusChanged).toBe(true);
    expect(result.status.before).toBe(200);
    expect(result.status.after).toBe(500);
  });

  it('detects changed fields', () => {
    const original = { status: 200, body: { price: 100 }, duration: 50 };
    const replayed = { status: 200, body: { price: 200 }, duration: 50 };
    const result = diff(original, replayed);
    expect(result.hasChanges).toBe(true);
    expect(result.body.price.before).toBe(100);
    expect(result.body.price.after).toBe(200);
  });

  it('detects added fields', () => {
    const original = { status: 200, body: {}, duration: 50 };
    const replayed = { status: 200, body: { newField: 'hello' }, duration: 50 };
    const result = diff(original, replayed);
    expect(result.body.newField.type).toBe('added');
    expect(result.body.newField.after).toBe('hello');
  });

  it('detects removed fields', () => {
    const original = { status: 200, body: { old: 'value' }, duration: 50 };
    const replayed = { status: 200, body: {}, duration: 50 };
    const result = diff(original, replayed);
    expect(result.body.old.type).toBe('removed');
    expect(result.body.old.before).toBe('value');
  });

  it('handles nested objects', () => {
    const original = { status: 200, body: { user: { name: 'john', age: 30 } }, duration: 50 };
    const replayed = { status: 200, body: { user: { name: 'jane', age: 30 } }, duration: 50 };
    const result = diff(original, replayed);
    expect(result.body['user.name'].before).toBe('john');
    expect(result.body['user.name'].after).toBe('jane');
  });

  it('handles arrays', () => {
    const original = { status: 200, body: { items: [1, 2, 3] }, duration: 50 };
    const replayed = { status: 200, body: { items: [1, 2, 4] }, duration: 50 };
    const result = diff(original, replayed);
    expect(result.body['items[2]'].before).toBe(3);
    expect(result.body['items[2]'].after).toBe(4);
  });
});
