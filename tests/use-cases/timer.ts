import type { UseCase } from './types'

export const timerUseCase: UseCase = {
  id: 'UC-03',
  title: 'Timer — Start, Pause, and Reset Speech Timers',
  actor: 'Timer role-holder',
  goal: 'Track elapsed time for each speaker slot with traffic-light feedback',
  preconditions: [
    'A session is active',
    'The Timer tab is selected',
  ],
  steps: [
    'Observe the default speech slots',
    'Click Start on a slot to begin timing',
    'Click Pause to stop the timer without resetting',
    'Click Reset to return the timer to 0:00',
    'Fill in the label field and click Add to create a custom slot',
  ],
  acceptanceCriteria: [
    'Three default slots are visible: Prepared Speech, Table Topic, Evaluation',
    'Clicking Start replaces the Start button with a Pause button',
    'Clicking Reset while a timer is running stops it and returns the display to 0:00',
    'A new custom slot can be added and appears in the list',
  ],
}
