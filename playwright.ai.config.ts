import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.BASE_URL ?? 'https://toastmaster.kotahirau.com'

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
  ...(!process.env.BASE_URL && !process.env.CI
    ? {
        webServer: {
          command: 'npm run build && npm run preview',
          url: 'http://localhost:4173',
          reuseExistingServer: true,
          timeout: 120_000,
          stdout: 'pipe',
          stderr: 'pipe',
        },
      }
    : {}),
})
