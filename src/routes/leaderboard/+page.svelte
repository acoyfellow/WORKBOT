<script lang="ts">
  import { locationStore, LOCATIONS } from '$lib/stores/location.svelte';
  
  interface LeaderboardEntry {
    userId: string;
    name: string;
    email: string | null;
    apps: number;
    leads: number;
    percentage: number;
  }
  
  interface LeaderboardData {
    leaderboard: LeaderboardEntry[];
    winners: { apps: string | null; leads: string | null };
    totals: { apps: number; leads: number };
    dateRange: { start: string; end: string };
    lastSync?: string | null;
    methodology?: {
      apps: string;
      leads: string;
      note?: string;
    };
  }
  
  let showMethodology = $state(false);
  let syncing = $state(false);
  let syncResult = $state<{synced: number; skipped: number} | null>(null);
  
  let data = $state<LeaderboardData | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  
  // Month selector
  let selectedMonth = $state(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  async function loadLeaderboard() {
    loading = true;
    error = null;
    syncResult = null;
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      
      // Use the tracked endpoint which uses our local database
      const res = await fetch(
        `/api/ghl/leaderboard/apps-tracked?locationId=${locationStore.selectedId}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) throw new Error('Failed to load leaderboard');
      data = await res.json();
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
    }
  }
  
  async function syncApps() {
    syncing = true;
    syncResult = null;
    try {
      const res = await fetch('/api/ghl/sync/app-submissions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locationId: locationStore.selectedId })
      });
      if (!res.ok) throw new Error('Sync failed');
      const result = await res.json();
      syncResult = { synced: result.synced, skipped: result.skipped };
      // Reload the leaderboard after sync
      await loadLeaderboard();
    } catch (e: any) {
      error = e.message;
    } finally {
      syncing = false;
    }
  }
  
  $effect(() => {
    if (locationStore.selectedId) {
      loadLeaderboard();
    }
  });
  
  function getMonthName(dateStr: string) {
    const [year, month] = dateStr.split('-').map(Number);
    return new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
  
  function getCellClass(value: number, type: 'apps' | 'leads' | 'percentage') {
    if (type === 'apps') {
      return value > 0 ? 'bg-green-600/30' : 'bg-red-500/30';
    }
    if (type === 'leads') {
      return value > 0 ? 'bg-green-600/30' : '';
    }
    if (type === 'percentage') {
      if (value >= 100) return 'text-green-400';
      if (value >= 50) return 'text-yellow-400';
      return '';
    }
    return '';
  }
</script>

<svelte:head>
  <title>Leaderboard - Workbot</title>
</svelte:head>

<div class="space-y-6">
  <div class="flex items-center justify-between flex-wrap gap-4">
    <h2 class="text-2xl font-bold">
      {LOCATIONS.find(l => l.id === locationStore.selectedId)?.name || 'Location'} Leaderboard
    </h2>
    <div class="flex items-center gap-2 flex-wrap">
      <input
        type="month"
        bind:value={selectedMonth}
        onchange={loadLeaderboard}
        class="bg-gray-800 rounded px-3 py-2 text-sm"
      />
      <button
        onclick={syncApps}
        disabled={syncing}
        class="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 px-4 py-2 rounded text-sm flex items-center gap-2"
      >
        {#if syncing}
          <svg class="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Syncing...
        {:else}
          Sync Apps
        {/if}
      </button>
      <button
        onclick={loadLeaderboard}
        class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
      >
        Refresh
      </button>
    </div>
  </div>
  
  {#if syncResult}
    <div class="bg-green-900/50 border border-green-700 rounded px-4 py-2 text-sm">
      ✓ Synced {syncResult.synced} new app submissions ({syncResult.skipped} already tracked)
    </div>
  {/if}
  
  <p class="text-xl text-gray-400">{getMonthName(selectedMonth)}</p>
  
  {#if loading}
    <div class="text-center py-8 text-gray-400">Loading...</div>
  {:else if error}
    <div class="text-center py-8 text-red-400">{error}</div>
  {:else if data}
    <!-- Winners Box -->
    <div class="bg-gray-800 rounded-lg overflow-hidden max-w-md">
      <div class="bg-black text-white text-center py-2 font-semibold">Winner</div>
      <div class="grid grid-cols-2">
        <div class="text-center py-3 border-r border-gray-700">
          <div class="text-gray-400 text-sm">Apps</div>
          <div class="font-semibold text-lg">{data.winners.apps || '-'}</div>
        </div>
        <div class="text-center py-3">
          <div class="text-gray-400 text-sm">Leads</div>
          <div class="font-semibold text-lg">{data.winners.leads || '-'}</div>
        </div>
      </div>
    </div>
    
    <!-- Leaderboard Table -->
    <div class="bg-gray-800 rounded-lg overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="border-b border-gray-700">
            <th class="text-left px-4 py-3">Sales Person</th>
            <th class="text-center px-4 py-3">Total Apps</th>
            <th class="text-center px-4 py-3">Total Leads</th>
            <th class="text-center px-4 py-3">Apps vs Leads %</th>
          </tr>
        </thead>
        <tbody>
          {#each data.leaderboard.filter(e => e.userId !== 'unassigned') as entry, i}
            <tr class="border-b border-gray-700/50 {i < 3 ? 'bg-gray-700/30' : ''}">
              <td class="px-4 py-3 font-medium">
                {entry.name}
                {#if entry.email}
                  <span class="text-gray-500 text-sm block">{entry.email}</span>
                {/if}
              </td>
              <td class="px-4 py-3 text-center {getCellClass(entry.apps, 'apps')}">
                {entry.apps}
              </td>
              <td class="px-4 py-3 text-center {getCellClass(entry.leads, 'leads')}">
                {entry.leads}
              </td>
              <td class="px-4 py-3 text-center {getCellClass(entry.percentage, 'percentage')}">
                {entry.percentage}%
              </td>
            </tr>
          {/each}
          <tr class="bg-gray-900 font-semibold">
            <td class="px-4 py-3">Total</td>
            <td class="px-4 py-3 text-center">{data.totals.apps}</td>
            <td class="px-4 py-3 text-center">{data.totals.leads}</td>
            <td class="px-4 py-3 text-center"></td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Date Range & Methodology -->
    <div class="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
      <p>
        Data from {new Date(data.dateRange.start).toLocaleDateString()} to {new Date(data.dateRange.end).toLocaleDateString()}
      </p>
      {#if data.lastSync}
        <p class="text-green-400">
          Last sync: {new Date(data.lastSync).toLocaleString()}
        </p>
      {:else}
        <p class="text-yellow-400">
          No sync data yet - click "Sync Apps" to capture current app submissions
        </p>
      {/if}
      <button 
        onclick={() => showMethodology = !showMethodology}
        class="text-blue-400 hover:text-blue-300 flex items-center gap-1"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        How is this calculated?
      </button>
    </div>
    
    {#if showMethodology && data.methodology}
      <div class="bg-gray-800 rounded-lg p-4 text-sm space-y-2">
        <h4 class="font-semibold text-white">Data Methodology</h4>
        <p><strong class="text-green-400">Apps:</strong> {data.methodology.apps}</p>
        <p><strong class="text-blue-400">Leads:</strong> {data.methodology.leads}</p>
        <p class="text-yellow-400 text-xs mt-2">⚠️ {data.methodology.note}</p>
      </div>
    {/if}
  {/if}
</div>
