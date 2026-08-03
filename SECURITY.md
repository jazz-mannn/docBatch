# Security Policy

## Supported version

Only the latest commit on the default branch is supported during MVP development.

## Data handling

DocBatch processes templates and spreadsheet data in browser memory. The MVP does not upload user documents to an application server.

## Reporting a vulnerability

Do not publish sensitive findings in a public issue. Contact the repository owner privately with:

- the affected component;
- reproduction steps;
- expected and observed behaviour;
- potential impact;
- a proposed mitigation, when available.

## Secret management

Do not commit passwords, tokens, private keys, payment secrets, or production environment files. Future server-side secrets must be stored in the deployment provider's encrypted environment settings.
