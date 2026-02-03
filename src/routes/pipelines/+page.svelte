<script lang="ts">
  import { locationStore } from '$lib/stores/location.svelte';
  import { getPipelines, type Pipeline } from '$lib/api';
  
  let pipelines = $state<Pipeline[]>([]);
  let loading = $state(true);
  let error = $state('');
  
  async function load() {
    loading = true;
    error = '';
    try {
      const result = await getPipelines(locationStore.selectedId);
      pipelines = result.pipelines || [];
    } catch (e) {
      error = (e as Error).message;
      pipelines = [];
    } finally {
      loading = false;
    }
  }
  
  $effect(() => {
    load();
  });
</script>

<svelte:head>
  <title>Pipelines - Workbot</title>
</svelte:head>

<h2 class="text-xl font-semibold mb-4">Pipelines</h2>

{#if error}
  <div class="bg-red-900/50 border border-red-500 text-red-200 rounded p-3 mb-4 text-sm">
    {error}
  </div>
{/if}

<div class="space-y-4">
  {#each pipelines as pipeline}
    <div class="bg-gray-800 rounded p-4">
      <h3 class="font-semibold mb-2">{pipeline.name}</h3>
      {#if pipeline.stages?.length}
        <div class="flex flex-wrap gap-2">
          {#each pipeline.stages as stage}
            <span class="bg-gray-700 px-3 py-1 rounded text-sm">{stage.name}</span>
          {/each}
        </div>
      {:else}
        <p class="text-gray-400 text-sm">No stages</p>
      {/if}
    </div>
  {:else}
    <div class="bg-gray-800 rounded p-4 text-center text-gray-400">
      {loading ? 'Loading...' : 'No pipelines found'}
    </div>
  {/each}
</div>
