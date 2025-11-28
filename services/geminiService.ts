import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PuzzleData } from "../types";

// Initialize Gemini
// NOTE: Process.env.API_KEY is handled by the build environment/runtime.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const PUZZLE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    detectedObject: { type: Type.STRING, description: "The main object identified in the image." },
    targetWord: { type: Type.STRING, description: "A single word related to the object (5-8 letters)." },
    clue: { type: Type.STRING, description: "A cryptic, sci-fi style clue describing the word as a data fragment." },
    context: { type: Type.STRING, description: "A short flavor text describing the object as a digital construct." },
    difficulty: { type: Type.INTEGER, description: "1 to 5 based on word complexity." }
  },
  required: ["detectedObject", "targetWord", "clue", "context", "difficulty"]
};

export const generateContextualPuzzle = async (imageBase64: string): Promise<PuzzleData> => {
  try {
    // We clean the base64 string if it contains the header
    const cleanBase64 = imageBase64.split(',')[1] || imageBase64;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64
            }
          },
          {
            text: "You are the Aethel Network Architect. Analyze this image to find a stability breach. Identify the main object. Generate a word puzzle based on it. The aesthetic is Digital Brutalism / Sci-Fi. The 'clue' should sound like a system log or corrupted data file."
          }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: PUZZLE_SCHEMA,
        temperature: 0.7,
      }
    });

    const text = response.text;
    if (!text) throw new Error("No data received from Network");

    // Clean Markdown formatting (```json ... ```)
    const jsonString = text.replace(/```json|```/g, '').trim();

    return JSON.parse(jsonString) as PuzzleData;

  } catch (error) {
    console.error("Gemini Scan Error:", error);
    // Fallback for demo/error states
    return {
      detectedObject: "Unknown Artifact",
      targetWord: "GLITCH",
      clue: "Signal lost. Manual override required.",
      context: "The visual feed is corrupted.",
      difficulty: 1
    };
  }
};