export type SpreadsheetRow = Record<string, string>;

export type FontFamily = 'Helvetica' | 'Times Roman' | 'Courier';
export type FontWeight = 'regular' | 'bold';
export type TextAlignment = 'left' | 'center' | 'right';
export type FieldContentMode = 'column' | 'custom';

export interface PositionedField {
  id: string;
  column: string;
  contentMode: FieldContentMode;
  customText: string;
  x: number;
  y: number;
  width: number;
  fontSizeRatio: number;
  fontFamily: FontFamily;
  fontWeight: FontWeight;
  alignment: TextAlignment;
  color: string;
}

export interface PdfPageSize {
  width: number;
  height: number;
}

export interface SpreadsheetData {
  headers: string[];
  rows: SpreadsheetRow[];
  sourceName: string;
}

export interface GenerationProgress {
  current: number;
  total: number;
  stage: 'idle' | 'generating' | 'zipping' | 'complete' | 'error';
  message: string;
}
