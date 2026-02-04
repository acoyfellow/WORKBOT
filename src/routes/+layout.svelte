<script lang="ts">
  import "../app.css";
  import { page } from '$app/stores';
  import { locationStore } from '$lib/stores/location.svelte';

  let { children } = $props();
  
  let sidebarOpen = $state(false);
  
  function toggleSidebar() {
    sidebarOpen = !sidebarOpen;
  }
  
  function closeSidebar() {
    sidebarOpen = false;
  }
  
  // Check if we're on login page
  let isLoginPage = $derived($page.url.pathname === '/login');
  
  const navItems = [
    { href: '/', label: 'Dashboard' },
    { href: '/contacts', label: 'Contacts' },
    { href: '/conversations', label: 'Conversations' },
    { href: '/pipelines', label: 'Pipelines' },
    { href: '/workflows', label: 'Workflows' },
    { href: '/activities', label: 'Activities' },
    { href: '/chat', label: 'Chat' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ];
</script>

<svelte:head>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin="anonymous">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
</svelte:head>

{#if isLoginPage}
  {@render children()}
{:else}
  <!-- Header -->
  <header class="fixed top-0 right-0 left-0 md:left-64 bg-gray-800 border-b border-gray-700 px-4 py-3 flex items-center gap-3 z-20">
    <button onclick={toggleSidebar} class="p-2 hover:bg-gray-700 rounded md:hidden">
      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
      </svg>
    </button>
    <div class="flex-1"></div>
    <select 
      class="bg-gray-700 rounded px-3 py-1.5 text-sm font-medium"
      value={locationStore.selectedId}
      onchange={(e) => locationStore.select(e.currentTarget.value)}
    >
      {#each locationStore.locations as location}
        <option value={location.id}>{location.name}</option>
      {/each}
    </select>
  </header>
  
  <!-- Overlay -->
  {#if sidebarOpen}
    <div 
      onclick={closeSidebar} 
      class="fixed inset-0 bg-black/50 z-40 md:hidden"
    ></div>
  {/if}
  
  <!-- Sidebar -->
  <nav 
    class="fixed top-0 left-0 w-64 bg-gray-800 h-screen p-4 z-50 transition-transform duration-200 overflow-y-auto
           {sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0"
  >
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-lg font-bold">Workbot</h1>
      <button onclick={closeSidebar} class="md:hidden p-1 hover:bg-gray-700 rounded">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
        </svg>
      </button>
    </div>
    
    <ul class="space-y-1">
      {#each navItems as item}
        <li>
          <a 
            href={item.href} 
            onclick={closeSidebar}
            class="block p-2 rounded hover:bg-gray-700 text-sm
                   {$page.url.pathname === item.href ? 'bg-gray-700 text-white' : 'text-gray-300'}"
          >
            {item.label}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  
  <!-- Main Content -->
  <main class="md:ml-64 px-4 md:px-6 pt-16 pb-4 md:pb-6 min-h-screen bg-gray-900 text-gray-100">
    {@render children()}
  </main>
{/if}

<style>
  :global(body) {
    font-family: 'Inter', system-ui, sans-serif;
    background-color: rgb(17 24 39); /* bg-gray-900 */
    color: rgb(243 244 246); /* text-gray-100 */
  }
</style>
