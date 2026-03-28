import { create } from 'zustand'

export type FillerWord = 'Ah' | 'Um' | 'Er' | 'So' | 'Basically' | 'You Know'
export const FILLER_WORDS: FillerWord[] = ['Ah', 'Um', 'Er', 'So', 'Basically', 'You Know']
export const FILLER_KEY_MAP: Record<string, FillerWord> = {
  a: 'Ah',
  u: 'Um',
  e: 'Er',
  s: 'So',
  b: 'Basically',
  k: 'You Know',
}

// Utility roles — each maps to a tab in the app
export const ALL_ROLES = ['ah', 'timer', 'grammarian', 'evaluator', 'topics'] as const
export type RoleId = (typeof ALL_ROLES)[number]
export const ROLE_LABELS: Record<RoleId, string> = {
  ah: 'Ah Counter',
  timer: 'Timer',
  grammarian: 'Grammarian',
  evaluator: 'General Evaluator',
  topics: 'Topics Master',
}

// All assignable meeting roles (utility + non-utility)
export const MEETING_ROLES: { value: string; label: string }[] = [
  { value: 'ah', label: 'Ah Counter' },
  { value: 'timer', label: 'Timer' },
  { value: 'grammarian', label: 'Grammarian' },
  { value: 'evaluator', label: 'General Evaluator' },
  { value: 'topics', label: 'Topics Master' },
  { value: 'toastmaster', label: 'Toastmaster of the Day' },
  { value: 'speaker', label: 'Speaker' },
  { value: 'member_evaluator', label: 'Evaluator' },
  { value: 'president', label: 'President' },
  { value: 'saa', label: 'Sergeant at Arms' },
  { value: 'other', label: 'Other' },
]

export interface Member {
  name: string
  role: string // one of MEETING_ROLES values
}

export interface TimerSlot {
  id: string
  label: string
  speaker: string
  minSec: number
  maxSec: number
  elapsed: number
  running: boolean
  intervalId?: ReturnType<typeof setInterval>
}

export interface Topic {
  id: string
  question: string
  speaker: string
  done: boolean
  elapsed: number
  running: boolean
  intervalId?: ReturnType<typeof setInterval>
}

export interface GrammarianState {
  wordOfDay: string
  wordDefinition: string
  wotdUsage: Record<string, number>
  notes: Record<string, string>
  globalNotes: string
}

export interface EvaluatorState {
  opening: string
  body: string
  closing: string
  overall: string
  rating: number
}

interface SessionStore {
  started: boolean
  members: Member[]

  // Ah Counter
  ahCounter: Record<string, Record<FillerWord, number>>

  // Timer
  timerSlots: TimerSlot[]

  // Grammarian
  grammarian: GrammarianState

  // General Evaluator
  evaluator: EvaluatorState

  // Topics Master
  topics: Topic[]

  // Actions
  addMember: (name: string, role: string) => void
  removeMember: (name: string) => void
  updateMemberRole: (name: string, role: string) => void
  startSession: () => void
  resetSession: () => void

  // Ah Counter
  incrementFiller: (member: string, word: FillerWord) => void
  decrementFiller: (member: string, word: FillerWord) => void

  // Timer
  addTimerSlot: (slot: Omit<TimerSlot, 'id' | 'elapsed' | 'running'>) => void
  removeTimerSlot: (id: string) => void
  updateTimerSlot: (id: string, patch: Partial<TimerSlot>) => void
  startTimer: (id: string) => void
  pauseTimer: (id: string) => void
  resetTimer: (id: string) => void

  // Grammarian
  setWordOfDay: (word: string, def: string) => void
  incrementWotd: (member: string) => void
  setMemberNote: (member: string, note: string) => void
  setGlobalNotes: (notes: string) => void

  // Evaluator
  setEvaluatorField: (field: keyof EvaluatorState, value: string | number) => void

  // Topics Master
  addTopic: (question: string, speaker: string) => void
  removeTopic: (id: string) => void
  updateTopic: (id: string, patch: Partial<Topic>) => void
  markTopicDone: (id: string) => void
  startTopicTimer: (id: string) => void
  pauseTopicTimer: (id: string) => void
  resetTopicTimer: (id: string) => void
}

function emptyAhRow(): Record<FillerWord, number> {
  return { Ah: 0, Um: 0, Er: 0, So: 0, Basically: 0, 'You Know': 0 }
}

function defaultTimerSlots(): Omit<TimerSlot, 'id' | 'elapsed' | 'running'>[] {
  return [
    { label: 'Prepared Speech', speaker: '', minSec: 300, maxSec: 420 },
    { label: 'Table Topic', speaker: '', minSec: 60, maxSec: 120 },
    { label: 'Evaluation', speaker: '', minSec: 120, maxSec: 180 },
  ]
}

let slotIdCounter = 0
function nextId() {
  return String(++slotIdCounter)
}

export const useSession = create<SessionStore>((set, get) => ({
  started: false,
  members: [],
  ahCounter: {},
  timerSlots: defaultTimerSlots().map((s) => ({ ...s, id: nextId(), elapsed: 0, running: false })),
  grammarian: { wordOfDay: '', wordDefinition: '', wotdUsage: {}, notes: {}, globalNotes: '' },
  evaluator: { opening: '', body: '', closing: '', overall: '', rating: 0 },
  topics: [],

  addMember: (name, role) => {
    const trimmed = name.trim()
    if (!trimmed) return
    set((s) => {
      if (s.members.some((m) => m.name === trimmed)) return s
      return {
        members: [...s.members, { name: trimmed, role }],
        ahCounter: { ...s.ahCounter, [trimmed]: emptyAhRow() },
        grammarian: {
          ...s.grammarian,
          wotdUsage: { ...s.grammarian.wotdUsage, [trimmed]: 0 },
          notes: { ...s.grammarian.notes, [trimmed]: '' },
        },
      }
    })
  },

  removeMember: (name) => {
    set((s) => {
      const members = s.members.filter((m) => m.name !== name)
      const ahCounter = { ...s.ahCounter }
      delete ahCounter[name]
      const wotdUsage = { ...s.grammarian.wotdUsage }
      delete wotdUsage[name]
      const notes = { ...s.grammarian.notes }
      delete notes[name]
      return { members, ahCounter, grammarian: { ...s.grammarian, wotdUsage, notes } }
    })
  },

  updateMemberRole: (name, role) =>
    set((s) => ({
      members: s.members.map((m) => (m.name === name ? { ...m, role } : m)),
    })),

  startSession: () => set({ started: true }),

  resetSession: () => {
    const s = get()
    s.timerSlots.forEach((slot) => { if (slot.intervalId) clearInterval(slot.intervalId) })
    s.topics.forEach((t) => { if (t.intervalId) clearInterval(t.intervalId) })
    slotIdCounter = 0
    set({
      started: false,
      members: [],
      ahCounter: {},
      timerSlots: defaultTimerSlots().map((sl) => ({ ...sl, id: nextId(), elapsed: 0, running: false })),
      grammarian: { wordOfDay: '', wordDefinition: '', wotdUsage: {}, notes: {}, globalNotes: '' },
      evaluator: { opening: '', body: '', closing: '', overall: '', rating: 0 },
      topics: [],
    })
  },

  // Ah Counter
  incrementFiller: (member, word) =>
    set((s) => ({
      ahCounter: {
        ...s.ahCounter,
        [member]: { ...s.ahCounter[member], [word]: (s.ahCounter[member]?.[word] ?? 0) + 1 },
      },
    })),

  decrementFiller: (member, word) =>
    set((s) => ({
      ahCounter: {
        ...s.ahCounter,
        [member]: {
          ...s.ahCounter[member],
          [word]: Math.max(0, (s.ahCounter[member]?.[word] ?? 0) - 1),
        },
      },
    })),

  // Timer
  addTimerSlot: (slot) =>
    set((s) => ({ timerSlots: [...s.timerSlots, { ...slot, id: nextId(), elapsed: 0, running: false }] })),

  removeTimerSlot: (id) => {
    const slot = get().timerSlots.find((s) => s.id === id)
    if (slot?.intervalId) clearInterval(slot.intervalId)
    set((s) => ({ timerSlots: s.timerSlots.filter((sl) => sl.id !== id) }))
  },

  updateTimerSlot: (id, patch) =>
    set((s) => ({ timerSlots: s.timerSlots.map((sl) => (sl.id === id ? { ...sl, ...patch } : sl)) })),

  startTimer: (id) => {
    const slot = get().timerSlots.find((s) => s.id === id)
    if (!slot || slot.running) return
    const intervalId = setInterval(() => {
      set((s) => ({
        timerSlots: s.timerSlots.map((sl) => sl.id === id ? { ...sl, elapsed: sl.elapsed + 1 } : sl),
      }))
    }, 1000)
    set((s) => ({
      timerSlots: s.timerSlots.map((sl) => (sl.id === id ? { ...sl, running: true, intervalId } : sl)),
    }))
  },

  pauseTimer: (id) => {
    const slot = get().timerSlots.find((s) => s.id === id)
    if (slot?.intervalId) clearInterval(slot.intervalId)
    set((s) => ({
      timerSlots: s.timerSlots.map((sl) =>
        sl.id === id ? { ...sl, running: false, intervalId: undefined } : sl
      ),
    }))
  },

  resetTimer: (id) => {
    const slot = get().timerSlots.find((s) => s.id === id)
    if (slot?.intervalId) clearInterval(slot.intervalId)
    set((s) => ({
      timerSlots: s.timerSlots.map((sl) =>
        sl.id === id ? { ...sl, elapsed: 0, running: false, intervalId: undefined } : sl
      ),
    }))
  },

  // Grammarian
  setWordOfDay: (word, def) =>
    set((s) => ({ grammarian: { ...s.grammarian, wordOfDay: word, wordDefinition: def } })),

  incrementWotd: (member) =>
    set((s) => ({
      grammarian: {
        ...s.grammarian,
        wotdUsage: { ...s.grammarian.wotdUsage, [member]: (s.grammarian.wotdUsage[member] ?? 0) + 1 },
      },
    })),

  setMemberNote: (member, note) =>
    set((s) => ({
      grammarian: { ...s.grammarian, notes: { ...s.grammarian.notes, [member]: note } },
    })),

  setGlobalNotes: (notes) =>
    set((s) => ({ grammarian: { ...s.grammarian, globalNotes: notes } })),

  // Evaluator
  setEvaluatorField: (field, value) =>
    set((s) => ({ evaluator: { ...s.evaluator, [field]: value } })),

  // Topics
  addTopic: (question, speaker) =>
    set((s) => ({
      topics: [...s.topics, { id: nextId(), question, speaker, done: false, elapsed: 0, running: false }],
    })),

  removeTopic: (id) => {
    const t = get().topics.find((x) => x.id === id)
    if (t?.intervalId) clearInterval(t.intervalId)
    set((s) => ({ topics: s.topics.filter((x) => x.id !== id) }))
  },

  updateTopic: (id, patch) =>
    set((s) => ({ topics: s.topics.map((t) => (t.id === id ? { ...t, ...patch } : t)) })),

  markTopicDone: (id) =>
    set((s) => ({ topics: s.topics.map((t) => (t.id === id ? { ...t, done: !t.done } : t)) })),

  startTopicTimer: (id) => {
    const topic = get().topics.find((t) => t.id === id)
    if (!topic || topic.running) return
    const intervalId = setInterval(() => {
      set((s) => ({
        topics: s.topics.map((t) => (t.id === id ? { ...t, elapsed: t.elapsed + 1 } : t)),
      }))
    }, 1000)
    set((s) => ({
      topics: s.topics.map((t) => (t.id === id ? { ...t, running: true, intervalId } : t)),
    }))
  },

  pauseTopicTimer: (id) => {
    const topic = get().topics.find((t) => t.id === id)
    if (topic?.intervalId) clearInterval(topic.intervalId)
    set((s) => ({
      topics: s.topics.map((t) => (t.id === id ? { ...t, running: false, intervalId: undefined } : t)),
    }))
  },

  resetTopicTimer: (id) => {
    const topic = get().topics.find((t) => t.id === id)
    if (topic?.intervalId) clearInterval(topic.intervalId)
    set((s) => ({
      topics: s.topics.map((t) =>
        t.id === id ? { ...t, elapsed: 0, running: false, intervalId: undefined } : t
      ),
    }))
  },
}))
