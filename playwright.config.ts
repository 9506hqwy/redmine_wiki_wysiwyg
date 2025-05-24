import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './test/e2e',
  fullyParallel: false,
  reporter: [
    ['html', {outputFolder: "artifacts/playwright/"}],
  ],
  projects: [
    {
      name: 'initialize',
      testMatch: 'initialize*',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium setup',
      testMatch: 'setup*',
      teardown: 'chromium teardown',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'chromium test',
      testMatch: 'wiki*',
      use: { ...devices['Desktop Chrome'] },
      dependencies: ['chromium setup'],
    },
    {
      name: 'chromium teardown',
      testMatch: 'teardown*',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox setup',
      testMatch: 'setup*',
      teardown: 'firefox teardown',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'firefox test',
      testMatch: 'wiki*',
      use: { ...devices['Desktop Firefox'] },
      dependencies: ['firefox setup'],
    },
    {
      name: 'firefox teardown',
      testMatch: 'teardown*',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit setup',
      testMatch: 'setup*',
      teardown: 'webkit teardown',
      use: { ...devices['Desktop Safari'] },
    },
    {
      name: 'webkit test',
      testMatch: 'wiki*',
      use: { ...devices['Desktop Safari'] },
      dependencies: ['webkit setup'],
    },
    {
      name: 'webkit teardown',
      testMatch: 'teardown*',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
