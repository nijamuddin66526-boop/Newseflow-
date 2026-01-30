
import { GoogleGenAI, Modality, Type } from "@google/genai";
import { TrendingItem, Post } from "../types.ts";

export interface GlobalNewsResult {
  text: string;
  sources: { title: string; uri: string }[];
}

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const safeJsonParse = (text: string, fallback: any) => {
  try {
    // Attempt to extract JSON if it's wrapped in markdown code blocks or has extra text
    const jsonMatch = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
    const cleanText = jsonMatch ? jsonMatch[0] : text.trim();
    return JSON.parse(cleanText);
  } catch (e) {
    console.warn("JSON Parse Error, using fallback:", e);
    return fallback;
  }
};

export const searchGlobalNews = async (query: string): Promise<GlobalNewsResult> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Search for the latest news about: "${query}". Provide a concise summary.`,
      config: { tools: [{ googleSearch: {} }] },
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
      contents: `Translate the following news dispatch into ${targetLang}. Return ONLY a JSON object.
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

    return safeJsonParse(response.text || "{}", { title, content });
  } catch (error) {
    console.error("Gemini Translation Error:", error);
    return { title, content };
  }
};

export const fetchLiveTrendingTopics = async (): Promise<TrendingItem[]> => {
  try {
    const ai = getAI();
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: "Search Google News for top 5 trending topics globally. Format as: #Hashtag: Count",
      config: { tools: [{ googleSearch: {} }] },
    });

    const text = response.text || "";
    const lines = text.split('\n').filter(line => line.includes('#'));
    
    return lines.slice(0, 5).map((line, idx) => {
      const parts = line.replace(/^[*\s-]+/, '').split(':');
      const tag = parts[0]?.trim() || `#Trend${idx}`;
      const countStr = parts[1]?.replace(/[^0-9]/g, '') || "1000";
      return { id: `live-${idx}`, tag: tag.startsWith('#') ? tag : `#${tag}`, postCount: parseInt(countStr) };
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
      contents: "Get 5 top breaking news stories from Google News globally. Return JSON array with keys: title, content, category, imageKeyword.",
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

    const stories = safeJsonParse(response.text || "[]", []);
    return stories.map((s: any, idx: number) => ({
      id: `gt-${idx}-${Date.now()}`,
      userId: 'system-ai',
      authorName: 'NetSphere Intelligence',
      authorUsername: 'global_node',
      authorAvatar: `https://api.dicebear.com/7.x/bottts/svg?seed=global${idx}`,
      type: 'PHOTO',
      category: s.category || 'Global',
      title: s.title,
      content: s.content,
      mediaUrl: `https://images.unsplash.com/photo-1585829365234-75486981faee?q=80&w=800&auto=format&fit=crop`,
      likes: [],
      savedBy: [],
      comments: [],
      views: 15000 + Math.floor(Math.random() * 50000),
      shares: 500 + Math.floor(Math.random() * 2000),
      createdAt: new Date().toISOString()
    }));
  } catch (error) {
    console.error("Failed global stories:", error);
    return [];
  }
};

export const generateAIImage = async (prompt: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: { parts: [{ text: `Journalism photo, high quality: ${prompt}` }] },
    config: { imageConfig: { aspectRatio: "16:9" } },
  });
  const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
  if (part?.inlineData) return `data:image/png;base64,${part.inlineData.data}`;
  throw new Error("No image data returned");
};

export const generateNewsAudio = async (title: string, content: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `${title}. ${content}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
    },
  });
  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error("Audio generation failed");
  return audioData;
};
