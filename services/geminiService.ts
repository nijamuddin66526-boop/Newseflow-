
import { TrendingItem, Post } from "../types.ts";
import { GoogleGenAI } from "@google/genai";

export interface GlobalNewsResult {
  text: string;
  sources: Array<{ uri: string; title: string }>;
}

const RSS_API_BASE = "https://api.rss2json.com/v1/api.json?rss_url=";

const BENGALI_SOURCES = [
  { name: "Aaj Tak Bangla", url: "https://bengali.aajtak.in/rss/news" },
  { name: "Anandabazar", url: "https://www.anandabazar.com/rss-feed.xml" },
  { name: "News18 Bangla", url: "https://bengali.news18.com/rss/khabar.xml" },
  { name: "Zee 24 Ghanta", url: "https://zeenews.india.com/bengali/rss.xml" }
];

const stripHtml = (html: string) => {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  return doc.body.textContent || "";
};

export const fetchBengaliMultiSourceNews = async (): Promise<any[]> => {
  const fetchPromises = BENGALI_SOURCES.map(async (source) => {
    try {
      const response = await fetch(`${RSS_API_BASE}${encodeURIComponent(source.url)}`);
      const data = await response.json();
      if (data.status === 'ok') {
        return data.items.map((item: any) => ({
          title: item.title,
          description: stripHtml(item.description),
          urlToImage: item.enclosure?.link || item.thumbnail || `https://images.unsplash.com/photo-1504711434969-e33886168f5c?q=80&w=800&auto=format&fit=crop`,
          url: item.link,
          source: { name: source.name },
          publishedAt: item.pubDate,
          category: item.categories && item.categories.length > 0 ? item.categories[0] : "General"
        }));
      }
      return [];
    } catch (error) {
      console.error(`Failed to fetch from ${source.name}:`, error);
      return [];
    }
  });

  const results = await Promise.all(fetchPromises);
  const flattened = results.flat();
  
  // Sort by date descending
  return flattened.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
};

export const fetchLiveTrendingTopics = async (): Promise<TrendingItem[]> => {
  const topics = ["Bengali News", "Politics", "West Bengal", "Sports", "Cinema"];
  return topics.map((tag, idx) => ({
    id: `trend-${idx}`,
    tag: `#${tag}`,
    postCount: 1500 + Math.floor(Math.random() * 4000)
  }));
};

export const searchGlobalNews = async (query: string): Promise<GlobalNewsResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Provide a detailed real-time news summary for: ${query}`,
      config: { tools: [{ googleSearch: {} }] },
    });
    const text = response.text || "No news summary available for this topic.";
    const sources: Array<{ uri: string; title: string }> = [];
    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    if (groundingChunks) {
      groundingChunks.forEach((chunk: any) => {
        if (chunk.web?.uri && chunk.web?.title) {
          sources.push({ uri: chunk.web.uri, title: chunk.web.title });
        }
      });
    }
    return { text, sources };
  } catch (error) {
    console.error("Search Global News failed:", error);
    return {
      text: "The global news search is currently unavailable.",
      sources: []
    };
  }
};
