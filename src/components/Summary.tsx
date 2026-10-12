import type { RoundSummary } from '../lib/actions'
import { Confetti } from './Ring'
import { correctAnswerOf, type Result } from './Exercises'
import type { BossAnswer } from './Session'

interface Props {
  summary: RoundSummary
  bossLog?: BossAnswer[]
  onContinue: () => void
}

function givenText(r: Result): string {
  if (r.given?.startsWith('Position')) return 'falsche Stelle'
  return r.given || '—'
}

export function Summary({ summary, bossLog, onContinue }: Props) {
  const pct = summary.total ? summary.correct / summary.total : 0
  const celebrate = summary.dayCompleted || !!summary.levelUp || pct === 1 || (summary.boss?.grade ?? 0) >= 4
  const wrong = bossLog?.filter((b) => b.result.verdict === 'wrong') ?? []

  return (
    <div className="page narrow stack summary">
      {celebrate && <Confetti />}
      {summary.boss ? (
        <>
          <div className="muted">Probeprüfung</div>
          <div className="big-number celebrate">Note {summary.boss.grade.toFixed(1)}</div>
          <p className="muted">{summary.boss.correct} von {summary.boss.total} Aufgaben richtig</p>
        </>
      ) : (
        <>
          <div style={{ fontSize: '3rem' }} className="celebrate">{pct === 1 ? '💎' : pct >= 0.8 ? '🎉' : pct >= 0.5 ? '💪' : '🌱'}</div>
          <h1>{pct === 1 ? 'Perfekt!' : pct >= 0.8 ? 'Sehr gut!' : pct >= 0.5 ? 'Gut gemacht!' : 'Dranbleiben!'}</h1>
        </>
      )}

      <div className="summary-stats">
        {!summary.boss && (
          <div className="stat-box"><div className="v">{summary.correct}/{summary.total}</div><div className="l">richtig</div></div>
        )}
        <div className="stat-box"><div className="v">+{summary.xpEarned + summary.bonusXp}</div><div className="l">XP</div></div>
        {!summary.boss && (
          <div className="stat-box"><div className="v">🔥 {summary.maxCombo}</div><div className="l">beste Combo</div></div>
        )}
      </div>

      {summary.dayCompleted && <p style={{ fontWeight: 600, color: 'var(--success)' }}>✅ Tageslektion geschafft – deine Streak wächst!</p>}
      {summary.levelUp && (
        <div className="new-badge" style={{ borderColor: 'var(--accent)' }}>
          <span className="icon">⬆️</span>
          <span><strong>Level {summary.levelUp.level} erreicht!</strong><br /><span className="muted">Du bist jetzt «{summary.levelUp.name}».</span></span>
        </div>
      )}
      {summary.badges.map((b, i) => (
        <div key={b.id} className="new-badge" style={{ animationDelay: `${0.2 + i * 0.15}s` }}>
          <span className="icon">{b.icon}</span>
          <span><strong>Neues Abzeichen: {b.title}</strong><br /><span className="muted">{b.description}</span></span>
        </div>
      ))}

      {wrong.length > 0 && (
        <div className="review-list">
          <h2 style={{ marginTop: 16 }}>Das solltest du nochmals anschauen</h2>
          {wrong.map(({ task, result }) => {
            const ex = task.item.exercise
            const prompt = ex.type === 'place' ? `${ex.word} → ${ex.tokens.join(' ')}` : 'prompt' in ex ? ex.prompt ?? '' : ''
            return (
              <div key={task.key} className="review-row">
                <span>✗</span>
                <span>
                  <span className="muted small">{prompt} {'hint' in ex && ex.hint}</span><br />
                  <span style={{ color: 'var(--error)', textDecoration: 'line-through' }}>{givenText(result)}</span>{' '}
                  → <strong>{correctAnswerOf(task)}</strong>
                </span>
              </div>
            )
          })}
        </div>
      )}

      <button className="btn primary big" onClick={onContinue} autoFocus style={{ marginTop: 16 }}>Weiter</button>
    </div>
  )
}
