# micro-rq Docs

This is a Next.js App Router documentation app for the library.

## Local Development

```sh
cd docs
npm install
npm run dev
```

## Vercel

Create a Vercel project from the GitHub repository and set:

- Framework Preset: `Next.js`
- Root Directory: `docs`
- Install Command: `npm ci`
- Build Command: `npm run build`
- Output Directory: leave empty

After the first deployment, use the production deployment URL as the docs link in the root `README.md` and package metadata if you want npm to point to the docs site instead of GitHub.
