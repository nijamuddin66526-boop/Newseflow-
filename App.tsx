
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Post, TrendingItem, PostType } from './types.ts';
import { INITIAL_POSTS, INITIAL_TRENDING, NEWS_CATEGORIES } from './constants.ts';
import { Navbar } from './components/Navbar.tsx';
import { PostCard } from './components/PostCard.tsx';
import { CreatePost } from './components/CreatePost.tsx';
import { TrendingSidebar } from './components/TrendingSidebar.tsx';
import { GlobalNewsSearch } from './components/GlobalNewsSearch.tsx';
import { Guidelines } from './components/Guidelines.tsx';
import { searchGlobalNews, GlobalNewsResult, fetchLiveTrendingTopics } from './services/geminiService.ts';
import { Home, Compass, Bell, MessageSquare, User as UserIcon, LogOut, Settings, Bookmark, Edit2, Search, Plus, Globe, Shield, Lock, User as UserField, Loader2 } from 'lucide-react';
import { Button } from './components/Button.tsx';

const HomePage: React.FC<{ 
  posts: Post[]; 
  allPosts: Post[];
  currentUser: User; 
  onLike: (id: string) => void; 
  onShare: (id: string) => void;
  onSave: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onPostCreated: (data: any) => void;
  onUpdateLocation: (postId: string, location: any) => void;
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  globalSearchResults: GlobalNewsResult | null;
  isSearchingGlobal: boolean;
  globalSearchError: string | null;
  searchQuery: string;
  onTriggerGlobalSearch: () => void;
}> = ({ 
  posts, 
  allPosts, 
  currentUser, 
  onLike, 
  onShare, 
  onSave, 
  onComment, 
  onPostCreated, 
  onUpdateLocation,
  activeCategory, 
  setActiveCategory,
  globalSearchResults,
  isSearchingGlobal,
  globalSearchError,
  searchQuery,
  onTriggerGlobalSearch
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CreatePost currentUser={currentUser} onPostCreated={onPostCreated} />
      
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
        <button 
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${!activeCategory ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
        >
          All News
        </button>
        {NEWS_CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600' : 'bg-white border-slate-200 text-slate-600'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      <GlobalNewsSearch 
        results={globalSearchResults} 
        isLoading={isSearchingGlobal} 
        error={globalSearchError}
        query={searchQuery}
      />

      <div className="space-y-4">
        {posts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            allPosts={allPosts}
            currentUserId={currentUser.id} 
            onLike={onLike} 
            onShare={onShare} 
            onSave={onSave}
            onComment={onComment} 
            onUpdateLocation={onUpdateLocation}
          />
        ))}
        {posts.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border border-dashed p-8">
            <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-slate-900">No local reports</h3>
            <p className="text-slate-500 text-sm mb-6">Try searching global news or change filters.</p>
            <Button onClick={onTriggerGlobalSearch}>Search Globally</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const ProfilePage: React.FC<{ 
  user: User; 
  posts: Post[]; 
  onLike: (id: string) => void; 
  onShare: (id: string) => void;
  onSave: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onUpdateLocation: (postId: string, location: any) => void;
  onUpdateBio: (bio: string) => void;
}> = ({ user, posts, onLike, onShare, onSave, onComment, onUpdateLocation, onUpdateBio }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState(user.bio);
  const userPosts = useMemo(() => posts.filter(p => p.userId === user.id), [posts, user.id]);

  return (
    <div className="animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-3xl shadow-sm border p-8 mb-6">
        <div className="flex items-center space-x-6 mb-8">
          <img src={user.avatar} className="w-24 h-24 rounded-3xl object-cover shadow-lg" alt={user.name} />
          <div>
            <h1 className="text-3xl font-black text-slate-900">{user.name}</h1>
            <p className="text-slate-500 font-bold">@{user.username}</p>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border mb-6">
          {isEditing ? (
            <div className="space-y-4">
              <textarea 
                className="w-full p-4 border rounded-xl"
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
              />
              <Button onClick={() => { onUpdateBio(tempBio); setIsEditing(false); }}>Save Mission</Button>
            </div>
          ) : (
            <p className="italic text-slate-700 font-medium">"{user.bio}"</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? 'Cancel' : 'Edit Credentials'}
        </Button>
      </div>

      <h2 className="text-xl font-black mb-4">My Dispatches</h2>
      <div className="space-y-4">
        {userPosts.map(post => (
          <PostCard key={post.id} post={post} allPosts={posts} currentUserId={user.id} onLike={onLike} onShare={onShare} onSave={onSave} onComment={onComment} onUpdateLocation={onUpdateLocation} />
        ))}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('newsflow_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('newsflow_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  
  const [trending, setTrending] = useState<TrendingItem[]>(INITIAL_TRENDING);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [loginData, setLoginData] = useState({ name: '', username: '' });
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [globalSearchResults, setGlobalSearchResults] = useState<GlobalNewsResult | null>(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [globalSearchError, setGlobalSearchError] = useState<string | null>(null);

  useEffect(() => { localStorage.setItem('newsflow_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('newsflow_user', JSON.stringify(currentUser));
    else localStorage.removeItem('newsflow_user');
  }, [currentUser]);

  useEffect(() => {
    const getTrending = async () => {
      setIsTrendingLoading(true);
      try {
        const liveTrends = await fetchLiveTrendingTopics();
        if (liveTrends.length > 0) setTrending(liveTrends);
      } catch (err) { console.error(err); }
      setIsTrendingLoading(false);
    };
    getTrending();
    const interval = setInterval(getTrending, 300000); 
    return () => clearInterval(interval);
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q);
      const matchesCategory = !activeCategory || post.category === activeCategory;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, searchQuery, activeCategory]);

  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingGlobal(true);
    setGlobalSearchError(null);
    try {
      const results = await searchGlobalNews(searchQuery);
      setGlobalSearchResults(results);
    } catch (err) { setGlobalSearchError("Failed to fetch news."); }
    finally { setIsSearchingGlobal(false); }
  };

  const handleCreatePost = (data: any) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Date.now().toString(),
      userId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      type: data.type,
      category: data.category,
      title: data.title,
      content: data.content,
      mediaUrl: data.mediaUrl,
      likes: [],
      savedBy: [],
      comments: [],
      views: 0,
      shares: 0,
      createdAt: new Date().toISOString()
    };
    setPosts([newPost, ...posts]);
  };

  const handleLike = (id: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes.includes(currentUser.id) ? p.likes.filter(uid => uid !== currentUser.id) : [...p.likes, currentUser.id] } : p));
  };

  const handleSave = (id: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, savedBy: p.savedBy?.includes(currentUser.id) ? p.savedBy.filter(uid => uid !== currentUser.id) : [...(p.savedBy || []), currentUser.id] } : p));
  };

  const handleComment = (id: string, text: string) => {
    if (!currentUser) return;
    const newComment = { id: Date.now().toString(), userId: currentUser.id, userName: currentUser.name, text, createdAt: new Date().toISOString() };
    setPosts(prev => prev.map(p => p.id === id ? { ...p, comments: [...p.comments, newComment] } : p));
  };

  const handleShare = (id: string) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, shares: p.shares + 1 } : p));
    alert("Dispatch shared to external networks!");
  };

  const handleUpdateBio = (newBio: string) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, bio: newBio });
  };

  const handleLogout = () => { setCurrentUser(null); navigate('/'); };
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setTimeout(() => {
      setCurrentUser({ id: 'u1', name: loginData.name || 'Correspondent', username: loginData.username || 'user', avatar: `https://picsum.photos/seed/${loginData.username}/200`, bio: 'Independent Journalist' });
      setIsLoggingIn(false);
    }, 1000);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl p-8 text-center border">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white shadow-lg"><Compass className="w-8 h-8" /></div>
          <h1 className="text-3xl font-black mb-2">NewsFlow</h1>
          <p className="text-slate-500 mb-8">Login to start reporting</p>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="text" placeholder="Full Name" className="w-full p-4 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" required
              onChange={(e) => setLoginData({...loginData, name: e.target.value})}
            />
            <input 
              type="text" placeholder="Username" className="w-full p-4 border rounded-xl bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" required
              onChange={(e) => setLoginData({...loginData, username: e.target.value})}
            />
            <Button fullWidth size="lg" disabled={isLoggingIn} className="rounded-xl h-14 font-black">
              {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Sign In'}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar user={currentUser} onLogout={handleLogout} onSearch={setSearchQuery} />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="hidden lg:block w-64 space-y-2 sticky top-24 h-fit">
            <Link to="/" className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${location.pathname === '/' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'hover:bg-white border border-transparent hover:border-slate-200'}`}>
              <Home className="w-5 h-5" /><span className="font-bold">Home</span>
            </Link>
            <Link to="/guidelines" className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${location.pathname === '/guidelines' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'hover:bg-white border border-transparent hover:border-slate-200'}`}>
              <Shield className="w-5 h-5" /><span className="font-bold">Guidelines</span>
            </Link>
            <Link to="/profile" className={`flex items-center space-x-3 p-3 rounded-xl transition-all ${location.pathname === '/profile' ? 'bg-blue-600 text-white shadow-lg shadow-blue-100' : 'hover:bg-white border border-transparent hover:border-slate-200'}`}>
              <UserIcon className="w-5 h-5" /><span className="font-bold">Profile</span>
            </Link>
          </div>
          <div className="flex-1 max-w-3xl">
            <Routes>
              <Route path="/" element={<HomePage posts={filteredPosts} allPosts={posts} currentUser={currentUser} onLike={handleLike} onShare={handleShare} onSave={handleSave} onComment={handleComment} onPostCreated={handleCreatePost} onUpdateLocation={() => {}} activeCategory={activeCategory} setActiveCategory={setActiveCategory} globalSearchResults={globalSearchResults} isSearchingGlobal={isSearchingGlobal} globalSearchError={globalSearchError} searchQuery={searchQuery} onTriggerGlobalSearch={handleGlobalSearch} />} />
              <Route path="/profile" element={<ProfilePage user={currentUser} posts={posts} onLike={handleLike} onShare={handleShare} onSave={handleSave} onComment={handleComment} onUpdateLocation={() => {}} onUpdateBio={handleUpdateBio} />} />
              <Route path="/guidelines" element={<Guidelines />} />
            </Routes>
          </div>
          <TrendingSidebar trending={trending} onSearch={setSearchQuery} isLoading={isTrendingLoading} />
        </div>
      </main>
    </div>
  );
};

export default function App() { return (<Router><AppContent /></Router>); }
