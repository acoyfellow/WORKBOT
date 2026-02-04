// Tool executor - runs the actual GHL API calls

const GHL_API = 'http://localhost:8001';

export interface ToolResult {
  success: boolean;
  data?: any;
  error?: string;
}

export async function executeTool(
  toolName: string,
  params: Record<string, any>,
  locationId: string
): Promise<ToolResult> {
  try {
    switch (toolName) {
      case 'export_contacts':
        return await exportContacts(locationId, params);
      case 'create_contact':
        return await createContact(locationId, params);
      case 'search_contacts':
        return await searchContacts(locationId, params);
      case 'get_pipelines':
        return await getPipelines(locationId);
      case 'list_workflows':
        return await listWorkflows(locationId, params);
      case 'add_to_workflow':
        return await addToWorkflow(locationId, params);
      case 'get_conversations':
        return await getConversations(locationId, params);
      case 'add_tag':
        return await addTag(locationId, params);
      case 'move_opportunity':
        return await moveOpportunity(locationId, params);
      case 'send_sms':
        return await sendSms(locationId, params);
      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

async function ghlFetch(endpoint: string): Promise<any> {
  const res = await fetch(`${GHL_API}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function ghlPost(endpoint: string, body: any): Promise<any> {
  const res = await fetch(`${GHL_API}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

async function exportContacts(locationId: string, params: any): Promise<ToolResult> {
  const { format = 'json', query = '', limit = 100 } = params;
  const data = await ghlFetch(`/api/contacts?locationId=${locationId}&limit=${limit}${query ? `&query=${encodeURIComponent(query)}` : ''}`);
  const contacts = data.data?.contacts || data.contacts || [];
  
  if (format === 'csv') {
    const headers = ['id', 'firstName', 'lastName', 'email', 'phone', 'dateAdded'];
    const csv = [
      headers.join(','),
      ...contacts.map((c: any) => headers.map(h => JSON.stringify(c[h] || '')).join(','))
    ].join('\n');
    return { success: true, data: { format: 'csv', content: csv, count: contacts.length } };
  }
  
  return { success: true, data: { format: 'json', contacts, count: contacts.length } };
}

async function createContact(locationId: string, params: any): Promise<ToolResult> {
  const { firstName, lastName, email, phone, tags } = params;
  const body: any = { locationId, firstName };
  if (lastName) body.lastName = lastName;
  if (email) body.email = email;
  if (phone) body.phone = phone;
  if (tags) body.tags = tags.split(',').map((t: string) => t.trim());
  
  const result = await ghlPost('/api/contacts', body);
  return { success: true, data: result };
}

async function searchContacts(locationId: string, params: any): Promise<ToolResult> {
  const { query } = params;
  const data = await ghlFetch(`/api/contacts?locationId=${locationId}&query=${encodeURIComponent(query)}&limit=10`);
  const contacts = data.data?.contacts || data.contacts || [];
  return { 
    success: true, 
    data: contacts.map((c: any) => ({
      id: c.id,
      name: `${c.firstName || ''} ${c.lastName || ''}`.trim(),
      email: c.email,
      phone: c.phone
    }))
  };
}

async function getPipelines(locationId: string): Promise<ToolResult> {
  const data = await ghlFetch(`/api/pipelines?locationId=${locationId}`);
  const pipelines = data.data?.pipelines || data.pipelines || [];
  return {
    success: true,
    data: pipelines.map((p: any) => ({
      id: p.id,
      name: p.name,
      stages: p.stages?.map((s: any) => ({ id: s.id, name: s.name })) || []
    }))
  };
}

async function listWorkflows(locationId: string, params: any): Promise<ToolResult> {
  const { status = 'all' } = params;
  const data = await ghlFetch(`/api/workflows?locationId=${locationId}`);
  let workflows = data.data?.workflows || data.workflows || [];
  
  if (status !== 'all') {
    workflows = workflows.filter((w: any) => w.status === status);
  }
  
  return {
    success: true,
    data: workflows.map((w: any) => ({
      id: w.id,
      name: w.name,
      status: w.status
    }))
  };
}

async function addToWorkflow(locationId: string, params: any): Promise<ToolResult> {
  const { contactId, contactEmail, workflowName } = params;
  
  // Find contact if email provided
  let cid = contactId;
  if (!cid && contactEmail) {
    const search = await searchContacts(locationId, { query: contactEmail });
    if (!search.success || !search.data?.length) {
      return { success: false, error: `Contact not found: ${contactEmail}` };
    }
    cid = search.data[0].id;
  }
  
  // Find workflow by name
  const workflows = await listWorkflows(locationId, {});
  const workflow = workflows.data?.find((w: any) => 
    w.name.toLowerCase().includes(workflowName.toLowerCase())
  );
  
  if (!workflow) {
    return { success: false, error: `Workflow not found: ${workflowName}` };
  }
  
  // Add to workflow (this endpoint may vary)
  const result = await ghlPost(`/api/workflows/${workflow.id}/enroll`, {
    contactId: cid,
    locationId
  });
  
  return { success: true, data: { enrolled: true, workflow: workflow.name, contactId: cid } };
}

async function getConversations(locationId: string, params: any): Promise<ToolResult> {
  const { limit = 20 } = params;
  const data = await ghlFetch(`/api/conversations?locationId=${locationId}&limit=${limit}`);
  const conversations = data.data?.conversations || data.conversations || [];
  return {
    success: true,
    data: conversations.map((c: any) => ({
      id: c.id,
      contactName: c.contactName,
      lastMessage: c.lastMessageBody,
      unread: c.unreadCount
    }))
  };
}

async function addTag(locationId: string, params: any): Promise<ToolResult> {
  const { contactEmail, tag } = params;
  
  // Find contact
  const search = await searchContacts(locationId, { query: contactEmail });
  if (!search.success || !search.data?.length) {
    return { success: false, error: `Contact not found: ${contactEmail}` };
  }
  
  const contactId = search.data[0].id;
  const result = await ghlPost(`/api/contacts/${contactId}/tags`, {
    tags: [tag],
    locationId
  });
  
  return { success: true, data: { tagged: true, contact: contactEmail, tag } };
}

async function moveOpportunity(locationId: string, params: any): Promise<ToolResult> {
  // This would need opportunity lookup - simplified for now
  return { success: false, error: 'Move opportunity not yet implemented - need opportunity ID' };
}

async function sendSms(locationId: string, params: any): Promise<ToolResult> {
  const { contactEmail, contactPhone, message } = params;
  
  let phone = contactPhone;
  if (!phone && contactEmail) {
    const search = await searchContacts(locationId, { query: contactEmail });
    if (!search.success || !search.data?.length) {
      return { success: false, error: `Contact not found: ${contactEmail}` };
    }
    phone = search.data[0].phone;
  }
  
  if (!phone) {
    return { success: false, error: 'No phone number found' };
  }
  
  const result = await ghlPost('/api/conversations/messages', {
    type: 'SMS',
    contactId: null, // would need lookup
    message,
    locationId
  });
  
  return { success: true, data: { sent: true, phone, message } };
}
