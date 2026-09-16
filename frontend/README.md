# File Organizer — Frontend

React + TypeScript + Tailwind dashboard for the File Organizer backend.

## Setup

```bash
cd frontend
npm install
```

## Development

```bash
npm run dev
```

Opens at `http://localhost:5173`. API calls to `/api/*` are proxied to
`http://127.0.0.1:8000` (see `vite.config.ts`), so run the backend
alongside it.

## Production build

```bash
npm run build
```

Outputs static files to `dist/`. Serve them with any static file host
and point it at your deployed backend (adjust `vite.config.ts`'s proxy
target, or set up your host's reverse proxy, so `/api` reaches the
FastAPI service).

```bash
npm run preview   # sanity-check the production build locally
```

## Structure

```text
src/
├── api/client.ts        typed fetch wrapper for every backend endpoint
├── components/           FolderSelect, StatsBar, ModeSelector,
│                          PreviewTable, ActionBar, ResultsSummary,
│                          RulesPanel, ConfirmDialog, Toast, Icon, …
├── types.ts               shared TS types mirroring the backend models
├── utils.ts                formatting + category color helpers
└── App.tsx                 page flow: scan → preview → organize → undo
```
