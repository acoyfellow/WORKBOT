<script lang="ts">
  import { locationStore } from '$lib/stores/location.svelte';
  
  // Placeholder stats - will be replaced with real data later
  const stats = [
    { label: 'Contacts', value: '12,847' },
    { label: 'Conversations', value: '3,291' },
    { label: 'Opportunities', value: '847' },
  ];
</script>

<svelte:head>
  <title>Dashboard - Workbot</title>
</svelte:head>

<h2 class="text-xl font-semibold mb-4">Dashboard</h2>

<p class="text-gray-400 text-sm mb-4">
  Location: <span class="text-white font-medium">{locationStore.selected.name}</span>
</p>

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
