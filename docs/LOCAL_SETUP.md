# Local development setup

This guide starts from a new computer and ends with DocBatch running in a browser.

## 1. Install the required software

Install:

- Git
- Node.js LTS, version 22 or later
- Visual Studio Code, recommended
- Chrome, Edge, or Firefox

### Windows installation with Winget

Open PowerShell as a normal user and run:

```powershell
winget install --id Git.Git -e
winget install --id OpenJS.NodeJS.LTS -e
winget install --id Microsoft.VisualStudioCode -e
```

Close PowerShell completely, then open it again.

Confirm the installations:

```powershell
git --version
node --version
npm --version
```

Each command must return a version number.

### macOS installation with Homebrew

```bash
brew install git node
brew install --cask visual-studio-code
```

Confirm the installations:

```bash
git --version
node --version
npm --version
```

### Linux installation

Install Git using the distribution package manager. Install the current Node.js LTS release from NodeSource, NVM, or the official Node.js packages. Confirm:

```bash
git --version
node --version
npm --version
```

## 2. Choose a writable projects folder

Do not clone the project into `C:\Windows\System32`, `C:\Program Files`, or another protected system directory.

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

## 3. Clone the GitHub repository

```bash
git clone https://github.com/Rash-Au/docBatch.git
cd docBatch
```

The repository is private. GitHub may open a browser window or request authentication. Sign in using the GitHub account that has access to `Rash-Au/docBatch`.

Confirm the repository state:

```bash
git status
git branch --show-current
```

The branch should normally be `main`.

## 4. Install project dependencies

```bash
npm install
```

This reads `package.json` and installs React, Vite, PDF.js, pdf-lib, SheetJS, JSZip, Vitest, and the other required packages.

## 5. Start the development website

```bash
npm run dev
```

Vite prints a local address similar to:

```text
http://localhost:5173/
```

Open that address in a browser.

Keep the terminal open while using the local site. Press `Ctrl+C` in the terminal to stop the development server.

## 6. Open the project in Visual Studio Code

From the project directory:

```bash
code .
```

Useful folders:

```text
src/components/   Interface components
src/lib/          PDF, spreadsheet, image, and validation logic
src/types.ts      Shared TypeScript models
tests/            Unit tests
docs/             Architecture and deployment documentation
```

## 7. Update an existing local copy

Open a terminal in the project folder and run:

```bash
git switch main
git pull origin main
npm install
npm run dev
```

Run `npm install` after pulling because dependencies may have changed.

## 8. Validate changes before pushing

Run all checks:

```bash
npm run typecheck
npm run test
npm run build
```

Expected results:

- TypeScript reports no errors.
- Vitest reports passing tests.
- Vite creates a production build in `dist/`.

Preview the production build locally:

```bash
npm run preview
```

## 9. Create a development branch

Do not make unfinished changes directly on `main`.

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

Open a pull request from the new branch into `main` on GitHub.

## 10. Common Windows problems

### `npm` is not recognized

Node.js is missing or the terminal has not reloaded the updated PATH.

1. Install Node.js LTS.
2. Close every PowerShell and VS Code window.
3. Open PowerShell again.
4. Run:

```powershell
node --version
npm --version
```

### PowerShell blocks `npm.ps1`

Use the command shim without changing the machine execution policy:

```powershell
npm.cmd install
npm.cmd run dev
```

### Permission denied while cloning

Move to a user-owned folder:

```powershell
cd "$HOME\Projects"
```

Then clone again.

### Port 5173 is already in use

Vite normally selects another port automatically. Use the new URL shown in the terminal. To select a specific port:

```bash
npm run dev -- --port 5174
```

### Private repository authentication fails

Confirm that the signed-in GitHub account can open:

```text
https://github.com/Rash-Au/docBatch
```

Then run the clone command again. GitHub Desktop can also clone the repository after account sign-in.

## 11. Browser testing checklist

Before opening a pull request, test:

- PDF upload and preview
- CSV and Excel upload
- Detected PDF text selection
- Spreadsheet and custom text fields
- Duplicate-field warning
- Drag-to-delete bin
- Signature and logo upload
- Filename pattern preview
- PDF and ZIP generation
- First-visit tutorial

All document and image processing should remain inside the browser session.
