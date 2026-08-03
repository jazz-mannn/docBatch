# Production deployment

DocBatch is a static React and Vite website. The recommended production route is GitHub to Vercel, with automatic deployments from the `main` branch.

## Recommended: Vercel

### 1. Import the repository

1. Sign in to Vercel with the GitHub account that can access `Rash-Au/docBatch`.
2. Select **Add New → Project**.
3. Import `Rash-Au/docBatch`.
4. Confirm that the production branch is `main`.

### 2. Confirm build settings

Use:

```text
Framework preset: Vite
Install command: npm install
Build command: npm run build
Output directory: dist
```

The included `vercel.json` configures the single-page application rewrite.

### 3. Deploy

1. Select **Deploy**.
2. Wait for the production build to complete.
3. Open the generated Vercel address.
4. Test the landing page, tutorial, PDF upload, spreadsheet upload, field placement, image placement, ZIP export, and mobile layout.

Every later merge into `main` should trigger a new production deployment automatically.

## Enable Web Analytics

The website includes the `@vercel/analytics` React component.

1. Open the DocBatch project in Vercel.
2. Open **Analytics**.
3. Enable **Web Analytics**.
4. Redeploy if Vercel requests a new deployment.
5. Use the dashboard to review aggregate visits, page views, referrers, countries, and device information.

The document-processing workflow does not send uploaded PDF files, spreadsheet values, signatures, logos, or generated document contents to analytics.

## Add a custom domain

After the Vercel deployment is stable:

1. Open **Project Settings → Domains**.
2. Add the purchased domain.
3. Follow the DNS records shown by Vercel.
4. Set the preferred production domain as primary.
5. Test both the root domain and the `www` version.
6. Confirm HTTPS is active before sharing the website publicly.

## Production checklist

Before launch, confirm:

- The latest pull request is merged into `main`.
- GitHub Actions passes type checking, unit tests, and the production build.
- Vercel deploys the current `main` commit.
- The site title, description, logo, and browser theme are correct.
- The first-visit tutorial opens in a private browser window.
- A text-based certificate PDF detects a sensible default font.
- The original PDF text is not selectable as an editor field.
- A scanned image-only PDF falls back to Helvetica without failing.
- PNG signatures preserve transparency.
- Duplicate fields are clearly visible in the editor.
- Drag-to-delete and explicit delete buttons both work.
- Output filename tokens generate safe names.
- A 500-row batch does not exceed the intended browser limit.
- Mobile visitors can read the landing page and open the studio.
- Web Analytics is enabled only after the privacy copy is reviewed.

## Netlify

1. Import the GitHub repository.
2. Netlify reads `netlify.toml` automatically.
3. Confirm the build command is `npm run build`.
4. Confirm the publish directory is `dist`.
5. Deploy the `main` branch.

The included Vercel Analytics component is intended for Vercel. Use a separate privacy-conscious analytics provider when hosting elsewhere.

## Cloudflare Pages

Use:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
Production branch: main
```

## Environment variables

The current website does not require production secrets.

Future authentication and payment features must keep private keys inside server or serverless environments. Never expose payment secrets or privileged database keys through variables prefixed with `VITE_`, because Vite includes those values in browser-delivered code.

## Rollback

When a production deployment has a problem:

1. Open the Vercel project.
2. Open **Deployments**.
3. Select the last verified deployment.
4. Promote or redeploy that version.
5. Correct the problem through a new GitHub pull request rather than editing production files manually.
