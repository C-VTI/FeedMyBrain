// Inhaltsmodell: statische Prüfungsinhalte, einmalig aus dem Schulmaterial erstellt.

export type Kind = 'vocab' | 'grammar'

/** Lücke/Übersetzung: Texteingabe, bei neuen Aufgaben optional Multiple Choice. */
export interface GapExercise {
  type: 'gap'
  instruction: string
  /** Satz mit "___" als Lücke, oder ein einzelner Begriff (z. B. deutsches Wort). */
  prompt: string
  /** Zusatzhinweis, z. B. "(lent)" oder "(+ bien)". */
  hint?: string
  /** Alle akzeptierten Antworten; die erste wird als Lösung angezeigt. */
  answers: string[]
  /** Auswahloptionen für Multiple Choice (inkl. richtiger Antwort). */
  options?: string[]
  explanation?: string
  /** Französischer Text für die Sprachausgabe. */
  speak?: string
}

export interface ChoiceExercise {
  type: 'mc'
  instruction: string
  prompt: string
  options: string[]
  answer: string
  explanation?: string
  speak?: string
}

/** Adverb an die richtige Stelle im Satz setzen. */
export interface PlaceExercise {
  type: 'place'
  instruction: string
  /** Satz in Wörtern; Positionen 0..tokens.length sind die Lücken davor/dazwischen/danach. */
  tokens: string[]
  /** Satzzeichen am Ende (Standard "."). */
  end?: string
  word: string
  positions: number[]
  solution: string
  explanation?: string
}

/** Satz aus Wortbausteinen bauen. */
export interface OrderExercise {
  type: 'order'
  instruction: string
  prompt?: string
  /** Bausteine der Lösung in richtiger Reihenfolge. */
  tokens: string[]
  /** Weitere richtige Reihenfolgen als ganzer Satz (aus denselben Bausteinen). */
  alt?: string[]
  explanation?: string
  speak?: string
}

export type Exercise = GapExercise | ChoiceExercise | PlaceExercise | OrderExercise

export interface Item {
  id: string
  unitId: string
  kind: Kind
  exercise: Exercise
}

export interface Unit {
  id: string
  kind: Kind
  title: string
  subtitle: string
  /** Erklärung (Mini-Markdown), wird vor der ersten Übung gezeigt. */
  explanation?: string
}

export interface Exam {
  id: string
  subject: string
  title: string
  className: string
  defaultExamDate: string
  /** Einheiten in der Reihenfolge, in der sie im Lernplan eingeführt werden. */
  units: Unit[]
  items: Item[]
  /** Anteil Vokabeln (0..1) in Wiederholungen und in der Probeprüfung. */
  vocabWeight: number
}
