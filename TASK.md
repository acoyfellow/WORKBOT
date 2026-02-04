# Current Task: Phase 2 - Leaderboard Accuracy & Polish

## Completed (Phase 1)
- ✅ Password auth (env var based)
- ✅ Responsive sidebar layout
- ✅ Location selector (5 GHL sub-accounts)
- ✅ Dashboard with token status & refresh button
- ✅ All data pages: Contacts, Conversations, Pipelines, Workflows, Activities
- ✅ Chat interface (natural language → GHL API)
- ✅ Leaderboard with Apps/Leads tracking
- ✅ 21 Playwright e2e tests
- ✅ GitHub repo: https://github.com/acoyfellow/WORKBOT

## In Progress
- App submissions tracking system (on-demand sync)
- Need to backfill historical data or set up regular sync

## Known Issues
1. **App counts show 0** - No opportunities currently in "Personal App Submitted" stages. Need to either:
   - Run sync when opps ARE in those stages
   - Set up periodic sync (cron/alarm)
   - Manually backfill from spreadsheet data

2. **Some users show as "Unknown"** - User data not fully synced. Run user sync.

3. **GHL token expires hourly** - Manual refresh via browser login + OTP

## Next Tasks
1. Set up periodic sync for app submissions (every 15 min?)
2. Add user sync to populate names
3. Custom domain setup (workbot.coey.dev) - needs CF DNS token
4. Consider webhook integration for real-time tracking

## App Submitted Stage IDs (Closer Capital)
```
Kevin's Pipeline: 036331fd-6772-4086-84ab-1303de7e4f8e
Job Flow: c7fa45d8-a0e1-46b2-abc8-ee92448bc92d  
Outside Sales Job Flow: 6b3a2a2c-6d33-44ae-a453-b461f5aa48da
```

## Services
- `workbot-dev` (systemd) - SvelteKit on port 8000
- `ghl-dashboard` (systemd) - GHL API backend on port 8001

## Key Files
- `/home/exedev/workbot/` - SvelteKit app
- `/home/exedev/ghl-automation/` - GHL API backend
- `/home/exedev/ghl-automation/data/workbot.db` - SQLite database
- `/home/exedev/ghl-automation/config/ghl-client-token.json` - GHL auth token
