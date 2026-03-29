import { Stagehand } from '@browserbasehq/stagehand'
import type { Page } from '@playwright/test'

export const BASE_URL = process.env.BASE_URL ?? 'http://localhost:4173'

export function createStagehand(): Stagehand {
  return new Stagehand({
    env: 'LOCAL',
    model: {
      modelName: 'anthropic/claude-sonnet-4-6',
      apiKey: process.env.ANTHROPIC_API_KEY,
    },
    localBrowserLaunchOptions: { headless: true },
    verbose: 0,
    disablePino: true,
  })
}

/**
 * Returns the active Playwright-compatible page from Stagehand's browser.
 * Stagehand uses patchright (a Playwright fork) internally, so the full
 * Playwright Page API is available at runtime even though Stagehand's own
 * type definitions only expose a subset.
 */
export function getPage(stagehand: Stagehand): Page {
  return stagehand.context.pages()[0] as unknown as Page
}
