# AgriTrust

Hackathon demo app for Build@HUB Hackathon 2026.

## Stack

- Vite
- React 18
- TypeScript
- React Router
- Vercel for frontend hosting
- Supabase for backend storage
- Zustand
- Tailwind CSS
- Recharts
- QRCode React
- Framer Motion
- Lucide React
- GitHub Actions for CI/CD

## Run

1. Install Node.js 20+.
2. Open the project in a normal local folder.
3. Install dependencies:

```bash
npm install
```

4. Copy the environment template:

```bash
cp .env.example .env.local
```

5. Fill in these values:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

6. Start the app:

```bash
npm run dev
```

7. Build for production:

```bash
npm run build
```

## Supabase Setup

1. Create a Supabase project.
2. In the Supabase SQL editor, run [schema.sql](file:///Users/bennguyen/Library/Application%20Support/TRAE%20SOLO/ModularData/ai-agent/work-mode-projects/6a8028179aa7933d6e39a200/supabase/schema.sql).
3. Copy your project URL and anon key into `.env.local`.

The app now uses Supabase for:

- `deployment_heartbeats` on app boot
- `ledger_events` when scans, pump actions, and sales are logged
- `notifications` when important demo events are triggered
- `demo_state` when core demo state changes

If the Supabase env vars are missing, the app still runs as an offline demo.

## Vercel Setup

1. Create a Vercel project and link it to this repository.
2. Keep the framework as Vite.
3. The repo already includes [vercel.json](file:///Users/bennguyen/Library/Application%20Support/TRAE%20SOLO/ModularData/ai-agent/work-mode-projects/6a8028179aa7933d6e39a200/vercel.json).

## GitHub Actions Secrets

Add these repository secrets in GitHub:

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

The workflow is defined in [vercel-deploy.yml](file:///Users/bennguyen/Library/Application%20Support/TRAE%20SOLO/ModularData/ai-agent/work-mode-projects/6a8028179aa7933d6e39a200/.github/workflows/vercel-deploy.yml).

Behavior:

- Pull requests deploy a Vercel preview build
- Pushes to `main` deploy production
- Supabase values are injected from GitHub secrets during the build

## Recommended Flow

1. Develop locally with `.env.local`
2. Push to a feature branch for Vercel preview deployment
3. Merge to `main` for production deployment

## Important Note

In this hosted environment, `npm install` failed when the project lived inside a very long macOS path with spaces because `esbuild` could not spawn correctly there. The code itself was verified by copying the repo to a short temp path and running a successful production build there.

If you see a similar `esbuild` spawn error locally, move the repo to a shorter path without spaces and run `npm install` again.
