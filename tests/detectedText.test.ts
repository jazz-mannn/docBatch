import { describe, expect, it } from 'vitest';
import { fieldFromDetectedText, inferStandardFont } from '../src/lib/detectedText';
import type { DetectedPdfText } from '../src/types';

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

describe('detected field creation', () => {
  it('creates a covered custom field at the detected position', () => {
    const detected: DetectedPdfText = {
      id: 'detected-1',
      text: 'Original certificate title',
      x: 0.2,
      y: 0.3,
      width: 0.4,
      fontSizeRatio: 0.04,
      fontFamily: 'Helvetica',
      fontWeight: 'regular',
      fontStyle: 'normal',
    };

    expect(fieldFromDetectedText(detected)).toMatchObject({
      contentMode: 'custom',
      customText: 'Original certificate title',
      coverOriginal: true,
      x: 0.2,
      y: 0.3,
      fontFamily: 'Helvetica',
    });
  });
});
