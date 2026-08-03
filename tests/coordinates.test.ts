import { describe, expect, it } from 'vitest';
import type { PositionedField, PositionedImage } from '../src/types';
import {
  moveField,
  moveImage,
  toPdfImagePlacement,
  toPdfPlacement,
} from '../src/lib/coordinates';

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
  fontStyle: 'normal',
  alignment: 'center',
  color: '#111827',
};

const image: PositionedImage = {
  id: 'image-1',
  asset: {
    id: 'asset-1',
    name: 'signature.png',
    role: 'signature',
    mimeType: 'image/png',
    dataUrl: 'data:image/png;base64,AA==',
    pixelWidth: 600,
    pixelHeight: 200,
  },
  x: 0.1,
  y: 0.7,
  width: 0.25,
  height: 0.1,
  coverOriginal: false,
};

describe('moveField', () => {
  it('keeps a field inside the page bounds', () => {
    expect(moveField(field, 1, 1)).toMatchObject({ x: 0.5, y: 0.98 });
    expect(moveField(field, -1, -1)).toMatchObject({ x: 0, y: 0 });
  });
});

describe('moveImage', () => {
  it('keeps an image inside the page bounds', () => {
    expect(moveImage(image, 1, 1)).toMatchObject({ x: 0.75, y: 0.9 });
    expect(moveImage(image, -1, -1)).toMatchObject({ x: 0, y: 0 });
  });
});

describe('PDF placement', () => {
  it('converts normalized text coordinates into PDF coordinates', () => {
    expect(toPdfPlacement(field, 600, 800, 20)).toEqual({
      x: 150,
      y: 620,
      maxWidth: 300,
    });
  });

  it('converts normalized image coordinates into PDF coordinates', () => {
    expect(toPdfImagePlacement(image, 600, 800)).toEqual({
      x: 60,
      y: 160,
      width: 150,
      height: 80,
    });
  });
});
