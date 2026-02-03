import { redirect, type Handle } from '@sveltejs/kit';

const AUTH_COOKIE = 'workbot_auth';

export const handle: Handle = async ({ event, resolve }) => {
  const isLoginPage = event.url.pathname === '/login';
  const isApiRoute = event.url.pathname.startsWith('/api/');
  const isAuthCookie = event.cookies.get(AUTH_COOKIE) === '1';

  // Redirect to login if not authenticated (except login page and API routes)
  if (!isAuthCookie && !isLoginPage && !isApiRoute) {
    throw redirect(303, '/login');
  }

  return resolve(event);
};
