import type { UseCase } from './types'

export const exportSessionUseCase: UseCase = {
  id: 'UC-04',
  title: 'Export Session — Download a Text Report',
  actor: 'Any role-holder',
  goal: 'Save all session data as a downloadable text file at the end of the meeting',
  preconditions: [
    'A session is active with at least one member',
  ],
  steps: [
    'Click the Export button in the header',
  ],
  acceptanceCriteria: [
    'Clicking Export triggers a file download named toastmasters-YYYY-MM-DD.txt',
  ],
}
