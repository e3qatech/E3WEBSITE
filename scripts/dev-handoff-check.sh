#!/usr/bin/env bash
set -e

echo "Starting E3 Website Handoff Check..."

BRANCH=$(git rev-parse --abbrev-ref HEAD)
COMMIT=$(git rev-parse --short HEAD)
TRACKING=$(git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "None")

echo "Current Branch: $BRANCH"
echo "Current Commit: $COMMIT"
echo "Tracking Branch: $TRACKING"

if [ "$TRACKING" = "None" ]; then
  echo "ERROR: Branch has no upstream. Please push your branch before handoff."
  exit 1
fi

if ! git diff-index --quiet HEAD --; then
  echo "ERROR: Working tree is dirty. Untracked or modified files exist."
  git status --short
  exit 1
fi

UNTRACKED=$(git ls-files --others --exclude-standard)
if [ -n "$UNTRACKED" ]; then
  echo "ERROR: Untracked files exist. Please commit or ignore them:"
  echo "$UNTRACKED"
  exit 1
fi

BEHIND=$(git rev-list --count HEAD..@{u} 2>/dev/null || echo "0")
AHEAD=$(git rev-list --count @{u}..HEAD 2>/dev/null || echo "0")

echo "Commits Behind: $BEHIND"
echo "Commits Ahead: $AHEAD"

if [ "$AHEAD" -gt 0 ]; then
  echo "ERROR: You have $AHEAD unpushed commits. Please push to origin before handoff."
  exit 1
fi

# Check for temporary files
if ls eslint-results*.json 1> /dev/null 2>&1 || ls lint-results*.json 1> /dev/null 2>&1; then
  echo "ERROR: Temporary lint reports found. Please delete them before handoff."
  exit 1
fi

echo "Handoff check passed successfully! Safe to switch devices."
