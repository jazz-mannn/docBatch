import { describe, expect, it } from 'vitest';
import {
  appendFilenameToken,
  renderFilenameTemplate,
  validateFilenameTemplate,
} from '../src/lib/filenameTemplate';

const headers = ['Certificate Number', 'Recipient'];
const row = {
  'Certificate Number': 'CERT-0042',
  Recipient: 'Recipient R-0042',
};

describe('filename templates', () => {
  it('renders literal text, spreadsheet values, and row numbers', () => {
    expect(renderFilenameTemplate(
      'Document Automation - {Certificate Number} - {row}',
      row,
      2,
    )).toBe('Document Automation - CERT-0042 - 3');
  });

  it('accepts known column and built-in tokens', () => {
    expect(validateFilenameTemplate(
      'Certificate - {Certificate Number} - {row}',
      headers,
    )).toBeNull();
  });

  it('rejects unknown tokens', () => {
    expect(validateFilenameTemplate('Certificate - {Unknown}', headers)).toBe(
      'Unknown file-name field: {Unknown}.',
    );
  });

  it('appends tokens using readable separators', () => {
    expect(appendFilenameToken('Document Automation', 'Certificate Number')).toBe(
      'Document Automation - {Certificate Number}',
    );
  });
});
