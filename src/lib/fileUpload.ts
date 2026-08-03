export interface UploadFileLike {
  name: string;
  size: number;
}

export interface UploadPolicy {
  label: string;
  maxFiles: number;
  maxBytes: number;
  extensions: readonly string[];
}

export type FileSelectionResult<T extends UploadFileLike> =
  | { ok: true; file: T }
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

function pluralize(count: number, singular: string, plural = `${singular}s`): string {
  return count === 1 ? singular : plural;
}

export function formatBytes(bytes: number): string {
  if (bytes >= MEBIBYTE) {
    const value = bytes / MEBIBYTE;
    return `${Number.isInteger(value) ? value : value.toFixed(1)} MB`;
  }

  return `${Math.ceil(bytes / 1024)} KB`;
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
  const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
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
