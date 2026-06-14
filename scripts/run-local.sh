#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${REPO_ROOT}"

if ! command -v pnpm >/dev/null 2>&1; then
  echo "Error: pnpm is required but not installed." >&2
  echo "Install pnpm: https://pnpm.io/installation" >&2
  exit 1
fi

if [[ ! -d "node_modules" ]]; then
  echo "Installing dependencies with pnpm..."
  pnpm install
fi

HOST="${HOST:-127.0.0.1}"
PORT="${PORT:-4321}"

echo "Starting Astro dev server..."
echo "URL: http://${HOST}:${PORT}"

echo "Tip: set HOST=0.0.0.0 to access from other devices on your network."

exec pnpm dev --host "${HOST}" --port "${PORT}" "$@"
