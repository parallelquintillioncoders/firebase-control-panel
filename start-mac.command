#!/usr/bin/env bash
set -e

# Change directory to project root (required for macOS Finder double-click)
cd "$(dirname "$0")"

# Support Apple Silicon (Homebrew), Intel Mac Homebrew, NVM, and standard paths
export PATH="/opt/homebrew/bin:/usr/local/bin:$HOME/.nvm/versions/node/$(ls "$HOME/.nvm/versions/node" 2>/dev/null | tail -n 1)/bin:$PATH"

printf '\n  ====================================================\n'
printf '       LAUNCHPAD FIREBASE CONTROL PANEL v4 (macOS)\n'
printf '  ====================================================\n\n'

if ! command -v node >/dev/null 2>&1; then
  echo "ERROR: Node.js 20+ is required. Install from https://nodejs.org/ or run 'brew install node'"
  echo ""
  read -p "Press [Enter] to exit..."
  exit 1
fi

if [ ! -f "node_modules/firebase-tools/package.json" ] || [ ! -f "node_modules/express/package.json" ]; then
  echo "First-time setup: installing dashboard and bundled Firebase CLI..."
  echo "Internet is needed for this first installation only."
  npm install --no-audit --no-fund
  if [ $? -ne 0 ]; then
    echo "ERROR: npm install failed. Check your internet connection and retry."
    read -p "Press [Enter] to exit..."
    exit 1
  fi
fi

echo "Firebase CLI is installed inside this project. No global PATH needed."
echo ""
echo "Dashboard: http://127.0.0.1:4183"
echo "Keep this Terminal window open for background deployments."
echo ""

export LAUNCHPAD_AUTO_OPEN=1

node server/index.js || {
  echo ""
  echo "Dashboard server stopped with an error."
  read -p "Press [Enter] to exit..."
}
