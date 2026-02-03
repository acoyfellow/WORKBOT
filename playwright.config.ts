import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  use: {
    baseURL: 'http://localhost:8000',
    headless: true,
  },
  webServer: {
    command: 'bunx vite dev --port 8000 --host 0.0.0.0',
    port: 8000,
    reuseExistingServer: true,
  },
});
