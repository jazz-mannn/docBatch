import * as XLSX from 'xlsx';
import type { SpreadsheetData, SpreadsheetRow } from '../types';

const MAX_ROWS = 500;

function stringifyCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '';
  }

  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return String(value).trim();
}

export async function parseSpreadsheet(file: File): Promise<SpreadsheetData> {
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !['csv', 'xlsx', 'xls'].includes(extension)) {
    throw new Error('Upload a CSV, XLSX, or XLS spreadsheet.');
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, {
    type: 'array',
    cellDates: true,
    dense: true,
  });

  const firstSheetName = workbook.SheetNames[0];
  if (!firstSheetName) {
    throw new Error('The spreadsheet does not contain a worksheet.');
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, {
    defval: '',
    raw: false,
  });

  if (rawRows.length === 0) {
    throw new Error('The spreadsheet does not contain data rows.');
  }

  if (rawRows.length > MAX_ROWS) {
    throw new Error(`This MVP supports up to ${MAX_ROWS} rows per batch.`);
  }

  const headers = Object.keys(rawRows[0]).map((header) => header.trim()).filter(Boolean);
  if (headers.length === 0) {
    throw new Error('The spreadsheet requires a header row.');
  }

  if (new Set(headers.map((header) => header.toLowerCase())).size !== headers.length) {
    throw new Error('Spreadsheet column names must be unique.');
  }

  const rows: SpreadsheetRow[] = rawRows.map((row) => {
    const normalized: SpreadsheetRow = {};
    for (const header of headers) {
      normalized[header] = stringifyCell(row[header]);
    }
    return normalized;
  });

  return {
    headers,
    rows,
    sourceName: file.name,
  };
}
