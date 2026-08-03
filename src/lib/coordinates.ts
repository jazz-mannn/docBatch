import type { PositionedField } from '../types';

export function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function moveField(
  field: PositionedField,
  deltaXRatio: number,
  deltaYRatio: number,
): PositionedField {
  return {
    ...field,
    x: clamp(field.x + deltaXRatio, 0, 1 - field.width),
    y: clamp(field.y + deltaYRatio, 0, 0.98),
  };
}

export function toPdfPlacement(
  field: PositionedField,
  pageWidth: number,
  pageHeight: number,
  fontSize: number,
): { x: number; y: number; maxWidth: number } {
  return {
    x: field.x * pageWidth,
    y: pageHeight - field.y * pageHeight - fontSize,
    maxWidth: field.width * pageWidth,
  };
}
