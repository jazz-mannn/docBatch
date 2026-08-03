import { describe, expect, it } from 'vitest';
import {
  PDF_UPLOAD_POLICY,
  SPREADSHEET_UPLOAD_POLICY,
  classifySourceFile,
  routeSourceFileDrop,
  validateFileSelection,
} from '../src/lib/fileUpload';

const file = (name: string, size: number, type = '') => ({ name, size, type });

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

describe('classifySourceFile', () => {
  it('recognises source files by extension', () => {
    expect(classifySourceFile(file('certificate.PDF', 100))).toBe('pdf');
    expect(classifySourceFile(file('records.csv', 100))).toBe('spreadsheet');
    expect(classifySourceFile(file('records.xlsx', 100))).toBe('spreadsheet');
  });

  it('uses MIME type when the extension is unavailable', () => {
    expect(classifySourceFile(file('template', 100, 'application/pdf'))).toBe('pdf');
    expect(classifySourceFile(file(
      'records',
      100,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ))).toBe('spreadsheet');
  });

  it('rejects unrelated file types', () => {
    expect(classifySourceFile(file('notes.docx', 100))).toBe('unsupported');
  });
});

describe('routeSourceFileDrop', () => {
  it('routes one PDF and one spreadsheet regardless of order', () => {
    const pdf = file('template.pdf', 1024);
    const spreadsheet = file('records.xlsx', 1024);

    expect(routeSourceFileDrop([spreadsheet, pdf])).toEqual({
      ok: true,
      pdf,
      spreadsheet,
    });
  });

  it('routes a spreadsheet dropped onto either source box', () => {
    const spreadsheet = file('records.csv', 1024);
    expect(routeSourceFileDrop([spreadsheet])).toEqual({
      ok: true,
      spreadsheet,
    });
  });

  it('rejects more than two source files', () => {
    expect(routeSourceFileDrop([
      file('template.pdf', 1024),
      file('records.csv', 1024),
      file('extra.xlsx', 1024),
    ])).toEqual({
      ok: false,
      message: 'Drop no more than 2 source files at once: one PDF and one CSV or Excel spreadsheet.',
    });
  });

  it('rejects duplicate PDFs', () => {
    expect(routeSourceFileDrop([
      file('one.pdf', 1024),
      file('two.pdf', 1024),
    ])).toEqual({
      ok: false,
      message: 'Only one PDF template can be active at a time.',
    });
  });

  it('rejects unsupported files with a useful response', () => {
    expect(routeSourceFileDrop([file('notes.docx', 1024)])).toEqual({
      ok: false,
      message: '“notes.docx” is not supported. Use one .pdf template and one .csv, .xlsx, or .xls spreadsheet.',
    });
  });

  it('applies the correct size limit after classifying a file', () => {
    expect(routeSourceFileDrop([
      file('template.pdf', PDF_UPLOAD_POLICY.maxBytes + 1),
    ])).toEqual({
      ok: false,
      message: 'The PDF template must be 8 MB or smaller.',
    });
  });
});
