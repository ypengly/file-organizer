# File Organizer — Backend

FastAPI service that performs the real filesystem work: scanning a folder,
building an organization preview, executing it, and undoing the last run.
No database — state (previews, undo history, custom rules) lives in
memory for the life of the process.

## Setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

## Run (development)

```bash
uvicorn app.main:app --reload --port 8000
```

The API is now at `http://127.0.0.1:8000`. Interactive docs at
`http://127.0.0.1:8000/docs`.

## Run (production)

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --workers 2
```

Since state is in-memory, stick to a single worker if you rely on
undo across requests, or put a process manager in front that keeps one
long-lived instance.

## Tests

```bash
PYTHONPATH=. pytest tests/ -v
```

## Endpoints

| Method | Path              | Purpose                                   |
|--------|-------------------|--------------------------------------------|
| POST   | /api/scan         | Inspect a folder: counts, size, types      |
| POST   | /api/preview      | Build a move plan — never touches disk     |
| POST   | /api/organize     | Execute a previously built preview         |
| POST   | /api/undo         | Reverse the most recent organize run       |
| GET    | /api/statistics   | Stats from the last organize run           |
| GET    | /api/rules        | List custom rules                          |
| POST   | /api/rules        | Create a custom rule                       |
| PATCH  | /api/rules/{id}   | Update a rule (incl. enable/disable, priority) |
| DELETE | /api/rules/{id}   | Delete a rule                              |
| GET    | /api/health       | Liveness check                             |

## Safety model

All filesystem access goes through `app/utils/filesystem.py`:

- Refuses to scan or organize OS/system directories.
- Resolves every path with `Path.resolve(strict=True)` and rejects
  anything that doesn't exist.
- Every planned destination is checked with `ensure_within_root` before
  a move happens, closing off path traversal via crafted filenames or
  rule targets.
- Symlinks that point outside the scanned root are skipped, never
  followed.
- Files are only ever moved (`shutil.move`), never opened, read for
  content, or executed.
- Preview and organize are two separate steps — `execute_organize`
  only accepts a `preview_id` produced by a prior `/api/preview` call,
  so nothing moves without a preview existing first.
- Duplicate destinations are never silently overwritten; `shutil.move`
  onto an existing path is only reached when the caller explicitly
  chose the "replace" strategy for that preview.
- Partial failures (permission errors, locked files, a source that
  disappeared) are caught per-file and reported back, instead of
  aborting or crashing the whole run.
