import { describe, expect, it } from 'vitest';
import { sanitizeFilename, uniqueFilename } from '../src/lib/filename';

describe('sanitizeFilename', () => {
  it('removes unsafe characters and normalizes spaces', () => {
    expect(sanitizeFilename('  Alex / Morgan: Certificate  ')).toBe('Alex_Morgan_Certificate');
  });

  it('uses a fallback for Windows reserved names', () => {
    expect(sanitizeFilename('CON', 'document_1')).toBe('document_1');
  });
});

describe('uniqueFilename', () => {
  it('adds a numeric suffix for duplicate names', () => {
    const used = new Set<string>();
    expect(uniqueFilename('Alex', used)).toBe('Alex');
    expect(uniqueFilename('Alex', used)).toBe('Alex_2');
    expect(uniqueFilename('alex', used)).toBe('alex_3');
  });
});
