import type { Exam, GapExercise, Unit } from '../content/types'
import { activeProfile } from '../lib/actions'
import { crowns, MASTERED_BOX, unitMastery } from '../lib/srs'
import { useData } from '../lib/storage'
import { speak, ttsAvailable } from '../lib/tts'
import { Markdown } from './Markdown'
import { Crowns } from './Ring'

interface Props {
  exam: Exam
  unit: Unit
  onClose: () => void
  onPractice: () => void
}

export function UnitDetail({ exam, unit, onClose, onPractice }: Props) {
  const data = useData()
  const p = activeProfile(data)!.exams[exam.id]
  const m = unitMastery(exam, p, unit.id)
  const intro = p.introduced.includes(unit.id)
  const vocab = unit.kind === 'vocab' ? exam.items.filter((i) => i.unitId === unit.id) : []

  return (
    <div className="overlay" onClick={onClose}>
      <div className="card modal stack" style={{ maxWidth: 720 }} onClick={(e) => e.stopPropagation()}>
        <div className="row spread">
          <div className="stack" style={{ gap: 0 }}>
            <span className="tag muted small">{unit.kind === 'vocab' ? 'Vokabeln' : 'Grammatik'}</span>
            <h2>{unit.title}</h2>
          </div>
          <button className="btn ghost" onClick={onClose}>✕</button>
        </div>
        <div className="row">
          <Crowns value={crowns(m)} />
          <span className="muted small">{Math.round(m * 100)} % gemeistert</span>
        </div>
        <button className="btn primary big" onClick={onPractice}>{intro ? 'Üben →' : 'Jetzt starten →'}</button>
        {unit.explanation && <Markdown text={unit.explanation} />}
        {vocab.length > 0 && (
          <div className="explanation">
            <h2>Wortliste</h2>
            <table>
              <tbody>
                {vocab.map((v) => {
                  const ex = v.exercise as GapExercise
                  const box = p.items[v.id]?.box ?? 0
                  return (
                    <tr key={v.id}>
                      <td>{ex.prompt}</td>
                      <td>
                        <strong>{ex.answers[0]}</strong>
                        {ttsAvailable() && ex.speak && (
                          <button className="btn ghost" style={{ padding: '0 6px' }} onClick={() => speak(ex.speak!)}>🔊</button>
                        )}
                      </td>
                      <td className="muted small" style={{ textAlign: 'right' }}>{box >= MASTERED_BOX ? '✓' : ''}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
