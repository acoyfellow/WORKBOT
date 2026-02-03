import { test, expect } from '@playwright/test';

// Helper to set auth cookie
async function setAuthCookie(context: any) {
  await context.addCookies([{
    name: 'workbot_auth',
    value: '1',
    domain: 'localhost',
    path: '/'
  }]);
}

test.describe('Authentication', () => {
  test('redirects to login when not authenticated', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL('/login');
    await expect(page.locator('h1')).toHaveText('Workbot');
    await expect(page.locator('input[name="password"]')).toBeVisible();
  });

  test('shows error on wrong password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await expect(page.locator('text=Invalid password')).toBeVisible();
  });

  test('logs in with correct password', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="password"]', 'workbot2026');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/');
    await expect(page.locator('h2')).toHaveText('Dashboard');
  });
});

test.describe('Dashboard', () => {
  test.beforeEach(async ({ context }) => {
    await setAuthCookie(context);
  });

  test('shows token status', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=GHL API Token')).toBeVisible();
    // Should show either Valid or Expired
    await expect(page.locator('text=/Valid|Expired/')).toBeVisible();
  });

  test('shows stats cards', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Contacts').first()).toBeVisible();
    await expect(page.locator('text=Conversations').first()).toBeVisible();
    await expect(page.locator('text=Opportunities')).toBeVisible();
  });

  test('has refresh token button', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button:has-text("Refresh Token")')).toBeVisible();
  });
});

test.describe('Sidebar & Navigation', () => {
  test.beforeEach(async ({ context }) => {
    await setAuthCookie(context);
  });

  test('sidebar is visible on desktop', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav >> text=Dashboard')).toBeVisible();
    await expect(page.locator('nav >> text=Contacts')).toBeVisible();
    await expect(page.locator('nav >> text=Pipelines')).toBeVisible();
  });

  test('mobile sidebar toggle works', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const sidebar = page.locator('nav');
    await expect(sidebar).toHaveClass(/-translate-x-full/);
    
    await page.click('header button');
    await expect(sidebar).toHaveClass(/translate-x-0/);
  });

  test('location selector has all locations', async ({ page }) => {
    await page.goto('/');
    const select = page.locator('header select');
    await expect(select).toBeVisible();
    await expect(select.locator('option')).toHaveCount(5);
    
    const options = await select.locator('option').allTextContents();
    expect(options).toContain('Phonesites');
    expect(options).toContain('Apex Business');
    expect(options).toContain('Closer Capital');
    expect(options).toContain('MedSpa Millions');
    expect(options).toContain('SignedSeal');
  });
});

test.describe('Contacts Page', () => {
  test.beforeEach(async ({ context }) => {
    await setAuthCookie(context);
  });

  test('loads and shows contacts table', async ({ page }) => {
    await page.goto('/contacts');
    await expect(page.locator('h2')).toHaveText('Contacts');
    await expect(page.locator('input[placeholder="Search..."]')).toBeVisible();
    await expect(page.locator('button:has-text("Search")')).toBeVisible();
    
    // Table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Email")')).toBeVisible();
    await expect(page.locator('th:has-text("Phone")')).toBeVisible();
  });

  test('shows contacts data or loading state', async ({ page }) => {
    await page.goto('/contacts');
    // Wait for either data or error
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Conversations Page', () => {
  test.beforeEach(async ({ context }) => {
    await setAuthCookie(context);
  });

  test('loads and shows conversations table', async ({ page }) => {
    await page.goto('/conversations');
    await expect(page.locator('h2')).toHaveText('Conversations');
    
    // Table headers
    await expect(page.locator('th:has-text("Contact")')).toBeVisible();
    await expect(page.locator('th:has-text("Last Message")')).toBeVisible();
  });
});

test.describe('Pipelines Page', () => {
  test.beforeEach(async ({ context }) => {
    await setAuthCookie(context);
  });

  test('loads and shows pipelines', async ({ page }) => {
    await page.goto('/pipelines');
    await expect(page.locator('h2')).toHaveText('Pipelines');
    
    // Wait for pipelines to load
    await page.waitForSelector('.bg-gray-800 h3', { timeout: 10000 });
    const pipelines = page.locator('.bg-gray-800 h3');
    const count = await pipelines.count();
    expect(count).toBeGreaterThan(0);
  });

  test('pipelines show stages', async ({ page }) => {
    await page.goto('/pipelines');
    await page.waitForSelector('.bg-gray-700', { timeout: 10000 });
    // Stages are shown as gray-700 badges
    const stages = page.locator('.bg-gray-700');
    const count = await stages.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Workflows Page', () => {
  test.beforeEach(async ({ context }) => {
    await setAuthCookie(context);
  });

  test('loads and shows workflows table', async ({ page }) => {
    await page.goto('/workflows');
    await expect(page.locator('h2')).toHaveText('Workflows');
    
    // Table headers
    await expect(page.locator('th:has-text("Name")')).toBeVisible();
    await expect(page.locator('th:has-text("Status")')).toBeVisible();
  });

  test('shows workflow data rows', async ({ page }) => {
    await page.goto('/workflows');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const rows = page.locator('table tbody tr');
    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});

test.describe('Activities Page', () => {
  test.beforeEach(async ({ context }) => {
    await setAuthCookie(context);
  });

  test('loads and shows filter controls', async ({ page }) => {
    await page.goto('/activities');
    await expect(page.locator('h2')).toHaveText('Activities');
    
    // Filter controls (use main to avoid header select)
    await expect(page.locator('main select')).toBeVisible();
    await expect(page.locator('input[type="date"]').first()).toBeVisible();
    await expect(page.locator('button:has-text("Filter")')).toBeVisible();
  });

  test('has activity type filter options', async ({ page }) => {
    await page.goto('/activities');
    const select = page.locator('select').first();
    await expect(select.locator('option')).toHaveCount(5); // All Types + 4 specific
  });
});
