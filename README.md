# DocBatch

**Turn one PDF template and one spreadsheet into hundreds of personalized documents.**

DocBatch is a browser-based bulk PDF generator for certificates, letters, invitations, badges, receipts, and similar documents. It is suited to universities, schools, training providers, HR teams, event organizers, nonprofit organizations, and other teams that issue repeated documents from one approved layout.

A user adds a PDF template and a CSV or Excel file, places spreadsheet or custom text fields on the template, previews the result, and downloads the generated PDFs as one ZIP archive.

The current MVP performs all document processing inside the browser. Uploaded files are not sent to an application server.

## Current MVP

- Drag and drop one PDF template, up to 8 MB.
- Drag and drop one `.csv`, `.xlsx`, or `.xls` spreadsheet, up to 5 MB.
- Keep no more than two active source files in one browser session.
- Inspect spreadsheet columns and records.
- Add spreadsheet-backed fields or editable custom text.
- Limit custom text to 200 characters per field.
- Place up to 20 fields on the template.
- Drag fields into position.
- Configure font, weight, alignment, colour, and text width.
- Preview any spreadsheet record.
- Choose a column for output file names.
- Generate up to 500 PDFs in one batch.
- Download the output as a ZIP archive.

## Product direction

DocBatch begins as a private, browser-only generator. Planned paid features include saved templates, QR verification, team workspaces, branded email delivery, higher batch limits, API access, and organization billing.

## Technology

- React and TypeScript
- Vite
- PDF.js for browser preview
- pdf-lib for PDF generation
- SheetJS for CSV and Excel parsing
- JSZip for ZIP export
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

`vercel.json` and `netlify.toml` are included.

## Privacy model

The MVP does not require accounts, a database, cloud file storage, or API keys. Template files and spreadsheet records remain in browser memory. Closing or refreshing the page clears the working session.

## Repository status

This repository is private and proprietary. See [LICENSE](LICENSE), [SECURITY.md](SECURITY.md), and the [architecture documentation](docs/ARCHITECTURE.md).
