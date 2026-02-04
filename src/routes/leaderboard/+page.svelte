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
  }
  
  let data = $state<LeaderboardData | null>(null);
  let loading = $state(true);
  let error = $state<string | null>(null);
  
  // Month selector
  let selectedMonth = $state(new Date().toISOString().slice(0, 7)); // YYYY-MM
  
  async function loadLeaderboard() {
    loading = true;
    error = null;
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1).toISOString();
      const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();
      
      const res = await fetch(
        `/api/ghl/leaderboard/apps-leads?locationId=${locationStore.selectedId}&startDate=${startDate}&endDate=${endDate}`
      );
      if (!res.ok) throw new Error('Failed to load leaderboard');
      data = await res.json();
    } catch (e: any) {
      error = e.message;
    } finally {
      loading = false;
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
  <div class="flex items-center justify-between">
    <h2 class="text-2xl font-bold">
      {LOCATIONS.find(l => l.id === locationStore.selectedId)?.name || 'Location'} Leaderboard
    </h2>
    <div class="flex items-center gap-4">
      <input
        type="month"
        bind:value={selectedMonth}
        onchange={loadLeaderboard}
        class="bg-gray-800 rounded px-3 py-2 text-sm"
      />
      <button
        onclick={loadLeaderboard}
        class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm"
      >
        Refresh
      </button>
    </div>
  </div>
  
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
    
    <!-- Date Range -->
    <p class="text-sm text-gray-500">
      Data from {new Date(data.dateRange.start).toLocaleDateString()} to {new Date(data.dateRange.end).toLocaleDateString()}
    </p>
  {/if}
</div>
