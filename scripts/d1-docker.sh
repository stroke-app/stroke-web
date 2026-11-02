#!/usr/bin/env bash
# Snapshot the local D1 database and serve it from Docker: over libSQL, and as
# a plain SQLite file with a browser UI.
set -euo pipefail
cd "$(dirname "$0")/.."

pnpm migrate:local
src=$(find .wrangler/state/v3/d1/miniflare-D1DatabaseObject -name '*.sqlite' ! -name metadata.sqlite | head -n1)
mkdir -p .wrangler/docker/sqlite
# .backup rather than cp: it reads through the WAL, so a running `pnpm dev`
# can't hand over a half-written copy.
sqlite3 "$src" ".backup .wrangler/docker/d1.sqlite"
sqlite3 "$src" ".backup .wrangler/docker/sqlite/stroke-web.sqlite"
docker compose up -d --force-recreate
echo "libSQL: http://127.0.0.1:58090"
echo "SQLite: $PWD/.wrangler/docker/sqlite/stroke-web.sqlite (browser UI: http://127.0.0.1:58091)"
