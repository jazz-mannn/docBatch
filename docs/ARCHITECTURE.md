# Architecture

## Objective

DocBatch is a static web application that converts one PDF template and one spreadsheet into a ZIP archive containing one personalized PDF per spreadsheet row.

## Current production boundary

The deployed website has no application server, customer database, cloud document storage, account system, or payment integration. Document processing occurs in the browser.

## Data flow

```text
PDF template ─> PDF.js preview ─> embedded-font analysis ─> default field style
      │
      └────────> browser memory ─> pdf-lib ─> generated PDFs ─> JSZip ─> download

CSV or Excel ─> SheetJS ─> normalized rows ─> React editor state ────────┘
PNG or JPEG ─> browser validation ─> data URL image assets ─────────────┘

First-visit state ─> localStorage tutorial flag
Page navigation ─> Vercel Web Analytics when enabled by the deployer
```

## Components

- `Landing`: public product explanation, use cases, and synthetic preview credentials.
- `GeneratorStudio`: source-file state, validation, editor controls, silent font defaults, filename patterns, and export orchestration.
- `FileDropZone`: drag-and-drop source input with count, extension, and size validation.
- `ImageUploadButton`: signature and logo input.
- `PdfWorkspace`: PDF.js rendering, normalized positioning, duplicate visibility, image placement, and drag-to-delete behavior.
- `Tutorial`: reusable first-visit workflow guide.
- `spreadsheet.ts`: file validation and spreadsheet normalization.
- `fileUpload.ts`: source-file policies and size limits.
- `imageAsset.ts`: PNG and JPEG validation, image limits, dimensions, and initial placement.
- `detectedText.ts`: embedded-font approximation and dominant-style selection.
- `fieldText.ts`: spreadsheet and custom text resolution.
- `filenameTemplate.ts`: token validation and row-specific output names.
- `pdf.ts`: PDF cloning, white cover blocks, standard font embedding, image embedding, field drawing, and ZIP creation.
- `filename.ts`: safe and unique output names.
- `coordinates.ts`: normalized browser-to-PDF coordinate conversion for text and images.
- `onboarding.ts`: local tutorial completion state.

## Silent PDF font detection

The first page is processed through `PDFPageProxy.getTextContent()`. Text items are analysed only to estimate the dominant embedded style.

For each usable text item, DocBatch derives:

- an approximate standard font family;
- regular or bold weight;
- normal or italic style;
- approximate font size;
- a score weighted by the amount of text using that style.

The original font is mapped to the nearest standard PDF family:

```text
sans-serif -> Helvetica
serif -> Times Roman
monospaced -> Courier
```

The highest-scoring style becomes the default for newly added text fields. The original PDF text is never rendered as an interactive selection layer and is not converted into an editable object.

Image-only or scanned PDFs do not expose usable text items. In that case, DocBatch uses the standard Helvetica fallback without interrupting the workflow.

## Coordinate and cover model

Text and image positions use normalized values from `0` to `1` instead of screen pixels. This keeps placement stable when the preview resizes.

```text
x = horizontal distance / preview width
y = vertical distance / preview height
width = element width / preview width
height = image height / preview height
```

During export, normalized values are converted into PDF points. PDF coordinates start at the bottom-left, while browser coordinates start at the top-left, so the vertical axis is inverted.

When `coverOriginal` is enabled, pdf-lib draws a white rectangle before drawing the text or image. The source template remains unchanged.

## Duplicate and deletion model

Repeated text elements are detected by spreadsheet-column or custom-text identity. Duplicate fields are translucent and labelled in the editor preview. Exported content remains fully opaque.

While an element is being dragged, a deletion target appears. Releasing the pointer over that target removes the element. The settings panel retains an explicit delete button as an accessible alternative.

## Image model

Signatures and logos are held as validated PNG or JPEG data URLs in browser memory.

Limits:

- 2 MB per image;
- 4096 × 4096 pixels maximum;
- four image elements per template;
- two signatures maximum;
- two logos maximum.

Transparent PNG is preferred for signatures and logos. pdf-lib embeds each image in every generated document.

## Filename model

Filename patterns contain literal text and tokens:

```text
Certificate - {Certificate Number} - {row}
```

Spreadsheet tokens resolve case-insensitively against the header row. `{row}` resolves to a one-based sequence number. The final value is sanitized and duplicate names receive suffixes before insertion into the ZIP archive.

## Resource controls

- One PDF template, maximum 8 MB.
- One spreadsheet, maximum 5 MB.
- Two active source files per session.
- Maximum 500 spreadsheet rows.
- Maximum 20 positioned text fields.
- Maximum 200 characters per custom text field.
- Maximum four positioned images.
- Maximum 120 characters in a filename pattern.
- Maximum 250 text items considered during font analysis.

## Security and privacy

- Uploaded files and images remain in browser memory.
- No document content is logged or sent to analytics.
- No remote code execution or server-side document parsing occurs.
- Output filenames are sanitized before ZIP insertion.
- File, row, field, image, and font-analysis limits protect browser memory.
- Tutorial completion stores one small value in local browser storage.
- Vercel Web Analytics measures aggregate website traffic only after the project owner enables it.

## Future hosted services

Commercial features may introduce:

- authentication and organization accounts;
- server-side payment webhooks;
- saved element templates containing coordinates, without source documents by default;
- certificate verification records containing document IDs and status;
- short-lived encrypted object storage for optional email delivery;
- team workspaces and role-based access.

These hosted services should remain separated from the browser document-processing engine.
