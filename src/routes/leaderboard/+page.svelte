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
  
  interface LeaderboardGroup {
    leaderboard: LeaderboardEntry[];
    winners: { apps: string | null; leads: string | null };
    totals: { apps: number; leads: number };
  }
  
  interface LeaderboardData {
    closers: LeaderboardGroup;
    outside: LeaderboardGroup;
    dateRange: { start: string; end: string };
    methodology?: {
      apps: string;
      leads: string;
      note?: string;
    };
  }
  
  let showMethodology = $state(false);
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
        `/api/ghl/leaderboard/v2?locationId=${locationStore.selectedId}&startDate=${startDate}&endDate=${endDate}`
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
  
  function getDisplayName(name: string): string {
    // Convert to nickname format like the spreadsheet
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      const first = parts[0].toUpperCase();
      const lastInitial = parts[parts.length - 1][0].toUpperCase();
      // Special cases
      if (name.includes('Taylre')) return 'TAYLRE';
      if (name.includes('Kevin')) return 'KEVIN';
      if (name.includes('Justin')) return 'JUSTIN';
      if (name.includes('Rob')) return 'ROB D.';
      if (name.includes('Rod')) return 'ROD M.';
      if (name.includes('Jeff')) return 'JEFF';
      if (name.includes('Neal')) return 'NEAL';
      if (name.includes('Adam')) return 'ADAM';
      if (name.includes('Jake')) return 'JAKE';
      if (name.includes('Billy')) return 'BILLY';
      if (name.includes('Amber')) return 'AMBER';
      if (name.includes('Zeeshan')) return 'ZEESHAN';
      return first;
    }
    return name.toUpperCase();
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
    <!-- Combined Winners Box -->
    <div class="bg-gray-800 rounded-lg overflow-hidden max-w-md">
      <div class="bg-black text-white text-center py-2 font-semibold">Winner</div>
      <div class="grid grid-cols-2">
        <div class="text-center py-3 border-r border-gray-700">
          <div class="text-gray-400 text-sm">Apps</div>
          <div class="font-semibold text-lg">{getDisplayName(data.closers.winners.apps || '-')}</div>
        </div>
        <div class="text-center py-3">
          <div class="text-gray-400 text-sm">Leads</div>
          <div class="font-semibold text-lg">{getDisplayName(data.closers.winners.leads || '-')}</div>
        </div>
      </div>
    </div>
    
    <!-- Closers Table (Kevin's Pipeline + Job Flow) -->
    <div>
      <h3 class="text-lg font-semibold mb-2 text-blue-400">Closers (Kevin's Pipeline + Job Flow)</h3>
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
            {#each data.closers.leaderboard.filter(e => e.apps > 0 || e.leads > 0) as entry, i}
              <tr class="border-b border-gray-700/50">
                <td class="px-4 py-3 font-medium">{getDisplayName(entry.name)}</td>
                <td class="px-4 py-3 text-center {getCellClass(entry.apps, 'apps')}">{entry.apps}</td>
                <td class="px-4 py-3 text-center {getCellClass(entry.leads, 'leads')}">{entry.leads}</td>
                <td class="px-4 py-3 text-center {getCellClass(entry.percentage, 'percentage')}">{entry.percentage}%</td>
              </tr>
            {/each}
            <tr class="bg-gray-900 font-semibold">
              <td class="px-4 py-3">Total</td>
              <td class="px-4 py-3 text-center">{data.closers.totals.apps}</td>
              <td class="px-4 py-3 text-center">{data.closers.totals.leads}</td>
              <td class="px-4 py-3 text-center"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Outside Sales Table -->
    <div>
      <h3 class="text-lg font-semibold mb-2 text-green-400">Outside Sales</h3>
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
            {#each data.outside.leaderboard.filter(e => e.apps > 0 || e.leads > 0) as entry, i}
              <tr class="border-b border-gray-700/50">
                <td class="px-4 py-3 font-medium">{getDisplayName(entry.name)}</td>
                <td class="px-4 py-3 text-center {getCellClass(entry.apps, 'apps')}">{entry.apps}</td>
                <td class="px-4 py-3 text-center {getCellClass(entry.leads, 'leads')}">{entry.leads}</td>
                <td class="px-4 py-3 text-center {getCellClass(entry.percentage, 'percentage')}">{entry.percentage}%</td>
              </tr>
            {/each}
            <tr class="bg-gray-900 font-semibold">
              <td class="px-4 py-3">Total</td>
              <td class="px-4 py-3 text-center">{data.outside.totals.apps}</td>
              <td class="px-4 py-3 text-center">{data.outside.totals.leads}</td>
              <td class="px-4 py-3 text-center"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- Methodology -->
    <div class="flex items-center gap-4 text-sm text-gray-500 flex-wrap">
      <p>
        Data from {new Date(data.dateRange.start).toLocaleDateString()} to {new Date(data.dateRange.end).toLocaleDateString()}
      </p>
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
