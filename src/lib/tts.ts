// Sprachausgabe über die Web Speech API des Browsers (in Chrome kostenlos verfügbar).

let frenchVoice: SpeechSynthesisVoice | null = null

function pickVoice() {
  const voices = window.speechSynthesis?.getVoices() ?? []
  frenchVoice =
    voices.find((v) => v.lang === 'fr-FR' && /google/i.test(v.name)) ??
    voices.find((v) => v.lang === 'fr-FR') ??
    voices.find((v) => v.lang.startsWith('fr')) ??
    null
}

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  pickVoice()
  window.speechSynthesis.onvoiceschanged = pickVoice
}

export const ttsAvailable = () => typeof window !== 'undefined' && 'speechSynthesis' in window

export function speak(text: string) {
  if (!ttsAvailable() || !text) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'fr-FR'
  u.rate = 0.9
  if (frenchVoice) u.voice = frenchVoice
  window.speechSynthesis.speak(u)
}
