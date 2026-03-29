import { test, expect } from '@playwright/test'
import { z } from 'zod'
import { exportSessionUseCase as UC } from '../use-cases/export-session'
import { createStagehand, getPage } from './helpers/stagehand'
import { Stagehand } from '@browserbasehq/stagehand'

test.describe(`${UC.id} (AI): ${UC.title}`, () => {
  let stagehand: Stagehand

  test.beforeEach(async () => {
    stagehand = createStagehand()
    await stagehand.init()
    await getPage(stagehand).goto(process.env.BASE_URL ?? 'https://toastmaster.kotahirau.com')
    await stagehand.act('Click the Name text field')
    await stagehand.act('Type "Alice"')
    await stagehand.act('Click the Add button')
    await stagehand.act('Click the Start Session button')
  })

  test.afterEach(async () => {
    await stagehand.close()
  })

  // UC.acceptanceCriteria[0]: "Clicking Export triggers a file download named toastmasters-YYYY-MM-DD.txt"
  test(UC.acceptanceCriteria[0], async () => {
    // Intercept the download URL via evaluate before Stagehand clicks Export
    await getPage(stagehand).evaluate(() => {
      const origCreateObjectURL = URL.createObjectURL.bind(URL)
      URL.createObjectURL = (blob: Blob) => {
        const url = origCreateObjectURL(blob)
        ;(window as unknown as Record<string, unknown>).__lastObjectURL = url
        return url
      }
      const origClick = HTMLAnchorElement.prototype.click
      HTMLAnchorElement.prototype.click = function (this: HTMLAnchorElement) {
        ;(window as unknown as Record<string, unknown>).__downloadFilename = this.download
        origClick.call(this)
      }
    })

    await stagehand.act('Click the Export button in the header toolbar')

    const filename = await getPage(stagehand).evaluate(
      () => (window as unknown as Record<string, unknown>).__downloadFilename as string | undefined,
    )

    expect(filename).toMatch(/^toastmasters-\d{4}-\d{2}-\d{2}\.txt$/)
  })
})
