import { describe, expect, it } from 'vitest';
import { validateImageCount } from '../src/lib/imageAsset';
import type { PositionedImage } from '../src/types';

function makeImage(id: string, role: 'signature' | 'logo'): PositionedImage {
  return {
    id,
    asset: {
      id: `asset-${id}`,
      name: `${role}.png`,
      role,
      mimeType: 'image/png',
      dataUrl: 'data:image/png;base64,AA==',
      pixelWidth: 400,
      pixelHeight: 200,
    },
    x: 0.1,
    y: 0.1,
    width: 0.2,
    height: 0.1,
    coverOriginal: false,
  };
}

describe('image limits', () => {
  it('limits each image role to two elements', () => {
    const images = [makeImage('1', 'signature'), makeImage('2', 'signature')];
    expect(validateImageCount(images, 'signature')).toContain('up to 2 signature');
  });

  it('limits the template to four image elements', () => {
    const images = [
      makeImage('1', 'signature'),
      makeImage('2', 'signature'),
      makeImage('3', 'logo'),
      makeImage('4', 'logo'),
    ];
    expect(validateImageCount(images, 'logo')).toContain('up to 4 image');
  });
});
