import { useSyncExternalStore } from 'react'
import { emptyData, type AppData } from './model'

/**
 * Speicher-Schnittstelle. Heute: localStorage im Browser.
 * Später kann hier ein Server- oder Cloud-Adapter angeschlossen werden.
 */
export interface StorageAdapter {
  load(): AppData | null
  save(data: AppData): void
}

const KEY = 'feedmybrain:v1'

export const localStorageAdapter: StorageAdapter = {
  load() {
    try {
      const raw = localStorage.getItem(KEY)
      return raw ? (JSON.parse(raw) as AppData) : null
    } catch {
      return null
    }
  },
  save(data) {
    try {
      localStorage.setItem(KEY, JSON.stringify(data))
    } catch {
      // Speichern nicht möglich (z. B. privater Modus) – App läuft trotzdem weiter.
    }
  },
}

let adapter: StorageAdapter = localStorageAdapter
let state: AppData = adapter.load() ?? emptyData()
const listeners = new Set<() => void>()

export function getData(): AppData {
  return state
}

/** Ändert den Zustand über eine Kopie und speichert ihn. */
export function update(mutate: (draft: AppData) => void): void {
  const draft = structuredClone(state)
  mutate(draft)
  state = draft
  adapter.save(state)
  listeners.forEach((l) => l())
}

export function replaceData(data: AppData): void {
  state = data
  adapter.save(state)
  listeners.forEach((l) => l())
}

function subscribe(l: () => void) {
  listeners.add(l)
  return () => listeners.delete(l)
}

export function useData(): AppData {
  return useSyncExternalStore(subscribe, getData)
}

// ---------- Export / Import ----------

export function exportData(): void {
  const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `feedmybrain-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

export async function importData(file: File): Promise<void> {
  const parsed = JSON.parse(await file.text()) as AppData
  if (parsed?.version !== 1 || !Array.isArray(parsed.profiles)) throw new Error('Ungültige Backup-Datei')
  replaceData(parsed)
}
