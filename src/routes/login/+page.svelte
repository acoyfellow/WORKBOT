<script lang="ts">
  import { enhance } from '$app/forms';
  
  let { form } = $props();
</script>

<svelte:head>
  <title>Login - Workbot</title>
</svelte:head>

<div class="min-h-screen bg-gray-900 flex items-center justify-center p-4">
  <div class="bg-gray-800 rounded-lg shadow-xl p-8 w-full max-w-sm">
    <h1 class="text-2xl font-bold text-white text-center mb-6">Workbot</h1>
    
    {#if form?.error}
      <div class="bg-red-900/50 border border-red-500 text-red-200 rounded p-3 mb-4 text-sm">
        Invalid password. Please try again.
      </div>
    {/if}
    
    <form method="POST" use:enhance class="space-y-4">
      <div>
        <label for="password" class="block text-sm font-medium text-gray-300 mb-1">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter password"
        />
      </div>
      
      <button
        type="submit"
        class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
      >
        Sign In
      </button>
    </form>
  </div>
</div>
