import { Stagehand } from '@browserbasehq/stagehand'
import type { Page } from '@playwright/test'
import { test } from '@playwright/test'

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

export function getPage(stagehand: Stagehand): Page {
  return stagehand.context.pages()[0] as unknown as Page
}

export async function screenshot(stagehand: Stagehand, label: string): Promise<void> {
  const buffer = await getPage(stagehand).screenshot({ fullPage: false })
  await test.info().attach(label, { body: buffer, contentType: 'image/png' })
}
