import { useRef } from 'react'
import type { Exam } from '../content/types'
import { activeProfile, deleteProfile, selectExam, selectProfile, updateExamSettings, updateSettings } from '../lib/actions'
import { WEEKDAYS_SHORT } from '../lib/date'
import { exportData, importData, useData } from '../lib/storage'
import { speak, ttsAvailable } from '../lib/tts'

const WEEK_ORDER = [1, 2, 3, 4, 5, 6, 0]

export function Settings({ exam, onClose }: { exam: Exam; onClose: () => void }) {
  const data = useData()
  const profile = activeProfile(data)!
  const p = profile.exams[exam.id]
  const fileRef = useRef<HTMLInputElement>(null)

  const toggleDay = (d: number) => {
    const next = p.freeWeekdays.includes(d) ? p.freeWeekdays.filter((x) => x !== d) : [...p.freeWeekdays, d]
    updateExamSettings(exam.id, { freeWeekdays: next })
  }

  const onImport = async (f: File | undefined) => {
    if (!f) return
    try {
      await importData(f)
      onClose()
    } catch (e) {
      alert(`Import fehlgeschlagen: ${(e as Error).message}`)
    }
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card modal stack" onClick={(e) => e.stopPropagation()}>
        <div className="row spread">
          <h2>Einstellungen</h2>
          <button className="btn ghost" onClick={onClose}>✕</button>
        </div>

        <div className="field">
          <label htmlFor="examDate">Prüfungsdatum</label>
          <input id="examDate" type="date" className="text-input" value={p.examDate} onChange={(e) => e.target.value && updateExamSettings(exam.id, { examDate: e.target.value })} />
        </div>

        <div className="field">
          <label>Feste freie Tage</label>
          <div className="weekday-toggle">
            {WEEK_ORDER.map((d) => (
              <button key={d} className={p.freeWeekdays.includes(d) ? 'on' : ''} onClick={() => toggleDay(d)}>{WEEKDAYS_SHORT[d]}</button>
            ))}
          </div>
          <span className="muted small">Zusätzliche freie Tage gibt es per Jokertag, wenn der Plan es zulässt.</span>
        </div>

        {ttsAvailable() && (
          <div className="field">
            <label>Sprachausgabe</label>
            <label className="switch">
              <input type="checkbox" checked={profile.settings.tts} onChange={(e) => updateSettings({ tts: e.target.checked })} />
              Vorlesen-Knopf anzeigen
            </label>
            <label className="switch">
              <input type="checkbox" checked={profile.settings.autoSpeak} onChange={(e) => updateSettings({ autoSpeak: e.target.checked })} />
              Richtige Antworten automatisch vorlesen
            </label>
            <div><button className="btn" onClick={() => speak('Bonjour ! Je mange une pomme.')}>🔊 Test</button></div>
          </div>
        )}

        <div className="field">
          <label>Backup</label>
          <span className="muted small">Der Fortschritt liegt nur in diesem Browser. Sichere ihn ab und zu als Datei.</span>
          <div className="row wrap">
            <button className="btn" onClick={exportData}>⬇️ Exportieren</button>
            <button className="btn" onClick={() => fileRef.current?.click()}>⬆️ Importieren</button>
            <input ref={fileRef} type="file" accept="application/json" hidden onChange={(e) => onImport(e.target.files?.[0])} />
          </div>
        </div>

        <div className="row wrap" style={{ borderTop: '1px solid var(--line)', paddingTop: 16 }}>
          <button className="btn" onClick={() => selectExam(undefined)}>Prüfung wechseln</button>
          <button className="btn" onClick={() => selectProfile(undefined)}>Profil wechseln</button>
          <span className="grow" />
          <button
            className="btn danger"
            onClick={() => confirm(`Profil «${profile.name}» mit allem Fortschritt löschen?`) && deleteProfile(profile.id)}
          >
            Profil löschen
          </button>
        </div>
      </div>
    </div>
  )
}
