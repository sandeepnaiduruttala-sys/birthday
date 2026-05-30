#!/usr/bin/env bash
set -euo pipefail

# Serve index.html publicly on port 8080
# Usage: ./serve.sh

PORT="${PORT:-8080}"
HOST="${HOST:-0.0.0.0}"

# Prefer python3
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT" --bind "$HOST"
fi

# Fallback to python
if command -v python >/dev/null 2>&1; then
  exec python -m http.server "$PORT" --bind "$HOST"
fi

echo "Python not found. Please install python3." >&2
exit 1

