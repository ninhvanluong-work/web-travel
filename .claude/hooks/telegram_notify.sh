#!/bin/bash

# Telegram Notification Hook for Claude Code (Project-Specific)
# This hook sends a notification to Telegram when Claude finishes a task

set -euo pipefail

# Load environment variables with priority: process.env > .claude/.env > .claude/hooks/.env
load_env() {
    # 1. Start with lowest priority: .claude/hooks/.env
    if [[ -f "$(dirname "$0")/.env" ]]; then
        set -a
        source "$(dirname "$0")/.env"
        set +a
    fi

    # 2. Override with .claude/.env
    if [[ -f .claude/.env ]]; then
        set -a
        source .claude/.env
        set +a
    fi

    # 3. Process env (already loaded) has highest priority - no action needed
    # Variables already in process.env will not be overwritten by 'source'
}

load_env

# Read JSON input from stdin
INPUT=$(cat)

# jq replacement using node (cross-platform)
jq_r() { echo "$1" | node -e "try{const d=JSON.parse(require('fs').readFileSync(0,'utf8'));const r=$2;process.stdout.write(String(r??''))}catch(e){process.stdout.write('')}"; }

# Extract relevant information from the hook input
HOOK_TYPE=$(jq_r "$INPUT" "d.hookType||'unknown'")
PROJECT_DIR=$(jq_r "$INPUT" "d.projectDir||''")
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
SESSION_ID=$(jq_r "$INPUT" "d.sessionId||''")
PROJECT_NAME=$(basename "$PROJECT_DIR")

# Configuration - these will be set via environment variables
TELEGRAM_BOT_TOKEN="${TELEGRAM_BOT_TOKEN:-}"
TELEGRAM_CHAT_ID="${TELEGRAM_CHAT_ID:-}"

# Validate required environment variables
if [[ -z "$TELEGRAM_BOT_TOKEN" ]]; then
    echo "Error: TELEGRAM_BOT_TOKEN environment variable not set" >&2
    exit 1
fi

if [[ -z "$TELEGRAM_CHAT_ID" ]]; then
    echo "Error: TELEGRAM_CHAT_ID environment variable not set" >&2
    exit 1
fi

# Function to send Telegram message
send_telegram_message() {
    local message="$1"
    local url="https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage"
    
    # Escape special characters for JSON
    local escaped_message=$(echo "$message" | node -e "const d=require('fs').readFileSync(0,'utf8');process.stdout.write(JSON.stringify(d))")
    
    local payload=$(cat <<EOF
{
    "chat_id": "${TELEGRAM_CHAT_ID}",
    "text": ${escaped_message},
    "parse_mode": "Markdown",
    "disable_web_page_preview": true
}
EOF
)
    
    curl -s -X POST \
        -H "Content-Type: application/json" \
        -d "$payload" \
        "$url" > /dev/null
}

# Generate summary based on hook type
case "$HOOK_TYPE" in
    "Stop")
        # Extract tool usage summary
        TOOLS_USED=$(echo "$INPUT" | node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
const tools=(d.toolsUsed||[]).map(t=>t.tool).filter(Boolean);
process.stdout.write(tools.join('\n'));
" | sort | uniq -c | sort -nr)
        FILES_MODIFIED=$(echo "$INPUT" | node -e "
const d=JSON.parse(require('fs').readFileSync(0,'utf8'));
const files=(d.toolsUsed||[]).filter(t=>['Edit','Write','MultiEdit'].includes(t.tool)).map(t=>t.parameters&&t.parameters.file_path).filter(Boolean);
process.stdout.write([...new Set(files)].join('\n'));
")

        # Count operations
        TOTAL_TOOLS=$(echo "$INPUT" | node -e "const d=JSON.parse(require('fs').readFileSync(0,'utf8'));process.stdout.write(String((d.toolsUsed||[]).length))")
        
        # Build summary message
        MESSAGE="🚀 *DevPocket Task Completed*
        
📅 *Time:* ${TIMESTAMP}
📁 *Project:* ${PROJECT_NAME}
🔧 *Total Operations:* ${TOTAL_TOOLS}
🆔 *Session:* ${SESSION_ID:0:8}...

*Tools Used:*"

        if [[ -n "$TOOLS_USED" ]]; then
            MESSAGE="${MESSAGE}
\`\`\`
${TOOLS_USED}
\`\`\`"
        else
            MESSAGE="${MESSAGE}
None"
        fi

        if [[ -n "$FILES_MODIFIED" ]]; then
            MESSAGE="${MESSAGE}

*Files Modified:*"
            while IFS= read -r file; do
                if [[ -n "$file" ]]; then
                    # Show relative path from project root
                    relative_file=$(echo "$file" | sed "s|^${PROJECT_DIR}/||")
                    MESSAGE="${MESSAGE}
• ${relative_file}"
                fi
            done <<< "$FILES_MODIFIED"
        fi
        
        MESSAGE="${MESSAGE}

📍 *Location:* \`${PROJECT_DIR}\`"
        ;;
        
    "SubagentStop")
        SUBAGENT_TYPE=$(jq_r "$INPUT" "d.subagentType||'unknown'")
        MESSAGE="🤖 *DevPocket Subagent Completed*

📅 *Time:* ${TIMESTAMP}
📁 *Project:* ${PROJECT_NAME}
🔧 *Agent Type:* ${SUBAGENT_TYPE}
🆔 *Session:* ${SESSION_ID:0:8}...

Specialized agent completed its task.

📍 *Location:* \`${PROJECT_DIR}\`"
        ;;
        
    *)
        MESSAGE="📝 *DevPocket Code Event*

📅 *Time:* ${TIMESTAMP}
📁 *Project:* ${PROJECT_NAME}
📋 *Event:* ${HOOK_TYPE}
🆔 *Session:* ${SESSION_ID:0:8}...

📍 *Location:* \`${PROJECT_DIR}\`"
        ;;
esac

# Send the notification
send_telegram_message "$MESSAGE"

# Log the notification (optional)
echo "Telegram notification sent for $HOOK_TYPE event in project $PROJECT_NAME" >&2