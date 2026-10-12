# FeedMyBrain – Anforderungen

Status: MVP umgesetzt (Release 1)
Stand: 2026-10-12

## 1. Vision

FeedMyBrain ist eine Lern-WebApp für Schüler zur Vorbereitung auf Tests und Prüfungen. Sie kombiniert kurze Erklärungen mit abwechslungsreichen Übungen im Stil von Duolingo und einem Lernplan bis zum Prüfungsdatum.

## 2. Zielgruppe

- **Primärer Nutzer:** Schüler, 17 Jahre, 2. Klasse Handelsmittelschule (HMS)
- **Weitere Nutzer:** später weitere Schüler (z. B. Geschwister, Freunde), die auf demselben Gerät lernen

## 3. Scope

### 3.1 MVP (Release 1)

- Fach: **Französisch**, 2. HMS
- Prüfung: **Freitag, 23.10.2026**. Inhalte siehe [material-analyse.md](material-analyse.md) (Vokabeln, unregelmäßige Verben, Steigerung, Adverbien)
- Gewichtung: etwa **50 % Vokabeln, 50 % Grammatik**
- Vokabeln werden nur **Deutsch → Französisch** abgefragt, **immer mit Artikel**
- Lernzeitraum: 12.10. bis zum Tag vor der Prüfung. Am Prüfungstag wird nicht mehr gelernt.

### 3.2 Später (neue Releases)

- Weitere Fächer und Prüfungen werden mit neuen App-Releases ergänzt.
- Ein Inhaltseditor oder Upload in der App ist **nicht** geplant.
- Möglicher Betrieb auf einem eigenen Gerät oder bei einem Cloud-Anbieter (z. B. für Synchronisierung)

## 4. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| F-01 | Benutzer auswählen oder anlegen (nur Name, kein Login, kein Passwort) | Muss |
| F-02 | Prüfung auswählen (Liste der verfügbaren Prüfungen) | Muss |
| F-03 | Prüfungsdatum erfassen bzw. ändern | Muss |
| F-04 | Lernziele/Themen der Prüfung anzeigen | Muss |
| F-05 | Kurze Erklärungen zu Themen, wo notwendig (vor der ersten Übung eines Themas und auf Abruf) | Muss |
| F-06 | Übungstyp Multiple Choice | Muss |
| F-07 | Übungstyp Texteingabe (Lücke ausfüllen, übersetzen, konjugieren) | Muss |
| F-08 | Übungstyp Satz bauen (Wortbausteine in richtige Reihenfolge bringen) | Soll |
| F-09 | Übungstyp Paare zuordnen | Soll |
| F-10 | Sofortiges Feedback mit richtiger Lösung und kurzer Begründung | Muss |
| F-11 | Lernplan aus Prüfungsdatum, Themen und 30 Min./Tag; feste freie Wochentage wählbar (Standard: Donnerstag) | Muss |
| F-11a | Jokertage: zusätzliche freie Tage, die nur angeboten werden, wenn der Plan es zulässt (siehe Kapitel 6a) | Soll |
| F-12 | Adaptiver Lernplan: verpasste Tage werden nachgeholt, schwache Themen öfter wiederholt, solange genügend Zeit bleibt | Soll |
| F-13 | Lernfortschritt pro Benutzer und Prüfung speichern | Muss |
| F-14 | Falsch beantwortete Aufgaben gezielt wiederholen | Muss |
| F-15 | Gamification (siehe Kapitel 6) | Soll |
| F-16 | Probeprüfung am letzten Lerntag | Soll |
| F-17 | Französische Wörter und Sätze vorlesen (Sprachausgabe des Browsers) | Kann |

## 5. Nicht-funktionale Anforderungen

| ID | Anforderung |
|----|-------------|
| N-01 | Läuft im Browser Chrome unter Windows 11 auf dem Laptop |
| N-02 | Kein Login, kein Server. Der Fortschritt wird im Browser gespeichert (localStorage). |
| N-03 | Die Speicherung ist gekapselt, damit später ein Server- oder Cloud-Speicher ergänzt werden kann. Export und Import des Fortschritts als Datei sind als Backup sinnvoll. |
| N-04 | Bedienung mit Tastatur möglich (Enter = prüfen/weiter) |
| N-05 | Französische Sonderzeichen sind leicht eingebbar (Buttons é è à ç ê ô û î ï œ) |
| N-06 | Inhalte sind statisch und pro Fach und Prüfung als Datendateien strukturiert. Sie werden einmalig aus dem Material erstellt. Neue Prüfungen kommen per Release. |
| N-07 | Keine KI zur Laufzeit |
| N-08 | Oberfläche auf Deutsch |
| N-09 | Design: schlicht und elegant, ruhige Farben, viel Weißraum, gute Lesbarkeit |

## 6. Gamification (Vorschlag)

| Element | Beschreibung | Priorität |
|---------|--------------|-----------|
| Streak 🔥 | Zählt die Tage in Folge, an denen die Tageslektion geschafft wurde. Geplante freie Tage unterbrechen die Streak nicht. | Muss |
| XP & Level | XP pro richtiger Antwort, Bonus für fehlerfreie Lektionen. Level-Aufstieg mit kleiner Animation. | Soll |
| Combo | Bei mehreren richtigen Antworten in Folge erscheint ein Combo-Zähler (x3, x5 …), der XP multipliziert. | Soll |
| Themen-Meisterschaft | Jedes Thema hat eine Meisterschaftsstufe von 0 bis 5 Kronen bzw. einen Ring, der sich füllt. | Soll |
| Prüfungsbereitschaft | Ein Indikator in Prozent zeigt, wie gut er auf die Prüfung vorbereitet ist. | Soll |
| Abzeichen | z. B. „Verb-Bezwinger“ (alle Verben gemeistert), „Perfektionist“ (Lektion ohne Fehler), „Frühaufsteher“ | Kann |
| Boss-Level | Die Probeprüfung am Ende als „Boss“ mit Zeitlimit | Kann |

Entscheidung: Alle Elemente werden umgesetzt.

## 6a. Lernplan (MVP)

- Lerntage: alle Tage vom Start bis zum Tag vor der Prüfung, ohne die festen freien Wochentage
- Tageslektion etwa 30 Min. Der Mix aus Vokabeln und Grammatik orientiert sich an der Gewichtung 50:50.
- Reihenfolge: zuerst neue Inhalte einführen, dann zunehmend wiederholen (schwache Themen zuerst). Der letzte Lerntag ist die Probeprüfung (Boss-Level).
- **Jokertag:** Der Schüler kann einen Lerntag freinehmen, ohne die Streak zu verlieren. Ein Joker ist nur verfügbar, wenn die verbleibenden Lerntage für den restlichen Stoff reichen. Der Plan wird danach neu verteilt.
- **Verpasster Tag ohne Joker:** Die Streak wird zurückgesetzt, und der Stoff wird auf die restlichen Tage verteilt.

Beispiel für die Prüfung am 23.10. mit freiem Donnerstag:

| Mo 12. | Di 13. | Mi 14. | Do 15. | Fr 16. | Sa 17. | So 18. | Mo 19. | Di 20. | Mi 21. | Do 22. |
|---|---|---|---|---|---|---|---|---|---|---|
| Lernen | Lernen | Lernen | frei | Lernen | Lernen | Lernen | Lernen | Lernen | Probeprüfung | frei |

→ 9 Lerntage (≈ 4,5 h), Probeprüfung am Mi 21.10.

## 7. Lernmaterial

- Quelle: Fotos und PDFs der Lernziele und des Unterrichtsmaterials in `material/<datum>-<fach>/`
- Das Material wurde ins Repo eingecheckt, als es noch privat war. Seit 12.10. ist das Repo öffentlich, siehe offene Punkte.
- Analyse: [material-analyse.md](material-analyse.md)

## 8. Offene Punkte

1. **Repo bereinigen:** `material/` (urheberrechtlich geschütztes Schulmaterial) und ggf. persönliche Angaben in `docs/` aus dem öffentlichen Repo **inkl. Git-Historie** entfernen (History-Rewrite + Force-Push). Erst nach erfolgreichem Test von GitHub Pages.
2. **Lösungen prüfen:** Die selbst erarbeiteten Lösungen in `src/content/fr-hms2-2026-10/grammar.json` stichprobenartig kontrollieren (siehe [material-analyse.md](material-analyse.md), Kapitel „Umsetzung“).

## 9. Entscheidungen

| Datum | Entscheidung |
|-------|--------------|
| 2026-10-12 | MVP = Französisch, 2. HMS, eine Prüfung |
| 2026-10-12 | Zielplattform: Laptop, Chrome, Windows 11 |
| 2026-10-12 | Kein Login, nur Auswahl von Benutzer und Prüfung |
| 2026-10-12 | Neue Fächer und Prüfungen kommen per App-Release, nicht per Upload in der App |
| 2026-10-12 | Inhalte werden einmalig aus dem Material erstellt, App ist statisch (Variante 1) |
| 2026-10-12 | Texteingabe wird regelbasiert bewertet: mehrere Lösungen erlaubt, Akzentfehler = „fast richtig“, keine KI |
| 2026-10-12 | Vorerst kein Server. Speicherung im Browser, später Gerät oder Cloud möglich. |
| 2026-10-12 | Lernzeit 30 Min./Tag, freie Tage möglich, adaptiver Plan |
| 2026-10-12 | Sprachausgabe als „nice to have“ ausprobieren |
| 2026-10-12 | Schulmaterial darf ins Repo (Repo ist privat) |
| 2026-10-12 | Prüfungsdatum 23.10.2026; Gewichtung 50 % Vokabeln, 50 % Grammatik |
| 2026-10-12 | Vokabeln nur DE → FR, immer mit Artikel |
| 2026-10-12 | Donnerstag ist ein fester freier Tag; zusätzliche freie Tage per Jokertag, wenn der Plan es zulässt |
| 2026-10-12 | Alle vorgeschlagenen Gamification-Elemente werden umgesetzt |
| 2026-10-12 | Der 22.10. bleibt frei; die Probeprüfung findet am letzten Lerntag statt (21.10.) |
| 2026-10-12 | Tech-Stack: Vite + React + TypeScript, statisch, ohne Server |
| 2026-10-12 | Lokaler Betrieb mit `npm run dev` auf festem Port 5173 (localStorage hängt an der Adresse); Windows: `start-windows.bat` |
| 2026-10-12 | Repo öffentlich gemacht; Hosting über **GitHub Pages** (kostenlos für öffentliche Repos): https://c-vti.github.io/FeedMyBrain/ |
| 2026-10-12 | Deployment automatisch per GitHub Actions bei jedem Push auf `main` (Tests → Build → Pages) |
| 2026-10-12 | Bereinigung von `material/` inkl. Historie erst später, nach erfolgreichem Pages-Test |

## 10. Umsetzung Release 1 (Stand 12.10.2026)

Festgelegte Regeln und Parameter (im Code unter `src/lib/`):

| Bereich | Regel |
|---------|-------|
| Tageslektion | 4 Runden ≈ 30 Min.: zuerst neue Einheiten (je Einführung mit Erklärung), Rest gemischte Wiederholung |
| Rundengröße | Einführung 12 Aufgaben (Vokabeln, + 1 Zuordnungsspiel) bzw. 14 (Grammatik); Wiederholung 15 Aufgaben + 1 Zuordnungsspiel |
| Verteilung | Noch nicht eingeführte Einheiten werden gleichmäßig auf die verbleibenden Lerntage vor der Probeprüfung verteilt; verpasste Tage verteilen sich automatisch neu |
| Joker | Nur wenn alle restlichen Einheiten mit max. 3 neuen pro Tag auf die verbleibenden Tage passen und mind. 2 Tage übrig sind; nicht am Probeprüfungstag und nicht nach Beginn der Tageslektion |
| Streak | Zählt erledigte Lerntage in Folge; feste freie Tage und Joker unterbrechen nicht, ein verpasster Lerntag setzt auf 0 |
| Übungsform | Neue Aufgaben (Box 0) zuerst als Multiple Choice, danach als Texteingabe |
| Wiederholung | Leitner-Boxen 0–5: richtig +1, falsch −2, „fast richtig“ unverändert (min. 1). Falsche Aufgaben kommen in derselben Runde einmal wieder. Auswahl nach Priorität: zuletzt falsch, niedrige Box, lange nicht gesehen |
| Bewertung Texteingabe | Groß/klein, Apostrophe, œ/oe und Satzzeichen am Ende egal; fehlende Akzente = „fast richtig“; fehlender/falscher Artikel wird angezeigt; Vokabeln mit gleichem deutschen Wort akzeptieren alle Varianten (z. B. Kartoffel → la pomme de terre / la patate); qc./qn. optional |
| Meisterschaft | Aufgabe gilt ab 3× richtig in Folge (Box 3) als gemeistert; Kronen 0–5 pro Einheit; Prüfungsbereitschaft = 50 % Vokabeln + 50 % Grammatik |
| XP & Level | 10 XP pro richtiger Antwort + Combo-Bonus bis +10, 5 XP bei „fast richtig“, +20 für fehlerfreie Runde, +50 für erledigte Tageslektion; Level n ab 75·n·(n−1) XP |
| Probeprüfung | 30 Aufgaben (15 Vokabeln, 15 Grammatik über alle Themen), nur Eingabe, 25 Min., Auswertung am Ende mit Schweizer Note (1 + 5 · Anteil richtig, auf halbe Noten gerundet) |
| Abzeichen | 15 Abzeichen (u. a. Streak 3/7, Combo 10/25, Themen gemeistert, Probeprüfung ≥ 4 bzw. ≥ 5.5) |
| Speicherung | localStorage (`feedmybrain:v1`), gekapselt über `StorageAdapter`; Export/Import als JSON-Datei |
| Test-Datum | Per URL simulierbar: `?today=JJJJ-MM-TT` |

