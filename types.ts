
export type PostType = 'BLOG' | 'PHOTO' | 'VIDEO';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio: string;
  phone?: string;
  email?: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  text: string;
  createdAt: string;
}

export interface Post {
  id: string;
  userId: string;
  authorName: string;
  authorUsername: string;
  authorAvatar: string;
  type: PostType;
  category: string;
  title: string;
  content: string; // Long text for Blog, description for others
  mediaUrl?: string;
  galleryImages?: string[]; // Array of image URLs for galleries
  likes: string[]; // Array of user IDs
  savedBy: string[]; // Array of user IDs who bookmarked the post
  comments: Comment[];
  views: number;
  shares: number;
  createdAt: string;
  location?: {
    name: string;
    lat?: number;
    lng?: number;
  };
}

export interface TrendingItem {
  id: string;
  tag: string;
  postCount: number;
}
