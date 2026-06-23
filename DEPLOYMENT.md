# Frontend Deployment Guide (Vercel)

This is a Vite + React SPA. It talks to the backend API via the `VITE_API` environment variable.

```
Browser  ->  Vercel (this app)  ->  Render (backend API)  ->  Supabase (Postgres)
```

## Deploy to Vercel

1. Push this repo to GitHub (already wired to `EyaderTs/frontend-starter-pack`).
2. On https://vercel.com -> **Add New -> Project** -> import this repo.
3. Vercel auto-detects Vite (config is also in [`vercel.json`](vercel.json)):
   - Build command: `npm run build`
   - Output directory: `dist`
   - SPA rewrite: all routes -> `/index.html` (so React Router deep links work)
4. Add an **Environment Variable**:

   | Variable | Value |
   | --- | --- |
   | `VITE_API` | `https://<your-render-service>.onrender.com/ebev1` |

   Vite bakes env vars at build time, so set this before the first build (or redeploy after changing it).
5. Deploy. Your app is served at `https://<your-app>.vercel.app`.

## After deploy

- Go to the backend (Render) and set `CORS_ORIGINS` to your Vercel URL, then redeploy the backend, otherwise the browser will block API calls with a CORS error.
- Log in with the admin seeded via the backend's `npm run seed` (see the backend `DEPLOYMENT.md`).

## Local development

```bash
npm install
# .env: VITE_API=http://localhost:5000/ebev1  (see .env.example)
npm run dev
```
