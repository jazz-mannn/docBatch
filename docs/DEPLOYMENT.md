# Deployment

## Vercel

1. Import `Rash-Au/docBatch` into Vercel.
2. Select the Vite framework preset.
3. Use `npm run build` as the build command.
4. Use `dist` as the output directory.
5. Deploy.

The included `vercel.json` configures the single-page application rewrite.

## Netlify

1. Import the GitHub repository.
2. Netlify reads `netlify.toml` automatically.
3. Confirm the build command is `npm run build`.
4. Confirm the publish directory is `dist`.
5. Deploy.

## Cloudflare Pages

Use:

```text
Framework preset: Vite
Build command: npm run build
Build output directory: dist
```

## Environment variables

The MVP does not require production secrets. Future account and payment features must keep secret keys on a server or serverless function. Never expose payment webhook secrets through variables prefixed with `VITE_`.
