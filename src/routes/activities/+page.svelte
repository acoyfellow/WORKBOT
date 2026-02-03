<script lang="ts">
  import { locationStore } from '$lib/stores/location.svelte';
  import { getActivities, type Activity } from '$lib/api';
  
  let activities = $state<Activity[]>([]);
  let loading = $state(true);
  let error = $state('');
  let filterType = $state('');
  let startDate = $state('');
  let endDate = $state('');
  
  async function load() {
    loading = true;
    error = '';
    try {
      const result = await getActivities(locationStore.selectedId, {
        type: filterType || undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        limit: 50,
      });
      activities = result.activities || [];
    } catch (e) {
      error = (e as Error).message;
      activities = [];
    } finally {
      loading = false;
    }
  }
  
  $effect(() => {
    load();
  });
</script>

<svelte:head>
  <title>Activities - Workbot</title>
</svelte:head>

<h2 class="text-xl font-semibold mb-4">Activities</h2>

<!-- Filters -->
<div class="bg-gray-800 p-4 rounded mb-4">
  <div class="grid grid-cols-1 md:grid-cols-4 gap-3">
    <div>
      <label class="text-xs text-gray-400">Type</label>
      <select bind:value={filterType} class="w-full bg-gray-700 rounded px-3 py-2 mt-1 text-sm">
        <option value="">All Types</option>
        <option value="call">Calls</option>
        <option value="email">Emails</option>
        <option value="sms">SMS</option>
        <option value="task">Tasks</option>
      </select>
    </div>
    <div>
      <label class="text-xs text-gray-400">Start Date</label>
      <input type="date" bind:value={startDate} class="w-full bg-gray-700 rounded px-3 py-2 mt-1 text-sm" />
    </div>
    <div>
      <label class="text-xs text-gray-400">End Date</label>
      <input type="date" bind:value={endDate} class="w-full bg-gray-700 rounded px-3 py-2 mt-1 text-sm" />
    </div>
    <div class="flex items-end">
      <button onclick={load} disabled={loading} class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm w-full disabled:opacity-50">
        {loading ? 'Loading...' : 'Filter'}
      </button>
    </div>
  </div>
</div>

{#if error}
  <div class="bg-red-900/50 border border-red-500 text-red-200 rounded p-3 mb-4 text-sm">
    {error}
  </div>
{/if}

<div class="bg-gray-800 rounded overflow-hidden">
  {#each activities as activity}
    <div class="p-3 border-b border-gray-700 hover:bg-gray-700/50">
      <div class="flex justify-between items-start">
        <div>
          <span class="text-xs bg-gray-700 px-2 py-0.5 rounded mr-2">{activity.type}</span>
          <span class="text-gray-400 text-sm">{activity.userName || 'Unknown'}</span>
        </div>
        <span class="text-gray-500 text-xs">{new Date(activity.timestamp).toLocaleString()}</span>
      </div>
      {#if activity.details}
        <p class="text-sm text-gray-300 mt-1">{activity.details}</p>
      {/if}
    </div>
  {:else}
    <div class="p-4 text-center text-gray-400">
      {loading ? 'Loading...' : 'No activities found'}
    </div>
  {/each}
</div>
