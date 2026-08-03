# Deployment

## Vercel

1. Import `Rash-Au/docBatch` into Vercel.
2. Select the Vite framework preset.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. Deploy.

The included `vercel.json` configures the single-page application rewrite.

### Enable traffic analytics

The application includes the `@vercel/analytics` React component. After deployment:

1. Open the DocBatch project in the Vercel dashboard.
2. Open **Analytics**.
3. Enable Web Analytics for the project.
4. Deploy the current `main` branch again if Vercel requests a new deployment.
5. Use the Analytics dashboard to review visits, page views, referrers, devices, countries, and other available aggregate traffic data.

The document-processing workflow does not send uploaded PDF or spreadsheet contents to the analytics component.

## Netlify

1. Import the GitHub repository.
2. Netlify reads `netlify.toml` automatically.
3. Confirm the build command is `npm run build`.
4. Confirm the publish directory is `dist`.
5. Deploy.

The included Vercel analytics component is intended for Vercel deployments. Use a separate privacy-respecting analytics provider if the production site is hosted elsewhere.

## Cloudflare Pages

Use:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

## Environment variables

The MVP does not require production secrets. Future account and payment features must keep secret keys on a server or serverless function. Never expose payment webhook secrets through variables prefixed with `VITE_`.
