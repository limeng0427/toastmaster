import { FILLER_WORDS } from '../store/session'
import type { TimerSlot, Topic, GrammarianState, EvaluatorState } from '../store/session'
import type { FillerWord } from '../store/session'

interface ExportState {
  members: string[]
  ahCounter: Record<string, Record<FillerWord, number>>
  timerSlots: TimerSlot[]
  grammarian: GrammarianState
  evaluator: EvaluatorState
  topics: Topic[]
}

function fmtSec(sec: number) {
  const m = Math.floor(sec / 60)
  const s = sec % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function exportSession(state: ExportState) {
  const lines: string[] = []
  const now = new Date().toLocaleString()
  lines.push(`TOASTMASTERS SESSION REPORT`)
  lines.push(`Generated: ${now}`)
  lines.push(`Members: ${state.members.join(', ')}`)
  lines.push('')

  // Ah Counter
  lines.push('=== AH COUNTER ===')
  const header = ['Member', ...FILLER_WORDS, 'Total'].join('\t')
  lines.push(header)
  state.members.forEach((m) => {
    const row = state.ahCounter[m] ?? {}
    const counts = FILLER_WORDS.map((w) => row[w] ?? 0)
    const total = counts.reduce((a, b) => a + b, 0)
    lines.push([m, ...counts, total].join('\t'))
  })
  lines.push('')

  // Timer
  lines.push('=== TIMER ===')
  state.timerSlots.forEach((slot) => {
    lines.push(`${slot.label} | Speaker: ${slot.speaker || '—'} | Time: ${fmtSec(slot.elapsed)} | Limit: ${fmtSec(slot.minSec)}–${fmtSec(slot.maxSec)}`)
  })
  lines.push('')

  // Grammarian
  lines.push('=== GRAMMARIAN ===')
  lines.push(`Word of the Day: ${state.grammarian.wordOfDay || '—'}`)
  if (state.grammarian.wordDefinition) lines.push(`Definition: ${state.grammarian.wordDefinition}`)
  lines.push('')
  lines.push('WotD Usage:')
  state.members.forEach((m) => {
    lines.push(`  ${m}: ${state.grammarian.wotdUsage[m] ?? 0} time(s)`)
  })
  lines.push('')
  lines.push('Member Notes:')
  state.members.forEach((m) => {
    const note = state.grammarian.notes[m]
    if (note) lines.push(`  ${m}: ${note}`)
  })
  if (state.grammarian.globalNotes) {
    lines.push('')
    lines.push('Global Notes:')
    lines.push(state.grammarian.globalNotes)
  }
  lines.push('')

  // General Evaluator
  lines.push('=== GENERAL EVALUATOR ===')
  if (state.evaluator.rating) lines.push(`Meeting Rating: ${'★'.repeat(state.evaluator.rating)}${'☆'.repeat(5 - state.evaluator.rating)}`)
  if (state.evaluator.opening) lines.push(`Opening:\n${state.evaluator.opening}`)
  if (state.evaluator.body) lines.push(`Body:\n${state.evaluator.body}`)
  if (state.evaluator.closing) lines.push(`Closing:\n${state.evaluator.closing}`)
  if (state.evaluator.overall) lines.push(`Overall:\n${state.evaluator.overall}`)
  lines.push('')

  // Topics Master
  lines.push('=== TOPICS MASTER ===')
  state.topics.forEach((t, i) => {
    lines.push(`${i + 1}. [${t.done ? 'DONE' : '    '}] "${t.question}" — Speaker: ${t.speaker || '—'} | Time: ${fmtSec(t.elapsed)}`)
  })

  const content = lines.join('\n')
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `toastmasters-${new Date().toISOString().slice(0, 10)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
