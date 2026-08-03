import JSZip from 'jszip';
import {
  PDFDocument,
  StandardFonts,
  rgb,
  type PDFFont,
  type PDFPage,
} from 'pdf-lib';
import type {
  FontFamily,
  FontWeight,
  PositionedField,
  SpreadsheetRow,
} from '../types';
import { sanitizeFilename, uniqueFilename } from './filename';
import { toPdfPlacement } from './coordinates';
import { resolveFieldText } from './fieldText';
import { renderFilenameTemplate } from './filenameTemplate';

const MIN_FONT_SIZE = 8;

function parseHexColor(hex: string): { red: number; green: number; blue: number } {
  const normalized = hex.replace('#', '');
  const value = normalized.length === 3
    ? normalized.split('').map((character) => character + character).join('')
    : normalized;

  if (!/^[0-9a-fA-F]{6}$/.test(value)) {
    return { red: 17 / 255, green: 24 / 255, blue: 39 / 255 };
  }

  return {
    red: Number.parseInt(value.slice(0, 2), 16) / 255,
    green: Number.parseInt(value.slice(2, 4), 16) / 255,
    blue: Number.parseInt(value.slice(4, 6), 16) / 255,
  };
}

function resolveStandardFont(family: FontFamily, weight: FontWeight): StandardFonts {
  if (family === 'Times Roman') {
    return weight === 'bold' ? StandardFonts.TimesRomanBold : StandardFonts.TimesRoman;
  }

  if (family === 'Courier') {
    return weight === 'bold' ? StandardFonts.CourierBold : StandardFonts.Courier;
  }

  return weight === 'bold' ? StandardFonts.HelveticaBold : StandardFonts.Helvetica;
}

async function getFont(
  document: PDFDocument,
  cache: Map<string, PDFFont>,
  family: FontFamily,
  weight: FontWeight,
): Promise<PDFFont> {
  const key = `${family}-${weight}`;
  const cached = cache.get(key);
  if (cached) {
    return cached;
  }

  const embedded = await document.embedFont(resolveStandardFont(family, weight));
  cache.set(key, embedded);
  return embedded;
}

function fitFontSize(font: PDFFont, text: string, preferred: number, maximumWidth: number): number {
  let size = preferred;
  while (size > MIN_FONT_SIZE && font.widthOfTextAtSize(text, size) > maximumWidth) {
    size -= 0.5;
  }
  return size;
}

function drawField(
  page: PDFPage,
  field: PositionedField,
  value: string,
  font: PDFFont,
): void {
  const { width: pageWidth, height: pageHeight } = page.getSize();
  const preferredFontSize = Math.max(MIN_FONT_SIZE, field.fontSizeRatio * pageWidth);
  const maximumWidth = field.width * pageWidth;
  const fontSize = fitFontSize(font, value, preferredFontSize, maximumWidth);
  const placement = toPdfPlacement(field, pageWidth, pageHeight, fontSize);
  const textWidth = font.widthOfTextAtSize(value, fontSize);
  const blockHeight = Math.max(14, fontSize * 1.45);
  const blockY = Math.max(0, placement.y - fontSize * 0.25);

  if (field.coverOriginal) {
    page.drawRectangle({
      x: placement.x,
      y: blockY,
      width: placement.maxWidth,
      height: blockHeight,
      color: rgb(1, 1, 1),
    });
  }

  let x = placement.x;
  if (field.alignment === 'center') {
    x += Math.max(0, (placement.maxWidth - textWidth) / 2);
  } else if (field.alignment === 'right') {
    x += Math.max(0, placement.maxWidth - textWidth);
  }

  const color = parseHexColor(field.color);
  page.drawText(value, {
    x,
    y: placement.y,
    size: fontSize,
    font,
    color: rgb(color.red, color.green, color.blue),
    maxWidth: placement.maxWidth,
  });
}

export async function generatePdfArchive(options: {
  template: File;
  rows: SpreadsheetRow[];
  fields: PositionedField[];
  filenamePattern: string;
  onProgress: (current: number, total: number) => void;
}): Promise<Blob> {
  const { template, rows, fields, filenamePattern, onProgress } = options;
  const templateBytes = new Uint8Array(await template.arrayBuffer());
  const zip = new JSZip();
  const usedFilenames = new Set<string>();

  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const document = await PDFDocument.load(templateBytes, {
      ignoreEncryption: false,
    });
    const firstPage = document.getPages()[0];
    if (!firstPage) {
      throw new Error('The PDF template does not contain a page.');
    }

    const fontCache = new Map<string, PDFFont>();
    for (const field of fields) {
      const value = resolveFieldText(field, row);
      const font = await getFont(document, fontCache, field.fontFamily, field.fontWeight);
      drawField(firstPage, field, value, font);
    }

    const generated = await document.save({ useObjectStreams: true });
    const renderedName = renderFilenameTemplate(filenamePattern, row, index);
    const safeName = uniqueFilename(
      sanitizeFilename(renderedName, `document_${index + 1}`),
      usedFilenames,
    );
    zip.file(`${safeName}.pdf`, generated);
    onProgress(index + 1, rows.length);
  }

  return zip.generateAsync({
    type: 'blob',
    compression: 'DEFLATE',
    compressionOptions: { level: 6 },
  });
}
