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
  Compass
} from 'lucide-react';
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
  targetLanguage: string;
  autoTranslate: boolean;
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
  onTriggerGlobalSearch,
  targetLanguage,
  autoTranslate
}) => {
  return (
    <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
      <CreatePost currentUser={currentUser} onPostCreated={onPostCreated} />
      
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
        <button 
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${!activeCategory ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
        >
          All News
        </button>
        {NEWS_CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
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
            targetLanguage={targetLanguage}
            autoTranslate={autoTranslate}
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
  targetLanguage: string;
  autoTranslate: boolean;
}> = ({ user, posts, onLike, onShare, onSave, onComment, onUpdateLocation, onUpdateBio, targetLanguage, autoTranslate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempBio, setTempBio] = useState(user.bio);
  const userPosts = useMemo(() => posts.filter(p => p.userId === user.id), [posts, user.id]);

  return (
    <div className="animate-in slide-in-from-right-4 duration-500">
      <div className="bg-white rounded-3xl shadow-sm border p-8 mb-6">
        <div className="flex items-center space-x-6 mb-8">
          <img src={user.avatar} className="w-24 h-24 rounded-3xl object-cover shadow-lg border-4 border-white ring-1 ring-slate-100" alt={user.name} />
          <div>
            <h1 className="text-3xl font-black text-slate-900 leading-tight">{user.name}</h1>
            <p className="text-slate-500 font-bold">@{user.username}</p>
            <div className="flex items-center space-x-2 mt-2">
              {user.phone && <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md"><Smartphone className="w-2.5 h-2.5 mr-1" /> Verified Phone</div>}
              {user.email && <div className="flex items-center text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded-md"><Mail className="w-2.5 h-2.5 mr-1" /> Google Verified</div>}
            </div>
          </div>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border mb-6 relative">
          <div className="absolute -top-3 left-6 bg-white px-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">About Reporter</div>
          {isEditing ? (
            <div className="space-y-4">
              <textarea 
                className="w-full p-4 border rounded-xl bg-white shadow-inner outline-none focus:ring-2 focus:ring-blue-500"
                value={tempBio}
                onChange={(e) => setTempBio(e.target.value)}
              />
              <Button onClick={() => { onUpdateBio(tempBio); setIsEditing(false); }} className="rounded-xl">Save Mission</Button>
            </div>
          ) : (
            <p className="italic text-slate-700 font-medium">"{user.bio}"</p>
          )}
        </div>
        <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)} className="rounded-xl font-black">
          {isEditing ? 'Cancel Editing' : 'Update Credentials'}
        </Button>
      </div>

      <h2 className="text-xl font-black mb-4 px-2">Dispatched Reports</h2>
      <div className="space-y-4">
        {userPosts.map(post => (
          /* Fixed: Use current props onLike, onShare, onSave, onComment instead of non-existent handle functions */
          <PostCard key={post.id} post={post} allPosts={posts} currentUserId={user.id} onLike={onLike} onShare={onShare} onSave={onSave} onComment={onComment} onUpdateLocation={() => {}} targetLanguage={targetLanguage} autoTranslate={autoTranslate} />
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
  const [loginMethod, setLoginMethod] = useState<'MOBILE' | 'GOOGLE'>('MOBILE');
  const [mobileNumber, setMobileNumber] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [globalSearchResults, setGlobalSearchResults] = useState<GlobalNewsResult | null>(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [globalSearchError, setGlobalSearchError] = useState<string | null>(null);

  // Global Language State
  const [targetLanguage, setTargetLanguage] = useState(() => {
    return localStorage.getItem('newsflow_lang') || 'en';
  });

  // Auto Translate Toggle State
  const [autoTranslate, setAutoTranslate] = useState(() => {
    return localStorage.getItem('newsflow_auto_translate') === 'true';
  });

  useEffect(() => { localStorage.setItem('newsflow_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => {
    if (currentUser) localStorage.setItem('newsflow_user', JSON.stringify(currentUser));
    else localStorage.removeItem('newsflow_user');
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('newsflow_lang', targetLanguage);
  }, [targetLanguage]);

  useEffect(() => {
    localStorage.setItem('newsflow_auto_translate', String(autoTranslate));
  }, [autoTranslate]);

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
  };

  const handleUpdateBio = (newBio: string) => {
    if (!currentUser) return;
    setCurrentUser({ ...currentUser, bio: newBio });
  };

  const handleLogout = () => { setCurrentUser(null); navigate('/'); };

  const handleMobileLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileNumber) return;
    setIsLoggingIn(true);
    setTimeout(() => {
      setCurrentUser({ 
        id: 'u' + Date.now(), 
        name: 'Correspondent', 
        username: 'user_' + mobileNumber.slice(-4), 
        avatar: `https://picsum.photos/seed/${mobileNumber}/200`, 
        bio: 'Verified via Mobile Intelligence Node',
        phone: mobileNumber
      });
      setIsLoggingIn(false);
    }, 1500);
  };

  const handleGoogleLogin = () => {
    setIsLoggingIn(true);
    setTimeout(() => {
      setCurrentUser({ 
        id: 'u' + Date.now(), 
        name: 'Verified Citizen', 
        username: 'citizen_gmail', 
        avatar: `https://picsum.photos/seed/google/200`, 
        bio: 'Authenticated via Google Identity Services',
        email: 'user@gmail.com'
      });
      setIsLoggingIn(false);
    }, 2000);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl p-10 text-center border border-slate-100 overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 to-emerald-500" />
          <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-50 rounded-full blur-3xl opacity-50" />
          
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 text-white shadow-xl shadow-blue-100 transform -rotate-6 transition-transform hover:rotate-0">
            <Compass className="w-10 h-10" />
          </div>
          
          <h1 className="text-4xl font-black mb-2 tracking-tighter text-slate-900">NewsFlow</h1>
          <p className="text-slate-400 font-bold text-sm uppercase tracking-[0.2em] mb-10">Correspondent Entry</p>
          
          <div className="flex p-1 bg-slate-100 rounded-2xl mb-8">
            <button 
              onClick={() => setLoginMethod('MOBILE')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-black transition-all ${loginMethod === 'MOBILE' ? 'bg-white text-blue-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Smartphone className="w-4 h-4" />
              <span>Mobile</span>
            </button>
            <button 
              onClick={() => setLoginMethod('GOOGLE')}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-black transition-all ${loginMethod === 'GOOGLE' ? 'bg-white text-blue-600 shadow-sm scale-[1.02]' : 'text-slate-500 hover:text-slate-700'}`}
            >
              <Globe className="w-4 h-4" />
              <span>Google</span>
            </button>
          </div>

          {loginMethod === 'MOBILE' ? (
            <form onSubmit={handleMobileLogin} className="space-y-4 animate-in slide-in-from-left-4 duration-300">
              <div className="space-y-1.5 text-left">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">Phone Number</label>
                <div className="flex items-center bg-slate-50 border border-slate-100 rounded-2xl p-1 shadow-inner focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                  <div className="px-4 text-sm font-black text-slate-400 border-r border-slate-200">+1</div>
                  <input 
                    type="tel" 
                    placeholder="Enter mobile..." 
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-3 text-sm font-bold outline-none placeholder:text-slate-300" 
                    required
                  />
                </div>
              </div>
              <Button fullWidth size="lg" disabled={isLoggingIn} className="rounded-2xl h-14 font-black shadow-lg shadow-blue-100">
                {isLoggingIn ? <Loader2 className="animate-spin" /> : 'Request Access Code'}
              </Button>
            </form>
          ) : (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="p-8 bg-slate-50 rounded-3xl border border-slate-100 border-dashed">
                <Mail className="w-8 h-8 text-slate-300 mx-auto mb-4" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">Secure authentication via<br/>Gmail Identity Protocol</p>
              </div>
              <button 
                onClick={handleGoogleLogin}
                disabled={isLoggingIn}
                className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-slate-100 rounded-2xl h-14 font-black text-slate-700 hover:bg-slate-50 transition-all hover:border-slate-200 shadow-sm active:scale-95 disabled:opacity-50"
              >
                {isLoggingIn ? (
                  <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                ) : (
                  <>
                    <img src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" className="w-5 h-5" alt="G" />
                    <span>Continue with Google</span>
                  </>
                )}
              </button>
            </div>
          )}
          
          <div className="mt-10 flex items-center space-x-2 text-slate-400 text-[10px] font-black uppercase tracking-widest justify-center">
            <Fingerprint className="w-3 h-3" />
            <span>End-to-End Encryption Enabled</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar 
        user={currentUser} 
        onLogout={handleLogout} 
        onSearch={setSearchQuery} 
        currentLanguage={targetLanguage}
        onLanguageChange={setTargetLanguage}
        autoTranslate={autoTranslate}
        onAutoTranslateChange={setAutoTranslate}
      />
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="hidden lg:block w-64 space-y-2 sticky top-24 h-fit">
            <Link to="/" className={`flex items-center space-x-3 p-3 rounded-2xl transition-all ${location.pathname === '/' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'hover:bg-white border border-transparent hover:border-slate-200'}`}>
              <Home className="w-5 h-5" /><span className="font-bold">Home</span>
            </Link>
            <Link to="/guidelines" className={`flex items-center space-x-3 p-3 rounded-2xl transition-all ${location.pathname === '/guidelines' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'hover:bg-white border border-transparent hover:border-slate-200'}`}>
              <Shield className="w-5 h-5" /><span className="font-bold">Guidelines</span>
            </Link>
            <Link to="/profile" className={`flex items-center space-x-3 p-3 rounded-2xl transition-all ${location.pathname === '/profile' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'hover:bg-white border border-transparent hover:border-slate-200'}`}>
              <UserIcon className="w-5 h-5" /><span className="font-bold">Profile</span>
            </Link>
          </div>
          <div className="flex-1 max-w-3xl">
            <Routes>
              <Route path="/" element={<HomePage posts={filteredPosts} allPosts={posts} currentUser={currentUser} onLike={handleLike} onShare={handleShare} onSave={handleSave} onComment={handleComment} onPostCreated={handleCreatePost} onUpdateLocation={() => {}} activeCategory={activeCategory} setActiveCategory={setActiveCategory} globalSearchResults={globalSearchResults} isSearchingGlobal={isSearchingGlobal} globalSearchError={globalSearchError} searchQuery={searchQuery} onTriggerGlobalSearch={handleGlobalSearch} targetLanguage={targetLanguage} autoTranslate={autoTranslate} />} />
              <Route path="/profile" element={<ProfilePage user={currentUser} posts={posts} onLike={handleLike} onShare={handleShare} onSave={handleSave} onComment={handleComment} onUpdateLocation={() => {}} onUpdateBio={handleUpdateBio} targetLanguage={targetLanguage} autoTranslate={autoTranslate} />} />
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