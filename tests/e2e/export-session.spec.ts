import { test, expect } from '@playwright/test'
import { exportSessionUseCase as UC } from '../use-cases/export-session'
import { addMemberAndStart } from '../helpers/setup'

test.describe(`${UC.id}: ${UC.title}`, () => {
  test(UC.acceptanceCriteria[0], async ({ page }) => {
    // Clicking Export triggers a download named toastmasters-YYYY-MM-DD.txt
    await page.goto('/')
    await addMemberAndStart(page, [{ name: 'Alice' }])

    const downloadPromise = page.waitForEvent('download')
    await page.getByRole('button', { name: 'Export' }).click()
    const download = await downloadPromise

    expect(download.suggestedFilename()).toMatch(/^toastmasters-\d{4}-\d{2}-\d{2}\.txt$/)
  })
})
