#!/bin/bash
# GHL Token Refresh using Shelley's browser tools
# This script coordinates the refresh process

set -e

GHL_DIR="/home/exedev/ghl-automation"
CONFIG_DIR="$GHL_DIR/config"

echo "=== GHL Token Refresh ==="
echo "Time: $(date)"

# 1. First refresh Gmail token
echo "1. Refreshing Gmail OAuth token..."
source "$GHL_DIR/.env"

NEW_GMAIL=$(curl -s -X POST https://oauth2.googleapis.com/token \
  -d "client_id=$GOOGLE_CLIENT_ID" \
  -d "client_secret=$GOOGLE_CLIENT_SECRET" \
  -d "refresh_token=$(jq -r '.refresh_token' $CONFIG_DIR/gmail-tokens.json)" \
  -d "grant_type=refresh_token")

if echo "$NEW_GMAIL" | jq -e '.access_token' > /dev/null 2>&1; then
  jq --argjson new "$NEW_GMAIL" \
     --arg now "$(date +%s)" \
     '. + {access_token: $new.access_token, expires_in: $new.expires_in, refreshed_at: ($now | tonumber)}' \
     "$CONFIG_DIR/gmail-tokens.json" > /tmp/gmail-tokens.json && mv /tmp/gmail-tokens.json "$CONFIG_DIR/gmail-tokens.json"
  echo "   Gmail token refreshed!"
else
  echo "   ERROR: Failed to refresh Gmail token"
  echo "   $NEW_GMAIL"
  exit 1
fi

# 2. Check current GHL token status
echo "2. Checking GHL token status..."
STATUS=$(curl -s http://localhost:8001/api/status)
VALID=$(echo "$STATUS" | jq -r '.token.valid')
REMAINING=$(echo "$STATUS" | jq -r '.token.remaining')

if [ "$VALID" = "true" ] && [ "$REMAINING" -gt 300 ]; then
  echo "   GHL token still valid (${REMAINING}s remaining)"
  echo "   Skipping refresh."
  exit 0
fi

echo "   GHL token needs refresh (valid=$VALID, remaining=$REMAINING)"

# 3. The actual browser login needs to be done via Shelley's browser tools
# This script just prepares everything
echo "3. GHL token refresh requires browser automation."
echo "   Use Shelley to:
   - Navigate to https://app.jointheapex.com/
   - Login with credentials from .env
   - Complete OTP verification
   - Extract m_a cookie and save to $CONFIG_DIR/ghl-client-token.json"

echo ""
echo "=== Manual Steps ==="
echo "Email: $GHL_EMAIL"
echo "Password: (see .env)"
echo ""
