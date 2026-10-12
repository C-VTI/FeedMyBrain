# FeedMyBrain 🧠

Eine Lern-WebApp für Schüler, um sich gezielt auf Tests und Prüfungen in der Schule vorzubereiten: kurze Erklärungen, abwechslungsreiche Übungen im Stil von Duolingo, ein Lernplan bis zum Prüfungsdatum und Gamification.

## Status

✅ **MVP (Release 1):** Prüfung Französisch, 2. HMS, 23.10.2026

## Starten

Voraussetzung: [Node.js](https://nodejs.org) (LTS-Version) ist installiert.

**Windows:** Doppelklick auf `start-windows.bat`. Beim ersten Mal werden die Pakete installiert, danach öffnet sich die App im Browser.

**Terminal (Windows/macOS):**

```bash
npm install     # nur beim ersten Mal
npm run dev     # öffnet http://localhost:5173
```

> Der Lernfortschritt wird im Browser gespeichert (localStorage) und ist an die Adresse `http://localhost:5173` gebunden. Darum immer denselben Browser verwenden und ab und zu unter ⚙️ → **Exportieren** ein Backup machen.

## Funktionen

- **Profile ohne Login:** Wer lernt? Prüfung auswählen
- **Tageslektion (≈ 30 Min.):** Neue Themen werden mit Erklärung eingeführt, danach gemischte Wiederholungen (50 % Vokabeln, 50 % Grammatik)
- **Übungstypen:** Multiple Choice, Texteingabe mit Akzent-Tasten, Paare zuordnen, Satz bauen, Adverb platzieren
- **Bewertung:** Akzentfehler zählen als „fast richtig“, fehlende oder falsche Artikel werden erkannt
- **Wiederholungssystem:** Falsche Antworten kommen in derselben Runde noch einmal und später öfter
- **Lernplan:** Donnerstag ist frei (einstellbar), Jokertage gibt es, wenn die Zeit reicht, und verpasste Tage werden nachgeholt
- **Probeprüfung (Boss-Level):** am letzten Lerntag, 30 Aufgaben, 25 Minuten, Schweizer Note
- **Gamification:** Streak 🔥, XP und Level, Combo, Kronen pro Thema, Prüfungsbereitschaft in %, 15 Abzeichen
- **Vorlesen:** Französische Wörter und Sätze werden über die Sprachausgabe des Browsers vorgelesen

### Testen mit einem anderen Datum

Mit `?today=JJJJ-MM-TT` lässt sich ein Datum simulieren, z. B. `http://localhost:5173/?today=2026-10-21` (Probeprüfung).

## Projektstruktur

```
FeedMyBrain/
├── docs/                  # Anforderungen, Materialanalyse
├── material/              # Lernmaterial der Schule (Fotos, PDF)
└── src/
    ├── content/           # Prüfungsinhalte (statisch, pro Prüfung ein Ordner)
    │   └── fr-hms2-2026-10/   vocab.json, verbs.json, grammar.json, exam.ts
    ├── lib/               # Logik: Lernplan, Wiederholung, Gamification, Speicher
    └── components/        # Oberfläche (React)
```

## Neue Prüfung hinzufügen

1. Material in `material/<datum>-<fach>/` ablegen
2. Inhalte in `src/content/<prüfungs-id>/` erstellen (Vorlage: `fr-hms2-2026-10`)
3. Prüfung in `src/content/index.ts` registrieren

## Tech-Stack

Vite, React 18, TypeScript. Statische App ohne Server. Tests mit Vitest (`npm test`).
