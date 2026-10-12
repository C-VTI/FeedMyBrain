import type { Exam, Kind } from '../content/types'
import type { Verdict } from './check'
import type { ExamProgress, ItemStat } from './model'

export const MAX_BOX = 5
/** Ab dieser Box gilt eine Aufgabe als gemeistert (3× richtig in Folge). */
export const MASTERED_BOX = 3

export function emptyStat(): ItemStat {
  return { box: 0, seen: 0, correct: 0, wrong: 0, last: 0, lastWrong: false }
}

export function applyVerdict(stat: ItemStat | undefined, verdict: Verdict, now = Date.now()): ItemStat {
  const s = { ...(stat ?? emptyStat()) }
  s.seen++
  s.last = now
  if (verdict === 'correct') {
    s.correct++
    s.box = Math.min(MAX_BOX, s.box + 1)
    s.lastWrong = false
  } else if (verdict === 'almost') {
    s.box = Math.max(1, s.box)
    s.lastWrong = false
  } else {
    s.wrong++
    s.box = Math.max(0, s.box - 2)
    s.lastWrong = true
  }
  return s
}

function avgMastery(ids: string[], p: ExamProgress): number {
  if (ids.length === 0) return 0
  const sum = ids.reduce((acc, id) => acc + Math.min(MASTERED_BOX, p.items[id]?.box ?? 0), 0)
  return sum / (ids.length * MASTERED_BOX)
}

export function unitMastery(exam: Exam, p: ExamProgress, unitId: string): number {
  return avgMastery(exam.items.filter((i) => i.unitId === unitId).map((i) => i.id), p)
}

export function kindMastery(exam: Exam, p: ExamProgress, kind: Kind): number {
  return avgMastery(exam.items.filter((i) => i.kind === kind).map((i) => i.id), p)
}

/** Prüfungsbereitschaft 0..1, gewichtet nach Vokabeln/Grammatik. */
export function readiness(exam: Exam, p: ExamProgress): number {
  return exam.vocabWeight * kindMastery(exam, p, 'vocab') + (1 - exam.vocabWeight) * kindMastery(exam, p, 'grammar')
}

/** 0..5 Kronen pro Einheit. */
export function crowns(mastery: number): number {
  return Math.floor(mastery * 5 + 1e-9)
}
