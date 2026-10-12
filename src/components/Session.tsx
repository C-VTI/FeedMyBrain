import { useEffect, useRef, useState } from 'react'
import type { Exam } from '../content/types'
import { activeProfile, finishRound, recordAnswer, type RoundSummary } from '../lib/actions'
import { xpFor } from '../lib/gamification'
import { BOSS_MINUTES, taskFor, type Task } from '../lib/session'
import { speak, ttsAvailable } from '../lib/tts'
import { getData } from '../lib/storage'
import { ChoiceView, correctAnswerOf, InputView, MatchView, OrderView, PlaceView, type Result } from './Exercises'
import { Markdown } from './Markdown'

export interface SessionSpec {
  title: string
  type: 'new' | 'review' | 'boss' | 'free' | 'mistakes'
  tasks: Task[]
  roundKey?: string
  unitId?: string
  explanation?: string
}

export interface BossAnswer {
  task: Task
  result: Result
}

interface Props {
  exam: Exam
  spec: SessionSpec
  onExit: () => void
  onFinish: (summary: RoundSummary, bossLog?: BossAnswer[]) => void
}

/** Französischer Text, der nach einer Antwort vorgelesen werden kann. */
function speakText(task: Task): string | undefined {
  const ex = task.item.exercise
  if ('speak' in ex && ex.speak) return ex.speak
  if (ex.type === 'gap') return ex.prompt.includes('___') ? ex.prompt.replace('___', ex.answers[0]).replace(/^.*– /, '') : ex.answers[0]
  if (ex.type === 'mc') return ex.prompt.includes('___') ? ex.prompt.replace('___', ex.answer) : undefined
  if (ex.type === 'place') return ex.solution.split(' / ')[0]
  if (ex.type === 'order') return ex.tokens.join(' ')
}

export function Session({ exam, spec, onExit, onFinish }: Props) {
  const isBoss = spec.type === 'boss'
  const [showIntro, setShowIntro] = useState(spec.type === 'new' && !!spec.explanation)
  const [queue, setQueue] = useState<Task[]>(spec.tasks)
  const [idx, setIdx] = useState(0)
  const [result, setResult] = useState<Result | null>(null)
  const [praiseText, setPraiseText] = useState('')
  const [combo, setCombo] = useState(0)
  const stats = useRef({ correct: 0, maxCombo: 0, xp: 0, requeued: new Set<string>(), bossLog: [] as BossAnswer[] })
  const originalKeys = useRef(new Set(spec.tasks.map((t) => t.key)))
  const [secondsLeft, setSecondsLeft] = useState(BOSS_MINUTES * 60)
  const settings = activeProfile()?.settings

  const task = queue[idx]

  const finish = () => {
    const s = stats.current
    const summary = finishRound(exam, {
      roundKey: spec.roundKey,
      unitId: spec.unitId,
      type: spec.type,
      correct: s.correct,
      total: spec.tasks.length,
      maxCombo: s.maxCombo,
      xpEarned: s.xp,
    })
    onFinish(summary, isBoss ? s.bossLog : undefined)
  }

  const handleResult = (r: Result) => {
    const s = stats.current
    const ok = r.verdict !== 'wrong'
    const newCombo = r.verdict === 'correct' ? combo + 1 : r.verdict === 'almost' ? combo : 0
    const xp = xpFor(r.verdict, newCombo)
    s.xp += xp
    s.maxCombo = Math.max(s.maxCombo, newCombo)
    setCombo(newCombo)
    if (ok && originalKeys.current.has(task.key)) s.correct++

    if (r.perItem) {
      Object.entries(r.perItem).forEach(([id, v], i) => recordAnswer(exam.id, id, v, i === 0 ? xp : 0))
    } else {
      recordAnswer(exam.id, task.item.id, r.verdict, xp)
    }

    if (isBoss) {
      s.bossLog.push({ task, result: r })
      next()
      return
    }

    // Falsch beantwortete Aufgaben kommen am Ende der Runde noch einmal (einmalig).
    if (!ok && task.mode !== 'match' && !s.requeued.has(task.item.id)) {
      s.requeued.add(task.item.id)
      const p = getData().profiles.find((x) => x.id === getData().activeProfileId)?.exams[exam.id]
      if (p) setQueue((q) => [...q, taskFor(exam, p, task.item)])
    }
    setPraiseText(praise())
    setResult(r)
    const text = speakText(task)
    if (settings?.tts && settings.autoSpeak && text && ok) speak(text)
  }

  const next = () => {
    setResult(null)
    if (idx + 1 >= queue.length) finish()
    else setIdx(idx + 1)
  }

  useEffect(() => {
    if (!result) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault()
        next()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  useEffect(() => {
    if (!isBoss || showIntro) return
    const t = setInterval(() => setSecondsLeft((s) => s - 1), 1000)
    return () => clearInterval(t)
  }, [isBoss, showIntro])

  useEffect(() => {
    if (isBoss && secondsLeft <= 0) finish()
  }, [secondsLeft])

  const exit = () => {
    if (idx === 0 && !result) return onExit()
    if (confirm('Runde abbrechen? Deine bisherigen Antworten bleiben gespeichert.')) onExit()
  }

  if (showIntro) {
    return (
      <div className="session">
        <div className="session-top">
          <button className="btn ghost" onClick={onExit}>✕</button>
          <span className="muted">Neues Thema</span>
        </div>
        <div className="session-body">
          <h1>{spec.title}</h1>
          <div className="card"><Markdown text={spec.explanation!} /></div>
          <div><button className="btn primary big" onClick={() => setShowIntro(false)} autoFocus>Verstanden – los geht's →</button></div>
        </div>
      </div>
    )
  }

  if (!task) return null
  const progress = idx / queue.length
  const ex = task.item.exercise
  const instruction = task.mode === 'match' ? 'Ordne zu.' : ex.instruction
  const solution = correctAnswerOf(task)
  const text = speakText(task)
  const mm = Math.max(0, Math.floor(secondsLeft / 60))
  const ss = String(Math.max(0, secondsLeft % 60)).padStart(2, '0')

  return (
    <div className="session">
      <div className="session-top">
        <button className="btn ghost" onClick={exit} title="Beenden">✕</button>
        <div className="bar"><span style={{ width: `${progress * 100}%` }} /></div>
        {isBoss ? (
          <span className={`timer ${secondsLeft < 120 ? 'low' : ''}`}>⏱ {mm}:{ss}</span>
        ) : (
          <span key={combo} className={`combo ${combo >= 3 ? 'pop' : ''}`}>{combo >= 3 ? `🔥 x${combo}` : ''}</span>
        )}
      </div>

      <div className="session-body" key={task.key}>
        <div className="instruction">{isBoss ? `Aufgabe ${idx + 1} von ${queue.length} · ` : ''}{instruction}</div>
        {task.mode === 'mc' && <ChoiceView task={task} result={result} onResult={handleResult} />}
        {task.mode === 'input' && <InputView task={task} result={result} onResult={handleResult} />}
        {task.mode === 'place' && <PlaceView task={task} result={result} onResult={handleResult} />}
        {task.mode === 'order' && <OrderView task={task} result={result} onResult={handleResult} />}
        {task.mode === 'match' && <MatchView task={task} result={result} onResult={handleResult} />}
      </div>

      {result && !isBoss && (
        <div className={`feedback ${result.verdict === 'correct' ? 'right' : result.verdict}`}>
          <div className="feedback-inner">
            <div className="stack" style={{ gap: 2 }}>
              <div className="verdict">
                {result.verdict === 'correct' ? praiseText : result.verdict === 'almost' ? 'Fast richtig!' : 'Nicht ganz.'}
              </div>
              {result.note && <div style={{ fontWeight: 600 }}>{result.note}</div>}
              {task.mode !== 'match' && result.verdict !== 'correct' && solution && (
                <div className="solution">Lösung: <strong>{solution}</strong></div>
              )}
              {task.mode !== 'match' && 'explanation' in ex && ex.explanation && <div className="explain">{ex.explanation}</div>}
            </div>
            <div className="row">
              {settings?.tts && ttsAvailable() && text && task.mode !== 'match' && (
                <button className="speak" onClick={() => speak(text)} title="Vorlesen">🔊</button>
              )}
              <button className={`btn big ${result.verdict === 'wrong' ? 'primary' : 'success'}`} onClick={next}>
                Weiter ⏎
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const PRAISE = ['Super!', 'Genau!', 'Richtig!', 'Parfait !', 'Très bien !', 'Bravo !', 'Excellent !']
function praise() {
  return PRAISE[Math.floor(Math.random() * PRAISE.length)]
}
