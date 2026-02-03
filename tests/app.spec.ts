import { test, expect } from '@playwright/test';

test.describe('Phase 1 - Foundation', () => {
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

  test('logs in with correct password and shows dashboard', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[name="password"]', 'workbot2026');
    await page.click('button[type="submit"]');
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/');
    await expect(page.locator('h2')).toHaveText('Dashboard');
    
    // Stats cards visible (use more specific selectors)
    await expect(page.locator('.bg-gray-800 >> text=Contacts').first()).toBeVisible();
    await expect(page.locator('.bg-gray-800 >> text=Conversations').first()).toBeVisible();
    await expect(page.locator('.bg-gray-800 >> text=Opportunities')).toBeVisible();
  });

  test('sidebar navigation works', async ({ page, context }) => {
    // Set auth cookie
    await context.addCookies([{
      name: 'workbot_auth',
      value: '1',
      domain: 'localhost',
      path: '/'
    }]);
    
    await page.goto('/');
    await expect(page.locator('nav')).toBeVisible();
    await expect(page.locator('nav >> text=Dashboard')).toBeVisible();
    await expect(page.locator('nav >> text=Contacts')).toBeVisible();
  });

  test('location selector is present with all locations', async ({ page, context }) => {
    await context.addCookies([{
      name: 'workbot_auth',
      value: '1',
      domain: 'localhost',
      path: '/'
    }]);
    
    await page.goto('/');
    const select = page.locator('header select');
    await expect(select).toBeVisible();
    
    // Check all 5 locations are present as options
    await expect(select.locator('option')).toHaveCount(5);
    
    // Verify specific location names exist
    const options = await select.locator('option').allTextContents();
    expect(options).toContain('Phonesites');
    expect(options).toContain('Apex Business');
    expect(options).toContain('Closer Capital');
    expect(options).toContain('MedSpa Millions');
    expect(options).toContain('SignedSeal');
  });

  test('mobile sidebar toggle works', async ({ page, context }) => {
    await context.addCookies([{
      name: 'workbot_auth',
      value: '1',
      domain: 'localhost',
      path: '/'
    }]);
    
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Sidebar should be hidden initially on mobile
    const sidebar = page.locator('nav');
    await expect(sidebar).toHaveClass(/-translate-x-full/);
    
    // Click hamburger
    await page.click('header button');
    
    // Sidebar should be visible
    await expect(sidebar).toHaveClass(/translate-x-0/);
  });
});
