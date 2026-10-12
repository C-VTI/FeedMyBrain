import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChoiceExercise, GapExercise, OrderExercise, PlaceExercise } from '../content/types'
import { checkAnswer, normalize, type Verdict } from '../lib/check'
import { shuffle, type Task } from '../lib/session'

export interface Result {
  verdict: Verdict
  note?: string
  /** Bei Zuordnungsspielen: Ergebnis pro Vokabel. */
  perItem?: Record<string, Verdict>
  /** Eingabe des Schülers (für die Auswertung der Probeprüfung). */
  given?: string
}

interface Props {
  task: Task
  result: Result | null
  onResult: (r: Result) => void
}

/** Prompt mit hervorgehobener Lücke. */
export function Prompt({ text, filled, verdict }: { text: string; filled?: string; verdict?: Verdict }) {
  if (!text.includes('___')) return <div className={`prompt ${text.length > 40 ? 'sentence' : ''}`}>{text}</div>
  const [before, after] = text.split('___')
  const color = verdict === 'correct' ? 'var(--success)' : verdict === 'almost' ? 'var(--warn)' : verdict === 'wrong' ? 'var(--error)' : undefined
  return (
    <div className="prompt sentence">
      {before}
      <span className="gap" style={{ color }}>{filled ?? ' '}</span>
      {after}
    </div>
  )
}

export function correctAnswerOf(task: Task): string | undefined {
  const ex = task.item.exercise
  switch (ex.type) {
    case 'gap': return ex.answers[0]
    case 'mc': return ex.answer
    case 'place': return ex.solution
    case 'order': return ex.tokens.join(' ')
  }
}

// ---------- Multiple Choice ----------

export function ChoiceView({ task, result, onResult }: Props) {
  const ex = task.item.exercise as GapExercise | ChoiceExercise
  const answer = ex.type === 'mc' ? ex.answer : ex.answers[0]
  const options = task.options ?? []
  const [picked, setPicked] = useState<string | null>(null)

  const choose = (o: string) => {
    if (result) return
    setPicked(o)
    onResult({ verdict: normalize(o) === normalize(answer) ? 'correct' : 'wrong', given: o })
  }

  useEffect(() => {
    if (result) return
    const onKey = (e: KeyboardEvent) => {
      const n = Number(e.key)
      if (n >= 1 && n <= options.length) choose(options[n - 1])
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <>
      <div>
        <Prompt text={ex.prompt} filled={result ? answer : undefined} verdict={result?.verdict} />
        {ex.type === 'gap' && ex.hint && <div className="hint">{ex.hint}</div>}
      </div>
      <div className="options">
        {options.map((o, i) => {
          const cls = result && o === answer ? 'right' : result && o === picked ? 'wrong' : ''
          return (
            <button key={o} className={`option ${cls}`} onClick={() => choose(o)} disabled={!!result}>
              <span className="key">{i + 1}</span>
              {o}
            </button>
          )
        })}
      </div>
    </>
  )
}

// ---------- Texteingabe ----------

const ACCENTS = ['é', 'è', 'ê', 'à', 'â', 'ç', 'ô', 'û', 'ù', 'î', 'ï', 'ë', 'œ']

export function InputView({ task, result, onResult }: Props) {
  const ex = task.item.exercise as GapExercise
  const [value, setValue] = useState('')
  const ref = useRef<HTMLInputElement>(null)

  useEffect(() => ref.current?.focus(), [task.key])

  const insert = (ch: string) => {
    const el = ref.current
    if (!el || result) return
    const start = el.selectionStart ?? value.length
    const end = el.selectionEnd ?? value.length
    const next = value.slice(0, start) + ch + value.slice(end)
    setValue(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + ch.length, start + ch.length)
    })
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (result || !value.trim()) return
    const r = checkAnswer(value, ex.answers)
    onResult({ ...r, given: value })
  }

  const isVocab = task.item.kind === 'vocab'
  const cls = result ? (result.verdict === 'correct' ? 'right' : result.verdict) : ''

  return (
    <>
      <div>
        {isVocab ? <div className="prompt">{ex.prompt}</div> : <Prompt text={ex.prompt} />}
        {ex.hint && <div className="hint">{ex.hint}</div>}
      </div>
      <form onSubmit={submit} className="stack" style={{ gap: 10 }}>
        <input
          ref={ref}
          className={`text-input answer-input ${cls}`}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          readOnly={!!result}
          placeholder={isVocab ? 'z. B. la viande' : 'Deine Antwort'}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
        />
        <div className="row spread wrap">
          <div className="accents">
            {ACCENTS.map((a) => (
              <button type="button" key={a} className="accent-key" onClick={() => insert(a)} tabIndex={-1}>{a}</button>
            ))}
          </div>
          {!result && <button className="btn primary" disabled={!value.trim()}>Prüfen ⏎</button>}
        </div>
      </form>
    </>
  )
}

// ---------- Adverb platzieren ----------

export function PlaceView({ task, result, onResult }: Props) {
  const ex = task.item.exercise as PlaceExercise
  const [picked, setPicked] = useState<number | null>(null)

  const choose = (pos: number) => {
    if (result) return
    setPicked(pos)
    onResult({ verdict: ex.positions.includes(pos) ? 'correct' : 'wrong', given: `Position ${pos}` })
  }

  const slot = (pos: number) => {
    const chosen = picked === pos
    const cls = chosen ? (result?.verdict === 'correct' ? 'right' : 'wrong') : ''
    return (
      <button key={`s${pos}`} className={`slot ${cls}`} onClick={() => choose(pos)} disabled={!!result} title="Hier einsetzen">
        {chosen ? ex.word : '+'}
      </button>
    )
  }

  return (
    <>
      <div className="stack" style={{ gap: 10 }}>
        <span className="muted">Wohin gehört</span>
        <div><span className="word-to-place">{ex.word}</span></div>
      </div>
      <div className="tokens" style={{ gap: 6 }}>
        {ex.tokens.map((t, i) => (
          <span key={i} className="row" style={{ gap: 6 }}>
            {slot(i)}
            <span className="plain-word">{t}</span>
          </span>
        ))}
        {slot(ex.tokens.length)}
        <span className="plain-word">{ex.end ?? '.'}</span>
      </div>
      <p className="muted small">Klicke auf die Stelle, an die das Adverb gehört.</p>
    </>
  )
}

// ---------- Satz bauen ----------

export function OrderView({ task, result, onResult }: Props) {
  const ex = task.item.exercise as OrderExercise
  const order = (task.options ?? []).map(Number)
  const [chosen, setChosen] = useState<number[]>([])
  const complete = chosen.length === ex.tokens.length

  const check = () => {
    if (result || !complete) return
    const sentence = chosen.map((i) => ex.tokens[i]).join(' ')
    const accepted = [ex.tokens.join(' '), ...(ex.alt ?? [])].map(normalize)
    onResult({ verdict: accepted.includes(normalize(sentence)) ? 'correct' : 'wrong', given: sentence })
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter') check()
      if (e.key === 'Backspace' && !result) setChosen((c) => c.slice(0, -1))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <>
      {ex.prompt && <div className="prompt sentence">{ex.prompt}</div>}
      <div className="tokens answer-line">
        {chosen.map((i) => (
          <button key={i} className="token" onClick={() => !result && setChosen(chosen.filter((c) => c !== i))}>{ex.tokens[i]}</button>
        ))}
      </div>
      <div className="tokens">
        {order.map((i) => (
          <button key={i} className={`token ${chosen.includes(i) ? 'used' : ''}`} onClick={() => !result && setChosen([...chosen, i])}>
            {ex.tokens[i]}
          </button>
        ))}
      </div>
      {!result && (
        <div className="row">
          <button className="btn primary" disabled={!complete} onClick={check}>Prüfen ⏎</button>
          <button className="btn ghost" disabled={chosen.length === 0} onClick={() => setChosen([])}>Zurücksetzen</button>
        </div>
      )}
    </>
  )
}

// ---------- Paare zuordnen ----------

export function MatchView({ task, result, onResult }: Props) {
  const group = task.group ?? []
  const left = useMemo(() => shuffle(group), [task.key])
  const right = useMemo(() => shuffle(group), [task.key])
  const [selected, setSelected] = useState<string | null>(null)
  const [matched, setMatched] = useState<string[]>([])
  const [mistakes, setMistakes] = useState<string[]>([])
  const [shakeId, setShakeId] = useState<string | null>(null)

  const pick = (rightId: string) => {
    if (!selected || result) return
    if (selected === rightId) {
      const next = [...matched, rightId]
      setMatched(next)
      setSelected(null)
      if (next.length === group.length) {
        const perItem = Object.fromEntries(group.map((g) => [g.id, mistakes.includes(g.id) ? 'wrong' : 'correct'])) as Record<string, Verdict>
        onResult({ verdict: mistakes.length === 0 ? 'correct' : 'wrong', perItem })
      }
    } else {
      if (!mistakes.includes(selected)) setMistakes([...mistakes, selected])
      setShakeId(rightId)
      setTimeout(() => setShakeId(null), 350)
    }
  }

  return (
    <>
      <div className="prompt sentence">Finde die Paare</div>
      <div className="match">
        <div className="col">
          {left.map((g) => (
            <button
              key={g.id}
              className={`option ${selected === g.id ? 'selected' : ''} ${matched.includes(g.id) ? 'matched' : ''}`}
              onClick={() => setSelected(g.id)}
            >
              {(g.exercise as GapExercise).prompt}
            </button>
          ))}
        </div>
        <div className="col">
          {right.map((g) => (
            <button
              key={g.id}
              className={`option ${matched.includes(g.id) ? 'matched' : ''} ${shakeId === g.id ? 'shake wrong' : ''}`}
              onClick={() => pick(g.id)}
            >
              {(g.exercise as GapExercise).answers[0]}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
