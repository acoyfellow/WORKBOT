# Workbot - GHL Dashboard

A SvelteKit dashboard for managing GoHighLevel (GHL) locations, contacts, pipelines, and workflows.

## Current Status: Phase 1 Complete ✅

**Live:** https://workbot.exe.xyz:8000/

### What's Working
- ✅ Password authentication (cookie-based)
- ✅ Responsive sidebar with mobile hamburger toggle
- ✅ Location selector (5 GHL locations)
- ✅ Dashboard with token status and refresh button
- ✅ Contacts page with search
- ✅ Conversations page
- ✅ Pipelines page with stages
- ✅ Workflows page with status badges
- ✅ Activities page with filters
- ✅ Server-side API proxy (fixes CORS)
- ✅ 18 Playwright e2e tests passing
- ✅ GHL token refresh via browser automation

---

## Phase 2: Real-time & Enhanced Features

### 2.1 Live Dashboard Stats
- [ ] Fetch real counts from GHL API on dashboard
- [ ] Add loading states and error handling
- [ ] Cache stats with TTL

### 2.2 Contact Management
- [ ] Contact detail view
- [ ] Edit contact fields
- [ ] Add/remove tags
- [ ] View contact timeline

### 2.3 Pipeline Views
- [ ] Kanban board view for pipelines
- [ ] Drag-drop opportunity between stages
- [ ] Opportunity detail modal

### 2.4 Activity Stream
- [ ] Real-time activity feed (WebSocket)
- [ ] Activity notifications
- [ ] Filter by user/type

---

## Phase 3: Automation & Reports

### 3.1 Scheduled Reports
- [ ] Configure email reports (daily/weekly)
- [ ] New contacts report
- [ ] Pipeline summary report
- [ ] Activity digest

### 3.2 Bulk Operations
- [ ] Bulk tag contacts
- [ ] Bulk move pipeline stages
- [ ] Export to CSV

### 3.3 Team Audit
- [ ] Rep activity metrics
- [ ] Response time tracking
- [ ] Red flag detection

---

## Phase 4: Gamification & Leaderboard

### 4.1 Points System
- [ ] Points for calls, emails, appointments
- [ ] Daily/weekly streaks
- [ ] Achievement badges

### 4.2 Leaderboard
- [ ] Team rankings
- [ ] Historical trends
- [ ] Competition mode

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Browser                               │
│  https://workbot.exe.xyz:8000/                          │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│              Workbot (SvelteKit)                        │
│  - Password auth                                         │
│  - API proxy (/api/ghl/*)                               │
│  - Server-side rendering                                │
│  Port: 8000                                             │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│           GHL Automation Backend                         │
│  - GHL API client (private API)                         │
│  - Token management                                      │
│  - Activity sync                                         │
│  - Scheduled tasks                                       │
│  Port: 8001                                             │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│              GoHighLevel API                             │
│  backend.leadconnectorhq.com                            │
└─────────────────────────────────────────────────────────┘
```

## Tech Stack

- **Frontend:** SvelteKit 2, Svelte 5 (runes), Tailwind CSS 4
- **Backend:** Node.js, Express (GHL automation server)
- **Testing:** Playwright e2e
- **Deployment:** exe.dev VM, systemd services
- **Auth:** Simple password + cookie (workbot), GHL private API token

## Key Files

```
workbot/
├── src/
│   ├── lib/
│   │   ├── api.ts              # GHL API client
│   │   └── stores/location.svelte.ts
│   ├── routes/
│   │   ├── +layout.svelte      # Main layout with sidebar
│   │   ├── +page.svelte        # Dashboard
│   │   ├── login/              # Auth
│   │   ├── contacts/
│   │   ├── conversations/
│   │   ├── pipelines/
│   │   ├── workflows/
│   │   ├── activities/
│   │   └── api/ghl/            # API proxy
│   └── hooks.server.ts         # Auth middleware
├── tests/app.spec.ts           # 18 e2e tests
└── PLAN.md                     # This file

ghl-automation/
├── src/server.ts               # Backend API server
├── config/
│   ├── ghl-client-token.json   # GHL API token
│   └── gmail-tokens.json       # Gmail OAuth for OTP
└── tools/refresh-token.sh      # Token refresh script
```

## Running Locally

```bash
# Start GHL backend (port 8001)
cd ~/ghl-automation && npm start

# Start Workbot (port 8000)
cd ~/workbot && bun run dev

# Run tests
bun run test
```

## Token Refresh

GHL tokens expire every ~1 hour. To refresh:

1. **Gmail token** (automatic via refresh_token)
2. **GHL token** (requires browser automation + OTP)

Shelley can refresh both tokens using browser tools.
