import type { PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
  testDir: './tests/e2e',
  timeout: 60_000,
  retries: 0,
  use: {
    headless: true,
    trace: 'retain-on-failure',
    baseURL: 'http://localhost:3100',
  },
  webServer: {
    command: 'bash -c "npm run build && npx next start -p 3100"',
    port: 3100,
    timeout: 180_000,
    reuseExistingServer: false,
  },
};

export default config;


