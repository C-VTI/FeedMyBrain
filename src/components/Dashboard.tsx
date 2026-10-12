import { useEffect, useState } from 'react'
import type { Exam, Unit } from '../content/types'
import { activeProfile, ensureDayPlan, takeJoker } from '../lib/actions'
import { addDays, daysBetween, formatDate, range, today, WEEKDAYS_SHORT, weekday, fromISO } from '../lib/date'
import { BADGES, levelInfo } from '../lib/gamification'
import type { ExamProgress, Round } from '../lib/model'
import { canUseJoker, dayStatus, getDayPlan, streak } from '../lib/plan'
import { buildBossRound, buildMistakesRound, buildNewRound, buildReviewRound, countMistakes } from '../lib/session'
import { crowns, readiness, unitMastery } from '../lib/srs'
import { useData } from '../lib/storage'
import { Crowns, Ring } from './Ring'
import type { SessionSpec } from './Session'
import { Settings } from './Settings'
import { UnitDetail } from './UnitDetail'

interface Props {
  exam: Exam
  onStart: (spec: SessionSpec) => void
}

export function roundTitle(exam: Exam, r: Round): string {
  if (r.type === 'boss') return '👑 Probeprüfung'
  if (r.type === 'review') return 'Wiederholung (gemischt)'
  return `Neu: ${exam.units.find((u) => u.id === r.unitId)?.title ?? ''}`
}

export function Dashboard({ exam, onStart }: Props) {
  const data = useData()
  const profile = activeProfile(data)!
  const p = profile.exams[exam.id]
  const t = today()
  const [showSettings, setShowSettings] = useState(false)
  const [unitDetail, setUnitDetail] = useState<Unit | null>(null)

  useEffect(() => ensureDayPlan(exam, t), [exam, t, p.examDate, p.freeWeekdays.join(), p.jokers.length])

  const status = dayStatus(p, t)
  const plan = getDayPlan(exam, p, t)
  const currentStreak = streak(p, t)
  const lvl = levelInfo(profile.xp)
  const ready = readiness(exam, p)
  const daysLeft = daysBetween(t, p.examDate)
  const mistakes = countMistakes(exam, p)
  const joker = canUseJoker(exam, p, t)

  const startRound = (r: Round) => {
    if (r.type === 'boss') return onStart({ title: 'Probeprüfung', type: 'boss', tasks: buildBossRound(exam, p), roundKey: r.key })
    if (r.type === 'review') return onStart({ title: 'Wiederholung', type: 'review', tasks: buildReviewRound(exam, p), roundKey: r.key })
    const unit = exam.units.find((u) => u.id === r.unitId)!
    onStart({ title: unit.title, type: 'new', tasks: buildNewRound(exam, p, unit.id), roundKey: r.key, unitId: unit.id, explanation: unit.explanation })
  }

  const practiceUnit = (unit: Unit) => {
    const planned = plan?.rounds.find((r) => r.unitId === unit.id && !plan.done.includes(r.key))
    onStart({
      title: unit.title,
      type: 'new',
      tasks: buildNewRound(exam, p, unit.id),
      roundKey: planned?.key,
      unitId: unit.id,
      explanation: p.introduced.includes(unit.id) ? undefined : unit.explanation,
    })
  }

  const nextRound = plan?.rounds.find((r) => !plan.done.includes(r.key))
  const earned = BADGES.filter((b) => profile.badges[b.id])

  return (
    <div className="page">
      <div className="topbar">
        <div className="brand"><span className="dot" /> FeedMyBrain</div>
        <div className="stats">
          <span className={`chip flame ${currentStreak === 0 ? 'cold' : ''}`} title="Streak: Lerntage in Folge">🔥 {currentStreak}</span>
          <span className="chip gold" title={`${profile.xp} XP`}>⭐ {profile.xp} XP</span>
          <button className="chip" onClick={() => setShowSettings(true)} title="Einstellungen">
            {profile.avatar} {profile.name} ⚙️
          </button>
        </div>
      </div>

      <div className="hero">
        <div className="card today">
          <div className="muted small">{formatDate(t)}</div>
          <TodayHeader status={status} daysLeft={daysLeft} examDate={p.examDate} />
          {plan && (status === 'learn' || status === 'probe') && (
            <>
              <ul className="rounds">
                {plan.rounds.map((r) => {
                  const done = plan.done.includes(r.key)
                  return (
                    <li key={r.key} className={`round-item ${done ? 'done' : r === nextRound ? 'next' : ''}`}>
                      <span className="check">{done ? '✓' : ''}</span>
                      <span className="grow">{roundTitle(exam, r)}</span>
                      {r.type === 'boss' && !done && <span className="muted small">~25 Min.</span>}
                    </li>
                  )
                })}
              </ul>
              {plan.completed && <p style={{ fontWeight: 600, color: 'var(--success)' }}>🎉 Tageslektion geschafft! Mehr geht immer – aber du darfst auch Pause machen.</p>}
              <div className="row wrap">
                {nextRound ? (
                  <button className="btn primary big" onClick={() => startRound(nextRound)}>
                    {plan.done.length === 0 ? "Los geht's" : 'Weiter'} →
                  </button>
                ) : (
                  <button className="btn primary big" onClick={() => onStart({ title: 'Freies Training', type: 'free', tasks: buildReviewRound(exam, p) })}>
                    Extra-Runde →
                  </button>
                )}
                {joker.allowed && (
                  <button
                    className="btn ghost"
                    onClick={() => confirm('Jokertag einsetzen? Heute ist dann frei und deine Streak bleibt erhalten. Der Stoff wird auf die restlichen Tage verteilt.') && takeJoker(exam.id, t)}
                  >
                    🃏 Jokertag
                  </button>
                )}
              </div>
            </>
          )}
          {status !== 'learn' && status !== 'probe' && (
            <div className="row wrap" style={{ marginTop: 16 }}>
              <button className="btn primary" onClick={() => onStart({ title: 'Freies Training', type: 'free', tasks: buildReviewRound(exam, p) })}>
                Freies Training
              </button>
            </div>
          )}
        </div>

        <div className="card readiness">
          <Ring value={ready} size={132}>
            <span className="ring-label">{Math.round(ready * 100)}%</span>
          </Ring>
          <strong>Prüfungsbereitschaft</strong>
          <span className="muted small">{readinessText(ready)}</span>
          <div className="level" style={{ width: '100%', marginTop: 8 }}>
            <div className="row spread small">
              <strong>Level {lvl.level} · {lvl.name}</strong>
              <span className="muted">noch {lvl.toNext} XP</span>
            </div>
            <div className="bar gold"><span style={{ width: `${lvl.progress * 100}%` }} /></div>
          </div>
        </div>
      </div>

      <PlanStrip p={p} t={t} />

      <div className="row wrap" style={{ marginTop: 16 }}>
        <button className="btn" onClick={() => onStart({ title: 'Freies Training', type: 'free', tasks: buildReviewRound(exam, p) })}>🎲 Freies Training</button>
        <button className="btn" disabled={mistakes === 0} onClick={() => onStart({ title: 'Fehler wiederholen', type: 'mistakes', tasks: buildMistakesRound(exam, p) })}>
          🔁 Fehler wiederholen {mistakes > 0 && `(${mistakes})`}
        </button>
        {status !== 'probe' && p.introduced.length === exam.units.length && (
          <button className="btn" onClick={() => onStart({ title: 'Probeprüfung', type: 'boss', tasks: buildBossRound(exam, p) })}>👑 Probeprüfung</button>
        )}
      </div>

      <div className="section-title">
        <h2>Themen</h2>
        <span className="muted small">{p.introduced.length} von {exam.units.length} eingeführt</span>
      </div>
      <div className="units">
        {exam.units.map((u) => {
          const m = unitMastery(exam, p, u.id)
          const intro = p.introduced.includes(u.id)
          return (
            <button key={u.id} className={`unit ${intro ? '' : 'locked'}`} onClick={() => setUnitDetail(u)}>
              <Ring value={m} size={44} stroke={5}>
                <span style={{ fontSize: '0.95rem' }}>{u.kind === 'vocab' ? '📖' : '🧩'}</span>
              </Ring>
              <span className="grow stack" style={{ gap: 0 }}>
                <span className="tag">{u.kind === 'vocab' ? 'Vokabeln' : 'Grammatik'}</span>
                <strong>{u.title}</strong>
                <span className="muted small">{u.subtitle}</span>
                <span className="row" style={{ gap: 8, marginTop: 4 }}>
                  <Crowns value={crowns(m)} />
                  <span className="muted small">{intro ? `${Math.round(m * 100)} %` : 'neu'}</span>
                </span>
              </span>
            </button>
          )
        })}
      </div>

      <div className="section-title">
        <h2>Abzeichen</h2>
        <span className="muted small">{earned.length} von {BADGES.length}</span>
      </div>
      <div className="badges">
        {BADGES.map((b) => (
          <div key={b.id} className={`badge ${profile.badges[b.id] ? '' : 'locked'}`} title={b.description}>
            <div className="icon">{b.icon}</div>
            <div className="title">{b.title}</div>
            <div className="desc">{b.description}</div>
          </div>
        ))}
      </div>

      {showSettings && <Settings exam={exam} onClose={() => setShowSettings(false)} />}
      {unitDetail && (
        <UnitDetail exam={exam} unit={unitDetail} onClose={() => setUnitDetail(null)} onPractice={() => { setUnitDetail(null); practiceUnit(unitDetail) }} />
      )}
    </div>
  )
}

function TodayHeader({ status, daysLeft, examDate }: { status: string; daysLeft: number; examDate: string }) {
  const countdown = daysLeft > 1 ? `Noch ${daysLeft} Tage bis zur Prüfung (${formatDate(examDate, { weekday: 'short', day: 'numeric', month: 'short' })}).` : daysLeft === 1 ? 'Morgen ist die Prüfung!' : ''
  const map: Record<string, [string, string]> = {
    learn: ['Deine Tageslektion', `≈ 30 Minuten. ${countdown}`],
    probe: ['Heute: Probeprüfung 👑', `Der letzte Lerntag – zeig, was du kannst! ${countdown}`],
    free: ['Heute ist frei 🌴', `Genieß den Tag – deine Streak bleibt erhalten. ${countdown}`],
    joker: ['Jokertag 🃏', `Heute frei, deine Streak bleibt erhalten. ${countdown}`],
    exam: ['Heute ist Prüfung 🍀', 'Viel Erfolg – du bist vorbereitet!'],
    after: ['Die Prüfung ist vorbei 🎓', 'Du kannst trotzdem weiter üben.'],
    before: ['Bald geht es los', countdown],
  }
  const [title, sub] = map[status]
  return (
    <>
      <h2>{title}</h2>
      <p className="muted" style={{ margin: '4px 0 0' }}>{sub}</p>
    </>
  )
}

function readinessText(r: number): string {
  if (r < 0.15) return 'Jeder Tag zählt – fang an!'
  if (r < 0.4) return 'Guter Start, bleib dran.'
  if (r < 0.65) return 'Du bist auf einem guten Weg.'
  if (r < 0.85) return 'Stark! Der Stoff sitzt immer besser.'
  return 'Du bist bereit für die Prüfung! 💪'
}

function PlanStrip({ p, t }: { p: ExamProgress; t: string }) {
  const days = range(p.startDate, addDays(p.examDate, 1))
  return (
    <div className="card flat" style={{ padding: 16 }}>
      <div className="row spread" style={{ marginBottom: 10 }}>
        <strong>Lernplan</strong>
        <span className="muted small">🌴 frei · 🃏 Joker · 👑 Probeprüfung · 🎓 Prüfung</span>
      </div>
      <div className="plan">
        {days.map((d) => {
          const s = dayStatus(p, d)
          const rec = p.days[d]
          const missed = (s === 'learn' || s === 'probe') && d < t && !rec?.completed
          const icon =
            s === 'exam' ? '🎓' : s === 'free' ? '🌴' : s === 'joker' ? '🃏' : rec?.completed ? '✓' : missed ? '✗' : s === 'probe' ? '👑' : d === t ? '•' : '·'
          return (
            <div key={d} className={`day ${d === t ? 'today' : ''} ${rec?.completed ? 'completed' : ''} ${s === 'exam' ? 'exam' : ''}`}>
              <div>{WEEKDAYS_SHORT[weekday(d)]}</div>
              <div className="num">{fromISO(d).getDate()}.</div>
              <div className="ico" style={missed ? { color: 'var(--error)' } : undefined}>{icon}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
