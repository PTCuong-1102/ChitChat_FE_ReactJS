
import { GoogleGenAI } from "@google/genai";

export const getGeminiResponse = async (prompt: string, model: string, apiKey: string): Promise<string> => {
  if (!apiKey) {
    return "I'm sorry, the API key for this bot is not configured. Please configure the bot with a valid API key.";
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
        model: model,
        contents: prompt,
    });
    return response.text ?? "No response received from Gemini API.";
  } catch (error) {
    console.error("Error fetching response from Gemini API:", error);
    return "There was an error with your API Key or request. Please check the key and try again.";
  }
};
