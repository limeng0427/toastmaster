import { test, expect } from '@playwright/test'
import { z } from 'zod'
import { Stagehand } from '@browserbasehq/stagehand'
import { ahCounterUseCase as UC } from '../use-cases/ah-counter'
import { createStagehand, getPage } from './helpers/stagehand'

test.describe(`${UC.id} (AI): ${UC.title}`, () => {
  let stagehand: Stagehand

  test.beforeEach(async () => {
    stagehand = createStagehand()
    await stagehand.init()
    await getPage(stagehand).goto('/')
    await stagehand.act('Click the Name text field')
    await stagehand.act('Type "Alice"')
    await stagehand.act('Click the Add button')
    await stagehand.act('Click the Name text field')
    await stagehand.act('Type "Bob"')
    await stagehand.act('Click the Add button')
    await stagehand.act('Click the Start Session button')
    await stagehand.act('Click the Ah Counter tab')
  })

  test.afterEach(async () => {
    await stagehand.close()
  })

  // UC.acceptanceCriteria[0]: "Pressing A while a member row is selected increments that member's Ah count by 1"
  test(UC.acceptanceCriteria[0], async () => {
    // Alice is auto-selected on mount; dispatch keydown via evaluate (V3Page has no .keyboard)
    await getPage(stagehand).evaluate(() =>
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true })),
    )

    const { count } = await stagehand.extract(
      "What is the Ah filler word count shown for Alice in the table?",
      z.object({ count: z.number() }),
    )
    expect(count).toBe(1)
  })

  // UC.acceptanceCriteria[1]: "The selected member row has aria-selected='true'"
  test(UC.acceptanceCriteria[1], async () => {
    const { selected } = await stagehand.extract(
      'Which member row appears highlighted or selected (with a small blue indicator) in the Ah Counter table?',
      z.object({ selected: z.string() }),
    )
    expect(selected.toLowerCase()).toContain('alice')
  })

  // UC.acceptanceCriteria[2]: "Clicking the decrease button on a count reduces it by 1, with a floor of 0"
  test(UC.acceptanceCriteria[2], async () => {
    await stagehand.act('Click the increase button for the Ah column in Alice\'s row')
    await stagehand.act('Click the increase button for the Ah column in Alice\'s row')
    await stagehand.act('Click the decrease button for the Ah column in Alice\'s row')

    const { count } = await stagehand.extract(
      "What is the Ah filler word count shown for Alice?",
      z.object({ count: z.number() }),
    )
    expect(count).toBe(1)
  })

  // UC.acceptanceCriteria[3]: "Counts are independent per member — incrementing one does not affect another"
  test(UC.acceptanceCriteria[3], async () => {
    await stagehand.act('Click the increase button for the Ah column in Alice\'s row')

    await stagehand.act('Click the row for Bob')
    await getPage(stagehand).evaluate(() =>
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true })),
    )
    await getPage(stagehand).evaluate(() =>
      window.dispatchEvent(new KeyboardEvent('keydown', { key: 'a', bubbles: true })),
    )

    const { aliceCount, bobCount } = await stagehand.extract(
      'What are the Ah filler word counts for Alice and for Bob in the table?',
      z.object({ aliceCount: z.number(), bobCount: z.number() }),
    )
    expect(aliceCount).toBe(1)
    expect(bobCount).toBe(2)
  })
})
