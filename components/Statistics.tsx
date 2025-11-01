"use client"

import type React from "react"
import type { WordStatistics } from "../types"

interface StatisticsProps {
  statistics: WordStatistics
  totalWords: number
  onClose: () => void
}

const Statistics: React.FC<StatisticsProps> = ({ statistics, totalWords, onClose }) => {
  const reviewedWords = Object.keys(statistics).length
  const easyWords = Object.values(statistics).filter((s) => s.lastDifficulty === "easy").length
  const goodWords = Object.values(statistics).filter((s) => s.lastDifficulty === "good").length
  const hardWords = Object.values(statistics).filter((s) => s.lastDifficulty === "hard").length
  const completionPercentage = Math.round((reviewedWords / totalWords) * 100)

  return (
    <div className="w-full max-w-2xl bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-8 border-2 border-gray-100 dark:border-gray-700">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
          آمار پیشرفت شما
        </h2>
        <button
          onClick={onClose}
          className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          aria-label="Close statistics"
        >
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
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="space-y-6" dir="rtl">
        {/* Overall Progress */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-semibold text-gray-700 dark:text-gray-300">پیشرفت کلی</span>
            <span className="text-3xl font-bold text-blue-600 dark:text-blue-400">{completionPercentage}٪</span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-4 rounded-full transition-all duration-500"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            {reviewedWords} از {totalWords} لغت مرور شده
          </p>
        </div>

        {/* Difficulty Breakdown */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-200 dark:border-green-800 text-center">
            <div className="text-4xl font-bold text-green-600 dark:text-green-400 mb-2">{easyWords}</div>
            <div className="text-sm font-semibold text-green-700 dark:text-green-300">آسان</div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900/20 p-5 rounded-2xl border border-yellow-200 dark:border-yellow-800 text-center">
            <div className="text-4xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">{goodWords}</div>
            <div className="text-sm font-semibold text-yellow-700 dark:text-yellow-300">متوسط</div>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 p-5 rounded-2xl border border-red-200 dark:border-red-800 text-center">
            <div className="text-4xl font-bold text-red-600 dark:text-red-400 mb-2">{hardWords}</div>
            <div className="text-sm font-semibold text-red-700 dark:text-red-300">سخت</div>
          </div>
        </div>

        {/* Recent Words */}
        {reviewedWords > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/50 p-6 rounded-2xl border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-200 mb-4">آخرین لغات مرور شده</h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {Object.entries(statistics)
                .sort((a, b) => new Date(b[1].lastReviewed).getTime() - new Date(a[1].lastReviewed).getTime())
                .slice(0, 10)
                .map(([word, stat]) => (
                  <div
                    key={word}
                    className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg"
                  >
                    <span className="font-sans font-semibold text-gray-700 dark:text-gray-300" dir="ltr">
                      {word}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        stat.lastDifficulty === "easy"
                          ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                          : stat.lastDifficulty === "good"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                      }`}
                    >
                      {stat.lastDifficulty === "easy" ? "آسان" : stat.lastDifficulty === "good" ? "متوسط" : "سخت"}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Statistics
