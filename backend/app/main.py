"""FastAPI application entrypoint."""
from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import organize, rules, scan

app = FastAPI(
    title="File Organizer API",
    description="Local filesystem organization backend.",
    version="1.0.0",
)

# The frontend dev server (Vite) runs on a different port; this API is
# meant to be used locally, so a permissive local CORS policy is fine.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(scan.router)
app.include_router(organize.router)
app.include_router(rules.router)


@app.get("/api/health")
def health() -> dict:
    return {"status": "ok"}
