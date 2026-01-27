import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GlobalNewsResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export const searchGlobalNews = async (query: string): Promise<GlobalNewsResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the latest, breaking news about: "${query}". Provide a concise journalistic summary of current events related to this topic.`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "No summary available.";
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources = chunks
      .filter((chunk: any) => chunk.web)
      .map((chunk: any) => ({
        title: chunk.web.title,
        uri: chunk.web.uri,
      }));

    return { text, sources };
  } catch (error) {
    console.error("Gemini Search Error:", error);
    throw error;
  }
};
