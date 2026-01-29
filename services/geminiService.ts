
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { TrendingItem } from "../types.ts";

export interface GlobalNewsResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export const searchGlobalNews = async (query: string): Promise<GlobalNewsResult> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the latest news about: "${query}". Provide a concise summary.`,
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

export const translateDispatch = async (title: string, content: string, targetLang: string): Promise<{ title: string; content: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Translate the following news dispatch into ${targetLang}. 
      Return only a JSON object with keys "title" and "content".
      Title: ${title}
      Content: ${content}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            content: { type: Type.STRING },
          },
          required: ["title", "content"]
        }
      },
    });

    return JSON.parse(response.text || "{}");
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    throw error;
  }
};

export const fetchLiveTrendingTopics = async (): Promise<TrendingItem[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "What are the top 5 most trending news topics on Google News right now? List them as hashtags with a brief count of mention popularity (estimate). Format: #Tag: Count",
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || "";
    const lines = text.split('\n').filter(line => line.includes('#'));
    
    if (lines.length === 0) return [];

    return lines.slice(0, 5).map((line, idx) => {
      const parts = line.replace(/^[*\s-]+/, '').split(':');
      const tag = parts[0]?.trim() || `#Trend${idx}`;
      const countStr = parts[1]?.replace(/[^0-9]/g, '') || "1200";
      return {
        id: `live-${idx}`,
        tag: tag.startsWith('#') ? tag : `#${tag}`,
        postCount: parseInt(countStr)
      };
    });
  } catch (error) {
    console.error("Failed to fetch live trends:", error);
    return [];
  }
};

export const generateAIImage = async (prompt: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `News photo: ${prompt}` }],
      },
      config: {
        imageConfig: { aspectRatio: "16:9" },
      },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data");
  } catch (error) {
    console.error("Image Gen Error:", error);
    throw error;
  }
};

export const generateNewsAudio = async (title: string, content: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const fullText = `News Title: ${title}. Content: ${content}`;
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text: fullText }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Kore' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!base64Audio) throw new Error("Audio generation failed");
    return base64Audio;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    throw error;
  }
};
