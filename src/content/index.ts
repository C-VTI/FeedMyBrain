import type { Exam } from './types'
import { frHms2 } from './fr-hms2-2026-10/exam'

/** Alle verfügbaren Prüfungen. Neue Prüfungen werden hier per Release ergänzt. */
export const exams: Exam[] = [frHms2]

export function getExam(id: string): Exam | undefined {
  return exams.find((e) => e.id === id)
}
