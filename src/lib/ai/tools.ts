// GHL Tools - Available actions the AI can take

export interface Tool {
  name: string;
  description: string;
  parameters: {
    type: 'object';
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
    }>;
    required: string[];
  };
}

export const GHL_TOOLS: Tool[] = [
  {
    name: 'export_contacts',
    description: 'Export contacts from the current location. Can filter by query and export as JSON or CSV.',
    parameters: {
      type: 'object',
      properties: {
        format: {
          type: 'string',
          description: 'Export format',
          enum: ['json', 'csv']
        },
        query: {
          type: 'string',
          description: 'Optional search query to filter contacts'
        },
        limit: {
          type: 'number',
          description: 'Maximum number of contacts to export (default 100)'
        }
      },
      required: ['format']
    }
  },
  {
    name: 'create_contact',
    description: 'Create a new contact in the current location',
    parameters: {
      type: 'object',
      properties: {
        firstName: { type: 'string', description: 'First name' },
        lastName: { type: 'string', description: 'Last name' },
        email: { type: 'string', description: 'Email address' },
        phone: { type: 'string', description: 'Phone number' },
        tags: { type: 'string', description: 'Comma-separated tags to add' }
      },
      required: ['firstName']
    }
  },
  {
    name: 'add_to_workflow',
    description: 'Add a contact to a workflow/automation',
    parameters: {
      type: 'object',
      properties: {
        contactId: { type: 'string', description: 'Contact ID (or use contactEmail to look up)' },
        contactEmail: { type: 'string', description: 'Contact email to look up' },
        workflowName: { type: 'string', description: 'Name of the workflow (partial match OK)' }
      },
      required: ['workflowName']
    }
  },
  {
    name: 'search_contacts',
    description: 'Search for contacts by name, email, or phone',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' }
      },
      required: ['query']
    }
  },
  {
    name: 'get_pipelines',
    description: 'List all pipelines and their stages',
    parameters: {
      type: 'object',
      properties: {},
      required: []
    }
  },
  {
    name: 'move_opportunity',
    description: 'Move an opportunity to a different pipeline stage',
    parameters: {
      type: 'object',
      properties: {
        contactEmail: { type: 'string', description: 'Contact email to find their opportunity' },
        pipelineName: { type: 'string', description: 'Pipeline name' },
        stageName: { type: 'string', description: 'Stage to move to' }
      },
      required: ['stageName']
    }
  },
  {
    name: 'list_workflows',
    description: 'List all workflows/automations',
    parameters: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          description: 'Filter by status',
          enum: ['published', 'draft', 'all']
        }
      },
      required: []
    }
  },
  {
    name: 'send_sms',
    description: 'Send an SMS to a contact',
    parameters: {
      type: 'object',
      properties: {
        contactEmail: { type: 'string', description: 'Contact email to look up' },
        contactPhone: { type: 'string', description: 'Or direct phone number' },
        message: { type: 'string', description: 'Message to send' }
      },
      required: ['message']
    }
  },
  {
    name: 'get_conversations',
    description: 'Get recent conversations/messages',
    parameters: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: 'Number of conversations to fetch' }
      },
      required: []
    }
  },
  {
    name: 'add_tag',
    description: 'Add a tag to a contact',
    parameters: {
      type: 'object',
      properties: {
        contactEmail: { type: 'string', description: 'Contact email' },
        tag: { type: 'string', description: 'Tag to add' }
      },
      required: ['contactEmail', 'tag']
    }
  }
];

// System prompt for the AI
export const SYSTEM_PROMPT = `You are a GHL (GoHighLevel) assistant. You help users manage their CRM by executing commands.

Current location: {locationName} (ID: {locationId})

You have access to the following tools to interact with GHL:
- export_contacts: Export contacts as JSON or CSV
- create_contact: Create new contacts
- add_to_workflow: Add contacts to automations
- search_contacts: Find contacts
- get_pipelines: List pipelines and stages
- move_opportunity: Move deals between stages
- list_workflows: See available automations
- send_sms: Send text messages
- get_conversations: View recent messages
- add_tag: Tag contacts

When the user asks you to do something:
1. Determine which tool(s) to use
2. Call the tool with appropriate parameters
3. Report the results clearly

Be concise and action-oriented. If you need clarification, ask.
If a task requires multiple steps, execute them in sequence.`;
