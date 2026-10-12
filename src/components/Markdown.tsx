import type { ReactNode } from 'react'

// Mini-Markdown für Erklärungen: ## Überschrift, > Hinweis, - / 1. Listen, | Tabellen |, **fett**.

function inline(text: string): ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith('**') && part.endsWith('**') ? <strong key={i}>{part.slice(2, -2)}</strong> : part,
  )
}

const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())

export function Markdown({ text }: { text: string }) {
  const lines = text.split('\n')
  const out: ReactNode[] = []
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const key = out.length
    if (!line.trim()) {
      i++
    } else if (line.startsWith('## ')) {
      out.push(<h2 key={key}>{inline(line.slice(3))}</h2>)
      i++
    } else if (line.startsWith('> ')) {
      out.push(<blockquote key={key}>{inline(line.slice(2))}</blockquote>)
      i++
    } else if (line.startsWith('|')) {
      const rows: string[][] = []
      while (i < lines.length && lines[i].startsWith('|')) {
        if (!/^\|[\s|:-]+\|$/.test(lines[i].trim())) rows.push(cells(lines[i]))
        i++
      }
      const [head, ...body] = rows
      const hasHead = head.some(Boolean)
      out.push(
        <table key={key}>
          {hasHead && (
            <thead>
              <tr>{head.map((c, j) => <th key={j}>{inline(c)}</th>)}</tr>
            </thead>
          )}
          <tbody>
            {body.map((r, k) => (
              <tr key={k}>{r.map((c, j) => <td key={j}>{inline(c)}</td>)}</tr>
            ))}
          </tbody>
        </table>,
      )
    } else if (/^(- |\d+\. )/.test(line)) {
      const ordered = /^\d+\. /.test(line)
      const items: ReactNode[][] = []
      while (i < lines.length && (/^(- |\d+\. )/.test(lines[i]) || /^\s{2,}\S/.test(lines[i]))) {
        const l = lines[i]
        if (/^\s{2,}- /.test(l)) items[items.length - 1].push(<div key={i}>• {inline(l.trim().slice(2))}</div>)
        else if (/^\s{2,}\S/.test(l)) items[items.length - 1].push(<div key={i}><em>{inline(l.trim())}</em></div>)
        else items.push([<span key={i}>{inline(l.replace(/^(- |\d+\. )/, ''))}</span>])
        i++
      }
      const List = ordered ? 'ol' : 'ul'
      out.push(<List key={key}>{items.map((c, k) => <li key={k}>{c}</li>)}</List>)
    } else {
      const para: string[] = []
      while (i < lines.length && lines[i].trim() && !/^(## |> |\||- |\d+\. )/.test(lines[i])) para.push(lines[i++])
      out.push(<p key={key}>{para.map((p, k) => <span key={k}>{k > 0 && <br />}{inline(p)}</span>)}</p>)
    }
  }
  return <div className="explanation">{out}</div>
}
