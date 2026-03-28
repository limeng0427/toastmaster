import type { Page } from '@playwright/test'

interface Member {
  name: string
  role?: string
}

/**
 * Adds one or more members on the Setup screen and clicks Start Session.
 * Leaves the page on the main tab shell.
 */
export async function addMemberAndStart(page: Page, members: Member[]): Promise<void> {
  for (const member of members) {
    await page.getByPlaceholder('Name').fill(member.name)
    await page.getByRole('button', { name: 'Add' }).click()
  }
  await page.getByRole('button', { name: 'Start Session' }).click()
}

/**
 * Navigates to a named role tab in the session shell.
 */
export async function goToTab(page: Page, tabName: string): Promise<void> {
  await page.getByRole('tab', { name: tabName }).click()
}
