export interface UseCase {
  id: string
  title: string
  actor: string
  goal: string
  preconditions: string[]
  steps: string[]
  acceptanceCriteria: string[]
}
