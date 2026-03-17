import type { RequestHandler, Request, Response } from 'express';

// ── Options ──────────────────────────────────────────────

export interface ApiReplayOptions {
  /** Storage backend (default: 'file') */
  storage?: 'file';
  /** Header names to mask with '***' */
  maskHeaders?: string[];
  /** Body field names to mask with '***' */
  maskBody?: string[];
  /** Route prefixes to skip recording (e.g., ['/health']) */
  ignore?: string[];
  /** Custom directory for recordings (default: process.cwd()/recordings) */
  recordingsDir?: string;
}

export interface ReplayOptions {
  /** Override the target base URL (e.g., 'http://localhost:3000') */
  baseUrl?: string;
  /** Override parts of the original request */
  overrides?: {
    headers?: Record<string, string>;
    body?: unknown;
    query?: Record<string, string>;
  };
}

// ── Data Types ───────────────────────────────────────────

export interface RecordedRequest {
  id: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body: unknown;
  query: Record<string, string>;
  timestamp: string;
}

export interface RecordedResponse {
  status: number;
  body: unknown;
  duration: number;
}

export interface Recording {
  request: RecordedRequest;
  response: RecordedResponse;
}

export interface RecordingSummary {
  id: string;
  method: string;
  url: string;
  status: number;
  timestamp: string;
}

// ── Replay Result ────────────────────────────────────────

export interface ReplayResult {
  status: number;
  body: unknown;
  duration: number;
  original: RecordedResponse;
}

// ── Diff Types ───────────────────────────────────────────

export interface DiffChange {
  before: unknown;
  after: unknown;
  type?: 'added' | 'removed';
}

export interface DiffResult {
  statusChanged: boolean;
  status: { before: number; after: number };
  body: Record<string, DiffChange>;
  duration: { before: number; after: number };
  hasChanges: boolean;
}

// ── Functions ────────────────────────────────────────────

/**
 * Express middleware that records API requests and responses.
 *
 * @example
 * ```js
 * import { apiReplay } from 'api-replay';
 *
 * app.use(apiReplay({
 *   maskHeaders: ['authorization'],
 *   ignore: ['/health'],
 * }));
 * ```
 */
export function apiReplay(options?: ApiReplayOptions): RequestHandler;

/**
 * Replay a recorded request against a target environment.
 *
 * @example
 * ```js
 * const result = await replay('abc123', {
 *   baseUrl: 'http://localhost:3000',
 * });
 * ```
 */
export function replay(id: string, options?: ReplayOptions): Promise<ReplayResult>;

/**
 * Deep-diff two responses and return structured changes.
 */
export function diff(original: RecordedResponse, replayed: RecordedResponse): DiffResult;

/**
 * Format a diff result as a colored string for terminal output.
 */
export function formatDiff(result: DiffResult): string;

/**
 * Load a recording by ID from the recordings directory.
 */
export function loadRecording(id: string): Recording;

/**
 * List all stored recordings with summary info.
 */
export function listRecordings(): RecordingSummary[];

/**
 * Set the recordings directory path.
 */
export function setRecordingsDir(dir: string): void;

/**
 * Mask specified headers in a headers object.
 */
export function sanitizeHeaders(
  headers: Record<string, string>,
  options?: Pick<ApiReplayOptions, 'maskHeaders'>
): Record<string, string>;

/**
 * Mask specified fields in a body object.
 */
export function sanitizeBody(
  body: Record<string, unknown>,
  options?: Pick<ApiReplayOptions, 'maskBody'>
): Record<string, unknown>;
