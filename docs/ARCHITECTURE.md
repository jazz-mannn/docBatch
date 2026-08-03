# Architecture

## Objective

DocBatch converts one PDF template and one spreadsheet into a ZIP archive containing one personalized PDF per spreadsheet row.

## MVP boundary

The first release is a static single-page application. It has no application server, database, cloud document storage, customer account system, or payment integration.

## Data flow

```text
PDF template ─> PDF.js preview ─> selectable text extraction ─> positioned replacement fields
      │
      └────────> browser memory ─> pdf-lib ─> generated PDFs ─> JSZip ─> download

CSV or Excel ─> SheetJS ─> normalized rows ─> React editor state ────────┘
PNG or JPEG ─> browser validation ─> data URL image assets ─────────────┘

First-visit state ─> localStorage tutorial flag
Page navigation ─> Vercel Web Analytics when enabled by the deployer
```

## Components

- `Landing`: product explanation, institutional use cases, and synthetic preview credentials.
- `Generator`: upload state, validation, editor element controls, filename patterns, and export orchestration.
- `FileDropZone`: drag-and-drop source input with count, extension, and size validation.
- `ImageUploadButton`: compact signature and logo input.
- `PdfWorkspace`: PDF.js rendering, selectable-text regions, normalized positioning, duplicate visibility, and drag-to-delete behavior.
- `Tutorial`: reusable first-visit workflow guide.
- `spreadsheet.ts`: file validation and spreadsheet normalization.
- `fileUpload.ts`: source-file policies and size limits.
- `imageAsset.ts`: PNG and JPEG validation, image limits, dimensions, and initial placement.
- `detectedText.ts`: font approximation and detected-text conversion into editable fields.
- `fieldText.ts`: spreadsheet and custom text resolution.
- `filenameTemplate.ts`: token validation and row-specific output names.
- `pdf.ts`: PDF cloning, white cover blocks, standard font embedding, image embedding, field drawing, and ZIP creation.
- `filename.ts`: safe and unique output names.
- `coordinates.ts`: normalized browser-to-PDF coordinate conversion for text and images.
- `onboarding.ts`: local tutorial completion state.

## PDF text detection

The first page is processed through `PDFPageProxy.getTextContent()`. Each selectable text item is converted into normalized browser coordinates.

The detector records:

- original text;
- horizontal and vertical position;
- approximate width;
- approximate font size;
- PDF font name and family hints.

The original font is mapped to the nearest standard PDF family:

```text
sans-serif -> Helvetica
serif -> Times Roman
monospaced -> Courier
```

Bold and italic or oblique hints are preserved. This creates 12 supported standard variants without external font files.

Image-only or scanned PDFs do not expose text items. The interface reports that manual fields are required instead of attempting browser OCR.

## Coordinate and cover model

Text and image positions use normalized values from `0` to `1` instead of screen pixels. This keeps placement stable when the preview resizes.

```text
x = horizontal distance / preview width
y = vertical distance / preview height
width = element width / preview width
height = image height / preview height
```

During export, normalized values are converted into PDF points. PDF coordinates start at the bottom-left, while browser coordinates start at the top-left, so the vertical axis is inverted.

When `coverOriginal` is enabled, pdf-lib draws a white rectangle before drawing the text or image. The source template file remains unchanged.

## Duplicate and deletion model

Repeated text elements are detected by their spreadsheet column or custom text identity. Duplicate fields are translucent and labelled in the editor preview. Exported content remains fully opaque.

While an element is being dragged, a fixed deletion target appears. Releasing the pointer over that target removes the element. The settings panel retains an explicit delete button as an accessible alternative.

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
Document Automation - {Certificate Number} - {row}
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
- Maximum 250 detected text regions rendered for selection.

## Security and privacy

- Uploaded files and images remain in browser memory.
- No document content is logged or sent to the analytics component.
- No remote code execution or server-side document parsing occurs.
- Output filenames are sanitized before ZIP insertion.
- File, row, field, image, and text-detection limits protect browser memory.
- Tutorial completion stores one boolean-like value in local browser storage.
- Vercel Web Analytics is injected for aggregate website traffic only after the project owner enables it in Vercel.

## Planned hosted architecture

Paid features may introduce:

- Supabase or equivalent authentication and PostgreSQL storage;
- server-side payment webhooks;
- saved element templates containing coordinates, not source documents by default;
- certificate verification records containing document IDs and status;
- short-lived encrypted object storage for optional email delivery.

These features should remain separated from the local document-processing engine.
