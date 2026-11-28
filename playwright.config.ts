import { defineConfig, devices } from '@playwright/test';

// TAB-REQ-010: the built page against a mock of the Extensions API, in a real browser.
export default defineConfig({
  testDir: 'test/e2e',
  use: { baseURL: 'http://localhost:4317/' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'], viewport: { width: 800, height: 500 } } }],
  webServer: { command: 'npm run preview', url: 'http://localhost:4317/index.html', reuseExistingServer: true },
});
