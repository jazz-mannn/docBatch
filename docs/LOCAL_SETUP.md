# Local development setup

This guide is for contributors who need to run and test the DocBatch website on a computer before deploying changes.

## 1. Install the required software

Install:

- Git
- Node.js LTS, version 22 or later
- Visual Studio Code, recommended
- Chrome, Edge, or Firefox

### Windows with Winget

Open PowerShell as a normal user:

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Microsoft.VisualStudioCode -e
```

Close PowerShell completely, open it again, and confirm:

```powershell
git --version
node --version
npm --version
```

Each command must return a version number.

### macOS with Homebrew

```bash
brew install git node
brew install --cask visual-studio-code
```

Confirm:

```bash
git --version
node --version
npm --version
```

### Linux

Install Git with the distribution package manager. Install the current Node.js LTS release through NVM, NodeSource, or the official Node.js packages. Confirm:

```bash
git --version
node --version
npm --version
```

## 2. Use a writable project folder

Do not clone the repository into `C:\Windows\System32`, `C:\Program Files`, or another protected operating-system directory.

### Windows

```powershell
New-Item -ItemType Directory -Force "$HOME\Projects"
cd "$HOME\Projects"
```

### macOS or Linux

```bash
mkdir -p ~/Projects
cd ~/Projects
```

## 3. Clone the repository

```bash
git clone https://github.com/Rash-Au/docBatch.git
cd docBatch
```

The repository is private. Sign in with a GitHub account that has access to `Rash-Au/docBatch` when authentication is requested.

Confirm the repository state:

```bash
git status
git branch --show-current
```

The normal production branch is `main`.

## 4. Install dependencies

```bash
npm install
```

This installs React, Vite, PDF.js, pdf-lib, SheetJS, JSZip, Vitest, Vercel Analytics, and the supporting TypeScript packages.

## 5. Start the development website

```bash
npm run dev
```

Vite prints a local address similar to:

```text
http://localhost:5173/
```

Open the address in a browser. Keep the terminal open while using the development site. Press `Ctrl+C` to stop the server.

## 6. Open the project in Visual Studio Code

From the repository folder:

```bash
code .
```

Important locations:

```text
src/components/   Public website and document-studio components
src/lib/          PDF, spreadsheet, image, filename, and validation logic
src/types.ts      Shared TypeScript models
tests/            Unit tests
docs/             Architecture, deployment, and setup documentation
public/           Logo and static website assets
```

## 7. Update an existing local copy

```bash
git switch main
git pull origin main
npm install
npm run dev
```

Run `npm install` after pulling because project dependencies may have changed.

## 8. Validate changes

Run every required check:

```bash
npm run typecheck
npm run test
npm run build
```

Expected results:

- TypeScript reports no errors.
- Vitest reports passing tests.
- Vite creates a production build in `dist/`.

Preview the production build:

```bash
npm run preview
```

Use the preview address shown by Vite to inspect the final compiled website.

## 9. Work on a branch

Do not place unfinished changes directly on `main`.

```bash
git switch main
git pull origin main
git switch -c feature/short-description
```

After editing and validating:

```bash
git add .
git commit -m "Describe the change"
git push -u origin feature/short-description
```

Open a pull request from the feature branch into `main`. Merge only after GitHub Actions passes.

## 10. Common Windows problems

### `npm` is not recognized

Node.js is missing or the terminal has not reloaded the updated PATH.

1. Install Node.js LTS.
2. Close PowerShell and Visual Studio Code.
3. Open PowerShell again.
4. Run:

```powershell
node --version
npm --version
```

### PowerShell blocks `npm.ps1`

Use the Windows command shim without changing the machine execution policy:

```powershell
npm.cmd install
npm.cmd run dev
```

### Permission denied while cloning

Move into the user-owned project folder:

```powershell
cd "$HOME\Projects"
```

Then run the clone command again.

### Port 5173 is already in use

Vite normally selects another port automatically. Open the new address shown in the terminal. To choose a specific port:

```bash
npm run dev -- --port 5174
```

### Private repository authentication fails

Confirm that the signed-in GitHub account can open:

```text
https://github.com/Rash-Au/docBatch
```

GitHub Desktop can also clone the repository after account sign-in.

## 11. Browser testing checklist

Before opening a pull request, test:

- OLED landing page and responsive navigation
- First-visit tutorial
- PDF upload and preview
- CSV and Excel upload
- Silent default-font detection
- Original PDF text remaining non-interactive
- Helvetica fallback for scanned or image-only PDFs
- Spreadsheet-backed and custom text fields
- Professional font-family, weight, and style controls
- Duplicate-field warning and translucent editor state
- White cover blocks
- Drag-to-delete zone and explicit delete buttons
- Signature and logo upload
- Image transparency and resizing
- Filename-pattern preview
- PDF and ZIP generation
- Production build preview

All document and image processing must remain inside the browser session.

## 12. Deploy after merging

Once the pull request is merged into `main`, follow [the production deployment guide](DEPLOYMENT.md). The hosted website is the primary product; the local environment is only for development and verification.
