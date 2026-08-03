import { describe, expect, it } from 'vitest';
import {
  PDF_UPLOAD_POLICY,
  SPREADSHEET_UPLOAD_POLICY,
  validateFileSelection,
} from '../src/lib/fileUpload';

const file = (name: string, size: number) => ({ name, size });

describe('validateFileSelection', () => {
  it('accepts one valid PDF', () => {
    expect(validateFileSelection([file('template.pdf', 1024)], PDF_UPLOAD_POLICY)).toMatchObject({
      ok: true,
    });
  });

  it('rejects multiple files in one slot', () => {
    expect(validateFileSelection([
      file('one.pdf', 1024),
      file('two.pdf', 1024),
    ], PDF_UPLOAD_POLICY)).toEqual({
      ok: false,
      message: 'Only 1 file can be added to the PDF template slot.',
    });
  });

  it('rejects oversized spreadsheets', () => {
    expect(validateFileSelection([
      file('records.xlsx', SPREADSHEET_UPLOAD_POLICY.maxBytes + 1),
    ], SPREADSHEET_UPLOAD_POLICY)).toEqual({
      ok: false,
      message: 'The spreadsheet must be 5 MB or smaller.',
    });
  });

  it('rejects unsupported extensions', () => {
    expect(validateFileSelection([
      file('records.txt', 1024),
    ], SPREADSHEET_UPLOAD_POLICY)).toEqual({
      ok: false,
      message: 'The spreadsheet must use .csv, .xlsx, .xls.',
    });
  });
});
