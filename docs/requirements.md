# FeedMyBrain – Anforderungen

Status: Entwurf (Requirement Engineering)
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
- Das Material wird ins private Repo eingecheckt.
- Analyse: [material-analyse.md](material-analyse.md)

## 8. Offene Fragen

1. Hosting: GitHub Pages oder Alternative (siehe Chat)

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
