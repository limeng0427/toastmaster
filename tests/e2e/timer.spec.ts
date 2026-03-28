import { test, expect } from '@playwright/test'
import { timerUseCase as UC } from '../use-cases/timer'
import { addMemberAndStart, goToTab } from '../helpers/setup'

test.describe(`${UC.id}: ${UC.title}`, () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await addMemberAndStart(page, [{ name: 'Alice' }])
    await goToTab(page, 'Timer')
  })

  test(UC.acceptanceCriteria[0], async ({ page }) => {
    // Three default slots are visible: Prepared Speech, Table Topic, Evaluation
    // Slot labels are TextField input values; check with toHaveValue
    const slots = page.locator('[data-testid="timer-slot"]')
    await expect(slots.nth(0).locator('input').first()).toHaveValue('Prepared Speech')
    await expect(slots.nth(1).locator('input').first()).toHaveValue('Table Topic')
    await expect(slots.nth(2).locator('input').first()).toHaveValue('Evaluation')
  })

  test(UC.acceptanceCriteria[1], async ({ page }) => {
    // Clicking Start replaces the Start button with a Pause button (scoped to first slot)
    const firstSlot = page.locator('[data-testid="timer-slot"]').first()
    await firstSlot.getByRole('button', { name: 'Start' }).click()
    await expect(firstSlot.getByRole('button', { name: 'Pause' })).toBeVisible()
    await expect(firstSlot.getByRole('button', { name: 'Start' })).not.toBeVisible()
    // Clean up: pause to avoid timer running in background
    await firstSlot.getByRole('button', { name: 'Pause' }).click()
  })

  test(UC.acceptanceCriteria[2], async ({ page }) => {
    // Clicking Reset while running stops the timer and returns display to 0:00
    const firstSlot = page.locator('[data-testid="timer-slot"]').first()
    await firstSlot.getByRole('button', { name: 'Start' }).click()
    await page.waitForTimeout(1200)
    await firstSlot.getByRole('button', { name: 'Reset' }).click()

    await expect(firstSlot.getByText('0:00')).toBeVisible()
    await expect(firstSlot.getByRole('button', { name: 'Start' })).toBeVisible()
  })

  test(UC.acceptanceCriteria[3], async ({ page }) => {
    // A new custom slot can be added and appears in the list
    await page.getByPlaceholder('Label (e.g. Humorous Speech)').fill('Humorous Speech')
    await page.getByRole('button', { name: 'Add' }).last().click()
    // Slot label is a TextField input value; the new slot appears last
    await expect(page.locator('[data-testid="timer-slot"]').last().locator('input').first()).toHaveValue('Humorous Speech')
  })
})
