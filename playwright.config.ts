import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    headless: true,
    trace: 'retain-on-failure',
    baseURL: 'http://localhost:3000',
  },
  webServer: {
    command: 'npm run build && npm run start',
    port: 3000,
    timeout: 180_000,
    reuseExistingServer: !process.env.CI,
  },
};

export default config;


