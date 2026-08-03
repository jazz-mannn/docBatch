import { describe, expect, it } from 'vitest';
import type { PositionedField } from '../src/types';
import { moveField, toPdfPlacement } from '../src/lib/coordinates';

const field: PositionedField = {
  id: 'field-1',
  column: 'Name',
  contentMode: 'column',
  customText: '',
  coverOriginal: true,
  x: 0.25,
  y: 0.2,
  width: 0.5,
  fontSizeRatio: 0.03,
  fontFamily: 'Helvetica',
  fontWeight: 'regular',
  alignment: 'center',
  color: '#111827',
};

describe('moveField', () => {
  it('keeps a field inside the page bounds', () => {
    expect(moveField(field, 1, 1)).toMatchObject({ x: 0.5, y: 0.98 });
    expect(moveField(field, -1, -1)).toMatchObject({ x: 0, y: 0 });
  });
});

describe('toPdfPlacement', () => {
  it('converts normalized top-left coordinates into PDF coordinates', () => {
    expect(toPdfPlacement(field, 600, 800, 20)).toEqual({
      x: 150,
      y: 620,
      maxWidth: 300,
    });
  });
});
