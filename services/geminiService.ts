import type { FlashcardData } from "../types"

export const generateFlashcardContent = async (word: string): Promise<FlashcardData> => {
  try {
    const response = await fetch("/api/generate-flashcard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ word }),
    })

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`)
    }

    const data = await response.json()
    return data as FlashcardData
  } catch (error) {
    console.error("Error generating content from Gemini:", error)
    throw new Error("Failed to generate flashcard content.")
  }
}
