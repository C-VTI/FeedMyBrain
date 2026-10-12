export type Verdict = 'correct' | 'almost' | 'wrong'

/** Vereinheitlicht Eingaben: Groß/klein, Apostrophe, Leerzeichen, Satzzeichen am Ende, œ/oe. */
export function normalize(s: string): string {
  return s
    .normalize('NFC')
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/œ/g, 'oe')
    .replace(/æ/g, 'ae')
    .replace(/\s*'\s*/g, "'")
    .replace(/\s+/g, ' ')
    .replace(/[\s.!?;:,]+$/g, '')
    .trim()
}

export function stripAccents(s: string): string {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').normalize('NFC')
}

const ARTICLE = /^(le |la |les |l')/

export interface CheckResult {
  verdict: Verdict
  /** Kurzer Hinweis bei "fast richtig" oder typischen Fehlern. */
  note?: string
}

export function checkAnswer(input: string, answers: string[]): CheckResult {
  const given = normalize(input)
  if (!given) return { verdict: 'wrong' }
  const accepted = answers.map(normalize)
  if (accepted.includes(given)) return { verdict: 'correct' }
  if (accepted.some((a) => stripAccents(a) === stripAccents(given))) {
    return { verdict: 'almost', note: 'Fast richtig – achte auf die Akzente.' }
  }
  const body = (s: string) => stripAccents(s.replace(ARTICLE, ''))
  if (accepted.some((a) => ARTICLE.test(a) && body(a) === stripAccents(given))) {
    return { verdict: 'wrong', note: 'Der Artikel fehlt!' }
  }
  if (ARTICLE.test(given) && accepted.some((a) => ARTICLE.test(a) && body(a) === body(given))) {
    return { verdict: 'wrong', note: 'Falscher Artikel!' }
  }
  return { verdict: 'wrong' }
}
