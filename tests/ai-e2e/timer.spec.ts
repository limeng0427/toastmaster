import { test, expect } from '@playwright/test'
import { z } from 'zod'
import { Stagehand } from '@browserbasehq/stagehand'
import { timerUseCase as UC } from '../use-cases/timer'
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
    await stagehand.act('Click the Start Session button')
    await stagehand.act('Click the Timer tab')
  })

  test.afterEach(async () => {
    await stagehand.close()
  })

  // UC.acceptanceCriteria[0]: "Three default slots are visible: Prepared Speech, Table Topic, Evaluation"
  test(UC.acceptanceCriteria[0], async () => {
    const { slots } = await stagehand.extract(
      'List the label or name of each timer slot card currently visible on the page',
      z.object({ slots: z.array(z.string()) }),
    )
    expect(slots.some(s => /prepared speech/i.test(s))).toBe(true)
    expect(slots.some(s => /table topic/i.test(s))).toBe(true)
    expect(slots.some(s => /evaluation/i.test(s))).toBe(true)
  })

  // UC.acceptanceCriteria[1]: "Clicking Start replaces the Start button with a Pause button"
  test(UC.acceptanceCriteria[1], async () => {
    await stagehand.act('Click the Start button on the first timer slot')

    const { hasPause, hasStart } = await stagehand.extract(
      'In the first timer slot card, is there a Pause button visible? Is there a Start button visible?',
      z.object({ hasPause: z.boolean(), hasStart: z.boolean() }),
    )
    expect(hasPause).toBe(true)
    expect(hasStart).toBe(false)

    await stagehand.act('Click the Pause button on the first timer slot')
  })

  // UC.acceptanceCriteria[2]: "Clicking Reset while a timer is running stops it and returns the display to 0:00"
  test(UC.acceptanceCriteria[2], async () => {
    await stagehand.act('Click the Start button on the first timer slot')
    await getPage(stagehand).waitForTimeout(1200)
    await stagehand.act('Click the Reset button on the first timer slot')

    const { display, hasStart } = await stagehand.extract(
      'In the first timer slot card, what time is shown on the timer display? Is there a Start button (meaning it is not currently running)?',
      z.object({
        display: z.string().describe('the time shown, e.g. "0:00"'),
        hasStart: z.boolean().describe('true if Start button is visible (timer is stopped)'),
      }),
    )
    expect(display).toBe('0:00')
    expect(hasStart).toBe(true)
  })

  // UC.acceptanceCriteria[3]: "A new custom slot can be added and appears in the list"
  test(UC.acceptanceCriteria[3], async () => {
    await stagehand.act('Click the label input field in the "Add speech slot" section at the bottom')
    await stagehand.act('Type "Humorous Speech"')
    await stagehand.act('Click the Add button in the speech slot section at the bottom')

    const { slots } = await stagehand.extract(
      'List the label of each timer slot card visible on the page',
      z.object({ slots: z.array(z.string()) }),
    )
    expect(slots.some(s => /humorous speech/i.test(s))).toBe(true)
  })
})
