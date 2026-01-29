#!/bin/bash
#
# Slack PR Notification Script
# Sends notifications to the 개발 channel when PRs are created or pushed
#
# Usage:
#   ./notify-slack-pr.sh <event_type>
#
# Event types:
#   - pr_created: PR was just created
#   - push: Code was pushed to remote
#
# Environment variables:
#   - SLACK_CHANNEL: Channel name (default: 개발)

set -e

EVENT_TYPE="${1:-unknown}"
SLACK_CHANNEL="${SLACK_CHANNEL:-개발}"

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "unknown")

# Get author name
AUTHOR=$(git config user.name 2>/dev/null || echo "Unknown")

# Get PR details if available
PR_URL=$(gh pr view --json url -q .url 2>/dev/null || echo "")
PR_TITLE=$(gh pr view --json title -q .title 2>/dev/null || echo "")
PR_BODY=$(gh pr view --json body -q .body 2>/dev/null || echo "")
PR_NUMBER=$(gh pr view --json number -q .number 2>/dev/null || echo "")

# Build message based on event type
case "$EVENT_TYPE" in
  pr_created)
    if [ -n "$PR_URL" ] && [ -n "$PR_TITLE" ]; then
      MESSAGE="🔀 *새로운 PR 생성됨* #$PR_NUMBER\n\n*$PR_TITLE*\n\n📝 *Branch:* \`$BRANCH\`\n👤 *Author:* $AUTHOR\n\n━━━━━━━━━━━━━━━━━━━━\n\n$PR_BODY\n\n━━━━━━━━━━━━━━━━━━━━\n\n🔗 <$PR_URL|PR 보기>\n\n_🤖 Generated with Claude Code_"
    else
      MESSAGE="🔀 *새로운 PR 생성됨*\n📝 *Branch:* \`$BRANCH\`\n👤 *Author:* $AUTHOR\n\n_🤖 Generated with Claude Code_"
    fi
    ;;

  push)
    if [ -n "$PR_URL" ] && [ -n "$PR_TITLE" ]; then
      MESSAGE="⬆️ *코드 푸시됨* PR #$PR_NUMBER\n\n*$PR_TITLE*\n\n📝 *Branch:* \`$BRANCH\`\n👤 *Author:* $AUTHOR\n\n━━━━━━━━━━━━━━━━━━━━\n\n$PR_BODY\n\n━━━━━━━━━━━━━━━━━━━━\n\n🔗 <$PR_URL|PR 보기>\n\n_🤖 Generated with Claude Code_"
    else
      # No PR associated, just show push info
      COMMIT_MSG=$(git log -1 --pretty=format:"%s" 2>/dev/null || echo "No commit message")
      MESSAGE="⬆️ *코드 푸시됨*\n📝 *Branch:* \`$BRANCH\`\n👤 *Author:* $AUTHOR\n💬 *Message:* $COMMIT_MSG\n\n_🤖 Generated with Claude Code_"
    fi
    ;;

  *)
    MESSAGE="📢 *Git 활동*\n📝 *Branch:* \`$BRANCH\`\n👤 *Author:* $AUTHOR\n\n_🤖 Generated with Claude Code_"
    ;;
esac

# Send to Slack via Claude Code with MCP
# This will be executed by Claude Code which has access to Slack MCP
echo "[Slack] Sending notification to #$SLACK_CHANNEL: $EVENT_TYPE"
echo "[Slack] Channel: $SLACK_CHANNEL"

# Output structured data for Claude Code to parse and send via Slack MCP
cat <<EOF
{
  "channel": "$SLACK_CHANNEL",
  "message": "$MESSAGE",
  "event_type": "$EVENT_TYPE",
  "branch": "$BRANCH",
  "author": "$AUTHOR",
  "pr_url": "$PR_URL"
}
EOF

exit 0
