<script lang="ts">
  import { locationStore } from '$lib/stores/location.svelte';
  import { getTokenStatus, refreshToken, type TokenStatus } from '$lib/api';
  
  let tokenStatus = $state<TokenStatus | null>(null);
  let tokenLoading = $state(false);
  let refreshing = $state(false);
  let refreshMessage = $state('');
  
  // Placeholder stats - will be replaced with real data later
  const stats = [
    { label: 'Contacts', value: '12,847' },
    { label: 'Conversations', value: '3,291' },
    { label: 'Opportunities', value: '847' },
  ];
  
  async function loadTokenStatus() {
    tokenLoading = true;
    try {
      tokenStatus = await getTokenStatus();
    } catch (e) {
      tokenStatus = null;
    } finally {
      tokenLoading = false;
    }
  }
  
  async function handleRefreshToken() {
    refreshing = true;
    refreshMessage = '';
    try {
      const result = await refreshToken();
      refreshMessage = result.message;
      // Poll for status update
      setTimeout(loadTokenStatus, 5000);
      setTimeout(loadTokenStatus, 15000);
      setTimeout(loadTokenStatus, 30000);
    } catch (e) {
      refreshMessage = 'Failed to start refresh: ' + (e as Error).message;
    } finally {
      refreshing = false;
    }
  }
  
  function formatRemaining(seconds: number): string {
    if (seconds < 0) return 'Expired';
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  }
  
  $effect(() => {
    loadTokenStatus();
  });
</script>

<svelte:head>
  <title>Dashboard - Workbot</title>
</svelte:head>

<h2 class="text-xl font-semibold mb-4">Dashboard</h2>

<p class="text-gray-400 text-sm mb-4">
  Location: <span class="text-white font-medium">{locationStore.selected.name}</span>
</p>

<!-- Token Status -->
<div class="bg-gray-800 p-4 rounded mb-6">
  <div class="flex items-center justify-between">
    <div>
      <h3 class="font-semibold text-sm mb-1">GHL API Token</h3>
      {#if tokenLoading}
        <span class="text-gray-400 text-sm">Checking...</span>
      {:else if tokenStatus}
        <span class="text-sm {tokenStatus.valid ? 'text-green-400' : 'text-red-400'}">
          {tokenStatus.valid ? '✓ Valid' : '✗ Expired'}
          <span class="text-gray-400 ml-2">({formatRemaining(tokenStatus.remaining)})</span>
        </span>
      {:else}
        <span class="text-gray-400 text-sm">Unable to check status</span>
      {/if}
      {#if refreshMessage}
        <p class="text-xs text-gray-400 mt-1">{refreshMessage}</p>
      {/if}
    </div>
    <button
      onclick={handleRefreshToken}
      disabled={refreshing}
      class="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded text-sm disabled:opacity-50"
    >
      {refreshing ? 'Starting...' : 'Refresh Token'}
    </button>
  </div>
</div>

<!-- Stats Grid -->
<div class="grid grid-cols-3 gap-2 md:gap-4 mb-6">
  {#each stats as stat}
    <div class="bg-gray-800 p-3 md:p-4 rounded">
      <div class="text-gray-400 text-xs">{stat.label}</div>
      <div class="text-xl md:text-3xl font-bold">{stat.value}</div>
    </div>
  {/each}
</div>

<!-- Quick Actions -->
<div class="bg-gray-800 p-4 rounded">
  <h3 class="font-semibold mb-3 text-sm">Quick Actions</h3>
  <button class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm w-full md:w-auto">
    Send New Contacts Report
  </button>
</div>
