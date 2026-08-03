import type { PositionedField, SpreadsheetRow } from '../types';

export const MAX_CUSTOM_TEXT_LENGTH = 200;
export const MAX_POSITIONED_FIELDS = 20;

export function normalizeCustomText(value: string): string {
  return value.slice(0, MAX_CUSTOM_TEXT_LENGTH);
}

export function resolveFieldText(
  field: PositionedField,
  row: SpreadsheetRow | undefined,
): string {
  if (field.contentMode === 'custom') {
    return normalizeCustomText(field.customText);
  }

  return row?.[field.column] ?? '';
}
