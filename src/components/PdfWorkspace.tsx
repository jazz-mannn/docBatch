import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type {
  DetectedPdfText,
  PdfPageSize,
  PositionedField,
  PositionedImage,
  SpreadsheetRow,
} from '../types';
import { moveField, moveImage } from '../lib/coordinates';
import { resolveFieldText } from '../lib/fieldText';
import { inferStandardFont, limitDetectedText } from '../lib/detectedText';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfWorkspaceProps {
  template: File;
  fields: PositionedField[];
  images: PositionedImage[];
  row: SpreadsheetRow | undefined;
  selectedFieldId: string | null;
  selectedImageId: string | null;
  textSelectionMode: boolean;
  onSelectField: (fieldId: string) => void;
  onSelectImage: (imageId: string) => void;
  onChangeField: (field: PositionedField) => void;
  onChangeImage: (image: PositionedImage) => void;
  onDeleteField: (fieldId: string) => void;
  onDeleteImage: (imageId: string) => void;
  onCreateFieldFromDetected: (item: DetectedPdfText) => void;
  onDetectedText: (items: DetectedPdfText[]) => void;
  onPageSize: (size: PdfPageSize) => void;
}

interface DragState {
  kind: 'field' | 'image';
  id: string;
  label: string;
}

function fieldIdentity(field: PositionedField): string {
  return field.contentMode === 'custom'
    ? `custom:${field.customText.trim().toLowerCase()}`
    : `column:${field.column.trim().toLowerCase()}`;
}

export function PdfWorkspace({
  template,
  fields,
  images,
  row,
  selectedFieldId,
  selectedImageId,
  textSelectionMode,
  onSelectField,
  onSelectImage,
  onChangeField,
  onChangeImage,
  onDeleteField,
  onDeleteImage,
  onCreateFieldFromDetected,
  onDetectedText,
  onPageSize,
}: PdfWorkspaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const trashRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(700);
  const [renderError, setRenderError] = useState('');
  const [detectedText, setDetectedText] = useState<DetectedPdfText[]>([]);
  const [dragging, setDragging] = useState<DragState | null>(null);
  const [overTrash, setOverTrash] = useState(false);

  const duplicateFieldIds = useMemo(() => {
    const groups = new Map<string, string[]>();
    for (const field of fields) {
      const key = fieldIdentity(field);
      const ids = groups.get(key) ?? [];
      ids.push(field.id);
      groups.set(key, ids);
    }

    return new Set(
      [...groups.values()]
        .filter((ids) => ids.length > 1)
        .flat(),
    );
  }, [fields]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return undefined;

    const observer = new ResizeObserver(([entry]) => {
      if (entry) setStageWidth(entry.contentRect.width);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let cancelled = false;
    let loadingTask: ReturnType<typeof pdfjsLib.getDocument> | undefined;

    async function render() {
      try {
        setRenderError('');
        const bytes = new Uint8Array(await template.arrayBuffer());
        loadingTask = pdfjsLib.getDocument({ data: bytes });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);
        const baseViewport = page.getViewport({ scale: 1 });
        onPageSize({ width: baseViewport.width, height: baseViewport.height });

        const textContent = await page.getTextContent();
        const extracted = limitDetectedText(textContent.items.flatMap((item, index) => {
          if (!('str' in item) || !item.str.trim()) return [];

          const transformed = pdfjsLib.Util.transform(baseViewport.transform, item.transform);
          const fontHeight = Math.max(
            Math.hypot(transformed[2], transformed[3]),
            Number(item.height) || 0,
            8,
          );
          const style = textContent.styles[item.fontName];
          const fontDescription = `${item.fontName} ${style?.fontFamily ?? ''}`;
          const inferred = inferStandardFont(fontDescription);
          const x = Math.max(0, Math.min(0.98, transformed[4] / baseViewport.width));
          const y = Math.max(0, Math.min(0.98, (transformed[5] - fontHeight) / baseViewport.height));
          const width = Math.max(
            0.02,
            Math.min(1 - x, Number(item.width) / baseViewport.width),
          );

          return [{
            id: `detected-${index}`,
            text: item.str.trim(),
            x,
            y,
            width,
            fontSizeRatio: fontHeight / baseViewport.width,
            ...inferred,
          } satisfies DetectedPdfText];
        }));

        if (!cancelled) {
          setDetectedText(extracted);
          onDetectedText(extracted);
        }

        const desiredWidth = Math.min(1000, Math.max(600, window.innerWidth * 0.7));
        const viewport = page.getViewport({ scale: desiredWidth / baseViewport.width });
        const canvas = canvasRef.current;
        if (!canvas || cancelled) return;

        const context = canvas.getContext('2d');
        if (!context) throw new Error('Your browser could not create a PDF preview canvas.');
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvas.width = Math.floor(viewport.width * pixelRatio);
        canvas.height = Math.floor(viewport.height * pixelRatio);
        canvas.style.aspectRatio = `${viewport.width} / ${viewport.height}`;

        await page.render({
          canvas,
          canvasContext: context,
          viewport,
          transform: pixelRatio === 1 ? undefined : [pixelRatio, 0, 0, pixelRatio, 0, 0],
        }).promise;
      } catch (error) {
        if (!cancelled) {
          setDetectedText([]);
          onDetectedText([]);
          setRenderError(error instanceof Error ? error.message : 'Unable to preview this PDF.');
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
      void loadingTask?.destroy();
    };
  }, [template, onDetectedText, onPageSize]);

  function isInsideTrash(clientX: number, clientY: number): boolean {
    const rectangle = trashRef.current?.getBoundingClientRect();
    return Boolean(
      rectangle
      && clientX >= rectangle.left
      && clientX <= rectangle.right
      && clientY >= rectangle.top
      && clientY <= rectangle.bottom,
    );
  }

  function beginFieldDrag(event: ReactPointerEvent<HTMLButtonElement>, field: PositionedField) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelectField(field.id);
    const startX = event.clientX;
    const startY = event.clientY;
    const initial = field;
    const label = field.contentMode === 'custom' ? 'custom text' : field.column;
    setDragging({ kind: 'field', id: field.id, label });

    const handleMove = (moveEvent: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rectangle = stage.getBoundingClientRect();
      setOverTrash(isInsideTrash(moveEvent.clientX, moveEvent.clientY));
      onChangeField(moveField(
        initial,
        (moveEvent.clientX - startX) / rectangle.width,
        (moveEvent.clientY - startY) / rectangle.height,
      ));
    };

    const handleEnd = (endEvent: PointerEvent) => {
      if (isInsideTrash(endEvent.clientX, endEvent.clientY)) {
        onDeleteField(field.id);
      }
      setDragging(null);
      setOverTrash(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
  }

  function beginImageDrag(event: ReactPointerEvent<HTMLButtonElement>, image: PositionedImage) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelectImage(image.id);
    const startX = event.clientX;
    const startY = event.clientY;
    const initial = image;
    setDragging({ kind: 'image', id: image.id, label: image.asset.role });

    const handleMove = (moveEvent: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rectangle = stage.getBoundingClientRect();
      setOverTrash(isInsideTrash(moveEvent.clientX, moveEvent.clientY));
      onChangeImage(moveImage(
        initial,
        (moveEvent.clientX - startX) / rectangle.width,
        (moveEvent.clientY - startY) / rectangle.height,
      ));
    };

    const handleEnd = (endEvent: PointerEvent) => {
      if (isInsideTrash(endEvent.clientX, endEvent.clientY)) {
        onDeleteImage(image.id);
      }
      setDragging(null);
      setOverTrash(false);
      window.removeEventListener('pointermove', handleMove);
      window.removeEventListener('pointerup', handleEnd);
      window.removeEventListener('pointercancel', handleEnd);
    };

    window.addEventListener('pointermove', handleMove);
    window.addEventListener('pointerup', handleEnd);
    window.addEventListener('pointercancel', handleEnd);
  }

  return (
    <div className="pdf-frame">
      {renderError ? <div className="error-banner">{renderError}</div> : null}
      <div className="pdf-stage" ref={stageRef}>
        <canvas ref={canvasRef} aria-label="PDF template preview" />

        {textSelectionMode ? (
          <div className="detected-text-layer" aria-label="Detected PDF text">
            {detectedText.map((item) => (
              <button
                key={item.id}
                className="detected-text-target"
                type="button"
                style={{
                  left: `${item.x * 100}%`,
                  top: `${item.y * 100}%`,
                  width: `${item.width * 100}%`,
                  fontSize: `${Math.max(9, item.fontSizeRatio * stageWidth)}px`,
                }}
                title={`Use detected text: ${item.text}`}
                onClick={() => onCreateFieldFromDetected(item)}
              >
                {item.text}
              </button>
            ))}
          </div>
        ) : null}

        <div className="field-layer">
          {fields.map((field) => {
            const resolvedText = resolveFieldText(field, row);
            const fallback = field.contentMode === 'custom' ? 'Custom text' : `{{${field.column}}}`;
            const label = field.contentMode === 'custom' ? 'custom text' : field.column;
            const duplicate = duplicateFieldIds.has(field.id);

            return (
              <button
                className={`positioned-field ${field.coverOriginal ? 'cover-original' : ''} ${duplicate ? 'duplicate-field' : ''} ${selectedFieldId === field.id ? 'selected' : ''}`}
                key={field.id}
                type="button"
                style={{
                  left: `${field.x * 100}%`,
                  top: `${field.y * 100}%`,
                  width: `${field.width * 100}%`,
                  fontSize: `${Math.max(10, field.fontSizeRatio * stageWidth)}px`,
                  fontFamily: field.fontFamily,
                  fontStyle: field.fontStyle,
                  fontWeight: field.fontWeight === 'bold' ? 700 : 400,
                  textAlign: field.alignment,
                  color: field.color,
                }}
                onPointerDown={(event) => beginFieldDrag(event, field)}
                onClick={() => onSelectField(field.id)}
                title={`Drag ${label}. Drag to the bin to delete.`}
              >
                <span>{resolvedText || fallback}</span>
                {duplicate ? <em>Duplicate</em> : null}
              </button>
            );
          })}

          {images.map((image) => (
            <button
              className={`positioned-image ${selectedImageId === image.id ? 'selected' : ''}`}
              key={image.id}
              type="button"
              style={{
                left: `${image.x * 100}%`,
                top: `${image.y * 100}%`,
                width: `${image.width * 100}%`,
                height: `${image.height * 100}%`,
              }}
              onPointerDown={(event) => beginImageDrag(event, image)}
              onClick={() => onSelectImage(image.id)}
              title={`Drag ${image.asset.role}. Drag to the bin to delete.`}
            >
              {image.coverOriginal ? <span className="image-cover" /> : null}
              <img src={image.asset.dataUrl} alt={`${image.asset.role}: ${image.asset.name}`} />
              <em>{image.asset.role}</em>
            </button>
          ))}
        </div>
      </div>

      <div
        ref={trashRef}
        className={`editor-trash ${dragging ? 'visible' : ''} ${overTrash ? 'ready' : ''}`}
        role="status"
        aria-live="polite"
      >
        <strong>{overTrash ? 'Release to delete' : 'Drag here to delete'}</strong>
        <span>{dragging ? `Deleting ${dragging.label}` : 'The Remove button remains available in settings.'}</span>
      </div>
    </div>
  );
}
