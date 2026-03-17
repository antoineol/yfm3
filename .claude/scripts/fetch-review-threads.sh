#!/usr/bin/env bash
# Fetch unresolved PR review threads via GraphQL.
# Usage: fetch-review-threads.sh <branch-or-pr> [--skip-autofix]
#   --skip-autofix: exclude threads whose last comment is an autofix reply
set -euo pipefail

SKIP_AUTOFIX=false
ARG=""
for a in "$@"; do
  case "$a" in
    --skip-autofix) SKIP_AUTOFIX=true ;;
    *) ARG="$a" ;;
  esac
done

PR_NUM=$(gh pr view "$ARG" --json number --jq .number 2>/dev/null) || { echo "No PR found" >&2; exit 1; }
OWNER=$(gh repo view --json owner --jq .owner.login) || { echo "Failed to get repo owner" >&2; exit 1; }
REPO=$(gh repo view --json name --jq .name) || { echo "Failed to get repo name" >&2; exit 1; }

TMPF=$(mktemp)
trap 'rm -f "$TMPF"' EXIT

cat > "$TMPF" <<EOF
{"query":"query(\$owner:String!,\$repo:String!,\$prNum:Int!){repository(owner:\$owner,name:\$repo){pullRequest(number:\$prNum){reviewThreads(first:100){nodes{isResolved id comments(first:10){nodes{body author{login}path line originalLine}}}}}}}","variables":{"owner":"$OWNER","repo":"$REPO","prNum":$PR_NUM}}
EOF

SKIP_FILTER=""
if $SKIP_AUTOFIX; then
  SKIP_FILTER='| select(.comments.nodes | last | .body | contains("<!-- autofix-bot -->") | not)'
fi

gh api graphql --input "$TMPF" --jq "
  .data.repository.pullRequest.reviewThreads.nodes[]
  | select(.isResolved == false)
  $SKIP_FILTER
  | \"--- thread_id: \" + .id,
    (.comments.nodes[]
     | \"author: \" + .author.login + \" | file: \" + .path + \":\" + ((.line // .originalLine) | tostring),
       .body),
    \"\""
