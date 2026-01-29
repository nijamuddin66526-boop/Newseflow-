
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { TrendingItem, Post } from "../types.ts";

export interface GlobalNewsResult {
  text: string;
  sources: { title: string; uri: string }[];
}

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const searchGlobalNews = async (query: string): Promise<GlobalNewsResult> => {
  try {
    const ai = getAI();
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
    const ai = getAI();
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
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Search Google News for the current top 5 trending topics worldwide. Provide them as a list of hashtags with estimated mention counts. Format each line exactly as: #Hashtag: Number",
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
      const countStr = parts[1]?.replace(/[^0-9]/g, '') || "1500";
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

export const fetchGlobalTrendingStories = async (): Promise<Post[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: "Get the 5 most significant breaking news stories from Google News right now. For each story, provide: 1. Title, 2. A 3-sentence summary, 3. Category, 4. A representative image keyword. Format as a JSON array of objects.",
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING },
              category: { type: Type.STRING },
              imageKeyword: { type: Type.STRING }
            },
            required: ["title", "content", "category", "imageKeyword"]
          }
        }
      },
    });

    const stories = JSON.parse(response.text || "[]");
    
    return stories.map((s: any, idx: number) => ({
      id: `global-trend-${idx}`,
      userId: 'system-ai',
      authorName: 'Global Intel Node',
      authorUsername: 'global_feed',
      authorAvatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=global',
      type: 'PHOTO',
      category: s.category || 'World',
      title: s.title,
      content: s.content,
      mediaUrl: `https://source.unsplash.com/featured/?${encodeURIComponent(s.imageKeyword || 'news')}`,
      likes: [],
      savedBy: [],
      comments: [],
      views: Math.floor(Math.random() * 50000) + 10000,
      shares: Math.floor(Math.random() * 1000),
      createdAt: new Date().toISOString(),
      location: { name: 'Global Network' }
    }));
  } catch (error) {
    console.error("Failed to fetch global stories:", error);
    return [];
  }
};

export const generateAIImage = async (prompt: string): Promise<string> => {
  try {
    const ai = getAI();
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
    const ai = getAI();
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
