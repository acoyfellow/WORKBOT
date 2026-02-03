import { redirect, type Handle } from '@sveltejs/kit';

const AUTH_COOKIE = 'workbot_auth';
const AUTH_PASSWORD = 'workbot2026';

export const handle: Handle = async ({ event, resolve }) => {
  const isLoginPage = event.url.pathname === '/login';
  const isAuthCookie = event.cookies.get(AUTH_COOKIE) === '1';

  // Handle login POST
  if (isLoginPage && event.request.method === 'POST') {
    const formData = await event.request.formData();
    const password = formData.get('password');
    
    if (password === AUTH_PASSWORD) {
      event.cookies.set(AUTH_COOKIE, '1', {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30 // 30 days
      });
      throw redirect(303, '/');
    }
    // Wrong password - let the page render with error
    event.locals.loginError = true;
  }

  // Redirect to login if not authenticated
  if (!isAuthCookie && !isLoginPage) {
    throw redirect(303, '/login');
  }

  // Redirect away from login if already authenticated
  if (isAuthCookie && isLoginPage) {
    throw redirect(303, '/');
  }

  return resolve(event);
};
