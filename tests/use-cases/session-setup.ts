import type { UseCase } from './types'

export const sessionSetupUseCase: UseCase = {
  id: 'UC-01',
  title: 'Session Setup — Add Members and Start Session',
  actor: 'Meeting organiser',
  goal: 'Configure meeting attendees before the session begins',
  preconditions: [
    'The app is loaded at the Setup screen',
    'No session is currently active',
  ],
  steps: [
    'Type a member name into the Name field',
    'Select a role from the Role dropdown',
    'Click Add (or press Enter) to add the member to the list',
    'Repeat for a second member',
    'Click Start Session',
  ],
  acceptanceCriteria: [
    'The Start Session button is disabled until at least one member is added',
    'Each added member appears in the member list',
    'After clicking Start Session, all five role tabs are visible',
    'The attendee count chip in the header reflects the number of members added',
  ],
}
