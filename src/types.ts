export type SpreadsheetRow = Record<string, string>;

export type FontFamily = 'Helvetica' | 'Times Roman' | 'Courier';
export type FontWeight = 'regular' | 'bold';
export type FontStyle = 'normal' | 'italic';
export type TextAlignment = 'left' | 'center' | 'right';
export type FieldContentMode = 'column' | 'custom';
export type ImageRole = 'signature' | 'logo';

export interface PositionedField {
  id: string;
  column: string;
  contentMode: FieldContentMode;
  customText: string;
  coverOriginal: boolean;
  x: number;
  y: number;
  width: number;
  fontSizeRatio: number;
  fontFamily: FontFamily;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
  alignment: TextAlignment;
  color: string;
}

export interface DetectedPdfText {
  id: string;
  text: string;
  x: number;
  y: number;
  width: number;
  fontSizeRatio: number;
  fontFamily: FontFamily;
  fontWeight: FontWeight;
  fontStyle: FontStyle;
}

export interface ImageAsset {
  id: string;
  name: string;
  role: ImageRole;
  mimeType: 'image/png' | 'image/jpeg';
  dataUrl: string;
  pixelWidth: number;
  pixelHeight: number;
}

export interface PositionedImage {
  id: string;
  asset: ImageAsset;
  x: number;
  y: number;
  width: number;
  height: number;
  coverOriginal: boolean;
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
