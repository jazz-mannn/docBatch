# Architecture

## Objective

DocBatch converts one PDF template and one spreadsheet into a ZIP archive containing one personalized PDF per spreadsheet row.

## MVP boundary

The first release is a static single-page application. It has no application server, database, file storage, user account system, or payment integration.

## Data flow

```text
PDF template ───────────────┐
                            ├─> browser memory ─> pdf-lib ─> generated PDFs ─> JSZip ─> download
CSV or Excel ─> SheetJS ────┘
                            └─> React state ─> PDF.js preview and field editor
```

## Components

- `Landing`: product explanation and entry point.
- `Generator`: workflow state, validation, field controls, and export orchestration.
- `PdfWorkspace`: PDF.js rendering and normalized field positioning.
- `spreadsheet.ts`: file validation and spreadsheet normalization.
- `pdf.ts`: PDF cloning, font embedding, field drawing, and ZIP creation.
- `filename.ts`: safe and unique output names.
- `coordinates.ts`: normalized browser-to-PDF coordinate conversion.

## Coordinate model

Field positions use normalized values from `0` to `1` instead of screen pixels. This keeps placement stable when the preview resizes.

```text
x = horizontal distance / preview width
y = vertical distance / preview height
width = field width / preview width
```

During export, normalized values are converted into PDF points. PDF coordinates start at the bottom-left, while browser coordinates start at the top-left, so the vertical axis is inverted.

## Security and privacy

- Uploaded files remain in browser memory.
- No document content is logged.
- No remote code execution or server-side parsing occurs.
- Output filenames are sanitized before ZIP insertion.
- Batch size is limited to protect browser memory.

## Planned hosted architecture

Paid features may introduce:

- Supabase or equivalent authentication and PostgreSQL storage;
- server-side payment webhooks;
- saved field templates containing coordinates, not source documents by default;
- certificate verification records containing document IDs and status;
- short-lived encrypted object storage for optional email delivery.

These features should remain separated from the local document-processing engine.
