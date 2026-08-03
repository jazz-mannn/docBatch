import { useCallback, useMemo, useState } from 'react';
import type {
  GenerationProgress,
  PdfPageSize,
  PositionedField,
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
import { FileDropZone } from './FileDropZone';
import { PdfWorkspace } from './PdfWorkspace';

const INITIAL_PROGRESS: GenerationProgress = {
  current: 0,
  total: 0,
  stage: 'idle',
  message: '',
};

function createField(
  column: string,
  index: number,
  contentMode: PositionedField['contentMode'] = 'column',
): PositionedField {
  return {
    id: crypto.randomUUID(),
    column,
    contentMode,
    customText: contentMode === 'custom' ? 'Enter text for every document' : '',
    coverOriginal: true,
    x: 0.25,
    y: Math.min(0.2 + index * 0.08, 0.8),
    width: 0.5,
    fontSizeRatio: 0.035,
    fontFamily: 'Helvetica',
    fontWeight: 'regular',
    alignment: 'center',
    color: '#111827',
  };
}

export function Generator() {
  const [template, setTemplate] = useState<File | null>(null);
  const [spreadsheet, setSpreadsheet] = useState<SpreadsheetData | null>(null);
  const [fields, setFields] = useState<PositionedField[]>([]);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [recordIndex, setRecordIndex] = useState(0);
  const [filenamePattern, setFilenamePattern] = useState('');
  const [pageSize, setPageSize] = useState<PdfPageSize | null>(null);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<GenerationProgress>(INITIAL_PROGRESS);

  const selectedField = fields.find((field) => field.id === selectedFieldId) ?? null;
  const previewRow = spreadsheet?.rows[recordIndex];
  const activeFileCount = Number(Boolean(template)) + Number(Boolean(spreadsheet));
  const fieldLimitReached = fields.length >= MAX_POSITIONED_FIELDS;
  const filenameError = spreadsheet
    ? validateFilenameTemplate(filenamePattern, spreadsheet.headers)
    : null;
  const filenamePreview = spreadsheet && previewRow && !filenameError
    ? renderFilenameTemplate(filenamePattern, previewRow, recordIndex)
    : '';
  const ready = Boolean(
    template
    && spreadsheet
    && fields.length > 0
    && filenamePattern.trim()
    && !filenameError,
  );

  const updatePageSize = useCallback((size: PdfPageSize) => {
    setPageSize((current) => {
      if (current?.width === size.width && current.height === size.height) return current;
      return size;
    });
  }, []);

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

  async function handleSpreadsheet(file: File) {
    try {
      setError('');
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
      setError('The current MVP accepts PDF templates only.');
      return;
    }
    setError('');
    setTemplate(file);
    setPageSize(null);
  }

  function addField(
    column: string,
    contentMode: PositionedField['contentMode'] = 'column',
  ) {
    if (fieldLimitReached) {
      setError(`A template can contain up to ${MAX_POSITIONED_FIELDS} positioned fields.`);
      return;
    }

    setError('');
    const next = createField(column, fields.length, contentMode);
    setFields((current) => [...current, next]);
    setSelectedFieldId(next.id);
  }

  function changeField(updated: PositionedField) {
    setFields((current) => current.map((field) => field.id === updated.id ? updated : field));
  }

  function patchSelectedField(patch: Partial<PositionedField>) {
    if (!selectedField) return;
    changeField({ ...selectedField, ...patch });
  }

  function removeSelectedField() {
    if (!selectedFieldId) return;
    setFields((current) => current.filter((field) => field.id !== selectedFieldId));
    setSelectedFieldId(null);
  }

  function insertFilenameToken(token: string) {
    setFilenamePattern((current) => appendFilenameToken(current, token));
  }

  async function generate() {
    if (!template || !spreadsheet || !ready) return;
    try {
      setError('');
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
        filenamePattern,
        onProgress: (current, total) => {
          setProgress({
            current,
            total,
            stage: current === total ? 'zipping' : 'generating',
            message: current === total ? 'Compressing the ZIP archive…' : `Generating document ${current} of ${total}…`,
          });
        },
      });

      downloadBlob(archive, `docbatch-${new Date().toISOString().slice(0, 10)}.zip`);
      setProgress({
        current: spreadsheet.rows.length,
        total: spreadsheet.rows.length,
        stage: 'complete',
        message: 'The ZIP archive has been downloaded.',
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
    setSelectedFieldId(null);
    setRecordIndex(0);
    setFilenamePattern('');
    setPageSize(null);
    setError('');
    setProgress(INITIAL_PROGRESS);
  }

  return (
    <main className="generator-shell">
      <section className="generator-heading">
        <div>
          <div className="eyebrow">Browser-only MVP</div>
          <h1>Create a document batch</h1>
          <p>Drop files, place spreadsheet or custom text fields, preview one record, then export every PDF.</p>
        </div>
        <button className="text-button" type="button" onClick={reset}>Reset session</button>
      </section>

      {error ? <div className="error-banner" role="alert">{error}</div> : null}

      <div className="generator-grid">
        <aside className="control-panel">
          <section className="control-section">
            <div className="section-number">1</div>
            <div>
              <h2>Files</h2>
              <p>One PDF and one spreadsheet. {MAX_ACTIVE_FILES} files maximum per session.</p>
            </div>
          </section>

          <FileDropZone
            title="PDF template"
            accept="application/pdf,.pdf"
            emptyMessage="Drop a PDF here or click to browse"
            fileName={template?.name}
            policy={PDF_UPLOAD_POLICY}
            onFile={handleTemplate}
            onError={setError}
          />

          <FileDropZone
            title="CSV or Excel data"
            accept=".csv,.xlsx,.xls"
            emptyMessage="Drop a spreadsheet here or click to browse"
            fileName={spreadsheet?.sourceName}
            policy={SPREADSHEET_UPLOAD_POLICY}
            onFile={handleSpreadsheet}
            onError={setError}
          />

          <p className="privacy-note">
            {activeFileCount} of {MAX_ACTIVE_FILES} file slots in use. Adding a new file replaces the file in that slot.
          </p>

          {validationSummary ? (
            <div className="data-summary">
              <div><strong>{validationSummary.rows}</strong><span>rows</span></div>
              <div><strong>{validationSummary.columns}</strong><span>columns</span></div>
              <div><strong>{validationSummary.blankCells}</strong><span>blank cells</span></div>
            </div>
          ) : null}

          {spreadsheet ? (
            <section className="panel-block">
              <div className="panel-title-row">
                <h3>Add fields</h3>
                <span>{fields.length} of {MAX_POSITIONED_FIELDS}</span>
              </div>
              <button
                className="custom-field-button"
                type="button"
                disabled={fieldLimitReached}
                onClick={() => addField(spreadsheet.headers[0] ?? '', 'custom')}
              >
                <span>Custom text</span><strong>+</strong>
              </button>
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
            </section>
          ) : null}

          {selectedField ? (
            <section className="panel-block field-properties">
              <div className="panel-title-row">
                <h3>Field settings</h3>
                <button className="danger-link" type="button" onClick={removeSelectedField}>Remove</button>
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
                  Column
                  <select value={selectedField.column} onChange={(event) => patchSelectedField({ column: event.target.value })}>
                    {spreadsheet?.headers.map((header) => <option key={header}>{header}</option>)}
                  </select>
                </label>
              ) : (
                <label>
                  Text for every document
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
                  <strong>Cover original PDF content</strong>
                  <small>Add a white block behind this field using its selected width.</small>
                </span>
              </label>
              <label>
                Font
                <select value={selectedField.fontFamily} onChange={(event) => patchSelectedField({ fontFamily: event.target.value as PositionedField['fontFamily'] })}>
                  <option>Helvetica</option>
                  <option>Times Roman</option>
                  <option>Courier</option>
                </select>
              </label>
              <div className="two-column-controls">
                <label>
                  Weight
                  <select value={selectedField.fontWeight} onChange={(event) => patchSelectedField({ fontWeight: event.target.value as PositionedField['fontWeight'] })}>
                    <option value="regular">Regular</option>
                    <option value="bold">Bold</option>
                  </select>
                </label>
                <label>
                  Align
                  <select value={selectedField.alignment} onChange={(event) => patchSelectedField({ alignment: event.target.value as PositionedField['alignment'] })}>
                    <option value="left">Left</option>
                    <option value="center">Centre</option>
                    <option value="right">Right</option>
                  </select>
                </label>
              </div>
              <label>
                Text size
                <input type="range" min="0.015" max="0.08" step="0.0025" value={selectedField.fontSizeRatio} onChange={(event) => patchSelectedField({ fontSizeRatio: Number(event.target.value) })} />
              </label>
              <label>
                Field and cover width
                <input type="range" min="0.1" max="0.9" step="0.025" value={selectedField.width} onChange={(event) => patchSelectedField({ width: Number(event.target.value) })} />
              </label>
              <label>
                Text colour
                <input type="color" value={selectedField.color} onChange={(event) => patchSelectedField({ color: event.target.value })} />
              </label>
            </section>
          ) : null}
        </aside>

        <section className="workspace-panel">
          <div className="workspace-toolbar">
            <div>
              <strong>Document preview</strong>
              <span>{pageSize ? `${Math.round(pageSize.width)} × ${Math.round(pageSize.height)} pt` : 'Upload a template'}</span>
            </div>
            {spreadsheet ? (
              <label>
                Preview record
                <select value={recordIndex} onChange={(event) => setRecordIndex(Number(event.target.value))}>
                  {spreadsheet.rows.map((row, index) => (
                    <option key={index} value={index}>{index + 1}. {row[spreadsheet.headers[0]] || 'Unnamed record'}</option>
                  ))}
                </select>
              </label>
            ) : null}
          </div>

          {template ? (
            <PdfWorkspace
              template={template}
              fields={fields}
              row={previewRow}
              selectedFieldId={selectedFieldId}
              onSelectField={setSelectedFieldId}
              onChangeField={changeField}
              onPageSize={updatePageSize}
            />
          ) : (
            <div className="empty-workspace">
              <div className="empty-icon">PDF</div>
              <h2>Upload a PDF template</h2>
              <p>The first page will appear here. You can then drag spreadsheet fields and custom text onto it.</p>
            </div>
          )}
        </section>

        <aside className="export-panel">
          <section className="control-section">
            <div className="section-number">3</div>
            <div>
              <h2>Export</h2>
              <p>Generate and name one PDF for each row.</p>
            </div>
          </section>

          <label>
            Output file-name pattern
            <input
              className="filename-pattern-input"
              type="text"
              value={filenamePattern}
              maxLength={MAX_FILENAME_TEMPLATE_LENGTH}
              disabled={!spreadsheet}
              placeholder="Document - {Certificate Number}"
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
              <span>Preview</span>
              <strong>{filenamePreview}.pdf</strong>
            </div>
          ) : null}

          <div className="export-checklist">
            <div className={template ? 'complete' : ''}><span>{template ? '✓' : '1'}</span>PDF template</div>
            <div className={spreadsheet ? 'complete' : ''}><span>{spreadsheet ? '✓' : '2'}</span>Spreadsheet data</div>
            <div className={fields.length ? 'complete' : ''}><span>{fields.length ? '✓' : '3'}</span>At least one field</div>
            <div className={filenamePattern && !filenameError ? 'complete' : ''}><span>{filenamePattern && !filenameError ? '✓' : '4'}</span>Valid file names</div>
          </div>

          <button className="primary-button full-width" type="button" disabled={!ready || progress.stage === 'generating' || progress.stage === 'zipping'} onClick={() => void generate()}>
            {progress.stage === 'generating' || progress.stage === 'zipping' ? 'Working…' : `Generate ${spreadsheet?.rows.length ?? 0} PDFs`}
          </button>

          {progress.stage !== 'idle' ? (
            <div className={`progress-card ${progress.stage}`}>
              <div className="progress-track"><span style={{ width: `${progress.total ? (progress.current / progress.total) * 100 : 0}%` }} /></div>
              <p>{progress.message}</p>
            </div>
          ) : null}

          <p className="privacy-note">Files are processed locally in this browser session.</p>
        </aside>
      </div>
    </main>
  );
}
