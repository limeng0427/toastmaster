import { test, expect } from '@playwright/test'
import { ahCounterUseCase as UC } from '../use-cases/ah-counter'
import { addMemberAndStart, goToTab } from '../helpers/setup'

test.describe(`${UC.id}: ${UC.title}`, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await addMemberAndStart(page, [{ name: 'Alice' }, { name: 'Bob' }])
    await goToTab(page, 'Ah Counter')
  })

  test(UC.acceptanceCriteria[1], async ({ page }) => {
    // The selected member row has the Mui-selected class (MUI's selection indicator)
    // The first member (Alice) is auto-selected on mount
    await expect(page.getByRole('row', { name: /Alice/ })).toHaveClass(/Mui-selected/)
  })

  test(UC.acceptanceCriteria[0], async ({ page }) => {
    // Pressing A while a member row is selected increments that member's Ah count by 1
    // Alice is auto-selected; the window keydown listener fires regardless of focus
    await page.keyboard.press('a')

    const aliceRow = page.getByRole('row', { name: /Alice/ })
    // Ah column is index 1; contains the count surrounded by +/- buttons
    const ahCell = aliceRow.getByRole('cell').nth(1)
    await expect(ahCell.getByText('1')).toBeVisible()
  })

  test(UC.acceptanceCriteria[2], async ({ page }) => {
    // Clicking the decrease button reduces count by 1, with floor of 0
    await page.keyboard.press('a')
    await page.keyboard.press('a')

    const aliceRow = page.getByRole('row', { name: /Alice/ })
    const ahCell = aliceRow.getByRole('cell').nth(1)
    await ahCell.getByRole('button', { name: 'Decrease' }).click()
    await expect(ahCell.getByText('1')).toBeVisible()
  })

  test(UC.acceptanceCriteria[3], async ({ page }) => {
    // Counts are independent per member — use + buttons to increment without keyboard selection dependency
    const aliceAhCell = page.getByRole('row', { name: /Alice/ }).getByRole('cell').nth(1)
    const bobAhCell = page.getByRole('row', { name: /Bob/ }).getByRole('cell').nth(1)

    await aliceAhCell.getByRole('button', { name: 'Increase' }).click()  // Alice Ah: 1

    await bobAhCell.getByRole('button', { name: 'Increase' }).click()  // Bob Ah: 1
    await bobAhCell.getByRole('button', { name: 'Increase' }).click()  // Bob Ah: 2

    await expect(aliceAhCell.getByText('1')).toBeVisible()
    await expect(bobAhCell.getByText('2')).toBeVisible()
  })
})
