# DocBatch

**Turn one PDF template and one spreadsheet into hundreds of personalized documents.**

DocBatch is a browser-based bulk PDF generator for certificates, letters, invitations, badges, receipts, and similar documents. It is suited to universities, schools, training providers, HR teams, event organizers, nonprofit organizations, and other teams that issue repeated documents from one approved layout.

A user adds a PDF template and a CSV or Excel file, selects or adds editable content, previews the result, defines an output naming pattern, and downloads the generated PDFs as one ZIP archive.

The current MVP performs document processing inside the browser. Uploaded files are not sent to an application server.

## Current MVP

- Drag and drop one PDF template, up to 8 MB.
- Drag and drop one `.csv`, `.xlsx`, or `.xls` spreadsheet, up to 5 MB.
- Keep no more than two active source files in one browser session.
- Generate up to 500 PDFs in one batch.
- Detect selectable text on the first PDF page.
- Click detected PDF text to create a replacement field at its original location.
- Approximate detected text using Helvetica, Times Roman, or Courier.
- Use regular, bold, italic, and bold italic variants of the standard PDF fonts.
- Add spreadsheet-backed fields or editable custom text.
- Limit custom text to 200 characters per field.
- Place up to 20 text fields on the template.
- Show repeated fields translucently with a Duplicate label.
- Drag fields, signatures, and logos directly on the PDF preview.
- Drag any editor element over the red bin and release to delete it.
- Keep an explicit Delete selected field or image button in the settings panel.
- Cover original PDF content using a white block enabled by default for text.
- Add transparent PNG or JPEG signatures and logos.
- Limit images to 2 MB each and 4096 × 4096 pixels.
- Place up to four images total and two per image type.
- Configure font, style, weight, alignment, colour, field width, and cover width.
- Preview any spreadsheet record.
- Create file-name patterns using literal text, spreadsheet tokens, and `{row}`.
- Download the generated documents as one ZIP archive.
- Show a first-visit tutorial and retain tutorial completion in browser storage.
- Collect anonymous page-view analytics after Vercel Web Analytics is enabled.

## PDF text detection

DocBatch uses PDF.js text extraction on the first page. This works when the PDF contains selectable text.

When text is detected:

1. Open the generator.
2. Upload the PDF template.
3. Enable **Select PDF text**.
4. Click the highlighted original text.
5. Edit the resulting field in **Text field settings**.

DocBatch copies the detected position, approximate width, text size, weight, and italic state. It maps the original font to the nearest standard PDF family:

- Helvetica for sans-serif fonts.
- Times Roman for serif fonts.
- Courier for monospaced fonts.

Scanned or image-only PDFs do not contain selectable text. Add fields manually for those documents.

## Signatures and logos

Use PNG for signatures and logos that need transparent backgrounds. JPEG is supported when transparency is not required.

Limits:

```text
Maximum image file size: 2 MB
Maximum dimensions: 4096 × 4096 pixels
Maximum images per template: 4
Maximum signatures: 2
Maximum logos: 2
```

The editor lets the user resize and position each image. A white cover block can be enabled when the image should replace existing PDF content.

## File-name patterns

A pattern combines fixed text with spreadsheet column tokens:

```text
Document Automation - {Certificate Number}
```

For a row whose certificate number is `CERT-0042`, the exported file becomes:

```text
Document Automation - CERT-0042.pdf
```

Use `{row}` for a one-based sequence number. Duplicate generated names receive numeric suffixes before being added to the ZIP archive.

## Technology

- React and TypeScript
- Vite
- PDF.js for browser preview and selectable-text extraction
- pdf-lib for text, images, and PDF generation
- SheetJS for CSV and Excel parsing
- JSZip for ZIP export
- Vercel Web Analytics for anonymous traffic measurement
- Vitest for unit tests

## Local setup

Read the complete step-by-step guide:

[Local development setup](docs/LOCAL_SETUP.md)

Basic commands:

```bash
git clone https://github.com/Rash-Au/docBatch.git
cd docBatch
npm install
npm run dev
```

Open the local URL printed by Vite.

## Validation

```bash
npm run typecheck
npm run test
npm run build
```

## Deployment

The application is a static Vite site. Connect the repository to Vercel, Netlify, or Cloudflare Pages and use:

```text
Build command: npm run build
Output directory: dist
```

`vercel.json` and `netlify.toml` are included. Vercel deployments can enable Web Analytics from the project dashboard after the first deployment.

## Privacy model

The MVP does not require customer accounts, a database, cloud file storage, or document-processing API keys. Template files, spreadsheet records, signatures, and logos remain in browser memory. Closing or refreshing the page clears the working session.

The first-visit tutorial stores only a local completion flag. Web analytics measures site traffic and does not receive uploaded templates, spreadsheet content, signatures, or logos from the DocBatch processing workflow.

## Product direction

Planned paid features include saved templates, QR verification, team workspaces, branded email delivery, higher batch limits, API access, and organization billing.

## Repository status

This repository is private and proprietary. See [LICENSE](LICENSE), [SECURITY.md](SECURITY.md), [local setup](docs/LOCAL_SETUP.md), and the [architecture documentation](docs/ARCHITECTURE.md).
