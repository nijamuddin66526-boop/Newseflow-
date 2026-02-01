
import { TrendingItem, Post } from "../types.ts";
// Import GoogleGenAI from @google/genai following the guidelines
import { GoogleGenAI } from "@google/genai";

// Fix: Defined GlobalNewsResult interface required by GlobalNewsSearch component
export interface GlobalNewsResult {
  text: string;
  sources: Array<{ uri: string; title: string }>;
}

// Pure RSS Logic - No AI Tools
const RSS_API_BASE = "https://api.rss2json.com/v1/api.json?rss_url=";
const GOOGLE_NEWS_RSS = "https://news.google.com/rss?hl=en-US&gl=US&ceid=US:en";

const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

const mapRssToPost = (item: any, idx: number): Post => ({
  id: `rss-${idx}-${Date.now()}`,
  userId: 'system-rss',
  authorName: 'World News',
  authorUsername: 'global_feed',
  authorAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=rss${idx}`,
  type: 'PHOTO',
  category: 'Latest',
  title: item.title,
  content: stripHtml(item.description).substring(0, 500),
  mediaUrl: item.enclosure?.link || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop`,
  likes: [],
  savedBy: [],
  comments: [],
  views: 5000 + Math.floor(Math.random() * 10000),
  shares: 100 + Math.floor(Math.random() * 500),
  createdAt: new Date(item.pubDate).toISOString(),
  location: { name: "Google News Feed" }
});

export const fetchGlobalTrendingStories = async (): Promise<Post[]> => {
  try {
    const response = await fetch(`${RSS_API_BASE}${encodeURIComponent(GOOGLE_NEWS_RSS)}`);
    const data = await response.json();
    if (data.status !== 'ok') throw new Error("Fetch Failed");
    return data.items.slice(0, 15).map((item: any, idx: number) => mapRssToPost(item, idx));
  } catch (error) {
    console.error("Failed to fetch RSS news:", error);
    return [];
  }
};

export const fetchLiveTrendingTopics = async (): Promise<TrendingItem[]> => {
  const topics = ["Global", "Politics", "Technology", "Economy", "Climate", "Health"];
  return topics.map((tag, idx) => ({
    id: `trend-${idx}`,
    tag: `#${tag}`,
    postCount: 1500 + Math.floor(Math.random() * 4000)
  }));
};

/**
 * Fix: Added searchGlobalNews function using Gemini 3 and Google Search grounding.
 * This provides the implementation for the GlobalNewsSearch component.
 */
export const searchGlobalNews = async (query: string): Promise<GlobalNewsResult> => {
  // Initialize AI client using the provided environment variable
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a detailed real-time news summary for: ${query}`,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    // Access the .text property directly as it is not a method
    const text = response.text || "No news summary available for this topic.";
    const sources: Array<{ uri: string; title: string }> = [];

    // Extract website URLs from grounding chunks as required for Search Grounding
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({
            uri: chunk.web.uri,
            title: chunk.web.title
          });
        }
      });
    }

    return { text, sources };
  } catch (error) {
    console.error("Search Global News failed:", error);
    return {
      text: "The global news search is currently unavailable. Please verify your connection or try again later.",
      sources: []
    };
  }
};
