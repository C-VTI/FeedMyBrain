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

- Ein Fach: **Französisch**, 2. HMS
- Eine Prüfung, deren Inhalt auf den vorhandenen Lernzielen und dem Material (Fotos/PDF) basiert

### 3.2 Später (neue Releases)

- Weitere Fächer und Prüfungen werden mit neuen App-Releases ergänzt.
- Ein Inhaltseditor oder Upload in der App ist **nicht** geplant.

## 4. Funktionale Anforderungen

| ID | Anforderung | Priorität |
|----|-------------|-----------|
| F-01 | Benutzer auswählen oder anlegen (nur Name, kein Login, kein Passwort) | Muss |
| F-02 | Prüfung auswählen (Liste der verfügbaren Prüfungen) | Muss |
| F-03 | Prüfungsdatum erfassen bzw. ändern | Muss |
| F-04 | Lernziele der Prüfung anzeigen | Muss |
| F-05 | Erklärungen zu Themen bzw. Lernzielen, wo notwendig | Muss |
| F-06 | Übungstyp Multiple Choice | Muss |
| F-07 | Übungstyp Texteingabe (Lücke ausfüllen, übersetzen) | Muss |
| F-08 | Weitere Übungstypen (z. B. Zuordnen, Sätze bauen, Hören) | Soll |
| F-09 | Sofortiges Feedback mit richtiger Lösung und kurzer Begründung | Muss |
| F-10 | Lernplan, der aus Prüfungsdatum und Lernzielen erzeugt wird (Tagesportionen) | Muss |
| F-11 | Lernfortschritt pro Benutzer und Prüfung speichern | Muss |
| F-12 | Falsch beantwortete Aufgaben gezielt wiederholen | Soll |
| F-13 | Motivation durch Streak, Fortschrittsbalken, XP o. Ä. | Kann |
| F-14 | Probeprüfung bzw. Test-Modus kurz vor dem Prüfungstag | Kann |

## 5. Nicht-funktionale Anforderungen

| ID | Anforderung |
|----|-------------|
| N-01 | Läuft im Browser Chrome unter Windows 11 auf dem Laptop |
| N-02 | Kein Login und kein Benutzerkonto auf einem Server |
| N-03 | Bedienung mit Tastatur möglich (Enter = prüfen/weiter) |
| N-04 | Französische Sonderzeichen sind leicht eingebbar (é, è, à, ç, ê …) |
| N-05 | Inhalte sind pro Fach und Prüfung strukturiert, sodass neue Fächer leicht ergänzt werden können |
| N-06 | Sprache der Oberfläche: Deutsch |

## 6. Lernmaterial

- Quelle: Fotos und PDFs der Lernziele und des Unterrichtsmaterials
- Ablage im Repo: `material/`. Der Ordner wird per `.gitignore` ausgeschlossen, weil es sich um urheberrechtlich geschütztes Schulmaterial handelt.

## 7. Offene Fragen

Siehe Abschnitt „Offene Fragen“ im Chat bzw. die Ergänzungen unten.

## 8. Entscheidungen

| Datum | Entscheidung |
|-------|--------------|
| 2026-10-12 | MVP = Französisch, 2. HMS, eine Prüfung |
| 2026-10-12 | Zielplattform: Laptop, Chrome, Windows 11 |
| 2026-10-12 | Kein Login, nur Auswahl von Benutzer und Prüfung |
| 2026-10-12 | Neue Fächer und Prüfungen kommen per App-Release, nicht per Upload in der App |
