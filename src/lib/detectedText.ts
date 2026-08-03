import type {
  DetectedFontDefaults,
  DetectedPdfText,
  FontFamily,
  FontStyle,
  FontWeight,
  PositionedField,
} from '../types';

const MAX_DETECTED_ITEMS = 250;

export const FALLBACK_FONT_DEFAULTS: DetectedFontDefaults = {
  fontFamily: 'Helvetica',
  fontWeight: 'regular',
  fontStyle: 'normal',
  fontSizeRatio: 0.035,
};

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
    || normalized.includes('palatino')
    || normalized.includes('baskerville')
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

export function detectDominantFont(items: DetectedPdfText[]): DetectedFontDefaults | null {
  const validItems = limitDetectedText(items);
  if (validItems.length === 0) return null;

  const groups = new Map<string, {
    defaults: Omit<DetectedFontDefaults, 'fontSizeRatio'>;
    score: number;
    weightedSize: number;
  }>();

  for (const item of validItems) {
    const key = `${item.fontFamily}|${item.fontWeight}|${item.fontStyle}`;
    const weight = Math.max(1, item.text.trim().length);
    const current = groups.get(key) ?? {
      defaults: {
        fontFamily: item.fontFamily,
        fontWeight: item.fontWeight,
        fontStyle: item.fontStyle,
      },
      score: 0,
      weightedSize: 0,
    };

    current.score += weight;
    current.weightedSize += item.fontSizeRatio * weight;
    groups.set(key, current);
  }

  const dominant = [...groups.values()].sort((left, right) => right.score - left.score)[0];
  if (!dominant) return null;

  return {
    ...dominant.defaults,
    fontSizeRatio: Math.min(0.08, Math.max(0.015, dominant.weightedSize / dominant.score)),
  };
}

/**
 * Legacy compatibility helper. The website no longer exposes original PDF text
 * as selectable editor targets, but keeping this export avoids breaking older
 * development branches while the new generator is adopted.
 */
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
