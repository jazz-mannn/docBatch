# Architecture

## Objective

DocBatch converts one PDF template and one spreadsheet into a ZIP archive containing one personalized PDF per spreadsheet row.

## MVP boundary

The first release is a static single-page application. It has no application server, database, cloud document storage, customer account system, or payment integration.

## Data flow

```text
PDF template ───────────────┐
                            ├─> browser memory ─> pdf-lib ─> generated PDFs ─> JSZip ─> download
CSV or Excel ─> SheetJS ────┘
                            └─> React state ─> PDF.js preview and field editor

First-visit state ─> localStorage tutorial flag
Page navigation ─> Vercel Web Analytics when enabled by the deployer
```

## Components

- `Landing`: product explanation, institutional use cases, and synthetic preview credentials.
- `Generator`: upload state, validation, field controls, filename patterns, and export orchestration.
- `FileDropZone`: drag-and-drop input with count, extension, and size validation.
- `PdfWorkspace`: PDF.js rendering, normalized field positioning, and white cover-block preview.
- `Tutorial`: reusable first-visit workflow guide.
- `spreadsheet.ts`: file validation and spreadsheet normalization.
- `fileUpload.ts`: source-file policies and size limits.
- `fieldText.ts`: spreadsheet and custom text resolution.
- `filenameTemplate.ts`: token validation and row-specific output names.
- `pdf.ts`: PDF cloning, white cover blocks, font embedding, field drawing, and ZIP creation.
- `filename.ts`: safe and unique output names.
- `coordinates.ts`: normalized browser-to-PDF coordinate conversion.
- `onboarding.ts`: local tutorial completion state.

## Coordinate and cover model

Field positions use normalized values from `0` to `1` instead of screen pixels. This keeps placement stable when the preview resizes.

```text
x = horizontal distance / preview width
y = vertical distance / preview height
width = field width / preview width
```

During export, normalized values are converted into PDF points. PDF coordinates start at the bottom-left, while browser coordinates start at the top-left, so the vertical axis is inverted.

When `coverOriginal` is enabled, pdf-lib draws a white rectangle before drawing the new text. The rectangle uses the field's normalized width and a height derived from the fitted font size. This allows the new field to replace existing PDF text without altering the source template file.

## Filename model

Filename patterns contain literal text and tokens:

```text
Document Automation - {Certificate Number} - {row}
```

Spreadsheet tokens resolve case-insensitively against the header row. `{row}` resolves to a one-based sequence number. The final value is sanitized and duplicate names receive suffixes before insertion into the ZIP archive.

## Resource controls

- One PDF template, maximum 8 MB.
- One spreadsheet, maximum 5 MB.
- Two active source files per session.
- Maximum 500 spreadsheet rows.
- Maximum 20 positioned fields.
- Maximum 200 characters per custom text field.
- Maximum 120 characters in a filename pattern.

## Security and privacy

- Uploaded files remain in browser memory.
- No document content is logged or sent to the analytics component.
- No remote code execution or server-side document parsing occurs.
- Output filenames are sanitized before ZIP insertion.
- File, row, and field limits protect browser memory.
- Tutorial completion stores one boolean-like value in local browser storage.
- Vercel Web Analytics is injected for aggregate website traffic only after the project owner enables it in Vercel.

## Planned hosted architecture

Paid features may introduce:

- Supabase or equivalent authentication and PostgreSQL storage;
- server-side payment webhooks;
- saved field templates containing coordinates, not source documents by default;
- certificate verification records containing document IDs and status;
- short-lived encrypted object storage for optional email delivery.

These features should remain separated from the local document-processing engine.
