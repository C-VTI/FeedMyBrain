import type { ISODate } from './date'

export interface ItemStat {
  /** Leitner-Box 0..5; 5 = sicher gekonnt. */
  box: number
  seen: number
  correct: number
  wrong: number
  last: number
  lastWrong: boolean
}

export type RoundType = 'new' | 'review' | 'boss'

export interface Round {
  key: string
  type: RoundType
  unitId?: string
}

export interface DayRecord {
  rounds: Round[]
  done: string[]
  completed: boolean
  completedAt?: number
}

export interface BossResult {
  date: ISODate
  correct: number
  total: number
  grade: number
}

export interface ExamProgress {
  examId: string
  startDate: ISODate
  examDate: ISODate
  /** Feste freie Wochentage (0 = Sonntag … 6 = Samstag). */
  freeWeekdays: number[]
  jokers: ISODate[]
  /** Eingeführte Einheiten (Einführungsrunde abgeschlossen). */
  introduced: string[]
  days: Record<ISODate, DayRecord>
  items: Record<string, ItemStat>
  boss: BossResult[]
}

export interface Profile {
  id: string
  name: string
  avatar: string
  createdAt: number
  xp: number
  bestCombo: number
  badges: Record<string, number>
  exams: Record<string, ExamProgress>
  settings: { tts: boolean; autoSpeak: boolean }
}

export interface AppData {
  version: 1
  profiles: Profile[]
  activeProfileId?: string
  activeExamId?: string
}

export const emptyData = (): AppData => ({ version: 1, profiles: [] })
