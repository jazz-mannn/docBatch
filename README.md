# DocBatch

**Turn one PDF template and one spreadsheet into hundreds of personalized documents.**

DocBatch is a browser-based bulk PDF generator for certificates, letters, invitations, badges, receipts, and similar documents. It is suited to universities, schools, training providers, HR teams, event organizers, nonprofit organizations, and other teams that issue repeated documents from one approved layout.

A user adds a PDF template and a CSV or Excel file, places spreadsheet or custom text fields on the template, previews the result, defines an output naming pattern, and downloads the generated PDFs as one ZIP archive.

The current MVP performs document processing inside the browser. Uploaded files are not sent to an application server.

## Current MVP

- Drag and drop one PDF template, up to 8 MB.
- Drag and drop one `.csv`, `.xlsx`, or `.xls` spreadsheet, up to 5 MB.
- Keep no more than two active source files in one browser session.
- Inspect spreadsheet columns and records.
- Add spreadsheet-backed fields or editable custom text.
- Limit custom text to 200 characters per field.
- Place up to 20 fields on the template.
- Drag fields into position.
- Cover original PDF content using a white field block enabled by default.
- Configure font, weight, alignment, colour, field width, and cover width.
- Preview any spreadsheet record.
- Create file-name patterns using literal text, spreadsheet tokens, and `{row}`.
- Generate up to 500 PDFs in one batch.
- Download the output as a ZIP archive.
- Show a first-visit tutorial and retain tutorial completion in browser storage.
- Collect anonymous page-view analytics after Vercel Web Analytics is enabled.

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

## Product direction

DocBatch begins as a private, browser-only generator. Planned paid features include saved templates, QR verification, team workspaces, branded email delivery, higher batch limits, API access, and organization billing.

## Technology

- React and TypeScript
- Vite
- PDF.js for browser preview
- pdf-lib for PDF generation
- SheetJS for CSV and Excel parsing
- JSZip for ZIP export
- Vercel Web Analytics for anonymous traffic measurement
- Vitest for unit tests

## Local setup

Requirements:

- Node.js 22 or later
- npm

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

The MVP does not require customer accounts, a database, cloud file storage, or document-processing API keys. Template files and spreadsheet records remain in browser memory. Closing or refreshing the page clears the working session.

The first-visit tutorial stores only a local completion flag. Web analytics measures site traffic and does not receive uploaded templates or spreadsheet content from the DocBatch processing workflow.

## Repository status

This repository is private and proprietary. See [LICENSE](LICENSE), [SECURITY.md](SECURITY.md), and the [architecture documentation](docs/ARCHITECTURE.md).
