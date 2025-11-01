export interface FlashcardData {
  word: string
  ipa: string
  englishDefinition: string
  englishSynonyms: string[]
  englishAntonyms: string[]
  englishExamples: string[]
  persianTranslation: string
  persianPhonetic: string
  persianSynonyms: string[]
  persianAntonyms: string[]
  persianExamples: string[]
  extraNote?: string
}

export interface UserProgress {
  currentWordIndex: number
  lastVisited: string
  completedWords: number
}

export interface WordStatistics {
  [word: string]: {
    attempts: number
    lastDifficulty: "easy" | "good" | "hard"
    lastReviewed: string
  }
}
