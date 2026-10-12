import type { Exam } from '../content/types'
import type { Verdict } from './check'
import { today, type ISODate } from './date'
import { BADGES, levelInfo, newBadges, swissGrade, XP_DAY_DONE, XP_PERFECT_ROUND, type Badge } from './gamification'
import type { AppData, ExamProgress, Profile } from './model'
import { getDayPlan, isDayComplete, streak } from './plan'
import { applyVerdict } from './srs'
import { getData, update } from './storage'

const AVATARS = ['🦊', '🐼', '🦉', '🐯', '🐙', '🦄', '🐸', '🐧']

export function activeProfile(d: AppData = getData()): Profile | undefined {
  return d.profiles.find((p) => p.id === d.activeProfileId)
}

export function createProfile(name: string): void {
  update((d) => {
    const id = crypto.randomUUID()
    d.profiles.push({
      id,
      name: name.trim(),
      avatar: AVATARS[d.profiles.length % AVATARS.length],
      createdAt: Date.now(),
      xp: 0,
      bestCombo: 0,
      badges: {},
      exams: {},
      settings: { tts: true, autoSpeak: false },
    })
    d.activeProfileId = id
    d.activeExamId = undefined
  })
}

export function deleteProfile(id: string): void {
  update((d) => {
    d.profiles = d.profiles.filter((p) => p.id !== id)
    if (d.activeProfileId === id) d.activeProfileId = undefined
  })
}

export function selectProfile(id: string | undefined): void {
  update((d) => {
    d.activeProfileId = id
    d.activeExamId = undefined
  })
}

export function selectExam(exam: Exam | undefined): void {
  update((d) => {
    d.activeExamId = exam?.id
    const p = d.profiles.find((x) => x.id === d.activeProfileId)
    if (exam && p && !p.exams[exam.id]) {
      p.exams[exam.id] = {
        examId: exam.id,
        startDate: today(),
        examDate: exam.defaultExamDate,
        freeWeekdays: [4],
        jokers: [],
        introduced: [],
        days: {},
        items: {},
        boss: [],
      }
    }
  })
}

/** Ändert Profil und Prüfungsfortschritt des aktiven Profils. */
function withProgress(examId: string, fn: (profile: Profile, progress: ExamProgress) => void) {
  update((d) => {
    const profile = d.profiles.find((x) => x.id === d.activeProfileId)
    const progress = profile?.exams[examId]
    if (profile && progress) fn(profile, progress)
  })
}

export function updateExamSettings(examId: string, patch: Partial<Pick<ExamProgress, 'examDate' | 'freeWeekdays'>>) {
  withProgress(examId, (_, p) => {
    Object.assign(p, patch)
    // Zukünftige Tagespläne neu berechnen lassen
    const t = today()
    for (const day of Object.keys(p.days)) if (day > t || (day === t && p.days[day].done.length === 0)) delete p.days[day]
  })
}

export function updateSettings(patch: Partial<Profile['settings']>) {
  update((d) => {
    const profile = d.profiles.find((x) => x.id === d.activeProfileId)
    if (profile) Object.assign(profile.settings, patch)
  })
}

export function takeJoker(examId: string, day: ISODate) {
  withProgress(examId, (_, p) => {
    if (!p.jokers.includes(day)) p.jokers.push(day)
    delete p.days[day]
  })
}

/** Speichert das Ergebnis einer einzelnen Antwort. */
export function recordAnswer(examId: string, itemId: string, verdict: Verdict, xp: number) {
  withProgress(examId, (profile, p) => {
    p.items[itemId] = applyVerdict(p.items[itemId], verdict)
    profile.xp += xp
  })
}

export interface RoundSummary {
  correct: number
  total: number
  maxCombo: number
  xpEarned: number
  bonusXp: number
  dayCompleted: boolean
  levelUp?: { level: number; name: string }
  badges: Badge[]
  boss?: { grade: number; correct: number; total: number }
}

/**
 * Schließt eine Runde ab: Plan aktualisieren, Bonus-XP, Streak, Abzeichen.
 * `roundKey` ist nur bei Runden aus dem Tagesplan gesetzt.
 */
export function finishRound(
  exam: Exam,
  opts: { roundKey?: string; unitId?: string; type: string; correct: number; total: number; maxCombo: number; xpEarned: number },
): RoundSummary {
  const summary: RoundSummary = {
    correct: opts.correct,
    total: opts.total,
    maxCombo: opts.maxCombo,
    xpEarned: opts.xpEarned,
    bonusXp: 0,
    dayCompleted: false,
    badges: [],
  }
  const t = today()
  withProgress(exam.id, (profile, p) => {
    const levelBefore = levelInfo(profile.xp - opts.xpEarned).level
    const perfect = opts.total > 0 && opts.correct === opts.total && opts.type !== 'boss'
    if (perfect) summary.bonusXp += XP_PERFECT_ROUND

    if (opts.unitId && !p.introduced.includes(opts.unitId)) p.introduced.push(opts.unitId)

    let bossGrade: number | undefined
    if (opts.type === 'boss') {
      bossGrade = swissGrade(opts.correct, opts.total)
      p.boss.push({ date: t, correct: opts.correct, total: opts.total, grade: bossGrade })
      summary.boss = { grade: bossGrade, correct: opts.correct, total: opts.total }
    }

    if (opts.roundKey) {
      const day = p.days[t] ?? getDayPlan(exam, p, t)
      if (day) {
        if (!day.done.includes(opts.roundKey)) day.done.push(opts.roundKey)
        if (!day.completed && isDayComplete(day)) {
          day.completed = true
          day.completedAt = Date.now()
          summary.dayCompleted = true
          summary.bonusXp += XP_DAY_DONE
        }
        p.days[t] = day
      }
    }

    profile.xp += summary.bonusXp
    profile.bestCombo = Math.max(profile.bestCombo, opts.maxCombo)
    const levelAfter = levelInfo(profile.xp)
    if (levelAfter.level > levelBefore) summary.levelUp = { level: levelAfter.level, name: levelAfter.name }

    const now = new Date()
    summary.badges = newBadges({
      profile,
      exam,
      progress: p,
      streak: streak(p, t),
      round: { perfect, maxCombo: opts.maxCombo, type: opts.type },
      bossGrade,
      hour: now.getHours() + now.getMinutes() / 60,
    })
    for (const b of summary.badges) profile.badges[b.id] = Date.now()
  })
  return summary
}

/** Speichert den Tagesplan beim ersten Öffnen, damit er über den Tag stabil bleibt. */
export function ensureDayPlan(exam: Exam, day: ISODate) {
  const profile = activeProfile()
  const p = profile?.exams[exam.id]
  if (!p || p.days[day]) return
  const plan = getDayPlan(exam, p, day)
  if (plan) withProgress(exam.id, (_, prog) => (prog.days[day] = plan))
}

export { BADGES }
