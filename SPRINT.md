# Workbot Rebuild Sprint

## Stack
- SvelteKit + Svelte 5
- Remote functions pattern
- D1 + Drizzle (database)
- Alchemy (deployment)
- Tailwind CSS v4

## Deploy Target
- workbot.coey.dev (Cloudflare)

## Auth
- Simple password gate (hardcoded password)
- Cookie-based session
- NOT using Better Auth for now (can add later)

## Features to Port (from ~/ghl-automation/public/index.html)

### Navigation
- [x] Sidebar with tabs
- [x] Location selector (dropdown)
- [x] Mobile responsive (hamburger menu)

### Tabs/Pages
1. **Dashboard** - Stats cards, quick actions
2. **Contacts** - Search, list, table view
3. **Conversations** - List conversations
4. **Pipelines** - Pipeline/stage view
5. **Workflows** - List workflows
6. **Activities** - Activity feed with filters
7. **Leaderboard** - Points, streaks, badges
8. **Team Audit** - Rep metrics, red flags
9. **Scheduled Tasks** - Cron task management
10. **API Explorer** - Raw API testing
11. **Documentation** - API docs

### Backend (Remote Functions)
- GHL API integration (via m_a token or OAuth)
- Activity sync to D1
- Leaderboard calculations
- Task scheduling

## GHL Locations
| ID | Name |
|----|------|
| gDtFIBrCnempxaF6emIs | Phonesites |
| OG4bIh7relMcYLo9Izfi | Apex Business |
| U7eJ93D9PN7tH01uiIMl | Closer Capital |
| OgoxaWFBx9k18Sker7XM | MedSpa Millions |
| dkzsEb9htVMJzjuxLb51 | SignedSeal |

## File Structure
```
src/
├── lib/
│   ├── components/
│   │   ├── Sidebar.svelte
│   │   ├── Header.svelte
│   │   ├── StatsCard.svelte
│   │   └── ...
│   ├── stores/
│   │   └── location.ts
│   ├── api/
│   │   └── ghl.ts
│   └── schema.ts (D1 schema)
├── routes/
│   ├── +layout.svelte
│   ├── +page.svelte (dashboard)
│   ├── login/+page.svelte
│   ├── contacts/+page.svelte
│   ├── activities/+page.svelte
│   ├── leaderboard/+page.svelte
│   └── data.remote.ts
└── hooks.server.ts (auth check)
```

## Phase 1: Foundation
1. Simple password auth (cookie)
2. Layout with sidebar
3. Location selector store
4. Dashboard with stats

## Phase 2: Core Features
5. Contacts page
6. Activities page
7. Leaderboard page

## Phase 3: Full Feature Parity
8. Remaining pages
9. Real-time updates (if needed)
10. Deploy to Cloudflare
