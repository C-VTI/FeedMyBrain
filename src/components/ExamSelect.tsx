import { exams } from '../content'
import { activeProfile, selectExam, selectProfile } from '../lib/actions'
import { daysBetween, formatDate, today } from '../lib/date'
import { readiness } from '../lib/srs'
import { useData } from '../lib/storage'

export function ExamSelect() {
  const data = useData()
  const profile = activeProfile(data)!
  return (
    <div className="page narrow stack" style={{ paddingTop: 72 }}>
      <div className="row spread">
        <div className="brand"><span className="dot" /> FeedMyBrain</div>
        <button className="btn ghost" onClick={() => selectProfile(undefined)}>{profile.avatar} {profile.name} · wechseln</button>
      </div>
      <h1>Wofür lernst du?</h1>
      {exams.map((exam) => {
        const progress = profile.exams[exam.id]
        const examDate = progress?.examDate ?? exam.defaultExamDate
        const days = daysBetween(today(), examDate)
        return (
          <button key={exam.id} className="card unit" style={{ padding: 24 }} onClick={() => selectExam(exam)}>
            <span style={{ fontSize: '2.2rem' }}>🇫🇷</span>
            <span className="grow stack" style={{ gap: 2 }}>
              <span className="tag">{exam.subject} · {exam.className}</span>
              <h2>{exam.title}</h2>
              <span className="muted small">
                {formatDate(examDate)} {days > 0 ? `· noch ${days} Tage` : days === 0 ? '· heute' : '· vorbei'}
              </span>
            </span>
            {progress && <strong>{Math.round(readiness(exam, progress) * 100)} %</strong>}
          </button>
        )
      })}
    </div>
  )
}
