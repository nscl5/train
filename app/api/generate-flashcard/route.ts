import { GoogleGenAI, Type } from "@google/genai"
import { type NextRequest, NextResponse } from "next/server"

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string })

const flashcardSchema = {
  type: Type.OBJECT,
  properties: {
    word: { type: Type.STRING, description: "The English word." },
    ipa: { type: Type.STRING, description: "International Phonetic Alphabet (IPA) transcription." },
    englishDefinition: { type: Type.STRING, description: "A concise definition in English." },
    englishSynonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 English synonyms." },
    englishAntonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 English antonyms." },
    englishExamples: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Two example sentences in English.",
    },
    persianTranslation: { type: Type.STRING, description: "The most accurate Persian translation." },
    persianPhonetic: { type: Type.STRING, description: "A simplified Persian phonetic spelling." },
    persianSynonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 Persian synonyms." },
    persianAntonyms: { type: Type.ARRAY, items: { type: Type.STRING }, description: "2-3 Persian antonyms." },
    persianExamples: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Two example sentences in Persian.",
    },
    extraNote: { type: Type.STRING, nullable: true, description: "Optional grammar or usage note, in Persian." },
  },
  required: [
    "word",
    "ipa",
    "englishDefinition",
    "englishSynonyms",
    "englishAntonyms",
    "englishExamples",
    "persianTranslation",
    "persianPhonetic",
    "persianSynonyms",
    "persianAntonyms",
    "persianExamples",
  ],
}

export async function POST(request: NextRequest) {
  try {
    const { word } = await request.json()

    if (!word) {
      return NextResponse.json({ error: "Word is required" }, { status: 400 })
    }

    const prompt = `Generate a comprehensive vocabulary flashcard for IELTS exam preparation. The target word is "${word}".

Requirements:
1. Provide accurate IPA pronunciation
2. Write a clear, academic-level English definition suitable for IELTS
3. Include 2-3 relevant English synonyms and antonyms (if applicable)
4. Create two natural, contextual example sentences in English that demonstrate proper usage
5. Provide the most accurate Persian translation for native Persian speakers
6. Include Persian phonetic spelling (how to pronounce the Persian translation)
7. Add 2-3 Persian synonyms and antonyms (if applicable)
8. Create two natural Persian example sentences
9. Add a helpful usage note in Persian about grammar, common mistakes, or IELTS-specific tips (optional but encouraged)

Focus on making this educational, accurate, and helpful for IELTS preparation. Use natural, real-world examples.`

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: flashcardSchema,
      },
    })

    const jsonString = response.text.trim()
    const data = JSON.parse(jsonString)

    // Ensure arrays have content, even if empty
    data.englishSynonyms = data.englishSynonyms || []
    data.englishAntonyms = data.englishAntonyms || []
    data.englishExamples = data.englishExamples || []
    data.persianSynonyms = data.persianSynonyms || []
    data.persianAntonyms = data.persianAntonyms || []
    data.persianExamples = data.persianExamples || []

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error generating content from Gemini:", error)
    return NextResponse.json({ error: "Failed to generate flashcard content" }, { status: 500 })
  }
}
