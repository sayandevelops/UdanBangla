import { GoogleGenAI, Type } from "@google/genai";
import { Question, Difficulty } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY});

const MODEL_NAME = "gemini-2.5-flash";

export const generateQuizQuestions = async (
  topic: string,
  difficulty: Difficulty,
  count: number = 5
): Promise<Question[]> => {
  try {
    const prompt = `Generate ${count} multiple-choice questions about "${topic}" specifically tailored for West Bengal competitive exams (like WBCS). 
    Difficulty level: ${difficulty}. 
    Ensure the questions are relevant to the region's history, geography, culture, or general exam syllabus.
    Provide the output in English, but you may use Bengali terms where appropriate.
    The output must strictly adhere to the JSON schema.`;

    const response = await genAI.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              questionText: {
                type: Type.STRING,
                description: "The question stem.",
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "An array of exactly 4 possible answers.",
              },
              correctAnswerIndex: {
                type: Type.INTEGER,
                description: "The zero-based index of the correct answer in the options array.",
              },
              explanation: {
                type: Type.STRING,
                description: "A brief explanation of why the answer is correct.",
              },
            },
            required: ["questionText", "options", "correctAnswerIndex", "explanation"],
          },
        },
      },
    });

    if (!response.text) {
      throw new Error("No data returned from AI");
    }

    const rawData = JSON.parse(response.text);
    
    // Map to ensure IDs exist
    return rawData.map((q: any, index: number) => ({
      id: index,
      questionText: q.questionText,
      options: q.options,
      correctAnswerIndex: q.correctAnswerIndex,
      explanation: q.explanation
    }));

  } catch (error) {
    console.error("Error generating quiz:", error);
    throw error;
  }
};
