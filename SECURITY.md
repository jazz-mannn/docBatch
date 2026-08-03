# Security Policy

## Supported version

Only the latest production version deployed from the default `main` branch is supported.

## Data handling

DocBatch processes PDF templates, spreadsheet records, signatures, logos, generated PDFs, and ZIP archives in browser memory. The current website does not upload document content to a DocBatch application server.

The first-visit tutorial stores one local completion flag. Vercel Web Analytics, when enabled, measures aggregate website traffic and is not part of the document-processing path.

## Reporting a vulnerability

Do not publish sensitive findings in a public issue. Contact the repository owner privately with:

- the affected component;
- clear reproduction steps;
- expected and observed behaviour;
- potential impact;
- browser and operating-system details;
- a proposed mitigation, when available.

## Secret management

Do not commit passwords, access tokens, private keys, payment secrets, production environment files, or privileged database credentials.

Future server-side secrets must be stored in encrypted deployment-provider settings. Values exposed through Vite variables prefixed with `VITE_` are delivered to the browser and must never contain private credentials.

## Production changes

All production changes should be reviewed through a pull request and must pass:

```bash
npm run typecheck
npm run test
npm run build
```

Use the deployment platform's rollback controls when a production release introduces a security or availability problem.
