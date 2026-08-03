import { describe, expect, it } from 'vitest';
import { detectDominantFont, inferStandardFont } from '../src/lib/detectedText';
import type { DetectedPdfText } from '../src/types';

function detectedText(overrides: Partial<DetectedPdfText>): DetectedPdfText {
  return {
    id: crypto.randomUUID(),
    text: 'Sample text',
    x: 0.1,
    y: 0.1,
    width: 0.3,
    fontSizeRatio: 0.035,
    fontFamily: 'Helvetica',
    fontWeight: 'regular',
    fontStyle: 'normal',
    ...overrides,
  };
}

describe('standard font inference', () => {
  it('maps serif bold italic fonts to Times Roman variants', () => {
    expect(inferStandardFont('TimesNewRomanPS-BoldItalicMT serif')).toEqual({
      fontFamily: 'Times Roman',
      fontWeight: 'bold',
      fontStyle: 'italic',
    });
  });

  it('maps monospaced fonts to Courier', () => {
    expect(inferStandardFont('Liberation Mono Regular')).toEqual({
      fontFamily: 'Courier',
      fontWeight: 'regular',
      fontStyle: 'normal',
    });
  });
});

describe('dominant font detection', () => {
  it('uses the style representing the largest amount of PDF text', () => {
    const defaults = detectDominantFont([
      detectedText({ text: 'Short heading', fontFamily: 'Helvetica', fontWeight: 'bold' }),
      detectedText({
        text: 'This longer certificate body uses a classic serif style.',
        fontFamily: 'Times Roman',
        fontWeight: 'regular',
        fontStyle: 'normal',
        fontSizeRatio: 0.028,
      }),
      detectedText({
        text: 'Additional serif certificate wording.',
        fontFamily: 'Times Roman',
        fontWeight: 'regular',
        fontStyle: 'normal',
        fontSizeRatio: 0.032,
      }),
    ]);

    expect(defaults).toMatchObject({
      fontFamily: 'Times Roman',
      fontWeight: 'regular',
      fontStyle: 'normal',
    });
    expect(defaults?.fontSizeRatio).toBeGreaterThanOrEqual(0.028);
    expect(defaults?.fontSizeRatio).toBeLessThanOrEqual(0.032);
  });

  it('returns null when the PDF contains no usable text', () => {
    expect(detectDominantFont([])).toBeNull();
  });
});
