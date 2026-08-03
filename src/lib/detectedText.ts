import type {
  DetectedPdfText,
  FontFamily,
  FontStyle,
  FontWeight,
  PositionedField,
} from '../types';

const MAX_DETECTED_ITEMS = 250;

export function inferStandardFont(fontDescription: string): {
  fontFamily: FontFamily;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
} {
  const normalized = fontDescription.toLowerCase();

  let fontFamily: FontFamily = 'Helvetica';
  if (normalized.includes('courier') || normalized.includes('mono')) {
    fontFamily = 'Courier';
  } else if (
    normalized.includes('times')
    || normalized.includes('serif')
    || normalized.includes('georgia')
    || normalized.includes('garamond')
  ) {
    fontFamily = 'Times Roman';
  }

  const fontWeight: FontWeight = /bold|black|heavy|semibold|demi/.test(normalized)
    ? 'bold'
    : 'regular';
  const fontStyle: FontStyle = /italic|oblique/.test(normalized)
    ? 'italic'
    : 'normal';

  return { fontFamily, fontWeight, fontStyle };
}

export function limitDetectedText(items: DetectedPdfText[]): DetectedPdfText[] {
  return items
    .filter((item) => item.text.trim().length > 0 && item.width > 0.003)
    .slice(0, MAX_DETECTED_ITEMS);
}

export function fieldFromDetectedText(item: DetectedPdfText): PositionedField {
  return {
    id: crypto.randomUUID(),
    column: '',
    contentMode: 'custom',
    customText: item.text.slice(0, 200),
    coverOriginal: true,
    x: item.x,
    y: item.y,
    width: Math.min(0.9, Math.max(0.08, item.width + 0.015)),
    fontSizeRatio: Math.min(0.08, Math.max(0.015, item.fontSizeRatio)),
    fontFamily: item.fontFamily,
    fontWeight: item.fontWeight,
    fontStyle: item.fontStyle,
    alignment: 'left',
    color: '#111827',
  };
}
