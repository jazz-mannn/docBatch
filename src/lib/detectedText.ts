import type {
  DetectedFontDefaults,
  DetectedPdfText,
  FontFamily,
  FontStyle,
  FontWeight,
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
