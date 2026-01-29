
import { Post, TrendingItem } from './types.ts';

export const NEWS_CATEGORIES = [
  'Technology',
  'Politics',
  'Sports',
  'Entertainment',
  'Health',
  'Business',
  'World',
  'Science'
];

export const SUPPORTED_LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'bn', name: 'Bengali', native: 'বাংলা' },
  { code: 'es', name: 'Spanish', native: 'Español' },
  { code: 'fr', name: 'French', native: 'Français' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
  { code: 'de', name: 'German', native: 'Deutsch' },
  { code: 'zh', name: 'Chinese', native: '中文' },
  { code: 'hi', name: 'Hindi', native: 'हिन्दी' },
  { code: 'ja', name: 'Japanese', native: '日本語' }
];

export const INITIAL_TRENDING: TrendingItem[] = [
  { id: '1', tag: '#QuantumComputing', postCount: 1240 },
  { id: '2', tag: '#GreenEnergy', postCount: 856 },
  { id: '3', tag: '#AITrends2025', postCount: 2103 },
  { id: '4', tag: '#SpaceXLaunch', postCount: 450 },
  { id: '5', tag: '#GlobalEconomy', postCount: 120 }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u1',
    authorName: 'Sarah Jenkins',
    authorUsername: 'sarahj_news',
    authorAvatar: 'https://picsum.photos/seed/sarah/200',
    type: 'BLOG',
    category: 'Technology',
    title: 'The Future of AI in Newsrooms',
    content: 'As artificial intelligence continues to evolve, the landscape of journalism is shifting rapidly. Newsrooms are now using LLMs to assist with data analysis and fact-checking. However, the human element remains irreplaceable for investigative reporting and ethical judgment...',
    likes: ['u2', 'u3'],
    savedBy: [],
    comments: [
      { id: 'c1', userId: 'u2', userName: 'John Doe', text: 'Great insight! The balance is key.', createdAt: new Date().toISOString() }
    ],
    views: 4520,
    shares: 124,
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    location: { name: 'Silicon Valley, California' }
  },
  {
    id: 'p2',
    userId: 'u2',
    authorName: 'Marcus Vane',
    authorUsername: 'marcus_v',
    authorAvatar: 'https://picsum.photos/seed/marcus/200',
    type: 'PHOTO',
    category: 'World',
    title: 'Visual Dispatch: Resilience in the High Peaks',
    content: 'A series of captures showcasing the breathtaking yet demanding life in the Himalayas. Nature reporting at its finest.',
    mediaUrl: 'https://picsum.photos/seed/mountain/800/600',
    galleryImages: [
      'https://picsum.photos/seed/himalaya1/800/600',
      'https://picsum.photos/seed/himalaya2/800/600',
      'https://picsum.photos/seed/himalaya3/800/600',
      'https://picsum.photos/seed/himalaya4/800/600'
    ],
    likes: ['u1'],
    savedBy: [],
    comments: [],
    views: 12050,
    shares: 890,
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    location: { name: 'Mount Everest Base Camp' }
  },
  {
    id: 'p3',
    userId: 'u3',
    authorName: 'Alex Rivera',
    authorUsername: 'arivera',
    authorAvatar: 'https://picsum.photos/seed/alex/200',
    type: 'VIDEO',
    category: 'Sports',
    title: 'Final Seconds: The Championship Game',
    content: 'Wait for the buzzer beater! Incredible performance by the team today.',
    mediaUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    likes: [],
    savedBy: [],
    comments: [],
    views: 840,
    shares: 42,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    location: { name: 'United Center, Chicago' }
  }
];
