<script lang="ts">
  import { locationStore } from '$lib/stores/location.svelte';
  import { getContacts, type Contact } from '$lib/api';
  
  let query = $state('');
  let contacts = $state<Contact[]>([]);
  let loading = $state(false);
  let error = $state('');
  
  async function search() {
    loading = true;
    error = '';
    try {
      const result = await getContacts(locationStore.selectedId, query);
      contacts = result.contacts || [];
    } catch (e) {
      error = (e as Error).message;
      contacts = [];
    } finally {
      loading = false;
    }
  }
  
  // Load on mount
  $effect(() => {
    search();
  });
</script>

<svelte:head>
  <title>Contacts - Workbot</title>
</svelte:head>

<h2 class="text-xl font-semibold mb-4">Contacts</h2>

<div class="flex gap-2 mb-4">
  <input
    type="text"
    bind:value={query}
    placeholder="Search..."
    class="bg-gray-800 rounded px-3 py-2 flex-1 text-sm"
    onkeydown={(e) => e.key === 'Enter' && search()}
  />
  <button
    onclick={search}
    disabled={loading}
    class="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded text-sm disabled:opacity-50"
  >
    {loading ? 'Loading...' : 'Search'}
  </button>
</div>

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
        <th class="text-left p-3 text-gray-400">Email</th>
        <th class="text-left p-3 text-gray-400">Phone</th>
        <th class="text-left p-3 text-gray-400">Added</th>
      </tr>
    </thead>
    <tbody>
      {#each contacts as contact}
        <tr class="border-b border-gray-700 hover:bg-gray-700/50">
          <td class="p-3">{contact.name || `${contact.firstName || ''} ${contact.lastName || ''}`.trim() || '-'}</td>
          <td class="p-3 text-gray-400">{contact.email || '-'}</td>
          <td class="p-3 text-gray-400">{contact.phone || '-'}</td>
          <td class="p-3 text-gray-400">{contact.dateAdded ? new Date(contact.dateAdded).toLocaleDateString() : '-'}</td>
        </tr>
      {:else}
        <tr>
          <td colspan="4" class="p-3 text-center text-gray-400">
            {loading ? 'Loading...' : 'No contacts found'}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
