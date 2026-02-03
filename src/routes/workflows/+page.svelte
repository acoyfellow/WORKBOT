<script lang="ts">
  import { locationStore } from '$lib/stores/location.svelte';
  import { getWorkflows, type Workflow } from '$lib/api';
  
  let workflows = $state<Workflow[]>([]);
  let loading = $state(true);
  let error = $state('');
  
  async function load() {
    loading = true;
    error = '';
    try {
      const result = await getWorkflows(locationStore.selectedId);
      workflows = result.workflows || [];
    } catch (e) {
      error = (e as Error).message;
      workflows = [];
    } finally {
      loading = false;
    }
  }
  
  $effect(() => {
    load();
  });
</script>

<svelte:head>
  <title>Workflows - Workbot</title>
</svelte:head>

<h2 class="text-xl font-semibold mb-4">Workflows</h2>

{#if error}
  <div class="bg-red-900/50 border border-red-500 text-red-200 rounded p-3 mb-4 text-sm">
    {error}
  </div>
{/if}

<div class="bg-gray-800 rounded overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b border-gray-700">
        <th class="text-left p-3 text-gray-400">Name</th>
        <th class="text-left p-3 text-gray-400">Status</th>
      </tr>
    </thead>
    <tbody>
      {#each workflows as workflow}
        <tr class="border-b border-gray-700 hover:bg-gray-700/50">
          <td class="p-3">{workflow.name}</td>
          <td class="p-3">
            <span class="px-2 py-0.5 rounded text-xs {workflow.status === 'published' ? 'bg-green-600' : 'bg-gray-600'}">
              {workflow.status || 'draft'}
            </span>
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="2" class="p-3 text-center text-gray-400">
            {loading ? 'Loading...' : 'No workflows found'}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
