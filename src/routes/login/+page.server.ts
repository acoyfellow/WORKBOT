import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';

const AUTH_COOKIE = 'workbot_auth';
const AUTH_PASSWORD = 'workbot2026';

export const load: PageServerLoad = async ({ cookies }) => {
  // Already authenticated, redirect to home
  if (cookies.get(AUTH_COOKIE) === '1') {
    throw redirect(303, '/');
  }
  return {};
};

export const actions: Actions = {
  default: async ({ request, cookies }) => {
    const formData = await request.formData();
    const password = formData.get('password');
    
    if (password === AUTH_PASSWORD) {
      cookies.set(AUTH_COOKIE, '1', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
      throw redirect(303, '/');
    }
    
    return fail(400, { error: true });
  }
};
