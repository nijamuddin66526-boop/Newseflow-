
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
import { BottomNav } from './components/BottomNav.tsx';
import { searchGlobalNews, GlobalNewsResult, fetchLiveTrendingTopics, fetchGlobalTrendingStories } from './services/geminiService.ts';
import { 
  Home, 
  Search, 
  User as UserIcon, 
  Shield, 
  Loader2, 
  Smartphone, 
  Mail, 
  Fingerprint, 
  Globe,
  Compass,
  TrendingUp,
  Plus,
  Zap,
  Play
} from 'lucide-react';
import { Button } from './components/Button.tsx';

type ViewMode = 'HOME' | 'SHORTS';

const HomePage: React.FC<{ 
  posts: Post[]; 
  allPosts: Post[];
  currentUser: User; 
  viewMode: ViewMode;
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
  targetLanguage: string;
  autoTranslate: boolean;
  showCreateModal: boolean;
  setShowCreateModal: (val: boolean) => void;
  isTrendingNewsLoading: boolean;
}> = ({ 
  posts, 
  allPosts, 
  currentUser, 
  viewMode,
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
  onTriggerGlobalSearch,
  targetLanguage,
  autoTranslate,
  showCreateModal,
  setShowCreateModal,
  isTrendingNewsLoading
}) => {
  return (
    <div className="animate-in fade-in duration-500 pb-20 sm:pb-4">
      {showCreateModal && (
        <CreatePost 
          currentUser={currentUser} 
          onPostCreated={onPostCreated} 
          onClose={() => setShowCreateModal(false)}
        />
      )}
      
      {/* Category Pill Bar (Only for HOME mode) */}
      {viewMode === 'HOME' && (
        <div className="sticky top-[64px] z-30 bg-white border-b border-slate-100 flex items-center space-x-2 overflow-x-auto px-4 py-3 no-scrollbar">
          <button 
            onClick={() => setActiveCategory(null)}
            className={`px-4 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${!activeCategory ? 'bg-black text-white border-black' : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200'}`}
          >
            All
          </button>
          {NEWS_CATEGORIES.map(cat => (
            <button 
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-black text-white border-black' : 'bg-slate-100 border-transparent text-slate-500 hover:bg-slate-200'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {viewMode === 'HOME' && (
        <GlobalNewsSearch 
          results={globalSearchResults} 
          isLoading={isSearchingGlobal} 
          error={globalSearchError}
          query={searchQuery}
        />
      )}

      <div className={`mx-auto ${viewMode === 'SHORTS' ? 'max-w-md' : 'max-w-screen-xl px-2'}`}>
        {isTrendingNewsLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Querying Global Matrix...</p>
          </div>
        ) : (
          <div className={viewMode === 'HOME' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4" : "flex flex-col space-y-0"}>
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
                targetLanguage={targetLanguage}
                autoTranslate={autoTranslate}
                layout={viewMode === 'HOME' ? 'grid' : 'immersive'}
              />
            ))}
          </div>
        )}
        {!isTrendingNewsLoading && posts.length === 0 && (
          <div className="text-center py-24 px-8">
            <h3 className="text-xl font-black text-slate-900 mb-2">Network Idle</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium max-w-xs mx-auto">No reports match your criteria.</p>
            <Button size="lg" className="rounded-2xl px-8" onClick={onTriggerGlobalSearch}>Global Search</Button>
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
  targetLanguage: string;
  autoTranslate: boolean;
}> = ({ user, posts, onLike, onShare, onSave, onComment, onUpdateLocation, onUpdateBio, targetLanguage, autoTranslate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState(user.bio);
  const userPosts = useMemo(() => posts.filter(p => p.userId === user.id), [posts, user.id]);

  return (
    <div className="animate-in slide-in-from-right-4 duration-500 pb-20">
      <div className="bg-white p-8 border-b text-center sm:text-left sm:flex sm:items-center sm:space-x-8">
        <img src={user.avatar} className="w-24 h-24 rounded-full mx-auto sm:mx-0 object-cover ring-4 ring-slate-50 shadow-lg" alt={user.name} />
        <div className="mt-4 sm:mt-0 flex-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter">{user.name}</h1>
          <p className="text-blue-600 font-black uppercase text-[10px] tracking-widest">@{user.username}</p>
          <div className="mt-4 max-w-md mx-auto sm:mx-0">
            {isEditing ? (
              <div className="space-y-4">
                <textarea 
                  className="w-full p-4 border border-slate-200 rounded-xl bg-slate-50 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                />
                <Button size="sm" onClick={() => { onUpdateBio(tempBio); setIsEditing(false); }}>Save Profile</Button>
              </div>
            ) : (
              <p className="text-slate-600 font-medium text-sm leading-relaxed">{user.bio}</p>
            )}
            {!isEditing && <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="mt-2 text-blue-600 p-0 hover:bg-transparent">Edit Bio</Button>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0.5 mt-1">
        {userPosts.map(post => (
          <div key={post.id} className="aspect-[9/16] bg-slate-900 relative group cursor-pointer overflow-hidden">
            {post.mediaUrl ? (
              <img src={post.mediaUrl} className="w-full h-full object-cover group-hover:scale-110 transition-transform opacity-80" />
            ) : (
              <div className="w-full h-full flex items-center justify-center p-4">
                <p className="text-[10px] text-white font-black uppercase tracking-widest text-center line-clamp-4">{post.title}</p>
              </div>
            )}
            <div className="absolute bottom-2 left-2 flex items-center space-x-1 text-white drop-shadow-md z-10">
              <Play className="w-3 h-3 fill-current" />
              <span className="text-[10px] font-bold">{(post.views / 1000).toFixed(1)}k</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('HOME');
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
  const [trendingNews, setTrendingNews] = useState<Post[]>([]);
  const [isTrendingNewsLoading, setIsTrendingNewsLoading] = useState(false);
  
  const [loginMethod, setLoginMethod] = useState<'MOBILE' | 'GOOGLE'>('MOBILE');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [globalSearchResults, setGlobalSearchResults] = useState<GlobalNewsResult | null>(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [globalSearchError, setGlobalSearchError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const [targetLanguage, setTargetLanguage] = useState(() => localStorage.getItem('newsflow_lang') || 'en');
  const [autoTranslate, setAutoTranslate] = useState(() => localStorage.getItem('newsflow_auto_translate') === 'true');

  useEffect(() => { localStorage.setItem('newsflow_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('newsflow_user', JSON.stringify(currentUser));
    else localStorage.removeItem('newsflow_user');
  }, [currentUser]);

  useEffect(() => { localStorage.setItem('newsflow_lang', targetLanguage); }, [targetLanguage]);
  useEffect(() => { localStorage.setItem('newsflow_auto_translate', String(autoTranslate)); }, [autoTranslate]);

  useEffect(() => {
    const getTrendingData = async () => {
      setIsTrendingLoading(true);
      try {
        const [liveTrends, liveNews] = await Promise.all([
          fetchLiveTrendingTopics(),
          fetchGlobalTrendingStories()
        ]);
        if (liveTrends.length > 0) setTrending(liveTrends);
        if (liveNews.length > 0) setTrendingNews(liveNews);
      } catch (err) { console.error(err); }
      setIsTrendingLoading(false);
    };
    getTrendingData();
  }, []);

  useEffect(() => {
    if (activeCategory === 'TRENDING' || viewMode === 'SHORTS') {
      const refreshTrendingNews = async () => {
        setIsTrendingNewsLoading(true);
        try {
          const liveNews = await fetchGlobalTrendingStories();
          if (liveNews.length > 0) setTrendingNews(liveNews);
        } catch (err) { console.error(err); }
        finally { setIsTrendingNewsLoading(false); }
      };
      refreshTrendingNews();
    }
  }, [activeCategory, viewMode]);

  const filteredPosts = useMemo(() => {
    if (viewMode === 'SHORTS') return trendingNews;
    if (activeCategory === 'TRENDING') return trendingNews;
    let result = [...posts];
    if (activeCategory) result = result.filter(post => post.category === activeCategory);
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(post => post.title.toLowerCase().includes(q) || post.content.toLowerCase().includes(q));
    }
    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [posts, trendingNews, searchQuery, activeCategory, viewMode]);

  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingGlobal(true);
    setGlobalSearchError(null);
    try {
      const results = await searchGlobalNews(searchQuery);
      setGlobalSearchResults(results);
      if (location.pathname !== '/') navigate('/');
      setViewMode('HOME');
    } catch (err) { setGlobalSearchError("Search failure."); }
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
    setShowCreateModal(false);
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

  const handleShare = (id: string) => setPosts(prev => prev.map(p => p.id === id ? { ...p, shares: p.shares + 1 } : p));
  const handleUpdateBio = (newBio: string) => currentUser && setCurrentUser({ ...currentUser, bio: newBio });
  const handleLogout = () => { setCurrentUser(null); navigate('/'); };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 text-white shadow-xl shadow-blue-100 animate-bounce">
          <Compass className="w-10 h-10" />
        </div>
        <h1 className="text-4xl font-black mb-2 tracking-tighter">NewsFlow</h1>
        <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mb-10 text-center">Dispatch Verified News</p>
        <div className="w-full max-w-xs space-y-4">
          <Button fullWidth size="lg" className="rounded-2xl h-14 font-black" onClick={() => setCurrentUser({ id: 'guest', name: 'Citizen Journalist', username: 'guest_jr', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=guest', bio: 'Field observer reporting live.' })}>
            Enter Network
          </Button>
          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest text-center">Secure Dispatch Gateway</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        user={currentUser} 
        onLogout={handleLogout} 
        onSearch={setSearchQuery} 
        onSearchSubmit={handleGlobalSearch}
        currentLanguage={targetLanguage}
        onLanguageChange={setTargetLanguage}
        autoTranslate={autoTranslate}
        onAutoTranslateChange={setAutoTranslate}
      />
      
      <main className="max-w-screen-xl mx-auto flex flex-col lg:flex-row">
        {/* Left Sidebar for Desktop */}
        <div className="hidden lg:block w-64 space-y-2 sticky top-24 h-fit p-4 flex-shrink-0">
          <button onClick={() => setViewMode('HOME')} className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all ${viewMode === 'HOME' && location.pathname === '/' ? 'bg-slate-100 font-black text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Home className="w-5 h-5" /><span>Feed</span>
          </button>
          <button onClick={() => setViewMode('SHORTS')} className={`w-full flex items-center space-x-3 p-4 rounded-xl transition-all ${viewMode === 'SHORTS' ? 'bg-slate-100 font-black text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>
            <TrendingUp className="w-5 h-5" /><span>Shorts</span>
          </button>
          <Link to="/guidelines" className={`flex items-center space-x-3 p-4 rounded-xl transition-all ${location.pathname === '/guidelines' ? 'bg-slate-100 font-black text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>
            <Shield className="w-5 h-5" /><span>Guidelines</span>
          </Link>
          <Link to="/profile" className={`flex items-center space-x-3 p-4 rounded-xl transition-all ${location.pathname === '/profile' ? 'bg-slate-100 font-black text-slate-900' : 'text-slate-500 hover:bg-slate-50'}`}>
            <UserIcon className="w-5 h-5" /><span>Profile</span>
          </Link>
        </div>

        {/* Content Area */}
        <div className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<HomePage posts={filteredPosts} allPosts={posts} currentUser={currentUser} viewMode={viewMode} onLike={handleLike} onShare={handleShare} onSave={handleSave} onComment={handleComment} onPostCreated={handleCreatePost} onUpdateLocation={() => {}} activeCategory={activeCategory} setActiveCategory={setActiveCategory} globalSearchResults={globalSearchResults} isSearchingGlobal={isSearchingGlobal} globalSearchError={globalSearchError} searchQuery={searchQuery} onTriggerGlobalSearch={handleGlobalSearch} targetLanguage={targetLanguage} autoTranslate={autoTranslate} showCreateModal={showCreateModal} setShowCreateModal={setShowCreateModal} isTrendingNewsLoading={isTrendingNewsLoading} />} />
            <Route path="/profile" element={<ProfilePage user={currentUser} posts={posts} onLike={handleLike} onShare={handleShare} onSave={handleSave} onComment={handleComment} onUpdateLocation={() => {}} onUpdateBio={handleUpdateBio} targetLanguage={targetLanguage} autoTranslate={autoTranslate} />} />
            <Route path="/guidelines" element={<Guidelines />} />
          </Routes>
        </div>

        {/* Right Sidebar for Desktop */}
        <div className="hidden xl:block">
          <TrendingSidebar trending={trending} onSearch={setSearchQuery} isLoading={isTrendingLoading} />
        </div>
      </main>

      <BottomNav 
        onAddClick={() => setShowCreateModal(true)} 
        viewMode={viewMode}
        onViewChange={setViewMode}
      />
    </div>
  );
};

export default function App() { return (<Router><AppContent /></Router>); }
