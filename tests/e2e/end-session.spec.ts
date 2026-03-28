import { test, expect } from '@playwright/test'
import { endSessionUseCase as UC } from '../use-cases/end-session'
import { addMemberAndStart } from '../helpers/setup'

test.describe(`${UC.id}: ${UC.title}`, () => {
  test(UC.acceptanceCriteria[0], async ({ page }) => {
    // Confirming the End dialog resets all data and shows the Setup screen
    await page.goto('/')
    await addMemberAndStart(page, [{ name: 'Alice' }])

    page.on('dialog', (dialog) => dialog.accept())
    await page.getByRole('button', { name: 'End' }).click()

    await expect(page.getByRole('button', { name: 'Start Session' })).toBeVisible()
  })

  test(UC.acceptanceCriteria[1], async ({ page }) => {
    // Dismissing the End dialog keeps the session active
    await page.goto('/')
    await addMemberAndStart(page, [{ name: 'Alice' }])

    page.on('dialog', (dialog) => dialog.dismiss())
    await page.getByRole('button', { name: 'End' }).click()

    await expect(page.getByRole('tab', { name: 'Ah Counter' })).toBeVisible()
  })
})
