import { useState } from 'react'
import { getExam } from './content'
import { activeProfile } from './lib/actions'
import type { RoundSummary } from './lib/actions'
import { useData } from './lib/storage'
import { Dashboard } from './components/Dashboard'
import { ExamSelect } from './components/ExamSelect'
import { ProfileSelect } from './components/ProfileSelect'
import { Session, type BossAnswer, type SessionSpec } from './components/Session'
import { Summary } from './components/Summary'

type Screen =
  | { name: 'home' }
  | { name: 'session'; spec: SessionSpec }
  | { name: 'summary'; summary: RoundSummary; bossLog?: BossAnswer[] }

export function App() {
  const data = useData()
  const [screen, setScreen] = useState<Screen>({ name: 'home' })
  const profile = activeProfile(data)
  const exam = data.activeExamId ? getExam(data.activeExamId) : undefined

  if (!profile) return <ProfileSelect />
  if (!exam || !profile.exams[exam.id]) return <ExamSelect />

  const home = () => {
    setScreen({ name: 'home' })
    window.scrollTo(0, 0)
  }

  switch (screen.name) {
    case 'session':
      return (
        <Session
          key={screen.spec.tasks[0]?.key}
          exam={exam}
          spec={screen.spec}
          onExit={home}
          onFinish={(summary, bossLog) => setScreen({ name: 'summary', summary, bossLog })}
        />
      )
    case 'summary':
      return <Summary summary={screen.summary} bossLog={screen.bossLog} onContinue={home} />
    default:
      return <Dashboard exam={exam} onStart={(spec) => spec.tasks.length > 0 && setScreen({ name: 'session', spec })} />
  }
}
