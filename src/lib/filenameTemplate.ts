import type { SpreadsheetRow } from '../types';

export const MAX_FILENAME_TEMPLATE_LENGTH = 120;
const TOKEN_PATTERN = /\{([^{}]+)\}/g;
const BUILT_IN_TOKENS = new Set(['row']);

export function normalizeFilenameTemplate(value: string): string {
  return value.slice(0, MAX_FILENAME_TEMPLATE_LENGTH);
}

export function appendFilenameToken(pattern: string, token: string): string {
  const spacer = pattern.length > 0 && !/[\s_-]$/.test(pattern) ? ' - ' : '';
  return normalizeFilenameTemplate(`${pattern}${spacer}{${token}}`);
}

export function getFilenameTemplateTokens(pattern: string): string[] {
  return Array.from(pattern.matchAll(TOKEN_PATTERN), (match) => match[1].trim()).filter(Boolean);
}

export function validateFilenameTemplate(pattern: string, headers: readonly string[]): string | null {
  if (!pattern.trim()) {
    return 'Enter an output file-name pattern.';
  }

  const headerSet = new Set(headers.map((header) => header.toLowerCase()));
  const unknown = getFilenameTemplateTokens(pattern).filter((token) => (
    !BUILT_IN_TOKENS.has(token.toLowerCase()) && !headerSet.has(token.toLowerCase())
  ));

  if (unknown.length > 0) {
    return `Unknown file-name field: {${unknown[0]}}.`;
  }

  return null;
}

export function renderFilenameTemplate(
  pattern: string,
  row: SpreadsheetRow,
  rowIndex: number,
): string {
  const headerLookup = new Map(
    Object.keys(row).map((header) => [header.toLowerCase(), header]),
  );

  return pattern.replace(TOKEN_PATTERN, (_full, rawToken: string) => {
    const token = rawToken.trim();
    if (token.toLowerCase() === 'row') {
      return String(rowIndex + 1);
    }

    const matchedHeader = headerLookup.get(token.toLowerCase());
    return matchedHeader ? row[matchedHeader] ?? '' : '';
  }).trim();
}
