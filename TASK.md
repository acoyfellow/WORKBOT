# Current Task: Phase 1 - Foundation

## Goal
Get the basic app running with:
1. Simple password auth (hardcoded pw, cookie-based)
2. Layout with responsive sidebar
3. Location selector (stored in state)
4. Dashboard page with placeholder stats

## Password Gate Requirements
- Single hardcoded password (e.g., "workbot2026")
- On first visit, show login form
- On correct password, set cookie `workbot_auth=1` (or signed value)
- Check cookie in hooks.server.ts
- If not authed, redirect to /login

## Reference Files
- HTML prototype: ~/ghl-automation/public/index.html
- Remote functions example: src/routes/data.remote.ts

## Files to Create/Modify

### 1. src/routes/login/+page.svelte
Simple login form with password input

### 2. src/hooks.server.ts  
Check auth cookie, redirect to /login if missing

### 3. src/routes/+layout.svelte
- Responsive sidebar (hidden on mobile, toggle button)
- Header with location selector
- Main content area

### 4. src/lib/stores/location.svelte.ts
Svelte 5 rune-based store for selected location

### 5. src/routes/+page.svelte
Dashboard with stats cards (placeholder data for now)

## Locations Data
```typescript
const LOCATIONS = [
  { id: 'gDtFIBrCnempxaF6emIs', name: 'Phonesites' },
  { id: 'OG4bIh7relMcYLo9Izfi', name: 'Apex Business' },
  { id: 'U7eJ93D9PN7tH01uiIMl', name: 'Closer Capital' },
  { id: 'OgoxaWFBx9k18Sker7XM', name: 'MedSpa Millions' },
  { id: 'dkzsEb9htVMJzjuxLb51', name: 'SignedSeal' },
];
```

## Styling
- Dark theme (bg-gray-900, text-gray-100)
- Tailwind CSS (already included)
- Match the look of the HTML prototype

## Success Criteria
- `bun run dev` starts the app
- Visiting / redirects to /login if not authed
- Entering correct password sets cookie and shows dashboard
- Sidebar works on mobile (hamburger toggle)
- Location dropdown changes selected location
- Dashboard shows placeholder stats cards

## DONE when
All success criteria met. Then HANDOFF for Phase 2.

---

## Token Refresh Process

The GHL API requires a token that expires every ~1 hour. To refresh:

### Automatic (via Shelley)
1. Gmail OAuth token refresh is automatic (uses refresh_token)
2. GHL token requires browser automation:
   - Navigate to https://app.jointheapex.com/
   - Login with credentials from ~/ghl-automation/.env
   - Complete OTP (code arrives via email, fetch from Gmail API)
   - Extract `m_a` cookie from browser
   - Save to ~/ghl-automation/config/ghl-client-token.json

### Files
- Gmail tokens: ~/ghl-automation/config/gmail-tokens.json
- GHL token: ~/ghl-automation/config/ghl-client-token.json
- Credentials: ~/ghl-automation/.env (GHL_EMAIL, GHL_PASSWORD)

### Quick Gmail Token Refresh
```bash
source ~/ghl-automation/.env
curl -s -X POST https://oauth2.googleapis.com/token \
  -d "client_id=$GOOGLE_CLIENT_ID" \
  -d "client_secret=$GOOGLE_CLIENT_SECRET" \
  -d "refresh_token=$(jq -r '.refresh_token' ~/ghl-automation/config/gmail-tokens.json)" \
  -d "grant_type=refresh_token"
```
