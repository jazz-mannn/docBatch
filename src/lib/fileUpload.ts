export interface UploadFileLike {
  name: string;
  size: number;
  type?: string;
}

export interface UploadPolicy {
  label: string;
  maxFiles: number;
  maxBytes: number;
  extensions: readonly string[];
}

export type SourceFileKind = 'pdf' | 'spreadsheet' | 'unsupported';

export type FileSelectionResult<T extends UploadFileLike> =
  | { ok: true; file: T }
  | { ok: false; message: string };

export type SourceFileDropResult<T extends UploadFileLike> =
  | { ok: true; pdf?: T; spreadsheet?: T }
  | { ok: false; message: string };

const MEBIBYTE = 1024 * 1024;

export const MAX_ACTIVE_FILES = 2;

export const PDF_UPLOAD_POLICY: UploadPolicy = {
  label: 'PDF template',
  maxFiles: 1,
  maxBytes: 8 * MEBIBYTE,
  extensions: ['pdf'],
};

export const SPREADSHEET_UPLOAD_POLICY: UploadPolicy = {
  label: 'spreadsheet',
  maxFiles: 1,
  maxBytes: 5 * MEBIBYTE,
  extensions: ['csv', 'xlsx', 'xls'],
};

const PDF_MIME_TYPES = new Set(['application/pdf']);
const SPREADSHEET_MIME_TYPES = new Set([
  'text/csv',
  'application/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
]);

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

function extensionOf(fileName: string): string {
  return fileName.split('.').pop()?.trim().toLowerCase() ?? '';
}

export function formatBytes(bytes: number): string {
  if (bytes >= MEBIBYTE) {
    const value = bytes / MEBIBYTE;
    return `${Number.isInteger(value) ? value : value.toFixed(1)} MB`;
  }

  return `${Math.ceil(bytes / 1024)} KB`;
}

export function classifySourceFile(file: UploadFileLike): SourceFileKind {
  const extension = extensionOf(file.name);
  const mimeType = file.type?.trim().toLowerCase() ?? '';

  if (PDF_UPLOAD_POLICY.extensions.includes(extension) || PDF_MIME_TYPES.has(mimeType)) {
    return 'pdf';
  }

  if (
    SPREADSHEET_UPLOAD_POLICY.extensions.includes(extension)
    || SPREADSHEET_MIME_TYPES.has(mimeType)
  ) {
    return 'spreadsheet';
  }

  return 'unsupported';
}

export function validateFileSelection<T extends UploadFileLike>(
  files: readonly T[],
  policy: UploadPolicy,
): FileSelectionResult<T> {
  if (files.length === 0) {
    return { ok: false, message: `Choose a ${policy.label} file.` };
  }

  if (files.length > policy.maxFiles) {
    return {
      ok: false,
      message: `Only ${policy.maxFiles} ${pluralize(policy.maxFiles, 'file')} can be added to the ${policy.label} slot.`,
    };
  }

  const file = files[0];
  const extension = extensionOf(file.name);
  if (!policy.extensions.includes(extension)) {
    return {
      ok: false,
      message: `The ${policy.label} must use ${policy.extensions.map((item) => `.${item}`).join(', ')}.`,
    };
  }

  if (file.size > policy.maxBytes) {
    return {
      ok: false,
      message: `The ${policy.label} must be ${formatBytes(policy.maxBytes)} or smaller.`,
    };
  }

  return { ok: true, file };
}

export function routeSourceFileDrop<T extends UploadFileLike>(
  files: readonly T[],
): SourceFileDropResult<T> {
  if (files.length === 0) {
    return { ok: false, message: 'Drop a PDF template or a CSV or Excel spreadsheet.' };
  }

  if (files.length > MAX_ACTIVE_FILES) {
    return {
      ok: false,
      message: `Drop no more than ${MAX_ACTIVE_FILES} source files at once: one PDF and one CSV or Excel spreadsheet.`,
    };
  }

  const unsupported = files.filter((file) => classifySourceFile(file) === 'unsupported');
  if (unsupported.length > 0) {
    const names = unsupported.map((file) => `“${file.name}”`).join(', ');
    return {
      ok: false,
      message: `${names} ${unsupported.length === 1 ? 'is' : 'are'} not supported. Use one .pdf template and one .csv, .xlsx, or .xls spreadsheet.`,
    };
  }

  const pdfFiles = files.filter((file) => classifySourceFile(file) === 'pdf');
  const spreadsheetFiles = files.filter((file) => classifySourceFile(file) === 'spreadsheet');

  if (pdfFiles.length > PDF_UPLOAD_POLICY.maxFiles) {
    return { ok: false, message: 'Only one PDF template can be active at a time.' };
  }

  if (spreadsheetFiles.length > SPREADSHEET_UPLOAD_POLICY.maxFiles) {
    return { ok: false, message: 'Only one CSV or Excel spreadsheet can be active at a time.' };
  }

  const pdfResult = pdfFiles.length
    ? validateFileSelection(pdfFiles, PDF_UPLOAD_POLICY)
    : null;
  if (pdfResult && !pdfResult.ok) return pdfResult;

  const spreadsheetResult = spreadsheetFiles.length
    ? validateFileSelection(spreadsheetFiles, SPREADSHEET_UPLOAD_POLICY)
    : null;
  if (spreadsheetResult && !spreadsheetResult.ok) return spreadsheetResult;

  return {
    ok: true,
    pdf: pdfResult?.file,
    spreadsheet: spreadsheetResult?.file,
  };
}
