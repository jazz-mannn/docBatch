import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import type { PdfPageSize, PositionedField, SpreadsheetRow } from '../types';
import { moveField } from '../lib/coordinates';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

interface PdfWorkspaceProps {
  template: File;
  fields: PositionedField[];
  row: SpreadsheetRow | undefined;
  selectedFieldId: string | null;
  onSelectField: (fieldId: string) => void;
  onChangeField: (field: PositionedField) => void;
  onPageSize: (size: PdfPageSize) => void;
}

export function PdfWorkspace({
  template,
  fields,
  row,
  selectedFieldId,
  onSelectField,
  onChangeField,
  onPageSize,
}: PdfWorkspaceProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [stageWidth, setStageWidth] = useState(700);
  const [renderError, setRenderError] = useState('');

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
          setRenderError(error instanceof Error ? error.message : 'Unable to preview this PDF.');
        }
      }
    }

    void render();
    return () => {
      cancelled = true;
      void loadingTask?.destroy();
    };
  }, [template, onPageSize]);

  function beginDrag(event: ReactPointerEvent<HTMLButtonElement>, field: PositionedField) {
    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    onSelectField(field.id);
    const startX = event.clientX;
    const startY = event.clientY;
    const initial = field;

    const handleMove = (moveEvent: PointerEvent) => {
      const stage = stageRef.current;
      if (!stage) return;
      const rectangle = stage.getBoundingClientRect();
      onChangeField(moveField(
        initial,
        (moveEvent.clientX - startX) / rectangle.width,
        (moveEvent.clientY - startY) / rectangle.height,
      ));
    };

    const handleEnd = () => {
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
        <div className="field-layer">
          {fields.map((field) => (
            <button
              className={`positioned-field ${selectedFieldId === field.id ? 'selected' : ''}`}
              key={field.id}
              type="button"
              style={{
                left: `${field.x * 100}%`,
                top: `${field.y * 100}%`,
                width: `${field.width * 100}%`,
                fontSize: `${Math.max(10, field.fontSizeRatio * stageWidth)}px`,
                fontFamily: field.fontFamily,
                fontWeight: field.fontWeight === 'bold' ? 700 : 400,
                textAlign: field.alignment,
                color: field.color,
              }}
              onPointerDown={(event) => beginDrag(event, field)}
              onClick={() => onSelectField(field.id)}
              title={`Drag ${field.column}`}
            >
              {row?.[field.column] || `{{${field.column}}}`}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
