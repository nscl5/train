"use client"

import type React from "react"
import { useState, useEffect, useCallback } from "react"
import type { FlashcardData, UserProgress, WordStatistics } from "./types"
import { WORDS, getWordCategory, CATEGORY_NAMES } from "./constants"
import { generateFlashcardContent } from "./services/geminiService"
import Header from "./components/Header"
import Flashcard from "./components/Flashcard"
import Controls from "./components/Controls"
import Loader from "./components/Loader"
import Statistics from "./components/Statistics"

interface PrefetchedData {
  index: number
  data: FlashcardData
}

const CACHE_KEY = "flashtastic-cache"
const PROGRESS_KEY = "flashtastic-progress"
const STATS_KEY = "flashtastic-stats"
const CACHE_VERSION = 1

const getProgress = (): UserProgress => {
  try {
    const saved = localStorage.getItem(PROGRESS_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error("Failed to read progress", e)
  }
  return { currentWordIndex: 0, lastVisited: new Date().toISOString(), completedWords: 0 }
}

const saveProgress = (progress: UserProgress) => {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(progress))
  } catch (e) {
    console.error("Failed to save progress", e)
  }
}

const getStats = (): WordStatistics => {
  try {
    const saved = localStorage.getItem(STATS_KEY)
    if (saved) {
      return JSON.parse(saved)
    }
  } catch (e) {
    console.error("Failed to read stats", e)
  }
  return {}
}

const saveStats = (stats: WordStatistics) => {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats))
  } catch (e) {
    console.error("Failed to save stats", e)
  }
}

const getCache = (): Record<string, FlashcardData> => {
  try {
    const cachedData = localStorage.getItem(CACHE_KEY)
    if (cachedData) {
      const parsed = JSON.parse(cachedData)
      if (parsed.version === CACHE_VERSION && parsed.cards) {
        return parsed.cards
      }
    }
  } catch (e) {
    console.error("Failed to read from cache", e)
  }
  return {}
}

const setCache = (word: string, data: FlashcardData) => {
  try {
    const cache = getCache()
    const updatedCards = { ...cache, [word]: data }
    localStorage.setItem(CACHE_KEY, JSON.stringify({ version: CACHE_VERSION, cards: updatedCards }))
  } catch (e) {
    console.error("Failed to write to cache", e)
  }
}

const App: React.FC = () => {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [currentWordIndex, setCurrentWordIndex] = useState(() => getProgress().currentWordIndex)
  const [flashcardData, setFlashcardData] = useState<FlashcardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isFlipped, setIsFlipped] = useState(false)
  const [progress, setProgress] = useState(0)
  const [prefetchedData, setPrefetchedData] = useState<PrefetchedData | null>(null)
  const [statistics, setStatistics] = useState<WordStatistics>(() => getStats())
  const [showStats, setShowStats] = useState(false)

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }, [theme])

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"))
  }

  useEffect(() => {
    const progressData: UserProgress = {
      currentWordIndex,
      lastVisited: new Date().toISOString(),
      completedWords: Object.keys(statistics).length,
    }
    saveProgress(progressData)
  }, [currentWordIndex, statistics])

  const prefetchNextCard = useCallback(
    async (currentIndex: number) => {
      const nextIndex = (currentIndex + 1) % WORDS.length
      const nextWord = WORDS[nextIndex]

      if (prefetchedData?.index === nextIndex) return

      const cache = getCache()
      if (cache[nextWord]) {
        setPrefetchedData({ index: nextIndex, data: cache[nextWord] })
        return
      }

      try {
        const data = await generateFlashcardContent(nextWord)
        setCache(nextWord, data)
        setPrefetchedData({ index: nextIndex, data: data })
      } catch (err) {
        console.error(`Failed to prefetch ${nextWord}:`, err)
      }
    },
    [prefetchedData],
  )

  const loadFlashcard = useCallback(
    async (index: number) => {
      setIsFlipped(false)
      setError(null)
      const word = WORDS[index]

      if (prefetchedData && prefetchedData.index === index) {
        setFlashcardData(prefetchedData.data)
        setProgress(((index + 1) / WORDS.length) * 100)
        setPrefetchedData(null)
        prefetchNextCard(index)
        return
      }

      setIsLoading(true)
      setFlashcardData(null)

      const cache = getCache()
      if (cache[word]) {
        setFlashcardData(cache[word])
        setIsLoading(false)
        setProgress(((index + 1) / WORDS.length) * 100)
        prefetchNextCard(index)
        return
      }

      try {
        const data = await generateFlashcardContent(word)
        setCache(word, data)
        setFlashcardData(data)
      } catch (err) {
        console.error(err)
        setError("خطا در تولید محتوای فلش‌کارت. لطفاً دوباره تلاش کنید.")
      } finally {
        setIsLoading(false)
        setProgress(((index + 1) / WORDS.length) * 100)
        prefetchNextCard(index)
      }
    },
    [prefetchedData, prefetchNextCard],
  )

  useEffect(() => {
    loadFlashcard(currentWordIndex)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentWordIndex])

  const handleNextWord = () => {
    setCurrentWordIndex((prevIndex) => (prevIndex + 1) % WORDS.length)
  }

  const handleUserFeedback = (level: "easy" | "good" | "hard") => {
    if (flashcardData) {
      const newStats = {
        ...statistics,
        [flashcardData.word]: {
          attempts: (statistics[flashcardData.word]?.attempts || 0) + 1,
          lastDifficulty: level,
          lastReviewed: new Date().toISOString(),
        },
      }
      setStatistics(newStats)
      saveStats(newStats)
    }
    handleNextWord()
  }

  const handleResetProgress = () => {
    if (window.confirm("آیا مطمئن هستید که می‌خواهید پیشرفت خود را از ابتدا شروع کنید؟")) {
      setCurrentWordIndex(0)
      saveProgress({ currentWordIndex: 0, lastVisited: new Date().toISOString(), completedWords: 0 })
    }
  }

  const currentCategory = flashcardData ? getWordCategory(flashcardData.word) : "general"

  return (
    <div className="bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 min-h-screen text-gray-900 dark:text-gray-100 flex flex-col font-vazir transition-colors duration-300">
      <Header
        theme={theme}
        toggleTheme={toggleTheme}
        onShowStats={() => setShowStats(!showStats)}
        onResetProgress={handleResetProgress}
      />

      <main className="flex-grow flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-8">
        {flashcardData && !isLoading && (
          <div className="mb-4 px-4 py-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-full text-indigo-700 dark:text-indigo-300 text-sm font-semibold">
            {CATEGORY_NAMES[currentCategory]}
          </div>
        )}

        {isLoading && <Loader />}
        {error && (
          <div className="text-red-600 dark:text-red-400 text-center bg-red-50 dark:bg-red-900/20 p-6 rounded-2xl border border-red-200 dark:border-red-800 max-w-md">
            {error}
          </div>
        )}

        {!isLoading && !error && flashcardData && !showStats && (
          <div className="w-full max-w-2xl">
            <Flashcard data={flashcardData} isFlipped={isFlipped} onFlip={() => setIsFlipped(!isFlipped)} />
          </div>
        )}

        {showStats && (
          <Statistics statistics={statistics} totalWords={WORDS.length} onClose={() => setShowStats(false)} />
        )}
      </main>

      <footer className="w-full max-w-4xl mx-auto px-4 pb-8">
        <div className="mb-2 flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>
            کلمه {currentWordIndex + 1} از {WORDS.length}
          </span>
          <span>{Math.round(progress)}٪ تکمیل شده</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6 overflow-hidden shadow-inner">
          <div
            className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 h-3 rounded-full transition-all duration-500 ease-out shadow-lg"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <Controls
          onUserFeedback={handleUserFeedback}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(true)}
          onNext={handleNextWord}
        />
      </footer>
    </div>
  )
}

export default App
