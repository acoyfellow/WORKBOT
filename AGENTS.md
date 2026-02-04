## Available Services & Credentials

Check these locations for available API keys and credentials:

```bash
# Primary credential store
cat ~/ghl-automation/.env | grep -E "(TOKEN|KEY|SECRET|ID)" | sed 's/=.*/=***/'
```

**Known available services:**
- Cloudflare (limited permissions - no DNS edit on some zones)
- GitHub (ghp_ token - check if current)
- GHL API (private API with m_a cookie auth, expires hourly)
- Gmail OAuth (for OTP fetching during GHL login)
- Deja API
- Mailgun
- Twilio

---

## Git Commit Guidelines

- All commits must be authored by: Jordan Coeyman <coeyman@gmail.com>
- Do NOT add co-authored-by lines
- Do NOT use default VM user (exedev@workbot.exe.xyz)
- Git config is set globally, but verify before pushing

```bash
git config --global user.name "Jordan Coeyman"
git config --global user.email "coeyman@gmail.com"
```

---

## GHL Token Refresh Process

Token expires every ~1 hour. To refresh:

1. Refresh Gmail OAuth token:
```bash
cd ~/ghl-automation && source .env
curl -s -X POST https://oauth2.googleapis.com/token \
  -d "client_id=$GOOGLE_CLIENT_ID" \
  -d "client_secret=$GOOGLE_CLIENT_SECRET" \
  -d "refresh_token=$(jq -r '.refresh_token' config/gmail-tokens.json)" \
  -d "grant_type=refresh_token" | jq -r '.access_token'
```

2. Browser login to https://app.jointheapex.com/
3. Credentials: jordan@sendgrowth.com / QNoumenonI9!
4. Fetch OTP from Gmail API
5. Extract m_a cookie after login
6. Save to config/ghl-client-token.json with expires_at

---

## Project Architecture

```
workbot (SvelteKit)          ghl-automation (Express)
     :8000                         :8001
        |                            |
        +-- /api/ghl/* proxy ------> /api/*
        |                            |
        |                     SQLite (workbot.db)
        |                            |
        +-- Leaderboard UI           +-- /api/leaderboard/apps-tracked
        +-- Chat UI                  +-- /api/sync/app-submissions
        +-- All data pages           +-- GHL private API calls
```

---

## Key Database Tables (ghl-automation)

- `app_submissions` - Tracks when opps enter "App Submitted" stages
- `activities` - User activity log (notes, tasks, calls)
- `contacts` - Cached contact data
- `opportunities` - Cached opportunity data
- `users` - User info by location

---

## Leaderboard Logic

**Apps** = Opportunities that entered "Personal App Submitted" stages (tracked via sync)
**Leads** = New contacts assigned to user in date range

Stage IDs for Closer Capital:
- Kevin's Pipeline: `036331fd-6772-4086-84ab-1303de7e4f8e`
- Job Flow: `c7fa45d8-a0e1-46b2-abc8-ee92448bc92d`
- Outside Sales Job Flow: `6b3a2a2c-6d33-44ae-a453-b461f5aa48da`
