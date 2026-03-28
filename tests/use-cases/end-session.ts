import type { UseCase } from './types'

export const endSessionUseCase: UseCase = {
  id: 'UC-05',
  title: 'End Session — Reset All Data and Return to Setup',
  actor: 'Meeting organiser',
  goal: 'Clear all session data and prepare the app for the next meeting',
  preconditions: [
    'A session is active',
  ],
  steps: [
    'Click the End button in the header',
    'Confirm the browser dialog to reset all data',
  ],
  acceptanceCriteria: [
    'Confirming the End dialog resets all data and shows the Setup screen',
    'Dismissing the End dialog keeps the session active',
  ],
}
