import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const GHL_API = 'http://localhost:8001';

export const GET: RequestHandler = async ({ params, url }) => {
  const path = params.path;
  const queryString = url.search;
  
  try {
    const res = await fetch(`${GHL_API}/api/${path}${queryString}`);
    const data = await res.json();
    return json(data);
  } catch (e) {
    return json({ error: (e as Error).message }, { status: 500 });
  }
};

export const POST: RequestHandler = async ({ params, url, request }) => {
  const path = params.path;
  const queryString = url.search;
  
  try {
    const body = await request.text();
    const res = await fetch(`${GHL_API}/api/${path}${queryString}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body || undefined,
    });
    const data = await res.json();
    return json(data);
  } catch (e) {
    return json({ error: (e as Error).message }, { status: 500 });
  }
};
