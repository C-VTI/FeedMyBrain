// Datumsfunktionen auf Basis lokaler Kalendertage im Format YYYY-MM-DD.

export type ISODate = string

const pad = (n: number) => String(n).padStart(2, '0')

export function toISO(d: Date): ISODate {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

export function fromISO(s: ISODate): Date {
  const [y, m, d] = s.split('-').map(Number)
  return new Date(y, m - 1, d)
}

/** Heutiges Datum; zum Testen per URL überschreibbar: ?today=2026-10-15 */
export function today(): ISODate {
  const override = new URLSearchParams(window.location.search).get('today')
  if (override && /^\d{4}-\d{2}-\d{2}$/.test(override)) return override
  return toISO(new Date())
}

export function addDays(s: ISODate, n: number): ISODate {
  const d = fromISO(s)
  d.setDate(d.getDate() + n)
  return toISO(d)
}

/** 0 = Sonntag … 6 = Samstag */
export function weekday(s: ISODate): number {
  return fromISO(s).getDay()
}

export function daysBetween(a: ISODate, b: ISODate): number {
  return Math.round((fromISO(b).getTime() - fromISO(a).getTime()) / 86_400_000)
}

export function range(from: ISODate, toExclusive: ISODate): ISODate[] {
  const out: ISODate[] = []
  for (let d = from; d < toExclusive; d = addDays(d, 1)) out.push(d)
  return out
}

export const WEEKDAYS_SHORT = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
export const WEEKDAYS_LONG = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']

export function formatDate(s: ISODate, opts: Intl.DateTimeFormatOptions = { weekday: 'long', day: 'numeric', month: 'long' }): string {
  return fromISO(s).toLocaleDateString('de-CH', opts)
}
