import type { Exercise, Item } from './types'
import { normalize } from '../lib/check'

// ---------- Vokabeln ----------

export interface VocabEntry {
  id: string
  unit: string
  fr: string
  de: string
}

const GENDER_MARK = /\s*\((?:m|f|m\.|f\.|fam)\)/g

/** Anzeigeform ohne Genus-Markierung, z. B. "l'œuf (m)" → "l'œuf". */
export function vocabDisplay(fr: string): string {
  return fr.replace(GENDER_MARK, '').trim()
}

/** Alle akzeptierten Schreibweisen einer französischen Vokabel. */
export function vocabAnswers(fr: string): string[] {
  const out = new Set<string>()
  for (const alt of vocabDisplay(fr).split(' / ')) {
    // "le tableau, les tableaux" → Singular reicht; "prêt, e" → prêt / prête
    let [main, rest] = alt.split(', ').map((s) => s.trim())
    if (rest === 'e') out.add(main + 'e')
    const unwrapped = main.replace(/[()]/g, '').replace(/\s+/g, ' ').trim()
    const withoutOptional = main.replace(/\s*\([^)]*\)/g, '').trim()
    const bare = withoutOptional.replace(/\s*\b(?:qc|qn)\.(?:\/(?:qc|qn)\.)?/g, '').trim()
    out.add(main)
    out.add(unwrapped)
    out.add(withoutOptional)
    out.add(bare)
  }
  return [...out].filter(Boolean)
}

/** Deutscher Schlüssel, um gleichbedeutende Prompts zusammenzufassen ("(Koch)topf" ≈ "Topf"). */
function germanKey(de: string): string {
  return normalize(de.replace(/\([^)]*\)/g, ''))
}

/** Text für die Sprachausgabe (ohne qc./qn. und Klammern). */
export function speakable(fr: string): string {
  return vocabDisplay(fr)
    .split(' / ')[0]
    .split(', ')[0]
    .replace(/\s*\([^)]*\)/g, '')
    .replace(/\s*\b(?:qc|qn)\.(?:\/(?:qc|qn)\.)?/g, '')
    .trim()
}

export function buildVocabItems(entries: VocabEntry[]): Item[] {
  const byGerman = new Map<string, string[]>()
  for (const e of entries) {
    const k = germanKey(e.de)
    byGerman.set(k, [...(byGerman.get(k) ?? []), ...vocabAnswers(e.fr)])
  }
  return entries.map((e) => {
    const own = vocabAnswers(e.fr)
    const synonyms = (byGerman.get(germanKey(e.de)) ?? []).filter((a) => !own.includes(a))
    const exercise: Exercise = {
      type: 'gap',
      instruction: 'Übersetze ins Französische – mit Artikel.',
      prompt: e.de,
      answers: [vocabDisplay(e.fr), ...own, ...synonyms],
      speak: speakable(e.fr),
    }
    return { id: e.id, unitId: e.unit, kind: 'vocab', exercise }
  })
}

// ---------- Unregelmäßige Verben ----------

export interface VerbEntry {
  inf: string
  unit: string
  elide?: boolean
  forms?: string[]
  impersonal?: string
  de?: string
}

const PRONOUNS = ['je', 'tu', 'il/elle/on', 'nous', 'vous', 'ils/elles']
const SPEAK_PRONOUNS = ['je', 'tu', 'il', 'nous', 'vous', 'ils']

export function buildVerbItems(verbs: VerbEntry[]): Item[] {
  const items: Item[] = []
  for (const v of verbs) {
    if (v.impersonal) {
      const [, form] = v.impersonal.split(' ')
      items.push({
        id: `vb:${v.inf}`,
        unitId: v.unit,
        kind: 'grammar',
        exercise: {
          type: 'gap',
          instruction: 'Konjugiere im Präsens.',
          prompt: 'il ___',
          hint: `(${v.inf}) – ${v.de}`,
          answers: [form, v.impersonal],
          options: v.inf === 'falloir' ? ['faut', 'faux', 'fault', 'fallait'] : ['pleut', 'pleuve', 'pleuvoit', 'plut'],
          speak: v.impersonal,
        },
      })
      continue
    }
    const forms = v.forms!.map((f) => f.split('|'))
    forms.forEach((answers, p) => {
      const pronoun = p === 0 && v.elide ? "j'" : PRONOUNS[p]
      const speakPronoun = p === 0 && v.elide ? "j'" : SPEAK_PRONOUNS[p]
      const reflexiveNousVous = answers[0].startsWith('nous ') || answers[0].startsWith('vous ')
      const distractors = [...new Set(forms.map((f) => f[0]))].filter((f) => f !== answers[0])
      items.push({
        id: `vb:${v.inf}:${p}`,
        unitId: v.unit,
        kind: 'grammar',
        exercise: {
          type: 'gap',
          instruction: 'Konjugiere im Präsens.',
          prompt: `${pronoun} ___`,
          hint: `(${v.inf})`,
          answers,
          options: [answers[0], ...distractors.slice(0, 3)],
          speak: reflexiveNousVous
            ? `${SPEAK_PRONOUNS[p]} ${answers[0]}`
            : `${speakPronoun}${speakPronoun.endsWith("'") ? '' : ' '}${answers[0]}`,
        },
      })
    })
  }
  return items
}

// ---------- Grammatik (handgeschrieben) ----------

export type GrammarEntry = { id: string; unit: string } & Partial<Exercise> & { type: Exercise['type'] }

export function buildGrammarItems(entries: GrammarEntry[], defaultInstructions: Record<string, string>): Item[] {
  return entries.map(({ id, unit, ...ex }) => ({
    id,
    unitId: unit,
    kind: 'grammar',
    exercise: { instruction: defaultInstructions[`${unit}:${ex.type}`] ?? defaultInstructions[unit] ?? '', ...ex } as Exercise,
  }))
}
