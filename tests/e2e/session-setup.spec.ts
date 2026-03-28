import { test, expect } from '@playwright/test'
import { sessionSetupUseCase as UC } from '../use-cases/session-setup'
import { addMemberAndStart } from '../helpers/setup'

test.describe(`${UC.id}: ${UC.title}`, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test(UC.acceptanceCriteria[0], async ({ page }) => {
    // Start Session is disabled until at least one member is added
    await expect(page.getByRole('button', { name: 'Start Session' })).toBeDisabled()
  })

  test(UC.acceptanceCriteria[1], async ({ page }) => {
    // Each added member appears in the member list
    await page.getByPlaceholder('Name').fill('Alice')
    await page.getByRole('button', { name: 'Add' }).click()
    await page.getByPlaceholder('Name').fill('Bob')
    await page.getByRole('button', { name: 'Add' }).click()

    await expect(page.getByText('Alice')).toBeVisible()
    await expect(page.getByText('Bob')).toBeVisible()
  })

  test(UC.acceptanceCriteria[2], async ({ page }) => {
    // After clicking Start Session, all five role tabs are visible
    await addMemberAndStart(page, [{ name: 'Alice' }])

    await expect(page.getByRole('tab', { name: 'Ah Counter' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Timer' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Grammarian' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'General Evaluator' })).toBeVisible()
    await expect(page.getByRole('tab', { name: 'Topics Master' })).toBeVisible()
  })

  test(UC.acceptanceCriteria[3], async ({ page }) => {
    // The attendee count chip reflects the number of members added
    await addMemberAndStart(page, [{ name: 'Alice' }, { name: 'Bob' }])

    await expect(page.getByText('2 attendees')).toBeVisible()
  })
})
