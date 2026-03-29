import { defineConfig, devices } from '@playwright/test'

const useExternalURL = Boolean(process.env.BASE_URL)
const baseURL = process.env.BASE_URL ?? 'http://localhost:4173'

export default defineConfig({
  testDir: './tests/ai-e2e',
  fullyParallel: false,
  retries: 0,
  workers: 1,
  timeout: 90_000,
  use: { baseURL },
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'playwright-ai-report' }],
  ],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  ...(!useExternalURL
    ? {
        webServer: {
          command: 'npm run build && npm run preview',
          url: 'http://localhost:4173',
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          stdout: 'pipe',
          stderr: 'pipe',
        },
      }
    : {}),
})
