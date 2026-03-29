import { test, expect } from '@playwright/test'
import { z } from 'zod'
import { Stagehand } from '@browserbasehq/stagehand'
import { endSessionUseCase as UC } from '../use-cases/end-session'
import { createStagehand, getPage, BASE_URL, screenshot } from './helpers/stagehand'

test.describe(`${UC.id} (AI): ${UC.title}`, () => {
  let stagehand: Stagehand

  test.beforeEach(async () => {
    stagehand = createStagehand()
    await stagehand.init()
    await getPage(stagehand).goto(BASE_URL)
    await stagehand.act('Click the Name text field')
    await stagehand.act('Type "Alice"')
    await stagehand.act('Click the Add button')
    await stagehand.act('Click the Start Session button')
  })

  test.afterEach(async () => {
    await stagehand.close()
  })

  // UC.acceptanceCriteria[0]: "Confirming the End dialog resets all data and shows the Setup screen"
  test(UC.acceptanceCriteria[0], async () => {
    await screenshot(stagehand, '1-session-active')
    await getPage(stagehand).evaluate(() => { window.confirm = () => true })
    await stagehand.act('Click the End button in the header')
    await screenshot(stagehand, '2-session-ended-setup-screen')

    const { onSetupScreen } = await stagehand.extract(
      'Is the app now showing the initial Setup screen where you can add attendees and a "Start Session" button is present?',
      z.object({ onSetupScreen: z.boolean() }),
    )
    expect(onSetupScreen).toBe(true)
  })

  test.skip(UC.acceptanceCriteria[1], async () => {
    await getPage(stagehand).evaluate(() => { window.confirm = () => false })
    await stagehand.act('Click the End button in the header')

    const { sessionActive } = await stagehand.extract(
      'Are the role tabs (Ah Counter, Timer, Grammarian, etc.) still visible?',
      z.object({ sessionActive: z.boolean() }),
    )
    expect(sessionActive).toBe(true)
  })
})
