import { useCallback, useMemo, useState } from 'react';
import type {
  DetectedFontDefaults,
  GenerationProgress,
  ImageRole,
  PdfPageSize,
  PositionedField,
  PositionedImage,
  SpreadsheetData,
} from '../types';
import { parseSpreadsheet } from '../lib/spreadsheet';
import { generatePdfArchive } from '../lib/pdf';
import { downloadBlob } from '../lib/download';
import {
  MAX_ACTIVE_FILES,
  PDF_UPLOAD_POLICY,
  SPREADSHEET_UPLOAD_POLICY,
} from '../lib/fileUpload';
import {
  MAX_CUSTOM_TEXT_LENGTH,
  MAX_POSITIONED_FIELDS,
  normalizeCustomText,
} from '../lib/fieldText';
import {
  MAX_FILENAME_TEMPLATE_LENGTH,
  appendFilenameToken,
  normalizeFilenameTemplate,
  renderFilenameTemplate,
  validateFilenameTemplate,
} from '../lib/filenameTemplate';
import {
  MAX_IMAGE_ELEMENTS,
  MAX_IMAGES_PER_ROLE,
  createImageAsset,
  createPositionedImage,
  validateImageCount,
} from '../lib/imageAsset';
import { FALLBACK_FONT_DEFAULTS } from '../lib/detectedText';
import { FileDropZone } from './FileDropZone';
import { ImageUploadButton } from './ImageUploadButton';
import { PdfWorkspace } from './PdfWorkspace';

const INITIAL_PROGRESS: GenerationProgress = {
  current: 0,
  total: 0,
  stage: 'idle',
  message: '',
};

function fieldIdentity(field: PositionedField): string {
  return field.contentMode === 'custom'
    ? `custom:${field.customText.trim().toLowerCase()}`
    : `column:${field.column.trim().toLowerCase()}`;
}

function createField(
  column: string,
  index: number,
  duplicateIndex: number,
  contentMode: PositionedField['contentMode'],
  defaults: DetectedFontDefaults,
): PositionedField {
  const baseY = Math.min(0.18 + index * 0.06, 0.78);

  return {
    id: crypto.randomUUID(),
    column,
    contentMode,
    customText: contentMode === 'custom' ? 'Enter text for every document' : '',
    coverOriginal: true,
    x: Math.min(0.25 + duplicateIndex * 0.018, 0.72),
    y: Math.min(baseY + duplicateIndex * 0.016, 0.9),
    width: 0.5,
    fontSizeRatio: Math.min(0.08, Math.max(0.015, defaults.fontSizeRatio)),
    fontFamily: defaults.fontFamily,
    fontWeight: defaults.fontWeight,
    fontStyle: defaults.fontStyle,
    alignment: 'center',
    color: '#111827',
  };
}

function describeFont(defaults: DetectedFontDefaults): string {
  const weight = defaults.fontWeight === 'bold' ? 'Bold' : 'Regular';
  const style = defaults.fontStyle === 'italic' ? 'Italic' : 'Normal';
  return `${defaults.fontFamily} · ${weight} · ${style}`;
}

export function GeneratorStudio() {
  const [template, setTemplate] = useState<File | null>(null);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [fields, setFields] = useState<PositionedField[]>([]);
  const [images, setImages] = useState<PositionedImage[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [fontDefaults, setFontDefaults] = useState<DetectedFontDefaults>(FALLBACK_FONT_DEFAULTS);
  const [fontDetected, setFontDetected] = useState(false);
  const [recordIndex, setRecordIndex] = useState(0);
  const [filenamePattern, setFilenamePattern] = useState('');
  const [pageSize, setPageSize] = useState<PdfPageSize | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [progress, setProgress] = useState<GenerationProgress>(INITIAL_PROGRESS);

  const selectedField = fields.find((field) => field.id === selectedFieldId) ?? null;
  const selectedImage = images.find((image) => image.id === selectedImageId) ?? null;
  const previewRow = spreadsheet?.rows[recordIndex];
  const activeFileCount = Number(Boolean(template)) + Number(Boolean(spreadsheet));
  const fieldLimitReached = fields.length >= MAX_POSITIONED_FIELDS;
  const imageLimitReached = images.length >= MAX_IMAGE_ELEMENTS;
  const elementCount = fields.length + images.length;
  const filenameError = spreadsheet
    ? validateFilenameTemplate(filenamePattern, spreadsheet.headers)
    : null;
  const filenamePreview = spreadsheet && previewRow && !filenameError
    ? renderFilenameTemplate(filenamePattern, previewRow, recordIndex)
    : '';
  const ready = Boolean(
    template
    && spreadsheet
    && elementCount > 0
    && filenamePattern.trim()
    && !filenameError,
  );

  const duplicateCount = useMemo(() => {
    const counts = new Map<string, number>();
    for (const field of fields) {
      const key = fieldIdentity(field);
      counts.set(key, (counts.get(key) ?? 0) + 1);
    }
    return [...counts.values()]
      .filter((count) => count > 1)
      .reduce((sum, count) => sum + count, 0);
  }, [fields]);

  const validationSummary = useMemo(() => {
    if (!spreadsheet) return null;
    const blankCells = spreadsheet.rows.reduce((count, row) => (
      count + spreadsheet.headers.filter((header) => !row[header]).length
    ), 0);
    return {
      rows: spreadsheet.rows.length,
      columns: spreadsheet.headers.length,
      blankCells,
    };
  }, [spreadsheet]);

  const updatePageSize = useCallback((size: PdfPageSize) => {
    setPageSize((current) => {
      if (current?.width === size.width && current.height === size.height) return current;
      return size;
    });
  }, []);

  const updateDetectedFontDefaults = useCallback((defaults: DetectedFontDefaults | null) => {
    setFontDefaults(defaults ?? FALLBACK_FONT_DEFAULTS);
    setFontDetected(Boolean(defaults));
  }, []);

  async function handleSpreadsheet(file: File) {
    try {
      setError('');
      setNotice('');
      const parsed = await parseSpreadsheet(file);
      const firstHeader = parsed.headers[0] ?? 'row';
      setSpreadsheet(parsed);
      setFields([]);
      setSelectedFieldId(null);
      setRecordIndex(0);
      setFilenamePattern(`Document - {${firstHeader}}`);
    } catch (caught) {
      setSpreadsheet(null);
      setFilenamePattern('');
      setError(caught instanceof Error ? caught.message : 'Unable to read the spreadsheet.');
    }
  }

  function handleTemplate(file: File) {
    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      setError('Use a PDF file as the document template.');
      return;
    }

    setError('');
    setNotice('');
    setTemplate(file);
    setPageSize(null);
    setFontDefaults(FALLBACK_FONT_DEFAULTS);
    setFontDetected(false);
  }

  function addField(
    column: string,
    contentMode: PositionedField['contentMode'] = 'column',
  ) {
    if (fieldLimitReached) {
      setError(`A template can contain up to ${MAX_POSITIONED_FIELDS} positioned text fields.`);
      return;
    }

    const identity = contentMode === 'custom'
      ? 'custom:enter text for every document'
      : `column:${column.trim().toLowerCase()}`;
    const existingDuplicates = fields.filter((field) => fieldIdentity(field) === identity).length;
    const next = createField(
      column,
      fields.length,
      existingDuplicates,
      contentMode,
      fontDefaults,
    );

    setError('');
    setNotice(existingDuplicates > 0
      ? `${contentMode === 'custom' ? 'Custom text' : column} was added again. Duplicate fields are translucent and labelled in the editor.`
      : '');
    setFields((current) => [...current, next]);
    setSelectedFieldId(next.id);
    setSelectedImageId(null);
  }

  async function addImage(file: File, role: ImageRole) {
    const countError = validateImageCount(images, role);
    if (countError) {
      setError(countError);
      return;
    }

    try {
      setError('');
      const asset = await createImageAsset(file, role);
      const next = createPositionedImage(asset, pageSize, images.length);
      setImages((current) => [...current, next]);
      setSelectedImageId(next.id);
      setSelectedFieldId(null);
      setNotice(`${role === 'signature' ? 'Signature' : 'Logo'} added. Drag it into position or move it to the delete zone.`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `Unable to add the ${role}.`);
    }
  }

  function changeField(updated: PositionedField) {
    setFields((current) => current.map((field) => field.id === updated.id ? updated : field));
  }

  function changeImage(updated: PositionedImage) {
    setImages((current) => current.map((image) => image.id === updated.id ? updated : image));
  }

  function selectField(fieldId: string) {
    setSelectedFieldId(fieldId);
    setSelectedImageId(null);
  }

  function selectImage(imageId: string) {
    setSelectedImageId(imageId);
    setSelectedFieldId(null);
  }

  function patchSelectedField(patch: Partial<PositionedField>) {
    if (!selectedField) return;
    changeField({ ...selectedField, ...patch });
  }

  function patchSelectedImage(patch: Partial<PositionedImage>) {
    if (!selectedImage) return;
    changeImage({ ...selectedImage, ...patch });
  }

  function deleteField(fieldId: string) {
    setFields((current) => current.filter((field) => field.id !== fieldId));
    if (selectedFieldId === fieldId) setSelectedFieldId(null);
    setNotice('Text field deleted.');
  }

  function deleteImage(imageId: string) {
    setImages((current) => current.filter((image) => image.id !== imageId));
    if (selectedImageId === imageId) setSelectedImageId(null);
    setNotice('Image deleted.');
  }

  function insertFilenameToken(token: string) {
    setFilenamePattern((current) => appendFilenameToken(current, token));
  }

  async function generate() {
    if (!template || !spreadsheet || !ready) return;

    try {
      setError('');
      setNotice('');
      setProgress({
        current: 0,
        total: spreadsheet.rows.length,
        stage: 'generating',
        message: 'Generating PDFs in your browser…',
      });

      const archive = await generatePdfArchive({
        template,
        rows: spreadsheet.rows,
        fields,
        images,
        filenamePattern,
        onProgress: (current, total) => {
          setProgress({
            current,
            total,
            stage: current === total ? 'zipping' : 'generating',
            message: current === total
              ? 'Compressing the ZIP archive…'
              : `Generating document ${current} of ${total}…`,
          });
        },
      });

      downloadBlob(archive, `docbatch-${new Date().toISOString().slice(0, 10)}.zip`);
      setProgress({
        current: spreadsheet.rows.length,
        total: spreadsheet.rows.length,
        stage: 'complete',
        message: 'Your ZIP archive has been downloaded.',
      });
    } catch (caught) {
      const message = caught instanceof Error ? caught.message : 'Document generation failed.';
      setError(message);
      setProgress({ ...INITIAL_PROGRESS, stage: 'error', message });
    }
  }

  function reset() {
    setTemplate(null);
    setSpreadsheet(null);
    setFields([]);
    setImages([]);
    setSelectedFieldId(null);
    setSelectedImageId(null);
    setFontDefaults(FALLBACK_FONT_DEFAULTS);
    setFontDetected(false);
    setRecordIndex(0);
    setFilenamePattern('');
    setPageSize(null);
    setError('');
    setNotice('');
    setProgress(INITIAL_PROGRESS);
  }

  return (
    <main className="generator-shell studio-shell">
      <section className="generator-heading studio-heading">
        <div>
          <div className="eyebrow">Document automation studio</div>
          <h1>Build your PDF batch</h1>
          <p>Combine one approved PDF template with spreadsheet data, branded images, and reusable text.</p>
        </div>
        <button className="text-button" type="button" onClick={reset}>Start over</button>
      </section>

      {error ? <div className="error-banner" role="alert">{error}</div> : null}
      {notice ? <div className="notice-banner" role="status">{notice}</div> : null}
      {duplicateCount > 0 ? (
        <div className="duplicate-banner" role="status">
          {duplicateCount} repeated fields are translucent and labelled “Duplicate” in the editor. They remain fully opaque in exported PDFs.
        </div>
      ) : null}

      <div className="generator-grid">
        <aside className="control-panel">
          <section className="control-section">
            <div className="section-number">1</div>
            <div>
              <h2>Source files</h2>
              <p>Add one PDF template and one spreadsheet.</p>
            </div>
          </section>

          <FileDropZone
            title="PDF template"
            accept="application/pdf,.pdf"
            emptyMessage="Drop a PDF here or browse"
            fileName={template?.name}
            policy={PDF_UPLOAD_POLICY}
            onFile={handleTemplate}
            onError={setError}
          />

          <FileDropZone
            title="CSV or Excel data"
            accept=".csv,.xlsx,.xls"
            emptyMessage="Drop a spreadsheet here or browse"
            fileName={spreadsheet?.sourceName}
            policy={SPREADSHEET_UPLOAD_POLICY}
            onFile={handleSpreadsheet}
            onError={setError}
          />

          <p className="privacy-note">
            {activeFileCount} of {MAX_ACTIVE_FILES} source-file slots in use. Replacing a file updates that slot.
          </p>

          {validationSummary ? (
            <div className="data-summary">
              <div><strong>{validationSummary.rows}</strong><span>rows</span></div>
              <div><strong>{validationSummary.columns}</strong><span>columns</span></div>
              <div><strong>{validationSummary.blankCells}</strong><span>blank cells</span></div>
            </div>
          ) : null}

          {template ? (
            <section className="panel-block">
              <div className="panel-title-row">
                <h3>Default text style</h3>
                <span>{fontDetected ? 'Detected' : 'Standard'}</span>
              </div>
              <div className={`font-detection-card ${fontDetected ? 'detected' : ''}`}>
                <strong>{describeFont(fontDefaults)}</strong>
                <span>
                  {fontDetected
                    ? 'New fields inherit the dominant font detected in this PDF.'
                    : 'No embedded font was detected, so new fields use a compatible standard PDF font.'}
                </span>
              </div>
              <p className="control-help">The PDF text itself is never selected or converted into an editable field.</p>
            </section>
          ) : null}

          {template ? (
            <section className="panel-block">
              <div className="panel-title-row">
                <h3>Add content</h3>
                <span>{fields.length} text · {images.length} images</span>
              </div>

              <button
                className="custom-field-button"
                type="button"
                disabled={fieldLimitReached}
                onClick={() => addField(spreadsheet?.headers[0] ?? '', 'custom')}
              >
                <span>Custom text</span><strong>+</strong>
              </button>

              {spreadsheet ? (
                <div className="column-list">
                  {spreadsheet.headers.map((header) => (
                    <button
                      type="button"
                      key={header}
                      disabled={fieldLimitReached}
                      onClick={() => addField(header)}
                    >
                      <span>{header}</span><strong>+</strong>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="control-help">Add a spreadsheet to create row-specific text fields.</p>
              )}

              <div className="image-upload-grid">
                <ImageUploadButton
                  role="signature"
                  disabled={imageLimitReached || images.filter((image) => image.asset.role === 'signature').length >= MAX_IMAGES_PER_ROLE}
                  onFile={addImage}
                  onError={setError}
                />
                <ImageUploadButton
                  role="logo"
                  disabled={imageLimitReached || images.filter((image) => image.asset.role === 'logo').length >= MAX_IMAGES_PER_ROLE}
                  onFile={addImage}
                  onError={setError}
                />
              </div>
              <p className="control-help">
                Up to {MAX_IMAGE_ELEMENTS} images total and {MAX_IMAGES_PER_ROLE} per type. Transparent PNG files work best.
              </p>
            </section>
          ) : null}

          {selectedField ? (
            <section className="panel-block field-properties">
              <div className="panel-title-row">
                <h3>Text field settings</h3>
                <button className="danger-link explicit-delete" type="button" onClick={() => deleteField(selectedField.id)}>
                  Delete field
                </button>
              </div>

              <label>
                Text source
                <select
                  value={selectedField.contentMode}
                  onChange={(event) => patchSelectedField({
                    contentMode: event.target.value as PositionedField['contentMode'],
                  })}
                >
                  <option value="column">Spreadsheet column</option>
                  <option value="custom">Custom text</option>
                </select>
              </label>

              {selectedField.contentMode === 'column' ? (
                <label>
                  Spreadsheet column
                  <select
                    value={selectedField.column}
                    onChange={(event) => patchSelectedField({ column: event.target.value })}
                  >
                    {spreadsheet?.headers.map((header) => <option key={header}>{header}</option>)}
                  </select>
                </label>
              ) : (
                <label>
                  Text used in every document
                  <textarea
                    className="custom-text-input"
                    value={selectedField.customText}
                    maxLength={MAX_CUSTOM_TEXT_LENGTH}
                    rows={4}
                    onChange={(event) => patchSelectedField({
                      customText: normalizeCustomText(event.target.value),
                    })}
                  />
                  <span className="character-count">
                    {selectedField.customText.length} / {MAX_CUSTOM_TEXT_LENGTH} characters
                  </span>
                </label>
              )}

              <label className="checkbox-control">
                <input
                  type="checkbox"
                  checked={selectedField.coverOriginal}
                  onChange={(event) => patchSelectedField({ coverOriginal: event.target.checked })}
                />
                <span>
                  <strong>Cover the original content</strong>
                  <small>Draw a white block behind this text field before adding the new value.</small>
                </span>
              </label>

              <label>
                Font family
                <select
                  value={selectedField.fontFamily}
                  onChange={(event) => patchSelectedField({ fontFamily: event.target.value as PositionedField['fontFamily'] })}
                >
                  <option value="Times Roman">Times Roman · Classic certificate serif</option>
                  <option value="Helvetica">Helvetica · Modern professional sans</option>
                  <option value="Courier">Courier · Formal monospaced style</option>
                </select>
              </label>

              <div className="two-column-controls">
                <label>
                  Weight
                  <select
                    value={selectedField.fontWeight}
                    onChange={(event) => patchSelectedField({ fontWeight: event.target.value as PositionedField['fontWeight'] })}
                  >
                    <option value="regular">Regular</option>
                    <option value="bold">Bold</option>
                  </select>
                </label>
                <label>
                  Style
                  <select
                    value={selectedField.fontStyle}
                    onChange={(event) => patchSelectedField({ fontStyle: event.target.value as PositionedField['fontStyle'] })}
                  >
                    <option value="normal">Normal</option>
                    <option value="italic">Italic</option>
                  </select>
                </label>
              </div>

              <label>
                Alignment
                <select
                  value={selectedField.alignment}
                  onChange={(event) => patchSelectedField({ alignment: event.target.value as PositionedField['alignment'] })}
                >
                  <option value="left">Left</option>
                  <option value="center">Centre</option>
                  <option value="right">Right</option>
                </select>
              </label>

              <label>
                Text size
                <input
                  type="range"
                  min="0.015"
                  max="0.08"
                  step="0.0025"
                  value={selectedField.fontSizeRatio}
                  onChange={(event) => patchSelectedField({ fontSizeRatio: Number(event.target.value) })}
                />
              </label>

              <label>
                Field and cover width
                <input
                  type="range"
                  min="0.08"
                  max="0.9"
                  step="0.025"
                  value={selectedField.width}
                  onChange={(event) => patchSelectedField({ width: Number(event.target.value) })}
                />
              </label>

              <label>
                Text colour
                <input
                  type="color"
                  value={selectedField.color}
                  onChange={(event) => patchSelectedField({ color: event.target.value })}
                />
              </label>
            </section>
          ) : null}

          {selectedImage ? (
            <section className="panel-block field-properties">
              <div className="panel-title-row">
                <h3>{selectedImage.asset.role === 'signature' ? 'Signature' : 'Logo'} settings</h3>
                <button className="danger-link explicit-delete" type="button" onClick={() => deleteImage(selectedImage.id)}>
                  Delete image
                </button>
              </div>

              <div className="selected-image-summary">
                <img src={selectedImage.asset.dataUrl} alt="Selected upload preview" />
                <div>
                  <strong>{selectedImage.asset.name}</strong>
                  <span>{selectedImage.asset.pixelWidth} × {selectedImage.asset.pixelHeight} px</span>
                </div>
              </div>

              <label className="checkbox-control">
                <input
                  type="checkbox"
                  checked={selectedImage.coverOriginal}
                  onChange={(event) => patchSelectedImage({ coverOriginal: event.target.checked })}
                />
                <span>
                  <strong>Cover the original content</strong>
                  <small>Draw a white block behind the complete image area.</small>
                </span>
              </label>

              <label>
                Image width
                <input
                  type="range"
                  min="0.05"
                  max="0.6"
                  step="0.01"
                  value={selectedImage.width}
                  onChange={(event) => patchSelectedImage({ width: Number(event.target.value) })}
                />
              </label>

              <label>
                Image height
                <input
                  type="range"
                  min="0.03"
                  max="0.4"
                  step="0.01"
                  value={selectedImage.height}
                  onChange={(event) => patchSelectedImage({ height: Number(event.target.value) })}
                />
              </label>
              <p className="control-help">Drag the image on the document, or drag it onto the delete zone.</p>
            </section>
          ) : null}
        </aside>

        <section className="workspace-panel">
          <div className="workspace-toolbar">
            <div>
              <strong>Document preview</strong>
              <span>{pageSize ? `${Math.round(pageSize.width)} × ${Math.round(pageSize.height)} pt` : 'Add a PDF template'}</span>
            </div>
            {spreadsheet ? (
              <label>
                Preview record
                <select value={recordIndex} onChange={(event) => setRecordIndex(Number(event.target.value))}>
                  {spreadsheet.rows.map((row, index) => (
                    <option key={index} value={index}>
                      {index + 1}. {row[spreadsheet.headers[0]] || 'Unnamed record'}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {template ? (
            <PdfWorkspace
              template={template}
              fields={fields}
              images={images}
              row={previewRow}
              selectedFieldId={selectedFieldId}
              selectedImageId={selectedImageId}
              onSelectField={selectField}
              onSelectImage={selectImage}
              onChangeField={changeField}
              onChangeImage={changeImage}
              onDeleteField={deleteField}
              onDeleteImage={deleteImage}
              onDetectedFontDefaults={updateDetectedFontDefaults}
              onPageSize={updatePageSize}
            />
          ) : (
            <div className="empty-workspace">
              <div className="empty-icon">PDF</div>
              <h2>Add your PDF template</h2>
              <p>The first page appears here. You can then place spreadsheet fields, reusable text, signatures, and logos.</p>
            </div>
          )}
        </section>

        <aside className="export-panel">
          <section className="control-section">
            <div className="section-number">3</div>
            <div>
              <h2>Export</h2>
              <p>Name and generate one PDF for every spreadsheet row.</p>
            </div>
          </section>

          <label>
            Output filename pattern
            <input
              className="filename-pattern-input"
              type="text"
              value={filenamePattern}
              maxLength={MAX_FILENAME_TEMPLATE_LENGTH}
              disabled={!spreadsheet}
              placeholder="Certificate - {Certificate Number}"
              onChange={(event) => setFilenamePattern(normalizeFilenameTemplate(event.target.value))}
            />
            <span className="character-count">
              {filenamePattern.length} / {MAX_FILENAME_TEMPLATE_LENGTH} characters
            </span>
          </label>

          {spreadsheet ? (
            <div className="filename-token-section">
              <span>Insert a changing value</span>
              <div className="filename-token-list">
                <button type="button" onClick={() => insertFilenameToken('row')}>{'{row}'}</button>
                {spreadsheet.headers.map((header) => (
                  <button type="button" key={header} onClick={() => insertFilenameToken(header)}>
                    {`{${header}}`}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {filenameError ? <p className="inline-error">{filenameError}</p> : null}
          {filenamePreview ? (
            <div className="filename-preview">
              <span>Filename preview</span>
              <strong>{filenamePreview}.pdf</strong>
            </div>
          ) : null}

          <div className="export-checklist">
            <div className={template ? 'complete' : ''}><span>{template ? '✓' : '1'}</span>PDF template</div>
            <div className={spreadsheet ? 'complete' : ''}><span>{spreadsheet ? '✓' : '2'}</span>Spreadsheet data</div>
            <div className={elementCount ? 'complete' : ''}><span>{elementCount ? '✓' : '3'}</span>Text or image content</div>
            <div className={filenamePattern && !filenameError ? 'complete' : ''}><span>{filenamePattern && !filenameError ? '✓' : '4'}</span>Valid filenames</div>
          </div>

          <button
            className="primary-button full-width"
            type="button"
            disabled={!ready || progress.stage === 'generating' || progress.stage === 'zipping'}
            onClick={() => void generate()}
          >
            {progress.stage === 'generating' || progress.stage === 'zipping'
              ? 'Generating…'
              : `Generate ${spreadsheet?.rows.length ?? 0} PDFs`}
          </button>

          {progress.stage !== 'idle' ? (
            <div className={`progress-card ${progress.stage}`}>
              <div className="progress-track">
                <span style={{ width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%` }} />
              </div>
              <p>{progress.message}</p>
            </div>
          ) : null}

          <p className="privacy-note">Documents are processed in this browser session and downloaded directly to your device.</p>
        </aside>
      </div>
    </main>
  );
}
