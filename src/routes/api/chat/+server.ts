import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { GHL_TOOLS, SYSTEM_PROMPT } from '$lib/ai/tools';
import { executeTool } from '$lib/ai/executor';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

export const POST: RequestHandler = async ({ request, cookies }) => {
  // Check auth
  if (!cookies.get('workbot_auth')) {
    return json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { message, locationId, locationName, history = [] } = await request.json();

  if (!message) {
    return json({ error: 'Message required' }, { status: 400 });
  }

  if (!ANTHROPIC_API_KEY) {
    // Fallback: simple pattern matching for demo
    return json(await handleWithoutAI(message, locationId));
  }

  try {
    const systemPrompt = SYSTEM_PROMPT
      .replace('{locationName}', locationName || 'Unknown')
      .replace('{locationId}', locationId || '');

    // Call Claude with tools
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1024,
        system: systemPrompt,
        tools: GHL_TOOLS.map(t => ({
          name: t.name,
          description: t.description,
          input_schema: t.parameters
        })),
        messages: [
          ...history,
          { role: 'user', content: message }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return json({ error: 'AI service error' }, { status: 500 });
    }

    const result = await response.json();
    
    // Process tool calls
    const toolResults: any[] = [];
    let textResponse = '';

    for (const block of result.content) {
      if (block.type === 'text') {
        textResponse += block.text;
      } else if (block.type === 'tool_use') {
        const toolResult = await executeTool(block.name, block.input, locationId);
        toolResults.push({
          tool: block.name,
          input: block.input,
          result: toolResult
        });
      }
    }

    // If there were tool calls, get a summary from Claude
    if (toolResults.length > 0 && result.stop_reason === 'tool_use') {
      const summaryResponse = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1024,
          system: systemPrompt,
          messages: [
            ...history,
            { role: 'user', content: message },
            { role: 'assistant', content: result.content },
            { 
              role: 'user', 
              content: toolResults.map(tr => ({
                type: 'tool_result',
                tool_use_id: result.content.find((b: any) => b.type === 'tool_use' && b.name === tr.tool)?.id,
                content: JSON.stringify(tr.result)
              }))
            }
          ]
        })
      });

      if (summaryResponse.ok) {
        const summary = await summaryResponse.json();
        textResponse = summary.content
          .filter((b: any) => b.type === 'text')
          .map((b: any) => b.text)
          .join('');
      }
    }

    return json({
      response: textResponse,
      toolResults,
      usage: result.usage
    });

  } catch (err: any) {
    console.error('Chat error:', err);
    return json({ error: err.message }, { status: 500 });
  }
};

// Fallback handler without AI - pattern matching
async function handleWithoutAI(message: string, locationId: string) {
  const msg = message.toLowerCase();
  
  const { executeTool } = await import('$lib/ai/executor');
  
  // Export contacts
  if (msg.includes('export') && msg.includes('contact')) {
    const format = msg.includes('csv') ? 'csv' : 'json';
    const result = await executeTool('export_contacts', { format, limit: 100 }, locationId);
    return {
      response: result.success 
        ? `Exported ${result.data.count} contacts as ${format}.`
        : `Error: ${result.error}`,
      toolResults: [{ tool: 'export_contacts', result }],
      data: result.data
    };
  }
  
  // Search contacts
  if ((msg.includes('search') || msg.includes('find')) && msg.includes('contact')) {
    const match = msg.match(/(?:for|named?)\s+["']?([\w\s@.]+)["']?/i);
    const query = match?.[1] || msg.split(' ').pop() || '';
    const result = await executeTool('search_contacts', { query }, locationId);
    return {
      response: result.success
        ? `Found ${result.data.length} contacts matching "${query}".`
        : `Error: ${result.error}`,
      toolResults: [{ tool: 'search_contacts', result }]
    };
  }
  
  // List workflows
  if (msg.includes('workflow') && (msg.includes('list') || msg.includes('show'))) {
    const result = await executeTool('list_workflows', {}, locationId);
    return {
      response: result.success
        ? `Found ${result.data.length} workflows.`
        : `Error: ${result.error}`,
      toolResults: [{ tool: 'list_workflows', result }]
    };
  }
  
  // List pipelines
  if (msg.includes('pipeline')) {
    const result = await executeTool('get_pipelines', {}, locationId);
    return {
      response: result.success
        ? `Found ${result.data.length} pipelines.`
        : `Error: ${result.error}`,
      toolResults: [{ tool: 'get_pipelines', result }]
    };
  }
  
  // Get conversations
  if (msg.includes('conversation') || msg.includes('message')) {
    const result = await executeTool('get_conversations', { limit: 10 }, locationId);
    return {
      response: result.success
        ? `Found ${result.data.length} recent conversations.`
        : `Error: ${result.error}`,
      toolResults: [{ tool: 'get_conversations', result }]
    };
  }
  
  return {
    response: "I can help you with: export contacts, search contacts, list workflows, show pipelines, get conversations. Try asking for one of these!",
    toolResults: []
  };
}
