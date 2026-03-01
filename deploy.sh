#!/usr/bin/env bash
# deploy.sh — Generate and deploy the site to GitHub Pages
#
# Usage:
#   bash deploy.sh                  # uses theme defined in config.yml
#   bash deploy.sh sweet            # override theme
#   bash deploy.sh dia_das_mulheres # deploy seasonal theme

set -euo pipefail

THEME="${1:-}"
PYTHON=".venv/bin/python"
CONFIG="config.yml"
OUTPUT="docs"

# ── Check virtual environment ──────────────────────────────────────────────
if [ ! -f "$PYTHON" ]; then
  echo "❌  Virtual environment not found. Run: python -m venv .venv && pip install -r requirements.txt"
  exit 1
fi

# ── Generate site ──────────────────────────────────────────────────────────
echo "🔨 Generating site..."
if [ -n "$THEME" ]; then
  $PYTHON generate_site.py --theme "$THEME" --output "$OUTPUT"
else
  $PYTHON generate_site.py --output "$OUTPUT"
fi

# ── Git commit & push ──────────────────────────────────────────────────────
BRANCH=$(git rev-parse --abbrev-ref HEAD)
LABEL="${THEME:-$(grep '^theme:' $CONFIG | awk '{print $2}' | tr -d '"')}"

echo "📦 Committing docs/..."
git add docs/
if git diff --cached --quiet; then
  echo "✅  No changes to deploy."
else
  git commit -m "chore: deploy theme '${LABEL}'"
  echo "🚀 Pushing to ${BRANCH}..."
  git push
  echo "✅  Done! Site will be live at: $(grep 'siteUrl' $CONFIG | awk '{print $2}' | tr -d '"')"
fi
