<script lang="ts">
  import { locationStore } from '$lib/stores/location.svelte';
  import { getConversations, type Conversation } from '$lib/api';
  
  let conversations = $state<Conversation[]>([]);
  let loading = $state(true);
  let error = $state('');
  
  async function load() {
    loading = true;
    error = '';
    try {
      const result = await getConversations(locationStore.selectedId);
      conversations = result.conversations || [];
    } catch (e) {
      error = (e as Error).message;
      conversations = [];
    } finally {
      loading = false;
    }
  }
  
  $effect(() => {
    load();
  });
</script>

<svelte:head>
  <title>Conversations - Workbot</title>
</svelte:head>

<h2 class="text-xl font-semibold mb-4">Conversations</h2>

{#if error}
  <div class="bg-red-900/50 border border-red-500 text-red-200 rounded p-3 mb-4 text-sm">
    {error}
  </div>
{/if}

<div class="bg-gray-800 rounded overflow-x-auto">
  <table class="w-full text-sm">
    <thead>
      <tr class="border-b border-gray-700">
        <th class="text-left p-3 text-gray-400">Contact</th>
        <th class="text-left p-3 text-gray-400">Last Message</th>
        <th class="text-left p-3 text-gray-400">Date</th>
        <th class="text-left p-3 text-gray-400">Unread</th>
      </tr>
    </thead>
    <tbody>
      {#each conversations as conv}
        <tr class="border-b border-gray-700 hover:bg-gray-700/50">
          <td class="p-3">{conv.contactName || conv.contactId}</td>
          <td class="p-3 text-gray-400 truncate max-w-xs">{conv.lastMessageBody || '-'}</td>
          <td class="p-3 text-gray-400">{conv.lastMessageDate ? new Date(conv.lastMessageDate).toLocaleDateString() : '-'}</td>
          <td class="p-3">
            {#if conv.unreadCount}
              <span class="bg-blue-600 px-2 py-0.5 rounded-full text-xs">{conv.unreadCount}</span>
            {:else}
              -
            {/if}
          </td>
        </tr>
      {:else}
        <tr>
          <td colspan="4" class="p-3 text-center text-gray-400">
            {loading ? 'Loading...' : 'No conversations found'}
          </td>
        </tr>
      {/each}
    </tbody>
  </table>
</div>
