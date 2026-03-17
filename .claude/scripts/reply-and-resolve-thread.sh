#!/usr/bin/env bash
# Reply to a PR review thread. Auto-resolves bot-authored threads.
# Usage: reply-and-resolve-thread.sh <thread_id> <body> [<pr>] [--no-resolve]
set -euo pipefail

THREAD_ID="${1:?Usage: reply-and-resolve-thread.sh <thread_id> <body> [<pr>] [--no-resolve]}"
BODY="${2:?Usage: reply-and-resolve-thread.sh <thread_id> <body> [<pr>] [--no-resolve]}"
ARG="${3:-}"
[[ "$ARG" == "--no-resolve" ]] && { NO_RESOLVE=true; ARG=""; } || NO_RESOLVE=false
[[ "${4:-}" == "--no-resolve" ]] && NO_RESOLVE=true

is_bot() { [[ "$1" == *"[bot]"* || "$1" == "github-actions" || "$1" == "cursor" || "$1" == "coderabbitai" ]]; }

# --- Submit pending review (no-op if none) ---
PR_NUM=$(gh pr view $ARG --json number --jq .number 2>/dev/null) || { echo "No PR found" >&2; exit 1; }
OWNER=$(gh repo view --json owner --jq .owner.login) || { echo "Failed to get repo owner" >&2; exit 1; }
REPO=$(gh repo view --json name --jq .name) || { echo "Failed to get repo name" >&2; exit 1; }

ME=$(gh api user --jq .login) || { echo "Failed to get current user" >&2; exit 1; }

PENDING_ID=$(gh api "repos/$OWNER/$REPO/pulls/$PR_NUM/reviews" \
  --jq "[.[] | select(.state == \"PENDING\" and .user.login == \"$ME\")] | first | .id // empty")

if [[ -n "$PENDING_ID" ]]; then
  gh api "repos/$OWNER/$REPO/pulls/$PR_NUM/reviews/$PENDING_ID/events" \
    -f event=COMMENT --jq '.state' \
    || { echo "Failed to submit pending review $PENDING_ID" >&2; exit 1; }
fi

# --- Reply to thread ---
TMPF=$(mktemp)
trap 'rm -f "$TMPF"' EXIT

ESCAPED_BODY=$(printf '%s' "$BODY" | sed 's/\\/\\\\/g; s/"/\\"/g; s/\t/\\t/g' | sed ':a;N;$!ba;s/\n/\\n/g')

cat > "$TMPF" <<EOF
{"query":"mutation(\$threadId:ID!,\$body:String!){addPullRequestReviewThreadReply(input:{pullRequestReviewThreadId:\$threadId,body:\$body}){comment{id}}}","variables":{"threadId":"$THREAD_ID","body":"$ESCAPED_BODY"}}
EOF

gh api graphql --input "$TMPF" --jq '.data.addPullRequestReviewThreadReply.comment.id' \
  || { echo "Failed to reply to thread $THREAD_ID" >&2; exit 1; }

# --- Resolve bot-authored threads (unless --no-resolve) ---
if [[ "$NO_RESOLVE" == false ]]; then
  cat > "$TMPF" <<EOF
{"query":"query(\$id:ID!){node(id:\$id){... on PullRequestReviewThread{comments(first:1){nodes{author{login}}}}}}","variables":{"id":"$THREAD_ID"}}
EOF
  AUTHOR=$(gh api graphql --input "$TMPF" --jq '.data.node.comments.nodes[0].author.login // empty') || AUTHOR=""

  if is_bot "$AUTHOR"; then
    cat > "$TMPF" <<EOF
{"query":"mutation(\$id:ID!){resolveReviewThread(input:{threadId:\$id}){thread{isResolved}}}","variables":{"id":"$THREAD_ID"}}
EOF
    gh api graphql --input "$TMPF" --jq '.data.resolveReviewThread.thread.isResolved' \
      || { echo "Failed to resolve thread $THREAD_ID" >&2; exit 1; }
  fi
fi
