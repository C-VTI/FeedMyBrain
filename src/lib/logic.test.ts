import { describe, expect, it } from 'vitest'
import { frHms2 as exam } from '../content/fr-hms2-2026-10/exam'
import { vocabAnswers } from '../content/build'
import { checkAnswer } from './check'
import type { ExamProgress } from './model'
import { buildDayPlan, canUseJoker, dayStatus, learningDays, probeDay, streak } from './plan'
import { buildBossRound, buildNewRound, buildReviewRound } from './session'
import { swissGrade } from './gamification'

const progress = (patch: Partial<ExamProgress> = {}): ExamProgress => ({
  examId: exam.id,
  startDate: '2026-10-12',
  examDate: '2026-10-23',
  freeWeekdays: [4],
  jokers: [],
  introduced: [],
  days: {},
  items: {},
  boss: [],
  ...patch,
})

describe('Antwortprüfung', () => {
  it('akzeptiert Groß/Kleinschreibung, Apostrophe und œ/oe', () => {
    expect(checkAnswer('La Viande', ['la viande']).verdict).toBe('correct')
    expect(checkAnswer('l’oeuf', ["l'œuf"]).verdict).toBe('correct')
    expect(checkAnswer('l huile', ["l'huile"]).verdict).toBe('wrong')
  })
  it('fehlende Akzente sind "fast richtig"', () => {
    expect(checkAnswer('la poele', ['la poêle']).verdict).toBe('almost')
  })
  it('erkennt fehlenden und falschen Artikel', () => {
    expect(checkAnswer('viande', ['la viande'])).toEqual({ verdict: 'wrong', note: 'Der Artikel fehlt!' })
    expect(checkAnswer('le viande', ['la viande'])).toEqual({ verdict: 'wrong', note: 'Falscher Artikel!' })
  })
})

describe('Vokabel-Varianten', () => {
  it('erlaubt Verben ohne qc./qn. und Alternativen', () => {
    expect(vocabAnswers('ajouter qc. (à qc.)')).toEqual(expect.arrayContaining(['ajouter qc.', 'ajouter']))
    expect(vocabAnswers('battre qc./qn.')).toContain('battre')
    expect(vocabAnswers('la table de nuit / la table de chevet')).toEqual(expect.arrayContaining(['la table de nuit', 'la table de chevet']))
    expect(vocabAnswers("l'œuf (m)")).toContain("l'œuf")
    expect(vocabAnswers('prêt, e')).toEqual(expect.arrayContaining(['prêt', 'prête']))
    expect(vocabAnswers('le petit-déjeuner, les petits-déjeuners')).toContain('le petit-déjeuner')
  })
  it('akzeptiert Synonyme bei gleichem deutschen Wort (Kartoffel)', () => {
    const kartoffel = exam.items.filter((i) => i.exercise.type === 'gap' && i.exercise.prompt === 'Kartoffel')
    expect(kartoffel).toHaveLength(2)
    for (const k of kartoffel) {
      const answers = (k.exercise as { answers: string[] }).answers
      expect(checkAnswer('la pomme de terre', answers).verdict).toBe('correct')
      expect(checkAnswer('la patate', answers).verdict).toBe('correct')
    }
  })
})

describe('Inhalte', () => {
  it('haben eindeutige IDs und gültige Einheiten', () => {
    const ids = exam.items.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
    const units = new Set(exam.units.map((u) => u.id))
    for (const i of exam.items) expect(units.has(i.unitId), i.id).toBe(true)
    for (const u of exam.units) expect(exam.items.some((i) => i.unitId === u.id), u.id).toBe(true)
  })
  it('sind in sich stimmig (Lösung in den Optionen, Positionen gültig)', () => {
    for (const { id, exercise: ex } of exam.items) {
      if (ex.type === 'gap') {
        expect(ex.answers.length, id).toBeGreaterThan(0)
        if (ex.options) expect(ex.options, id).toContain(ex.answers[0])
        if (ex.options) expect(new Set(ex.options).size, id).toBe(ex.options.length)
      }
      if (ex.type === 'mc') expect(ex.options, id).toContain(ex.answer)
      if (ex.type === 'place') for (const p of ex.positions) expect(p >= 0 && p <= ex.tokens.length, id).toBe(true)
      if (ex.type === 'order') expect(ex.tokens.length, id).toBeGreaterThan(1)
    }
  })
  it('131 Vokabeln und 34 Verben', () => {
    expect(exam.items.filter((i) => i.kind === 'vocab')).toHaveLength(131)
    expect(new Set(exam.items.filter((i) => i.id.startsWith('vb:')).map((i) => i.id.split(':')[1])).size).toBe(34)
  })
})

describe('Lernplan', () => {
  it('Prüfung 23.10., Donnerstag frei → 9 Lerntage, Probeprüfung am 21.10.', () => {
    const p = progress()
    expect(learningDays(p)).toEqual(['2026-10-12', '2026-10-13', '2026-10-14', '2026-10-16', '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20', '2026-10-21'])
    expect(probeDay(p)).toBe('2026-10-21')
    expect(dayStatus(p, '2026-10-15')).toBe('free')
    expect(dayStatus(p, '2026-10-22')).toBe('free')
    expect(dayStatus(p, '2026-10-23')).toBe('exam')
  })
  it('verteilt alle 13 Einheiten auf die 8 Tage vor der Probeprüfung', () => {
    let p = progress()
    let total = 0
    for (const d of learningDays(p).slice(0, -1)) {
      const plan = buildDayPlan(exam, p, d)!
      const fresh = plan.rounds.filter((r) => r.type === 'new').map((r) => r.unitId!)
      expect(plan.rounds.length).toBeGreaterThanOrEqual(4)
      total += fresh.length
      p = { ...p, introduced: [...p.introduced, ...fresh], days: { ...p.days, [d]: { ...plan, completed: true } } }
    }
    expect(total).toBe(exam.units.length)
    expect(buildDayPlan(exam, p, '2026-10-21')!.rounds[0].type).toBe('boss')
  })
  it('holt verpasste Tage automatisch nach', () => {
    const p = progress()
    const plan = buildDayPlan(exam, p, '2026-10-19') // nur noch 19. + 20. zum Einführen
    expect(plan!.rounds.filter((r) => r.type === 'new')).toHaveLength(7)
  })
  it('Streak: freie Tage unterbrechen nicht, verpasste Tage schon', () => {
    const done = { rounds: [], done: [], completed: true }
    const p = progress({ days: { '2026-10-13': done, '2026-10-14': done, '2026-10-16': done } })
    expect(streak(p, '2026-10-16')).toBe(3)
    expect(streak(p, '2026-10-17')).toBe(3) // heute noch offen
    expect(streak(p, '2026-10-18')).toBe(0) // 17. verpasst
  })
  it('Joker nur, wenn genug Zeit bleibt', () => {
    expect(canUseJoker(exam, progress(), '2026-10-12').allowed).toBe(true)
    expect(canUseJoker(exam, progress(), '2026-10-20').allowed).toBe(false)
    expect(canUseJoker(exam, progress(), '2026-10-21').allowed).toBe(false)
    const allIntroduced = progress({ introduced: exam.units.map((u) => u.id) })
    expect(canUseJoker(exam, allIntroduced, '2026-10-19').allowed).toBe(true)
  })
})

describe('Runden', () => {
  it('Einführung, Wiederholung und Probeprüfung liefern Aufgaben', () => {
    const p = progress({ introduced: ['v-food-1', 'g-verbs-1'] })
    expect(buildNewRound(exam, p, 'v-food-1').some((t) => t.mode === 'match')).toBe(true)
    const review = buildReviewRound(exam, p)
    expect(review.length).toBeGreaterThanOrEqual(15)
    const boss = buildBossRound(exam, p)
    expect(boss).toHaveLength(30)
    expect(boss.filter((t) => t.item.kind === 'vocab')).toHaveLength(15)
    expect(boss.every((t) => t.mode !== 'mc' || t.item.exercise.type === 'mc')).toBe(true)
  })
  it('Schweizer Noten', () => {
    expect(swissGrade(30, 30)).toBe(6)
    expect(swissGrade(15, 30)).toBe(3.5)
    expect(swissGrade(18, 30)).toBe(4)
  })
})
