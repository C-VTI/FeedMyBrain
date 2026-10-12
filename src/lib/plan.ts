import type { Exam } from '../content/types'
import { addDays, range, weekday, type ISODate } from './date'
import type { DayRecord, ExamProgress, Round } from './model'

/** Runden pro Tag (≈ 30 Minuten). */
export const ROUNDS_PER_DAY = 4
/** Höchstens so viele neue Einheiten pro Tag – Grundlage für die Joker-Prüfung. */
export const MAX_NEW_PER_DAY = 3

export type DayStatus = 'before' | 'learn' | 'probe' | 'free' | 'joker' | 'exam' | 'after'

/** Alle Lerntage (ohne feste freie Tage und Joker) vom Start bis zum Tag vor der Prüfung. */
export function learningDays(p: ExamProgress): ISODate[] {
  return range(p.startDate, p.examDate).filter((d) => !p.freeWeekdays.includes(weekday(d)) && !p.jokers.includes(d))
}

/** Der letzte Lerntag ist der Tag der Probeprüfung. */
export function probeDay(p: ExamProgress): ISODate | undefined {
  return learningDays(p).at(-1)
}

export function dayStatus(p: ExamProgress, d: ISODate): DayStatus {
  if (d < p.startDate) return 'before'
  if (d === p.examDate) return 'exam'
  if (d > p.examDate) return 'after'
  if (p.jokers.includes(d)) return 'joker'
  if (p.freeWeekdays.includes(weekday(d))) return 'free'
  return d === probeDay(p) ? 'probe' : 'learn'
}

/** Noch nicht eingeführte Einheiten in Plan-Reihenfolge. */
export function remainingUnits(exam: Exam, p: ExamProgress): string[] {
  return exam.units.map((u) => u.id).filter((id) => !p.introduced.includes(id))
}

/** Lerntage ab `from` (inklusive), ohne den Probeprüfungstag. */
function teachingDaysFrom(p: ExamProgress, from: ISODate): ISODate[] {
  const probe = probeDay(p)
  return learningDays(p).filter((d) => d >= from && d !== probe)
}

/**
 * Stellt den Tagesplan zusammen: neue Einheiten gleichmäßig auf die verbleibenden
 * Tage verteilt, Rest mit Wiederholungen aufgefüllt. Verpasste Tage verteilen sich
 * dadurch automatisch auf die restlichen Tage.
 */
export function buildDayPlan(exam: Exam, p: ExamProgress, d: ISODate): DayRecord | null {
  const status = dayStatus(p, d)
  if (status === 'probe') {
    return { rounds: [{ key: 'boss', type: 'boss' }, { key: 'review-1', type: 'review' }], done: [], completed: false }
  }
  if (status !== 'learn') return null
  const remaining = remainingUnits(exam, p)
  const days = Math.max(1, teachingDaysFrom(p, d).length)
  const count = Math.min(remaining.length, Math.ceil(remaining.length / days))
  const rounds: Round[] = remaining.slice(0, count).map((unitId) => ({ key: `new-${unitId}`, type: 'new', unitId }))
  const reviews = Math.max(1, ROUNDS_PER_DAY - rounds.length)
  for (let i = 1; i <= reviews; i++) rounds.push({ key: `review-${i}`, type: 'review' })
  return { rounds, done: [], completed: false }
}

/** Liefert den gespeicherten Tagesplan oder erstellt einen neuen. */
export function getDayPlan(exam: Exam, p: ExamProgress, d: ISODate): DayRecord | null {
  return p.days[d] ?? buildDayPlan(exam, p, d)
}

/** Der Tag gilt als geschafft, wenn alle Runden erledigt sind; am Probetag reicht die Probeprüfung. */
export function isDayComplete(day: DayRecord): boolean {
  const required = day.rounds.some((r) => r.type === 'boss') ? day.rounds.filter((r) => r.type === 'boss') : day.rounds
  return required.every((r) => day.done.includes(r.key))
}

/** Tage in Folge mit erledigter Tageslektion; freie Tage und Joker unterbrechen nicht. */
export function streak(p: ExamProgress, d: ISODate): number {
  let count = 0
  for (let day = d; day >= p.startDate; day = addDays(day, -1)) {
    const status = dayStatus(p, day)
    if (status !== 'learn' && status !== 'probe') continue
    if (p.days[day]?.completed) count++
    else if (day === d) continue
    else break
  }
  return count
}

export interface JokerCheck {
  allowed: boolean
  reason?: string
}

/** Ein Joker ist nur erlaubt, wenn die restlichen Tage für den noch nicht eingeführten Stoff reichen. */
export function canUseJoker(exam: Exam, p: ExamProgress, d: ISODate): JokerCheck {
  const status = dayStatus(p, d)
  if (status === 'probe') return { allowed: false, reason: 'Am Tag der Probeprüfung gibt es keinen Joker.' }
  if (status !== 'learn') return { allowed: false, reason: 'Heute ist kein Lerntag.' }
  if ((p.days[d]?.done.length ?? 0) > 0) return { allowed: false, reason: 'Du hast heute schon angefangen.' }
  const remaining = remainingUnits(exam, p).length
  const daysLeft = teachingDaysFrom(p, addDays(d, 1)).length
  if (daysLeft < 1 || remaining > daysLeft * MAX_NEW_PER_DAY) {
    return { allowed: false, reason: 'Dafür reicht die Zeit bis zur Prüfung nicht mehr.' }
  }
  // Mindestens ein reiner Wiederholungstag soll übrig bleiben, damit nicht alles am Schluss kommt.
  if (remaining > 0 && daysLeft < 2) return { allowed: false, reason: 'Dafür reicht die Zeit bis zur Prüfung nicht mehr.' }
  return { allowed: true }
}
