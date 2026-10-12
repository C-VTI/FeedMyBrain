import { useState } from 'react'
import { createProfile, selectProfile } from '../lib/actions'
import { levelInfo } from '../lib/gamification'
import { useData } from '../lib/storage'

export function ProfileSelect() {
  const data = useData()
  const [adding, setAdding] = useState(data.profiles.length === 0)
  const [name, setName] = useState('')

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (name.trim()) createProfile(name)
  }

  return (
    <div className="page narrow stack" style={{ paddingTop: 72 }}>
      <div className="brand"><span className="dot" /> FeedMyBrain</div>
      <h1>Wer lernt heute?</h1>
      <div className="profiles">
        {data.profiles.map((p) => (
          <button key={p.id} className="profile-tile" onClick={() => selectProfile(p.id)}>
            <span className="avatar">{p.avatar}</span>
            <strong>{p.name}</strong>
            <span className="muted small">Level {levelInfo(p.xp).level}</span>
          </button>
        ))}
        {!adding && (
          <button className="profile-tile add" onClick={() => setAdding(true)}>
            <span className="avatar">＋</span>
            <span>Neues Profil</span>
          </button>
        )}
      </div>
      {adding && (
        <form className="card stack" onSubmit={submit}>
          <label className="field">
            <span style={{ fontWeight: 600 }}>Wie heißt du?</span>
            <input className="text-input" autoFocus value={name} onChange={(e) => setName(e.target.value)} placeholder="Vorname" maxLength={24} />
          </label>
          <div className="row">
            <button className="btn primary" disabled={!name.trim()}>Los geht's</button>
            {data.profiles.length > 0 && <button type="button" className="btn ghost" onClick={() => setAdding(false)}>Abbrechen</button>}
          </div>
        </form>
      )}
      <p className="muted small">Kein Login nötig – dein Fortschritt wird in diesem Browser gespeichert.</p>
    </div>
  )
}
