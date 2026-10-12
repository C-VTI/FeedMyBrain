import type { Exam } from '../content/types'
import type { Verdict } from './check'
import type { ExamProgress, Profile } from './model'
import { unitMastery } from './srs'

// ---------- XP & Level ----------

export const XP_CORRECT = 10
export const XP_ALMOST = 5
export const XP_PERFECT_ROUND = 20
export const XP_DAY_DONE = 50

/** XP für eine Antwort; die Combo bringt bis zu +10 Bonus. */
export function xpFor(verdict: Verdict, combo: number): number {
  if (verdict === 'correct') return XP_CORRECT + Math.min(10, Math.max(0, combo - 1) * 2)
  if (verdict === 'almost') return XP_ALMOST
  return 0
}

const LEVEL_NAMES = [
  'Débutant', 'Apprenti', 'Curieux', 'Bavard', 'Connaisseur',
  'Expert', 'Maître', 'Champion', 'Virtuose', 'Légende',
]

/** XP, ab der Level `level` erreicht ist (Level 1 = 0 XP). */
export function xpForLevel(level: number): number {
  return 75 * level * (level - 1)
}

export function levelInfo(xp: number) {
  let level = 1
  while (xp >= xpForLevel(level + 1)) level++
  const from = xpForLevel(level)
  const to = xpForLevel(level + 1)
  return {
    level,
    name: LEVEL_NAMES[Math.min(level, LEVEL_NAMES.length) - 1],
    progress: (xp - from) / (to - from),
    toNext: to - xp,
  }
}

// ---------- Abzeichen ----------

export interface BadgeContext {
  profile: Profile
  exam: Exam
  progress: ExamProgress
  streak: number
  /** Ergebnis der gerade beendeten Runde (falls vorhanden). */
  round?: { perfect: boolean; maxCombo: number; type: string }
  bossGrade?: number
  hour: number
}

export interface Badge {
  id: string
  icon: string
  title: string
  description: string
  earned: (c: BadgeContext) => boolean
}

const unitsOf = (c: BadgeContext, prefix: string) => c.exam.units.filter((u) => u.id.startsWith(prefix))
const allMastered = (c: BadgeContext, prefix: string) =>
  unitsOf(c, prefix).length > 0 && unitsOf(c, prefix).every((u) => unitMastery(c.exam, c.progress, u.id) >= 0.8)

export const BADGES: Badge[] = [
  { id: 'first-round', icon: '🌱', title: 'Premier pas', description: 'Die erste Runde geschafft', earned: (c) => !!c.round },
  { id: 'perfect', icon: '💎', title: 'Perfectionniste', description: 'Eine Runde ohne Fehler', earned: (c) => !!c.round?.perfect },
  { id: 'combo-10', icon: '⚡', title: 'En feu', description: '10 richtige Antworten in Folge', earned: (c) => (c.round?.maxCombo ?? 0) >= 10 },
  { id: 'combo-25', icon: '🌋', title: 'Inarrêtable', description: '25 richtige Antworten in Folge', earned: (c) => (c.round?.maxCombo ?? 0) >= 25 },
  { id: 'streak-3', icon: '🔥', title: 'Régulier', description: '3 Lerntage in Folge', earned: (c) => c.streak >= 3 },
  { id: 'streak-7', icon: '🏅', title: 'Infatigable', description: '7 Lerntage in Folge', earned: (c) => c.streak >= 7 },
  { id: 'early', icon: '🌅', title: 'Lève-tôt', description: 'Vor 7:30 Uhr gelernt', earned: (c) => !!c.round && c.hour < 7.5 },
  { id: 'night', icon: '🦉', title: 'Hibou', description: 'Nach 22 Uhr gelernt', earned: (c) => !!c.round && c.hour >= 22 },
  { id: 'all-units', icon: '🗺️', title: 'Explorateur', description: 'Alle Themen kennengelernt', earned: (c) => c.exam.units.every((u) => c.progress.introduced.includes(u.id)) },
  { id: 'verbs', icon: '🏋️', title: 'Verb-Bezwinger', description: 'Alle unregelmäßigen Verben gemeistert', earned: (c) => allMastered(c, 'g-verbs') },
  { id: 'gourmet', icon: '🥐', title: 'Gourmet', description: 'Alle Vokabeln «Essen & Kochen» gemeistert', earned: (c) => allMastered(c, 'v-food') },
  { id: 'dreamer', icon: '🛏️', title: 'Rêveur', description: 'Vokabeln «Schlafzimmer» gemeistert', earned: (c) => allMastered(c, 'v-room') },
  { id: 'adverbs', icon: '🎯', title: 'Roi des adverbes', description: 'Alle Adverb-Themen gemeistert', earned: (c) => allMastered(c, 'g-adv') && allMastered(c, 'g-adj-adv') && allMastered(c, 'g-comp-adv') },
  { id: 'boss', icon: '👑', title: 'Boss besiegt', description: 'Probeprüfung mit Note 4 oder besser', earned: (c) => (c.bossGrade ?? 0) >= 4 },
  { id: 'boss-6', icon: '🏆', title: 'Note 6!', description: 'Probeprüfung mit Note 5.5 oder besser', earned: (c) => (c.bossGrade ?? 0) >= 5.5 },
]

/** Liefert die neu verdienten Abzeichen (noch nicht im Profil). */
export function newBadges(c: BadgeContext): Badge[] {
  return BADGES.filter((b) => !c.profile.badges[b.id] && b.earned(c))
}

/** Schweizer Note 1–6, auf halbe Noten gerundet. */
export function swissGrade(correct: number, total: number): number {
  const raw = 1 + (5 * correct) / Math.max(1, total)
  return Math.round(raw * 2) / 2
}
