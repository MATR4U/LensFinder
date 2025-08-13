import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  retries: process.env.CI ? 2 : 0,
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || `http://localhost:${process.env.PORT || '3001'}`,
    headless: process.env.HEADLESS ? process.env.HEADLESS === 'true' : true,
    navigationTimeout: 60_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  webServer: [
    {
      command: process.env.PLAYWRIGHT_SERVER_CMD || 'npm run playwright:server',
      port: Number(process.env.PORT || 3001),
      reuseExistingServer: !process.env.CI,
      env: {
        NODE_ENV: process.env.NODE_ENV || 'development',
        DB_DRIVER: process.env.DB_DRIVER || 'pg',
        PORT: String(process.env.PORT || 3001),
        DATABASE_URL: process.env.DATABASE_URL || `postgres://lens:lens@localhost:${process.env.POSTGRES_PORT || '55432'}/lensfinder`,
        API_KEY: process.env.API_KEY || ''
      },
      timeout: 120_000,
      stdout: 'pipe',
      stderr: 'pipe'
    }
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 13'] },
    },
  ],
});


