import type { ImageAsset, ImageRole, PdfPageSize, PositionedImage } from '../types';

export const MAX_IMAGE_FILE_BYTES = 2 * 1024 * 1024;
export const MAX_IMAGE_DIMENSION = 4096;
export const MAX_IMAGE_ELEMENTS = 4;
export const MAX_IMAGES_PER_ROLE = 2;

const ACCEPTED_TYPES = new Set(['image/png', 'image/jpeg']);

function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('The image could not be read.'));
    reader.readAsDataURL(file);
  });
}

function readImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error('The selected file is not a valid PNG or JPEG image.'));
    image.src = dataUrl;
  });
}

export async function createImageAsset(file: File, role: ImageRole): Promise<ImageAsset> {
  if (!ACCEPTED_TYPES.has(file.type)) {
    throw new Error('Use a PNG or JPEG image for a signature or logo.');
  }

  if (file.size > MAX_IMAGE_FILE_BYTES) {
    throw new Error('Each signature or logo must be 2 MB or smaller.');
  }

  const dataUrl = await readAsDataUrl(file);
  const dimensions = await readImageDimensions(dataUrl);

  if (dimensions.width > MAX_IMAGE_DIMENSION || dimensions.height > MAX_IMAGE_DIMENSION) {
    throw new Error('Image dimensions must not exceed 4096 × 4096 pixels.');
  }

  return {
    id: crypto.randomUUID(),
    name: file.name,
    role,
    mimeType: file.type as ImageAsset['mimeType'],
    dataUrl,
    pixelWidth: dimensions.width,
    pixelHeight: dimensions.height,
  };
}

export function createPositionedImage(
  asset: ImageAsset,
  pageSize: PdfPageSize | null,
  index: number,
): PositionedImage {
  const width = asset.role === 'signature' ? 0.24 : 0.18;
  const pageRatio = pageSize ? pageSize.width / pageSize.height : 0.72;
  const imageRatio = asset.pixelHeight / asset.pixelWidth;
  const height = Math.min(0.24, Math.max(0.04, width * imageRatio * pageRatio));

  return {
    id: crypto.randomUUID(),
    asset,
    x: Math.min(0.08 + index * 0.035, 0.7),
    y: Math.min(asset.role === 'signature' ? 0.72 + index * 0.025 : 0.08 + index * 0.025, 0.88),
    width,
    height,
    coverOriginal: false,
  };
}

export function validateImageCount(
  images: PositionedImage[],
  role: ImageRole,
): string | null {
  if (images.length >= MAX_IMAGE_ELEMENTS) {
    return `A template can contain up to ${MAX_IMAGE_ELEMENTS} image elements.`;
  }

  const roleCount = images.filter((image) => image.asset.role === role).length;
  if (roleCount >= MAX_IMAGES_PER_ROLE) {
    return `A template can contain up to ${MAX_IMAGES_PER_ROLE} ${role} images.`;
  }

  return null;
}
