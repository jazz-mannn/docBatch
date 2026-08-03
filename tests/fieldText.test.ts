import { describe, expect, it } from 'vitest';
import type { PositionedField } from '../src/types';
import {
  MAX_CUSTOM_TEXT_LENGTH,
  normalizeCustomText,
  resolveFieldText,
} from '../src/lib/fieldText';

const baseField: PositionedField = {
  id: 'field-1',
  column: 'Recipient',
  contentMode: 'column',
  customText: '',
  coverOriginal: true,
  x: 0.2,
  y: 0.2,
  width: 0.5,
  fontSizeRatio: 0.03,
  fontFamily: 'Helvetica',
  fontWeight: 'regular',
  alignment: 'center',
  color: '#111827',
};

describe('field text', () => {
  it('uses the selected spreadsheet value', () => {
    expect(resolveFieldText(baseField, { Recipient: 'Recipient R-0042' })).toBe('Recipient R-0042');
  });

  it('uses custom text for every record', () => {
    expect(resolveFieldText({
      ...baseField,
      contentMode: 'custom',
      customText: 'Issued by Example Institution',
    }, { Recipient: 'Recipient R-0042' })).toBe('Issued by Example Institution');
  });

  it('limits custom text to the configured length', () => {
    const value = 'x'.repeat(MAX_CUSTOM_TEXT_LENGTH + 25);
    expect(normalizeCustomText(value)).toHaveLength(MAX_CUSTOM_TEXT_LENGTH);
  });
});
