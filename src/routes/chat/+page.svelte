<script lang="ts">
  import { locationStore, LOCATIONS } from '$lib/stores/location.svelte';
  
  interface Message {
    role: 'user' | 'assistant';
    content: string;
    toolResults?: any[];
    data?: any;
  }
  
  let messages = $state<Message[]>([]);
  let input = $state('');
  let loading = $state(false);
  let messagesContainer: HTMLDivElement;
  
  async function sendMessage() {
    if (!input.trim() || loading) return;
    
    const userMessage = input.trim();
    input = '';
    
    messages = [...messages, { role: 'user', content: userMessage }];
    loading = true;
    
    // Scroll to bottom
    setTimeout(() => {
      messagesContainer?.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
    }, 50);
    
    try {
      const location = LOCATIONS.find(l => l.id === locationStore.selectedId);
      
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          locationId: locationStore.selectedId,
          locationName: location?.name,
          history: messages.slice(-10).map(m => ({
            role: m.role,
            content: m.content
          }))
        })
      });
      
      const data = await res.json();
      
      if (data.error) {
        messages = [...messages, { 
          role: 'assistant', 
          content: `Error: ${data.error}` 
        }];
      } else {
        messages = [...messages, { 
          role: 'assistant', 
          content: data.response,
          toolResults: data.toolResults,
          data: data.data
        }];
      }
    } catch (err: any) {
      messages = [...messages, { 
        role: 'assistant', 
        content: `Network error: ${err.message}` 
      }];
    } finally {
      loading = false;
      setTimeout(() => {
        messagesContainer?.scrollTo({ top: messagesContainer.scrollHeight, behavior: 'smooth' });
      }, 50);
    }
  }
  
  function handleKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }
  
  function downloadData(data: any, filename: string) {
    const content = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
</script>

<svelte:head>
  <title>Chat - Workbot</title>
</svelte:head>

<div class="flex flex-col h-[calc(100vh-8rem)]">
  <h2 class="text-xl font-semibold mb-4">GHL Assistant</h2>
  
  <p class="text-gray-400 text-sm mb-4">
    Ask me to do things like "export contacts as json", "search for john", "list workflows", etc.
  </p>
  
  <!-- Messages -->
  <div 
    bind:this={messagesContainer}
    class="flex-1 overflow-y-auto bg-gray-900 rounded-lg p-4 mb-4 space-y-4"
  >
    {#if messages.length === 0}
      <div class="text-gray-500 text-center py-8">
        <p class="text-lg mb-2">👋 Hi! I'm your GHL assistant.</p>
        <p class="text-sm">Try asking me to:</p>
        <ul class="text-sm mt-2 space-y-1">
          <li>• Export contacts as JSON</li>
          <li>• Search for contacts named "John"</li>
          <li>• List all workflows</li>
          <li>• Show me the pipelines</li>
          <li>• Get recent conversations</li>
        </ul>
      </div>
    {/if}
    
    {#each messages as message}
      <div class="flex {message.role === 'user' ? 'justify-end' : 'justify-start'}">
        <div class="max-w-[80%] {message.role === 'user' ? 'bg-blue-600' : 'bg-gray-700'} rounded-lg px-4 py-2">
          <p class="whitespace-pre-wrap">{message.content}</p>
          
          {#if message.toolResults?.length}
            <div class="mt-2 pt-2 border-t border-gray-600 text-sm">
              {#each message.toolResults as tr}
                <div class="text-gray-400">
                  <span class="text-green-400">✓</span> {tr.tool}
                  {#if tr.result?.data}
                    <button 
                      onclick={() => downloadData(tr.result.data, `${tr.tool}.json`)}
                      class="ml-2 text-blue-400 hover:underline"
                    >
                      Download
                    </button>
                  {/if}
                </div>
              {/each}
            </div>
          {/if}
          
          {#if message.data?.content}
            <details class="mt-2 pt-2 border-t border-gray-600">
              <summary class="cursor-pointer text-sm text-gray-400">View Data</summary>
              <pre class="text-xs mt-2 overflow-x-auto max-h-40">{message.data.content.slice(0, 500)}{message.data.content.length > 500 ? '...' : ''}</pre>
            </details>
          {/if}
        </div>
      </div>
    {/each}
    
    {#if loading}
      <div class="flex justify-start">
        <div class="bg-gray-700 rounded-lg px-4 py-2">
          <div class="flex space-x-1">
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div>
            <div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
          </div>
        </div>
      </div>
    {/if}
  </div>
  
  <!-- Input -->
  <div class="flex gap-2">
    <input
      type="text"
      bind:value={input}
      onkeydown={handleKeydown}
      placeholder="Ask me to do something with GHL..."
      disabled={loading}
      class="flex-1 bg-gray-800 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
    <button
      onclick={sendMessage}
      disabled={loading || !input.trim()}
      class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-lg font-medium transition-colors"
    >
      Send
    </button>
  </div>
</div>
