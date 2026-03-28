import type { UseCase } from './types'

export const ahCounterUseCase: UseCase = {
  id: 'UC-02',
  title: 'Ah Counter — Track Filler Words via Keyboard Shortcuts',
  actor: 'Ah Counter role-holder',
  goal: 'Quickly tally filler words for each speaker using keyboard shortcuts',
  preconditions: [
    'A session is active with at least two members',
    'The Ah Counter tab is selected',
  ],
  steps: [
    'Click a member row to select them',
    'Press A to record an "Ah" filler word',
    'Press U to record an "Um" filler word',
    'Click another member row to switch selection',
    'Use the minus button to decrement a count',
  ],
  acceptanceCriteria: [
    'Pressing A while a member row is selected increments that member\'s Ah count by 1',
    'The selected member row has aria-selected="true"',
    'Clicking the decrease button on a count reduces it by 1, with a floor of 0',
    'Counts are independent per member — incrementing one does not affect another',
  ],
}
