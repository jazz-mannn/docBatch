# DocBatch

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](LICENSE)

**Create hundreds of personalized PDFs from one template and spreadsheet.**

DocBatch is a deployable web application for bulk document automation. It is designed for universities, schools, training providers, HR teams, event organizers, nonprofit organizations, and other teams that repeatedly issue documents from one approved layout.

Users upload a PDF template and CSV or Excel file, place dynamic fields and reusable content, preview the results, define output filenames, and download every generated PDF inside one ZIP archive.

## Website capabilities

- Drag and drop one PDF template, up to 8 MB.
- Drag and drop one `.csv`, `.xlsx`, or `.xls` spreadsheet, up to 5 MB.
- Generate up to 500 PDFs in one batch.
- Add spreadsheet-backed fields and editable custom text.
- Place up to 20 text fields on the template.
- Detect the dominant embedded PDF font silently and use it as the default for new fields.
- Keep the original PDF text non-interactive and unchanged.
- Use Times Roman, Helvetica, or Courier with regular, bold, normal, and italic variations.
- Show repeated fields translucently with a clear **Duplicate** label in the editor.
- Add PNG or JPEG signatures and logos.
- Place up to four images total, with two signatures and two logos.
- Drag text and images directly over the PDF preview.
- Drag any editor element onto the delete zone, or use the explicit delete button.
- Draw optional white cover blocks behind replacement text or images.
- Create output filename patterns using literal text, spreadsheet tokens, and `{row}`.
- Download the generated documents as one ZIP archive.
- Show first-visit onboarding that can be reopened at any time.
- Measure website traffic with Vercel Web Analytics after it is enabled by the deployer.

## Font matching

DocBatch analyses embedded text information from the first PDF page without turning that text into an editable object.

The dominant detected style becomes the starting style for newly added fields:

- Sans-serif fonts map to **Helvetica**.
- Serif fonts map to **Times Roman**.
- Monospaced fonts map to **Courier**.
- Bold and italic characteristics are preserved when possible.

Users remain free to change the font family, weight, style, alignment, colour, size, and field width. Image-only or scanned PDFs simply use the standard Helvetica fallback.

## Signatures and logos

PNG is recommended when transparency is required. JPEG is also supported.

```text
Maximum image file size: 2 MB
Maximum dimensions: 4096 × 4096 pixels
Maximum images per template: 4
Maximum signatures: 2
Maximum logos: 2
```

## Output filename patterns

A pattern combines fixed text with spreadsheet-column tokens:

```text
Certificate - {Certificate Number}
```

For a row whose certificate number is `CERT-0042`, the generated file becomes:

```text
Certificate - CERT-0042.pdf
```

Use `{row}` for a one-based sequence number. Duplicate generated names receive safe numeric suffixes.

## Deployment

DocBatch is a static React and Vite website. It can be deployed through Vercel, Netlify, or Cloudflare Pages.

Recommended Vercel configuration:

```text
Framework preset: Vite
Build command: npm run build
Output directory: dist
```

Detailed instructions are available in [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

## Technology

- React and TypeScript
- Vite
- PDF.js for browser preview and embedded-font analysis
- pdf-lib for PDF text, images, and document generation
- SheetJS for CSV and Excel parsing
- JSZip for ZIP export
- Vercel Web Analytics
- Vitest and GitHub Actions

## Privacy model

Document processing occurs in the browser. PDF templates, spreadsheet records, signatures, logos, generated PDFs, and ZIP archives are not sent to a DocBatch application server.

Closing or refreshing the page clears the working session. The first-visit tutorial stores one local completion flag. Web analytics measures website usage and does not receive document content from the processing workflow.

## Developer setup

Local development is secondary to the hosted website, but a complete setup guide is provided for contributors and testing:

[Step-by-step local development setup](docs/LOCAL_SETUP.md)

```bash
git clone https://github.com/jazz-mannn/docBatch.git
cd docBatch
npm install
npm run dev
```

Validation commands:

```bash
npm run typecheck
npm run test
npm run build
```

## License

DocBatch is released under the [MIT License](LICENSE). You may use, copy, modify, distribute, sublicense, and sell copies of the software subject to the conditions in that licence.

Third-party packages remain subject to their own licences. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for the main direct dependencies used by this project.

Copyright © 2026 Tinashe Rashayi.

See also [SECURITY.md](SECURITY.md), [CONTRIBUTING.md](CONTRIBUTING.md), [deployment documentation](docs/DEPLOYMENT.md), and [architecture documentation](docs/ARCHITECTURE.md).
