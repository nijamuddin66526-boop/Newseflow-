
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
import { AuthFlow } from './components/AuthFlow.tsx';
import { searchGlobalNews, GlobalNewsResult, fetchLiveTrendingTopics, fetchGlobalTrendingStories } from './services/geminiService.ts';
import { 
  Home, 
  Shield, 
  Loader2, 
  User as UserIcon, 
  TrendingUp,
  Image as ImageIcon,
  Video
} from 'lucide-react';
import { Button } from './components/Button.tsx';

type ViewMode = 'HOME' | 'SHORTS';

const InlineCreatePost: React.FC<{ 
  user: User; 
  onPostCreated: (data: any) => void;
}> = ({ user, onPostCreated }) => {
  const [content, setContent] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSubmit = () => {
    if (!content.trim()) return;
    onPostCreated({
      type: imageUrl ? 'PHOTO' : 'BLOG',
      category: 'Latest',
      title: content.slice(0, 50) + (content.length > 50 ? '...' : ''),
      content: content,
      mediaUrl: imageUrl || undefined
    });
    setContent('');
    setImageUrl('');
    setIsExpanded(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6">
      <div className="flex space-x-3">
        <img src={user.avatar} className="w-10 h-10 rounded-full bg-slate-100" />
        <div className="flex-1">
          <textarea
            placeholder="What's happening on NetSphere?"
            className="w-full bg-slate-100 hover:bg-slate-200 transition-colors rounded-2xl px-4 py-3 text-sm font-medium outline-none resize-none min-h-[44px]"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            rows={isExpanded ? 3 : 1}
          />
          {isExpanded && (
            <div className="mt-3 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Image URL (optional)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs font-medium outline-none focus:border-blue-500"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                />
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-50">
                <div className="flex items-center space-x-4">
                  <button className="text-slate-500 hover:text-blue-600 flex items-center space-x-2">
                    <Video className="w-4 h-4 text-blue-500" />
                    <span className="text-[10px] font-bold uppercase tracking-wider">Live Video</span>
                  </button>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsExpanded(false)}>Cancel</Button>
                  <Button size="sm" className="bg-[#1877F2] hover:bg-[#166fe5] px-6 rounded-full" onClick={handleSubmit} disabled={!content.trim()}>
                    Post
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface HomePageProps {
  posts: Post[];
  allPosts: Post[];
  currentUser: User;
  viewMode: ViewMode;
  onLike: (id: string) => void;
  onShare: (id: string) => void;
  onSave: (id: string) => void;
  onDelete: (id: string) => void;
  onComment: (id: string, text: string) => void;
  onPostCreated: (data: any) => void;
  onUpdateLocation: (id: string, loc: any) => void; // Fixed: added missing prop
  activeCategory: string | null;
  setActiveCategory: (cat: string | null) => void;
  globalSearchResults: GlobalNewsResult | null;
  isSearchingGlobal: boolean;
  globalSearchError: string | null;
  searchQuery: string;
  onTriggerGlobalSearch: () => void;
  isTrendingNewsLoading: boolean;
  onRefresh: () => void;
}

const HomePage: React.FC<HomePageProps> = ({ 
  posts, 
  allPosts, 
  currentUser, 
  viewMode,
  onLike, 
  onShare, 
  onSave, 
  onDelete,
  onComment, 
  onPostCreated, 
  onUpdateLocation,
  activeCategory, 
  setActiveCategory,
  globalSearchResults,
  isSearchingGlobal,
  globalSearchError,
  searchQuery,
  isTrendingNewsLoading,
  onRefresh
}) => {
  return (
    <div className="animate-in fade-in duration-500 pb-20 sm:pb-4">
      {viewMode === 'HOME' && (
        <>
          <div className="sticky top-[64px] z-30 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center space-x-2 overflow-x-auto px-4 py-3 no-scrollbar">
            <button 
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!activeCategory ? 'bg-[#1877F2] text-white shadow-md shadow-blue-100' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              For You
            </button>
            {NEWS_CATEGORIES.map(cat => (
              <button 
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-[#1877F2] text-white shadow-md shadow-blue-100' : 'text-slate-600 hover:bg-slate-100'}`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="max-w-2xl mx-auto pt-6 px-4 sm:px-0">
            <InlineCreatePost user={currentUser} onPostCreated={onPostCreated} />
          </div>
        </>
      )}

      {viewMode === 'HOME' && searchQuery && (
        <div className="max-w-2xl mx-auto px-4 sm:px-0">
          <GlobalNewsSearch 
            results={globalSearchResults} 
            isLoading={isSearchingGlobal} 
            error={globalSearchError}
            query={searchQuery}
          />
        </div>
      )}

      <div className={`mx-auto ${viewMode === 'SHORTS' ? 'max-w-md' : 'max-w-2xl px-4 sm:px-0'}`}>
        {isTrendingNewsLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-bold uppercase text-[10px] tracking-[0.2em]">Updating Dispatch...</p>
          </div>
        ) : (
          <div className={viewMode === 'HOME' ? "flex flex-col space-y-4" : "flex flex-col space-y-0"}>
            {posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                allPosts={allPosts}
                currentUserId={currentUser.id} 
                onLike={onLike} 
                onShare={onShare} 
                onSave={onSave}
                onDelete={onDelete}
                onComment={onComment} 
                onUpdateLocation={onUpdateLocation}
                layout={viewMode === 'HOME' ? 'grid' : 'immersive'}
              />
            ))}
          </div>
        )}
        {!isTrendingNewsLoading && posts.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 text-center py-24 px-8 shadow-sm">
            <h3 className="text-xl font-black text-slate-900 mb-2">Feed is Empty</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium max-w-xs mx-auto">The world is quiet right now. Check back later for new dispatches.</p>
            <Button size="lg" className="bg-[#1877F2] rounded-full px-8" onClick={onRefresh}>Refresh News</Button>
          </div>
        )}
      </div>
    </div>
  );
};

const AppContent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [viewMode, setViewMode] = useState<ViewMode>('HOME');
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('netsphere_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem('netsphere_posts');
    return saved ? JSON.parse(saved) : INITIAL_POSTS;
  });
  
  const [trending, setTrending] = useState<TrendingItem[]>(INITIAL_TRENDING);
  const [isTrendingLoading, setIsTrendingLoading] = useState(false);
  const [trendingNews, setTrendingNews] = useState<Post[]>([]);
  const [isTrendingNewsLoading, setIsTrendingNewsLoading] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [globalSearchResults, setGlobalSearchResults] = useState<GlobalNewsResult | null>(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [globalSearchError, setGlobalSearchError] = useState<string | null>(null);

  const filteredPosts = useMemo(() => {
    // Combine user posts and trending news
    let combined = [...posts, ...trendingNews];
    
    // De-duplicate if needed (by ID)
    const uniqueMap = new Map();
    combined.forEach(p => uniqueMap.set(p.id, p));
    combined = Array.from(uniqueMap.values());

    // Sorting by date descending
    combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Filtering by category
    if (activeCategory) {
      combined = combined.filter(p => p.category === activeCategory);
    }

    // Filtering by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      combined = combined.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.content.toLowerCase().includes(q) ||
        p.authorName.toLowerCase().includes(q)
      );
    }

    return combined;
  }, [posts, trendingNews, activeCategory, searchQuery]);

  useEffect(() => { 
    localStorage.setItem('netsphere_posts', JSON.stringify(posts)); 
  }, [posts]);

  useEffect(() => {
    if (currentUser) localStorage.setItem('netsphere_user', JSON.stringify(currentUser));
    else localStorage.removeItem('netsphere_user');
  }, [currentUser]);

  const refreshNews = async () => {
    setIsTrendingLoading(true);
    setIsTrendingNewsLoading(true);
    try {
      const [liveTrends, liveNews] = await Promise.all([
        fetchLiveTrendingTopics(),
        fetchGlobalTrendingStories()
      ]);
      if (liveTrends.length > 0) setTrending(liveTrends);
      if (liveNews.length > 0) setTrendingNews(liveNews);
    } catch (err) { 
      console.error(err); 
    } finally {
      setIsTrendingLoading(false);
      setIsTrendingNewsLoading(false);
    }
  };

  useEffect(() => {
    refreshNews();
  }, []);

  const handleGlobalSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearchingGlobal(true);
    setGlobalSearchError(null);
    try {
      const results = await searchGlobalNews(searchQuery);
      setGlobalSearchResults(results);
      if (location.pathname !== '/') navigate('/');
      setViewMode('HOME');
    } catch (err) { 
      setGlobalSearchError("Connection to global intelligence timed out."); 
    } finally { 
      setIsSearchingGlobal(false); 
    }
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
      category: data.category || 'Latest',
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
    setPosts(prev => [newPost, ...prev]);
  };

  const handleLike = (id: string) => {
    if (!currentUser) return;
    const updater = (p: Post) => p.id === id ? { 
      ...p, 
      likes: p.likes.includes(currentUser.id) 
        ? p.likes.filter(uid => uid !== currentUser.id) 
        : [...p.likes, currentUser.id] 
    } : p;
    setPosts(prev => prev.map(updater));
    setTrendingNews(prev => prev.map(updater));
  };

  const handleSave = (id: string) => {
    if (!currentUser) return;
    const updater = (p: Post) => p.id === id ? { 
      ...p, 
      savedBy: p.savedBy.includes(currentUser.id) 
        ? p.savedBy.filter(uid => uid !== currentUser.id) 
        : [...p.savedBy, currentUser.id] 
    } : p;
    setPosts(prev => prev.map(updater));
    setTrendingNews(prev => prev.map(updater));
  };

  const handleDeletePost = (id: string) => {
    if (window.confirm("Delete this dispatch forever?")) {
      setPosts(prev => prev.filter(p => p.id !== id));
      setTrendingNews(prev => prev.filter(p => p.id !== id));
    }
  };

  const handleComment = (id: string, text: string) => {
    if (!currentUser) return;
    const newComment = { 
      id: Date.now().toString(), 
      userId: currentUser.id, 
      userName: currentUser.name, 
      text, 
      createdAt: new Date().toISOString() 
    };
    const updater = (p: Post) => p.id === id ? { ...p, comments: [...p.comments, newComment] } : p;
    setPosts(prev => prev.map(updater));
    setTrendingNews(prev => prev.map(updater));
  };

  const handleShare = (id: string) => {
    const updater = (p: Post) => p.id === id ? { ...p, shares: p.shares + 1 } : p;
    setPosts(prev => prev.map(updater));
    setTrendingNews(prev => prev.map(updater));
  };

  if (!currentUser) {
    return <AuthFlow onComplete={setCurrentUser} />;
  }

  return (
    <div className="min-h-screen">
      <Navbar 
        user={currentUser} 
        onLogout={() => setCurrentUser(null)} 
        onSearch={setSearchQuery}
        onSearchSubmit={handleGlobalSearch}
      />
      
      <main className="max-w-screen-xl mx-auto flex flex-col lg:flex-row lg:px-4">
        {/* Left Sidebar */}
        <div className="hidden lg:block w-72 space-y-2 sticky top-20 h-fit py-4 pr-6 flex-shrink-0">
          <button onClick={() => { setViewMode('HOME'); navigate('/'); }} className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-all ${viewMode === 'HOME' && location.pathname === '/' ? 'bg-white shadow-sm font-black text-[#1877F2]' : 'text-slate-600 hover:bg-slate-200/50'}`}>
            <Home className={`w-5 h-5 ${viewMode === 'HOME' && location.pathname === '/' ? 'fill-current' : ''}`} />
            <span className="text-sm">Feed</span>
          </button>
          <button onClick={() => { setViewMode('SHORTS'); navigate('/'); }} className={`w-full flex items-center space-x-4 p-3 rounded-xl transition-all ${viewMode === 'SHORTS' ? 'bg-white shadow-sm font-black text-[#1877F2]' : 'text-slate-600 hover:bg-slate-200/50'}`}>
            <TrendingUp className="w-5 h-5" />
            <span className="text-sm">Live Dispatch</span>
          </button>
          <Link to="/profile" className={`flex items-center space-x-4 p-3 rounded-xl transition-all ${location.pathname === '/profile' ? 'bg-white shadow-sm font-black text-[#1877F2]' : 'text-slate-600 hover:bg-slate-200/50'}`}>
            <UserIcon className="w-5 h-5" />
            <span className="text-sm">Identity</span>
          </Link>
          <Link to="/guidelines" className={`flex items-center space-x-4 p-3 rounded-xl transition-all ${location.pathname === '/guidelines' ? 'bg-white shadow-sm font-black text-[#1877F2]' : 'text-slate-600 hover:bg-slate-200/50'}`}>
            <Shield className="w-5 h-5" />
            <span className="text-sm">Protocol</span>
          </Link>
        </div>

        {/* Main Feed */}
        <div className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={
              <HomePage 
                posts={filteredPosts} 
                allPosts={posts} 
                currentUser={currentUser} 
                viewMode={viewMode} 
                onLike={handleLike} 
                onShare={handleShare} 
                onSave={handleSave} 
                onDelete={handleDeletePost}
                onComment={handleComment} 
                onPostCreated={handleCreatePost} 
                onUpdateLocation={() => {}}
                activeCategory={activeCategory} 
                setActiveCategory={setActiveCategory} 
                searchQuery={searchQuery} 
                onTriggerGlobalSearch={handleGlobalSearch}
                isTrendingNewsLoading={isTrendingNewsLoading} 
                onRefresh={refreshNews}
                globalSearchResults={globalSearchResults}
                isSearchingGlobal={isSearchingGlobal}
                globalSearchError={globalSearchError}
              />
            } />
            <Route path="/profile" element={
              <div className="max-w-2xl mx-auto px-4 mt-8">
                <h1 className="text-2xl font-black mb-4">Your Profile</h1>
                <div className="flex flex-col space-y-4">
                  {posts.filter(p => p.userId === currentUser.id).map(post => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      allPosts={posts}
                      currentUserId={currentUser.id} 
                      onLike={handleLike} 
                      onShare={handleShare} 
                      onSave={handleSave}
                      onDelete={handleDeletePost}
                      onComment={handleComment} 
                      onUpdateLocation={() => {}}
                      layout="grid"
                    />
                  ))}
                </div>
              </div>
            } />
            <Route path="/guidelines" element={<Guidelines />} />
          </Routes>
        </div>

        {/* Right Sidebar */}
        <div className="hidden xl:block w-80 sticky top-20 h-fit py-4 pl-6">
          <TrendingSidebar trending={trending} onSearch={setSearchQuery} isLoading={isTrendingLoading} />
        </div>
      </main>

      <BottomNav 
        onAddClick={() => { setViewMode('HOME'); navigate('/'); }} 
        viewMode={viewMode}
        onViewChange={setViewMode}
      />
    </div>
  );
};

export default function App() { return (<Router><AppContent /></Router>); }
