#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
printf '\n  LAUNCHPAD — FIREBASE CONTROL PANEL v3\n\n'
if ! command -v node >/dev/null 2>&1; then
  echo 'ERROR: Node.js 20+ is required. See https://nodejs.org/'
  exit 1
fi
if [ ! -f node_modules/firebase-tools/package.json ] || [ ! -f node_modules/express/package.json ]; then
  echo 'First-time setup: installing dashboard and the bundled Firebase CLI...'
  npm install --no-audit --no-fund
fi
echo 'Firebase CLI is project-local; no global firebase command is required.'
echo 'Open http://127.0.0.1:4183 in your browser.'
echo 'Use Settings -> Alternative code login on macOS/Linux.'
echo 'Keep the server running for background deployment jobs.'
node server/index.js
