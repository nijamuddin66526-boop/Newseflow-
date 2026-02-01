
import React, { useState, useMemo, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import { User, Post, TrendingItem, PostType } from './types.ts';
import { INITIAL_POSTS, INITIAL_TRENDING, NEWS_CATEGORIES } from './constants.ts';
import { Navbar } from './components/Navbar.tsx';
import { PostCard } from './components/PostCard.tsx';
import { CreatePost } from './components/CreatePost.tsx';
import { TrendingSidebar } from './components/TrendingSidebar.tsx';
import { Guidelines } from './components/Guidelines.tsx';
import { BottomNav } from './components/BottomNav.tsx';
import { AuthFlow } from './components/AuthFlow.tsx';
import { fetchLiveTrendingTopics, fetchGlobalTrendingStories } from './services/geminiService.ts';
import { 
  Home, 
  Shield, 
  Loader2, 
  User as UserIcon, 
  TrendingUp,
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
  searchQuery: string;
  showCreateModal: boolean;
  setShowCreateModal: (val: boolean) => void;
  isTrendingNewsLoading: boolean;
  onRefresh: () => void;
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
  searchQuery,
  showCreateModal,
  setShowCreateModal,
  isTrendingNewsLoading,
  onRefresh
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

      <div className={`mx-auto ${viewMode === 'SHORTS' ? 'max-w-md' : 'max-w-screen-xl px-2'}`}>
        {isTrendingNewsLoading ? (
          <div className="py-20 text-center">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin mx-auto mb-4" />
            <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Loading Latest Feed...</p>
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
                layout={viewMode === 'HOME' ? 'grid' : 'immersive'}
              />
            ))}
          </div>
        )}
        {!isTrendingNewsLoading && posts.length === 0 && (
          <div className="text-center py-24 px-8">
            <h3 className="text-xl font-black text-slate-900 mb-2">No Reports Found</h3>
            <p className="text-slate-500 text-sm mb-8 font-medium max-w-xs mx-auto">Try refreshing your feed.</p>
            <Button size="lg" className="rounded-2xl px-8" onClick={onRefresh}>Refresh</Button>
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
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => { localStorage.setItem('netsphere_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('netsphere_user', JSON.stringify(currentUser));
    else localStorage.removeItem('netsphere_user');
  }, [currentUser]);

  const refreshNews = async () => {
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

  useEffect(() => {
    refreshNews();
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
      <AuthFlow 
        onComplete={(user) => {
          setCurrentUser(user);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar 
        user={currentUser} 
        onLogout={handleLogout} 
        onSearch={setSearchQuery} 
      />
      
      <main className="max-w-screen-xl mx-auto flex flex-col lg:flex-row">
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

        <div className="flex-1 min-w-0">
          <Routes>
            <Route path="/" element={<HomePage posts={filteredPosts} allPosts={posts} currentUser={currentUser} viewMode={viewMode} onLike={handleLike} onShare={handleShare} onSave={handleSave} onComment={handleComment} onPostCreated={handleCreatePost} onUpdateLocation={() => {}} activeCategory={activeCategory} setActiveCategory={setActiveCategory} searchQuery={searchQuery} showCreateModal={showCreateModal} setShowCreateModal={setShowCreateModal} isTrendingNewsLoading={isTrendingNewsLoading} onRefresh={refreshNews} />} />
            <Route path="/profile" element={<ProfilePage user={currentUser} posts={posts} onLike={handleLike} onShare={handleShare} onSave={handleSave} onComment={handleComment} onUpdateLocation={() => {}} onUpdateBio={handleUpdateBio} />} />
            <Route path="/guidelines" element={<Guidelines />} />
          </Routes>
        </div>

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
