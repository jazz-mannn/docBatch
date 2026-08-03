# Third-Party Notices

DocBatch includes and depends on open-source software maintained by other authors and organisations. Those components are not relicensed by the DocBatch MIT License; each remains governed by its own licence terms.

The main direct dependencies declared by this repository are listed below.

## Runtime dependencies

| Package | Version range | Licence |
|---|---:|---|
| `@vercel/analytics` | `^2.0.1` | MIT |
| `jszip` | `^3.10.1` | MIT or GPL-3.0; DocBatch uses it under the MIT option |
| `pdf-lib` | `^1.17.1` | MIT |
| `pdfjs-dist` | `^5.4.54` | Apache-2.0 |
| `react` | `^19.1.1` | MIT |
| `react-dom` | `^19.1.1` | MIT |
| `xlsx` (SheetJS Community Edition) | `^0.18.5` | Apache-2.0 |

## Development dependencies

| Package | Version range | Licence |
|---|---:|---|
| `@types/react` | `^19.1.10` | MIT |
| `@types/react-dom` | `^19.1.7` | MIT |
| `@vitejs/plugin-react` | `^5.0.2` | MIT |
| `typescript` | `^5.9.2` | Apache-2.0 |
| `vite` | `^7.1.3` | MIT |
| `vitest` | `^3.2.4` | MIT |

## Complete licence texts

Installed packages normally include their licence text inside their package directory. After running `npm install`, review the corresponding `LICENSE`, `LICENSE.md`, `COPYING`, or package metadata under `node_modules` when preparing a redistributed build.

Transitive dependencies may introduce additional licences. Anyone redistributing DocBatch should generate and review an up-to-date dependency licence report for the exact dependency versions included in that distribution.

This file is provided for attribution and inventory purposes and is not a substitute for the original third-party licence texts.
