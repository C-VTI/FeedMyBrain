import type { Exam, Item } from '../content/types'
import type { ExamProgress } from './model'

export type TaskMode = 'mc' | 'input' | 'place' | 'order' | 'match'

export interface Task {
  key: string
  mode: TaskMode
  item: Item
  /** Für mc: gemischte Optionen; für order: gemischte Baustein-Indizes als Strings. */
  options?: string[]
  /** Für match: alle Vokabeln des Zuordnungsspiels. */
  group?: Item[]
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

let counter = 0
const nextKey = () => `t${++counter}`

/** Erzeugt die passende Übungsform: neue Aufgaben zuerst als Auswahl, danach als Eingabe. */
export function taskFor(exam: Exam, p: ExamProgress, item: Item, forceInput = false): Task {
  const ex = item.exercise
  const box = p.items[item.id]?.box ?? 0
  switch (ex.type) {
    case 'mc':
      return { key: nextKey(), mode: 'mc', item, options: shuffle(ex.options) }
    case 'place':
      return { key: nextKey(), mode: 'place', item }
    case 'order':
      return { key: nextKey(), mode: 'order', item, options: shuffle(ex.tokens.map((_, i) => String(i))) }
    case 'gap': {
      if (!forceInput && box === 0) {
        if (ex.options) return { key: nextKey(), mode: 'mc', item, options: shuffle(ex.options) }
        if (item.kind === 'vocab') return { key: nextKey(), mode: 'mc', item, options: vocabOptions(exam, item) }
      }
      return { key: nextKey(), mode: 'input', item }
    }
  }
}

function vocabOptions(exam: Exam, item: Item): string[] {
  const answer = (item.exercise as { answers: string[] }).answers[0]
  const pool = exam.items.filter((i) => i.unitId === item.unitId && i.id !== item.id)
  const distractors = shuffle(pool)
    .map((i) => (i.exercise as { answers: string[] }).answers[0])
    .filter((a, idx, all) => a !== answer && all.indexOf(a) === idx)
    .slice(0, 3)
  return shuffle([answer, ...distractors])
}

function matchTask(items: Item[]): Task {
  return { key: nextKey(), mode: 'match', item: items[0], group: items }
}

/** Priorität für Wiederholungen: falsch Beantwortetes und Unsicheres zuerst, etwas Zufall für Abwechslung. */
function priority(p: ExamProgress, item: Item, now: number): number {
  const s = p.items[item.id]
  if (!s) return 3 + Math.random() * 2
  const daysSince = (now - s.last) / 86_400_000
  return (s.lastWrong ? 4 : 0) + (5 - s.box) * 1.5 + Math.min(daysSince, 5) * 0.5 + Math.random() * 2
}

function pickByPriority(p: ExamProgress, items: Item[], n: number): Item[] {
  const now = Date.now()
  return items
    .map((item) => ({ item, score: priority(p, item, now) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, n)
    .map((x) => x.item)
}

/** Einführungsrunde einer neuen Einheit. */
export function buildNewRound(exam: Exam, p: ExamProgress, unitId: string): Task[] {
  const items = exam.items.filter((i) => i.unitId === unitId)
  const unseen = shuffle(items.filter((i) => !p.items[i.id]))
  const seen = items.filter((i) => p.items[i.id]).sort((a, b) => p.items[a.id].box - p.items[b.id].box)
  const picked = [...unseen, ...seen].slice(0, items[0]?.kind === 'vocab' ? 12 : 14)
  const tasks = picked.map((i) => taskFor(exam, p, i))
  if (items[0]?.kind === 'vocab' && picked.length >= 5) {
    tasks.splice(7, 0, matchTask(shuffle(picked).slice(0, 5)))
  }
  return tasks
}

/** Gemischte Wiederholung über alle bereits eingeführten Einheiten (50:50 Vokabeln/Grammatik). */
export function buildReviewRound(exam: Exam, p: ExamProgress, size = 15): Task[] {
  const units = p.introduced.length > 0 ? p.introduced : [exam.units[0].id]
  const pool = exam.items.filter((i) => units.includes(i.unitId))
  const vocab = pool.filter((i) => i.kind === 'vocab')
  const grammar = pool.filter((i) => i.kind === 'grammar')
  let nVocab = vocab.length === 0 ? 0 : grammar.length === 0 ? size : Math.round(size * exam.vocabWeight)
  nVocab = Math.min(nVocab, vocab.length)
  const picked = [...pickByPriority(p, vocab, nVocab), ...pickByPriority(p, grammar, size - nVocab)]
  const tasks = shuffle(picked).map((i) => taskFor(exam, p, i))
  if (vocab.length >= 5) {
    const forMatch = pickByPriority(p, vocab.filter((v) => !picked.includes(v)), 5)
    if (forMatch.length === 5) tasks.splice(Math.floor(tasks.length / 2), 0, matchTask(forMatch))
  }
  return tasks
}

/** Fehler wiederholen: zuletzt falsch beantwortete und unsichere Aufgaben. */
export function buildMistakesRound(exam: Exam, p: ExamProgress, size = 15): Task[] {
  const pool = exam.items.filter((i) => {
    const s = p.items[i.id]
    return s && (s.lastWrong || s.box <= 1)
  })
  return shuffle(pickByPriority(p, pool, size)).map((i) => taskFor(exam, p, i))
}

export function countMistakes(exam: Exam, p: ExamProgress): number {
  return exam.items.filter((i) => {
    const s = p.items[i.id]
    return s && (s.lastWrong || s.box <= 1)
  }).length
}

export const BOSS_SIZE = 30
export const BOSS_MINUTES = 25

/** Probeprüfung: alle Themen, Eingabe statt Auswahl, Gewichtung wie in der Prüfung. */
export function buildBossRound(exam: Exam, p: ExamProgress): Task[] {
  const nVocab = Math.round(BOSS_SIZE * exam.vocabWeight)
  const vocab = shuffle(exam.items.filter((i) => i.kind === 'vocab')).slice(0, nVocab)
  const grammarUnits = exam.units.filter((u) => u.kind === 'grammar')
  const perUnit = Math.ceil((BOSS_SIZE - nVocab) / grammarUnits.length)
  const grammar = shuffle(
    grammarUnits.flatMap((u) => shuffle(exam.items.filter((i) => i.unitId === u.id)).slice(0, perUnit)),
  ).slice(0, BOSS_SIZE - nVocab)
  return shuffle([...vocab, ...grammar]).map((i) => taskFor(exam, p, i, true))
}
