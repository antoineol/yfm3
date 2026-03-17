#!/usr/bin/env bash
# Run linters and tests on files changed vs a base branch.
# Usage: verify-changes.sh [--base <branch>]
set -euo pipefail

BASE="new-app"
while [[ $# -gt 0 ]]; do
  case "$1" in
    --base) [[ -z "${2:-}" ]] && { echo "Error: --base requires a branch name" >&2; exit 1; }; BASE="$2"; shift 2 ;;
    *) echo "Unknown option: $1" >&2; exit 1 ;;
  esac
done

PROJECT_ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

# Get changed files vs base
CHANGED=$(git diff --name-only "$BASE"...HEAD 2>/dev/null || git diff --name-only "$BASE" HEAD)

if [[ -z "$CHANGED" ]]; then
  echo "No changed files vs $BASE"
  exit 0
fi

EXIT=0

# Filter file list to those that still exist, return space-separated absolute paths
existing_files() {
  local files="$1" result=""
  while IFS= read -r f; do
    [[ -f "$PROJECT_ROOT/$f" ]] && result="$result $PROJECT_ROOT/$f"
  done <<< "$files"
  echo "$result"
}

RB_FILES=$(echo "$CHANGED" | grep '\.rb$' || true)
SPEC_FILES=$(echo "$CHANGED" | grep '_spec\.rb$' || true)
NEXT_FILES=$(echo "$CHANGED" | grep '^nextjs/' || true)

if [[ -n "$RB_FILES" ]]; then
  echo "=== Rubocop ==="
  bundle exec rubocop || EXIT=1
fi

if [[ -n "$SPEC_FILES" ]]; then
  echo "=== RSpec ==="
  EXISTING=$(existing_files "$SPEC_FILES")
  if [[ -n "$EXISTING" ]]; then bundle exec rspec $EXISTING || EXIT=1; fi
fi

if [[ -n "$NEXT_FILES" ]]; then
  echo "=== Next.js lint ==="
  make -C "$PROJECT_ROOT" next.lint || EXIT=1

  echo "=== Next.js typecheck ==="
  make -C "$PROJECT_ROOT" next.typecheck || EXIT=1
fi

exit $EXIT
