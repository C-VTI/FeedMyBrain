import type { Exam, Unit } from '../types'
import { buildGrammarItems, buildVerbItems, buildVocabItems, type GrammarEntry, type VerbEntry, type VocabEntry } from '../build'
import vocab from './vocab.json'
import verbs from './verbs.json'
import grammar from './grammar.json'

const VOCAB_TIP = `Du lernst die Wörter **von Deutsch nach Französisch** – immer **mit Artikel**.

- **le** = männlich, **la** = weiblich, **l'** vor Vokal oder stummem h, **les** = Plural
- Bei **l'** und **les** siehst du das Geschlecht nicht – merke es dir trotzdem (z. B. l'huile **f.**)
- Bei Verben brauchst du **qc.** (quelque chose) und **qn.** (quelqu'un) nicht einzutippen

> Sonderzeichen: Nutze die Knöpfe unter dem Eingabefeld (é, è, à, ç …).`

const VERB_TIP = `Diese Verben sind **unregelmäßig** – du musst die Formen auswendig können.

| | aller | être | avoir | faire |
|---|---|---|---|---|
| je | vais | suis | ai (j'ai) | fais |
| tu | vas | es | as | fais |
| il/elle/on | va | est | a | fait |
| nous | allons | sommes | avons | faisons |
| vous | allez | êtes | avez | **faites** |
| ils/elles | vont | sont | ont | font |

**Muster, die helfen:**
- je/tu enden fast immer auf **-s** (je bois, tu bois), il/elle auf **-t** (il boit)
- Ausnahmen mit **-x**: je peux, je veux, je vaux
- Stammwechsel bei nous/vous: boire → **buv**ons, recevoir → **recev**ons, aber ils **reçoiv**ent
- Unpersönlich: **il faut** (man muss), **il pleut** (es regnet)`

const COMP_ADJ = `## Komparativ (Vergleich)

| | Bildung | Beispiel |
|---|---|---|
| + | **plus** … que | Paul est **plus** grand **que** Marc. |
| = | **aussi** … que | Lisa est **aussi** grande **que** Léa. |
| − | **moins** … que | Ce film est **moins** long **que** l'autre. |

Das Adjektiv wird **angeglichen**: plus grand**e**, moins intéressant**s**.

## Superlativ

| Bildung | Beispiel |
|---|---|
| **le/la/les plus** … (de) | C'est **le plus** grand **de** mes frères. |
| **le/la/les moins** … (de) | Ce sont **les moins** adorables. |

## Achtung: bon

| Positiv | Komparativ | Superlativ |
|---|---|---|
| bon(s) / bonne(s) | **meilleur(s) / meilleure(s)** | **le/la/les meilleur(e)(s)** |

Nie «plus bon»!

## Stellung im Superlativ

- Adjektiv **nach** dem Nomen → Artikel **wiederholen**: C'est **la** dame **la** plus élégante.
- Adjektiv **vor** dem Nomen (beau, grand, petit, vieux, bon …): C'est **la** plus belle maison.`

const ADV_FORM = `Ein Adverb beschreibt ein Verb, ein Adjektiv oder einen ganzen Satz – es ist **unveränderlich**.

## Grundregel
**Weibliche Form des Adjektivs + -ment**

| männlich | weiblich | Adverb |
|---|---|---|
| heureux | heureuse | heureuse**ment** |
| long | longue | longue**ment** |
| habituel | habituelle | habituelle**ment** |

## Endet die männliche Form auf Vokal → bleibt
joli → **joliment**, vrai → **vraiment**, absolu → **absolument**

## -ant / -ent
| | | |
|---|---|---|
| -ant → **-amment** | élégant → élég**amment** | courant → cour**amment** |
| -ent → **-emment** | prudent → prud**emment** | évident → évid**emment** |

## Unregelmäßig
| Adjektiv | Adverb |
|---|---|
| bon | **bien** |
| mauvais | **mal** |
| gentil | **gentiment** |
| énorme | énorm**é**ment |
| précis | précis**é**ment |
| profond | profond**é**ment |
| gai | gai**e**ment |`

const ADV_PLACE = `> **Nie** zwischen Subjekt und konjugiertem Verb! «Sie geht **oft** ins Kino» → Elle va **souvent** au cinéma.

## Der Entscheidungsbaum

1. **Bezieht sich das Adverb auf den ganzen Satz?** → **Satzanfang**, mit Komma.
   Heureusement, il fait beau.
2. **Ist es abgeleitet (-ment)?**
   - einfache Zeit → **nach dem konjugierten Verb**: Ma sœur sourit chaleureusement.
   - zusammengesetzte Zeit / mit Infinitiv → **vor das Partizip/den Infinitiv**: Il a **longuement** expliqué.
3. **Ort oder Zeitpunkt** (hier, demain, ici, là-bas, après …) → **Satzanfang oder Satzende**, nie zwischen Hilfsverb und Partizip.
   Hier, il est rentré. / Il est rentré hier.
4. **Unbestimmte Zeit und andere** (souvent, déjà, bientôt, toujours, beaucoup, enfin …) → **nach dem konjugierten Verb**.
   Je vais **bientôt** partir. – Elle est **déjà** rentrée.

**Ausnahme:** tôt und tard → immer **nach** dem Partizip/Infinitiv: Il est rentré **tard**.`

const ADJ_ADV = `## Adjektiv oder Adverb?

| Frage | Wortart | Beispiel |
|---|---|---|
| Wie **ist** etwas/jemand? (beschreibt ein Nomen) | **Adjektiv** – wird angeglichen | Les leçons sont **longues**. |
| Wie **macht** jemand etwas? (beschreibt ein Verb) | **Adverb** – unveränderlich | Il explique **longuement**. |

**Tipp:** Nach **être** steht fast immer das Adjektiv: Elle est **bonne** en français.
Nach anderen Verben das Adverb: Elle parle **bien** français.`

const COMP_ADV = `## Komparativ der Adverbien
| | | |
|---|---|---|
| + | **plus** … que | Tu parles **plus facilement qu'**avant. |
| = | **aussi** … que | Naïma parle **aussi bien que** ses amis. |
| − | **moins** … que | On parle **moins souvent que** chez nous. |

## Superlativ
**le plus / le moins** … (de) – immer **le**, weil das Adverb unveränderlich ist!
C'est Linda qui comprend **le plus facilement de** tous les élèves.

## Achtung: Adjektiv vs. Adverb
| | Komparativ | Superlativ |
|---|---|---|
| Adjektiv **fort** (veränderlich) | plus fort | le / la / les plus fort(e)s |
| Adverb **fortement** (unveränderlich) | plus fortement | le plus fortement |

## Unregelmäßig
| Adverb | Komparativ | Superlativ |
|---|---|---|
| bien | **mieux** | **le mieux** |
| mal | plus mal / pis | le plus mal / le pis |
| beaucoup | **plus** | **le plus** |
| peu | **moins** | **le moins** |

Gleichheit bei beaucoup: **autant que** / **autant de** + Nomen (nicht «aussi beaucoup»).

> bon (Adjektiv) → **meilleur**, bien (Adverb) → **mieux**.`

const units: Unit[] = [
  { id: 'v-food-1', kind: 'vocab', title: 'Essen & Kochen 1', subtitle: 'la nourriture … la poêle', explanation: VOCAB_TIP },
  { id: 'g-verbs-1', kind: 'grammar', title: 'Unregelmäßige Verben 1', subtitle: 'aller, être, avoir, faire …', explanation: VERB_TIP },
  { id: 'v-food-2', kind: 'vocab', title: 'Essen & Kochen 2', subtitle: 'bouillir … la table', explanation: VOCAB_TIP },
  { id: 'g-comp-adj', kind: 'grammar', title: 'Steigerung des Adjektivs', subtitle: 'plus … que, le plus, meilleur', explanation: COMP_ADJ },
  { id: 'v-food-3', kind: 'vocab', title: 'Essen & Kochen 3', subtitle: 'manger … la fraise', explanation: VOCAB_TIP },
  { id: 'g-adv-form', kind: 'grammar', title: 'Adverbien bilden', subtitle: '-ment, -amment, -emment', explanation: ADV_FORM },
  { id: 'v-food-4', kind: 'vocab', title: 'Essen & Kochen 4', subtitle: 'le citron … le lait', explanation: VOCAB_TIP },
  { id: 'g-verbs-2', kind: 'grammar', title: 'Unregelmäßige Verben 2', subtitle: 'connaître, écrire, mettre …', explanation: VERB_TIP },
  { id: 'v-room', kind: 'vocab', title: 'Schlafzimmer & Schlaf', subtitle: 'la chambre … le sommeil', explanation: VOCAB_TIP },
  { id: 'g-adv-place', kind: 'grammar', title: 'Stellung der Adverbien', subtitle: 'Wohin gehört das Adverb?', explanation: ADV_PLACE },
  { id: 'g-adj-adv', kind: 'grammar', title: 'Adjektiv oder Adverb?', subtitle: 'lent ou lentement?', explanation: ADJ_ADV },
  { id: 'g-verbs-3', kind: 'grammar', title: 'Unregelmäßige Verben 3', subtitle: "s'asseoir, se taire, voir …", explanation: VERB_TIP },
  { id: 'g-comp-adv', kind: 'grammar', title: 'Steigerung der Adverbien', subtitle: 'mieux, le mieux, autant', explanation: COMP_ADV },
]

const instructions: Record<string, string> = {
  'g-comp-adj': 'Ergänze die richtige Form.',
  'g-comp-adj:mc': 'Wähle die richtige Antwort.',
  'g-adv-form': 'Bilde das Adverb.',
  'g-adv-form:mc': 'Wähle die richtige Antwort.',
  'g-adv-place': 'Setze das Adverb an die richtige Stelle.',
  'g-adv-place:mc': 'Wähle die richtige Antwort.',
  'g-adj-adv': 'Adjektiv oder Adverb? Ergänze die richtige Form.',
  'g-comp-adv': 'Ergänze die richtige Form.',
  'g-comp-adv:mc': 'Wähle die richtige Form.',
}

export const frHms2: Exam = {
  id: 'fr-hms2-2026-10',
  subject: 'Französisch',
  title: 'Prüfung Französisch',
  className: '2. HMS',
  defaultExamDate: '2026-10-23',
  units,
  vocabWeight: 0.5,
  items: [
    ...buildVocabItems(vocab as VocabEntry[]),
    ...buildVerbItems(verbs as VerbEntry[]),
    ...buildGrammarItems(grammar as GrammarEntry[], instructions),
  ],
}
