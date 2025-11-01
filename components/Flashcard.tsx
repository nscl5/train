"use client"

import type React from "react"
import type { FlashcardData } from "../types"

interface FlashcardProps {
  data: FlashcardData
  isFlipped: boolean
  onFlip: () => void
}

const VolumeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
    <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
  </svg>
)

const Flashcard: React.FC<FlashcardProps> = ({ data, isFlipped, onFlip }) => {
  const playAudio = () => {
    try {
      const utterance = new SpeechSynthesisUtterance(data.word)
      utterance.lang = "en-US"
      speechSynthesis.speak(utterance)
    } catch (error) {
      console.error("Text-to-speech not supported or failed.", error)
    }
  }

  const CardFace: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
    <div
      className={`absolute w-full h-full p-8 md:p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl flex flex-col overflow-y-auto border-2 border-gray-100 dark:border-gray-700 ${className}`}
    >
      {children}
    </div>
  )

  return (
    <div
      className={`perspective w-full min-h-[500px] md:min-h-[600px] max-w-2xl mx-auto cursor-pointer ${isFlipped ? "card-flipped" : ""}`}
      onClick={onFlip}
    >
      <div className="relative w-full h-full card-inner">
        {/* Front of the card */}
        <CardFace className="card-front">
          <div className="flex-grow flex flex-col justify-center items-center text-center space-y-6">
            <div className="space-y-3">
              <h2 className="font-sans font-bold text-6xl md:text-7xl bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                {data.word}
              </h2>
              <div className="flex items-center justify-center gap-3">
                <p className="font-sans text-2xl text-gray-500 dark:text-gray-400">{data.ipa}</p>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    playAudio()
                  }}
                  className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-all transform hover:scale-110"
                  aria-label="Play pronunciation"
                >
                  <VolumeIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="w-20 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"></div>

            <div className="max-w-xl">
              <p className="font-sans text-xl md:text-2xl text-gray-700 dark:text-gray-300 leading-relaxed">
                {data.englishDefinition}
              </p>
            </div>
          </div>

          <div className="mt-8 space-y-4 border-t-2 border-gray-100 dark:border-gray-700 pt-6">
            <h3 className="font-sans font-semibold text-lg text-gray-600 dark:text-gray-400">Examples:</h3>
            <div className="space-y-3">
              {data.englishExamples.map((ex, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-blue-500 dark:text-blue-400 text-xl">•</span>
                  <p className="font-sans italic text-gray-600 dark:text-gray-400 text-lg leading-relaxed">"{ex}"</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 pt-4 text-center">
            <p className="text-sm text-gray-400 dark:text-gray-500 flex items-center justify-center gap-2">
              <span className="inline-block w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
              برای دیدن ترجمه و جزئیات بیشتر کلیک کنید
            </p>
          </div>
        </CardFace>

        {/* Back of the card */}
        <CardFace className="card-back" dir="rtl">
          <div className="space-y-6 text-right">
            <div className="text-center pb-6 border-b-2 border-gray-100 dark:border-gray-700">
              <h2 className="font-vazir font-bold text-5xl md:text-6xl bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent mb-3">
                {data.persianTranslation}
              </h2>
              <p className="font-vazir text-xl text-gray-500 dark:text-gray-400">{data.persianPhonetic}</p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-xl text-gray-800 dark:text-gray-200 flex items-center gap-2">
                <span className="w-1 h-6 bg-emerald-500 rounded-full"></span>
                مثال‌های فارسی
              </h3>
              <div className="space-y-2 pr-4">
                {data.persianExamples.map((ex, i) => (
                  <p key={i} className="text-gray-600 dark:text-gray-400 text-lg leading-relaxed">
                    • {ex}
                  </p>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              {(data.persianSynonyms.length > 0 || data.englishSynonyms.length > 0) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-2xl border border-blue-200 dark:border-blue-800">
                  <h4 className="font-bold text-lg text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                    <span className="text-2xl">↔</span>
                    مترادف‌ها
                  </h4>
                  <ul className="space-y-2 text-blue-700 dark:text-blue-200">
                    {data.persianSynonyms.map((s, i) => (
                      <li key={`ps-${i}`} className="text-base">
                        • {s}
                      </li>
                    ))}
                    {data.englishSynonyms.map((s, i) => (
                      <li key={`es-${i}`} className="font-sans text-base" dir="ltr">
                        • {s}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {(data.persianAntonyms.length > 0 || data.englishAntonyms.length > 0) && (
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-2xl border border-red-200 dark:border-red-800">
                  <h4 className="font-bold text-lg text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                    <span className="text-2xl">⇄</span>
                    متضادها
                  </h4>
                  <ul className="space-y-2 text-red-700 dark:text-red-200">
                    {data.persianAntonyms.map((a, i) => (
                      <li key={`pa-${i}`} className="text-base">
                        • {a}
                      </li>
                    ))}
                    {data.englishAntonyms.map((a, i) => (
                      <li key={`ea-${i}`} className="font-sans text-base" dir="ltr">
                        • {a}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {data.extraNote && (
              <div className="mt-6 p-5 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-2xl border-2 border-amber-200 dark:border-amber-800">
                <h4 className="font-bold text-lg text-amber-800 dark:text-amber-300 mb-2 flex items-center gap-2">
                  <span className="text-2xl">💡</span>
                  نکته مهم
                </h4>
                <p className="text-amber-700 dark:text-amber-200 text-base leading-relaxed">{data.extraNote}</p>
              </div>
            )}
          </div>
        </CardFace>
      </div>
    </div>
  )
}

export default Flashcard
