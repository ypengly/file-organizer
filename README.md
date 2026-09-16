# File Organizer

A desktop-style file organization utility with a Python backend that
does the real filesystem work, and a React dashboard on top. Scans a
folder, shows exactly what will move where, and only touches disk once
you confirm.

```
file-organizer/
├── backend/     FastAPI service — scanning, organizing, undo, rules
└── frontend/    React + TypeScript + Tailwind dashboard
```

## Quick start

Two terminals — the backend needs to be running for the frontend to do
anything.

**Terminal 1 — backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Terminal 2 — frontend**

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`, paste in a folder path (e.g.
`/Users/you/Downloads`), and hit Scan.

Full setup, production build, and API details are in each folder's own
README (`backend/README.md`, `frontend/README.md`).

## How it works

1. **Scan** — point it at a folder; the backend reports file counts,
   total size, and a breakdown by type.
2. **Choose a mode** — By Type, By Date (modified or created), or your
   own Custom Rules, plus how to handle name collisions (rename, skip,
   ask, or replace-with-confirmation).
3. **Preview** — every proposed move is listed before anything happens.
   Nothing is written to disk at this stage.
4. **Organize** — confirm, and the backend executes the plan and
   reports real statistics (files organized, folders created, space
   processed, skipped, duplicates, time taken, and any failures).
5. **Undo** — one click reverses the moves from the run you just did.

## Safety

- Files are only ever moved, never deleted, modified, or executed.
- A destination that already has a same-named file is never silently
  overwritten.
- Every path is validated before use — no path traversal, no operating
  on system directories, no following symlinks out of the scanned tree.
- Preview and execute are separate API calls by design.

See `backend/README.md` for the full breakdown of what's enforced
where.

## Tech stack

- **Backend:** Python, FastAPI, pathlib/os/shutil, Pydantic — no database
- **Frontend:** React, TypeScript, Tailwind CSS, Vite
