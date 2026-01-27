
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
import { searchGlobalNews, GlobalNewsResult } from './services/geminiService.ts';
import { Home, Compass, Bell, MessageSquare, User as UserIcon, LogOut, Settings, Bookmark, Edit2, Search, Plus, Globe, Shield } from 'lucide-react';
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
      
      {/* Category Pills */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
        <button 
          onClick={() => setActiveCategory(null)}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${!activeCategory ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
        >
          News Feed
        </button>
        {NEWS_CATEGORIES.map(cat => (
          <button 
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${activeCategory === cat ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Global News Results */}
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
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 border-dashed animate-in zoom-in-95">
            <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
              <Search className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No reports found locally</h3>
            <p className="text-slate-500 text-sm max-w-xs mx-auto font-medium mb-6">We couldn't find any internal dispatches matching "{searchQuery}".</p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3 px-6">
              <Button variant="outline" className="rounded-full px-8 font-bold w-full sm:w-auto" onClick={() => setActiveCategory(null)}>Clear Filters</Button>
              {searchQuery && (
                <Button className="rounded-full px-8 font-bold w-full sm:w-auto group" onClick={onTriggerGlobalSearch}>
                  <Globe className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                  Search Global Feeds
                </Button>
              )}
            </div>
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
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6">
        <div className="h-44 bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-700 relative">
          <div className="absolute inset-0 opacity-10" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px'}} />
          <div className="absolute bottom-4 right-4 flex space-x-2">
            <div className="bg-white/10 backdrop-blur-md p-2 rounded-xl text-white border border-white/20">
              <Settings className="w-5 h-5" />
            </div>
          </div>
        </div>
        <div className="px-8 pb-8">
          <div className="relative flex justify-between items-end -mt-16 mb-6">
            <div className="relative group">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-32 h-32 rounded-3xl border-4 border-white shadow-xl object-cover bg-white" 
              />
              <button className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-xl text-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
            <Button variant="outline" size="sm" className="rounded-full mb-2 h-10 px-6 font-bold shadow-sm" onClick={() => setIsEditing(!isEditing)}>
              {isEditing ? 'Discard Changes' : 'Edit Credentials'}
            </Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">{user.name}</h1>
          </div>
          <p className="text-slate-500 font-bold text-sm tracking-wide">@{user.username}</p>
          
          <div className="mt-6">
            {isEditing ? (
              <div className="space-y-4 animate-in fade-in duration-300">
                <textarea 
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-none transition-all shadow-inner"
                  rows={4}
                  placeholder="Tell the world about your journalistic mission..."
                  value={tempBio}
                  onChange={(e) => setTempBio(e.target.value)}
                />
                <Button size="md" className="rounded-full px-8 shadow-md" onClick={() => { onUpdateBio(tempBio); setIsEditing(false); }}>
                  Update Mission
                </Button>
              </div>
            ) : (
              <p className="text-slate-700 text-sm leading-relaxed font-medium bg-slate-50/50 p-5 rounded-2xl border border-slate-100 italic shadow-sm">
                "{user.bio}"
              </p>
            )}
          </div>
          
          <div className="flex items-center space-x-12 mt-8 pt-8 border-t border-slate-100">
            <div className="text-center group cursor-pointer">
              <span className="block text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">{userPosts.length}</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Articles</span>
            </div>
            <div className="text-center group cursor-pointer">
              <span className="block text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">1.4k</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Followers</span>
            </div>
            <div className="text-center group cursor-pointer">
              <span className="block text-2xl font-black text-slate-900 group-hover:text-blue-600 transition-colors">512</span>
              <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Following</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-6 px-2">
        <h2 className="text-xl font-black text-slate-900 tracking-tight">Recent Dispatches</h2>
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
          <span>Sort by</span>
          <select className="bg-transparent border-none focus:ring-0 text-blue-600 font-black cursor-pointer">
            <option>Latest</option>
            <option>Most Impactful</option>
          </select>
        </div>
      </div>

      <div className="space-y-4">
        {userPosts.map(post => (
          <PostCard 
            key={post.id} 
            post={post} 
            allPosts={posts}
            currentUserId={user.id} 
            onLike={onLike} 
            onShare={onShare}
            onSave={onSave}
            onComment={onComment} 
            onUpdateLocation={onUpdateLocation}
          />
        ))}
        {userPosts.length === 0 && (
          <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 border-dashed shadow-sm">
            <p className="text-slate-400 font-bold">You haven't filed any reports yet.</p>
          </div>
        )}
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
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  // Global AI Search State
  const [globalSearchResults, setGlobalSearchResults] = useState<GlobalNewsResult | null>(null);
  const [isSearchingGlobal, setIsSearchingGlobal] = useState(false);
  const [globalSearchError, setGlobalSearchError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('newsflow_posts', JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('newsflow_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('newsflow_user');
    }
  }, [currentUser]);

  // Clear global results when search query changes
  useEffect(() => {
    setGlobalSearchResults(null);
    setGlobalSearchError(null);
  }, [searchQuery]);

  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = post.title.toLowerCase().includes(q) || 
                          post.content.toLowerCase().includes(q) ||
                          post.category.toLowerCase().includes(q) ||
                          post.authorUsername.toLowerCase().includes(q);
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
    } catch (err) {
      setGlobalSearchError("Global network timeout. Could not reach news feeds.");
    } finally {
      setIsSearchingGlobal(false);
    }
  };

  const handleCreatePost = (newPostData: { 
    type: PostType, 
    category: string, 
    title: string, 
    content: string, 
    mediaUrl?: string, 
    location?: { name: string; lat: number; lng: number } 
  }) => {
    if (!currentUser) return;
    const newPost: Post = {
      id: Math.random().toString(36).substr(2, 9),
      userId: currentUser.id,
      authorName: currentUser.name,
      authorUsername: currentUser.username,
      authorAvatar: currentUser.avatar,
      type: newPostData.type,
      category: newPostData.category,
      title: newPostData.title,
      content: newPostData.content,
      mediaUrl: newPostData.mediaUrl,
      location: newPostData.location,
      likes: [],
      savedBy: [],
      comments: [],
      views: Math.floor(Math.random() * 100),
      shares: 0,
      createdAt: new Date().toISOString()
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const handleUpdateLocation = (postId: string, location: { name: string; lat: number; lng: number }) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, location };
      }
      return post;
    }));
  };

  const handleLike = (postId: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const alreadyLiked = post.likes.includes(currentUser.id);
        return {
          ...post,
          likes: alreadyLiked 
            ? post.likes.filter(id => id !== currentUser.id)
            : [...post.likes, currentUser.id]
        };
      }
      return post;
    }));
  };

  const handleSave = (postId: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        const savedBy = post.savedBy || [];
        const alreadySaved = savedBy.includes(currentUser.id);
        return {
          ...post,
          savedBy: alreadySaved
            ? savedBy.filter(id => id !== currentUser.id)
            : [...savedBy, currentUser.id]
        };
      }
      return post;
    }));
  };

  const handleShare = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    }));
  };

  const handleComment = (postId: string, text: string) => {
    if (!currentUser) return;
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: Math.random().toString(36).substr(2, 9),
              userId: currentUser.id,
              userName: currentUser.name,
              text,
              createdAt: new Date().toISOString()
            }
          ]
        };
      }
      return post;
    }));
  };

  const handleUpdateBio = (newBio: string) => {
    if (currentUser) {
      setCurrentUser({ ...currentUser, bio: newBio });
    }
  };

  const handleLogin = () => {
    const mockUser: User = {
      id: 'u-me',
      name: 'Julian Thorne',
      username: 'jthorne_press',
      avatar: 'https://picsum.photos/seed/julian/200',
      bio: 'Independent Correspondent specializing in global policy and digital frontier ethics. Dedicated to investigative transparency.'
    };
    setCurrentUser(mockUser);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    navigate('/');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white lg:bg-slate-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl lg:shadow-2xl lg:border lg:border-slate-200 p-8 text-center animate-in zoom-in-95 duration-500">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200 rotate-12 transition-transform hover:rotate-0">
            <Compass className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-black text-slate-900 mb-3 tracking-tighter italic">NewsFlow</h1>
          <p className="text-slate-500 mb-10 leading-relaxed font-medium px-4">The global standard for decentralized news reporting and verified journalistic insights.</p>
          
          <div className="space-y-4">
            <Button fullWidth size="lg" className="rounded-2xl h-14 font-black tracking-wide shadow-lg shadow-blue-100" onClick={handleLogin}>
              Authenticate Identity
            </Button>
            <div className="flex items-center py-4">
              <div className="flex-1 border-b border-slate-100"></div>
              <span className="px-4 text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Independent News Network</span>
              <div className="flex-1 border-b border-slate-100"></div>
            </div>
            <Button variant="outline" fullWidth size="lg" className="rounded-2xl h-14 font-black tracking-wide border-2">
              Apply for Media Credentials
            </Button>
          </div>
          
          <p className="mt-12 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
            Encrypted. Immutable. Global.<br/>
            © 2025 NewsFlow Operations
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-24 lg:pb-0">
      <Navbar user={currentUser} onLogout={handleLogout} onSearch={setSearchQuery} />
      
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Left Sidebar */}
          <div className="hidden lg:block w-72 sticky top-24 h-fit">
            <div className="space-y-1 bg-white p-3 rounded-3xl shadow-sm border border-slate-200">
              <Link to="/" className={`flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all group ${location.pathname === '/' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}>
                <Home className={`w-5 h-5 ${location.pathname === '/' ? '' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="font-bold tracking-tight">News Feed</span>
              </Link>
              <Link to="/explore" className="flex items-center space-x-4 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all group">
                <Compass className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold tracking-tight">Global Explore</span>
              </Link>
              <Link to="/notifications" className="flex items-center space-x-4 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all group">
                <Bell className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold tracking-tight">Alerts Center</span>
              </Link>
              <Link to="/messages" className="flex items-center space-x-4 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all group">
                <MessageSquare className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold tracking-tight">Secure Comms</span>
              </Link>
              <Link to="/bookmarks" className="flex items-center space-x-4 px-4 py-3 rounded-2xl text-slate-600 hover:bg-slate-50 hover:text-blue-600 transition-all group">
                <Bookmark className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold tracking-tight">Saved Briefs</span>
              </Link>
              <Link to="/guidelines" className={`flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all group ${location.pathname === '/guidelines' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}>
                <Shield className={`w-5 h-5 ${location.pathname === '/guidelines' ? '' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="font-bold tracking-tight">Standards Bureau</span>
              </Link>
              <Link to="/profile" className={`flex items-center space-x-4 px-4 py-3 rounded-2xl transition-all group ${location.pathname === '/profile' ? 'bg-blue-600 text-white shadow-xl shadow-blue-100' : 'text-slate-600 hover:bg-slate-50 hover:text-blue-600'}`}>
                <UserIcon className={`w-5 h-5 ${location.pathname === '/profile' ? '' : 'group-hover:scale-110 transition-transform'}`} />
                <span className="font-bold tracking-tight">Bureau Profile</span>
              </Link>
            </div>
            
            <div className="mt-8">
              <Button fullWidth size="lg" className="rounded-2xl h-14 font-black shadow-lg shadow-blue-100 group" onClick={() => navigate('/')}>
                <Plus className="w-5 h-5 mr-2 group-hover:rotate-90 transition-transform" />
                File New Dispatch
              </Button>
            </div>
          </div>

          {/* Center: Main Content */}
          <div className="flex-1 max-w-2xl mx-auto w-full lg:max-w-3xl">
            <Routes>
              <Route path="/" element={
                <HomePage 
                  posts={filteredPosts} 
                  allPosts={posts}
                  currentUser={currentUser} 
                  onLike={handleLike} 
                  onShare={handleShare}
                  onSave={handleSave}
                  onComment={handleComment} 
                  onPostCreated={handleCreatePost}
                  onUpdateLocation={handleUpdateLocation}
                  activeCategory={activeCategory}
                  setActiveCategory={setActiveCategory}
                  globalSearchResults={globalSearchResults}
                  isSearchingGlobal={isSearchingGlobal}
                  globalSearchError={globalSearchError}
                  searchQuery={searchQuery}
                  onTriggerGlobalSearch={handleGlobalSearch}
                />
              } />
              <Route path="/guidelines" element={<Guidelines />} />
              <Route path="/profile" element={
                <ProfilePage 
                  user={currentUser} 
                  posts={posts} 
                  onLike={handleLike} 
                  onShare={handleShare}
                  onSave={handleSave}
                  onComment={handleComment}
                  onUpdateLocation={handleUpdateLocation}
                  onUpdateBio={handleUpdateBio}
                />
              } />
              <Route path="*" element={
                <div className="text-center py-32 bg-white rounded-3xl border border-slate-200 shadow-sm animate-in fade-in duration-700">
                  <Compass className="w-16 h-16 text-slate-200 mx-auto mb-4 animate-pulse" />
                  <h3 className="text-xl font-black text-slate-900">Encrypted Channel Pending</h3>
                  <p className="text-slate-500 font-medium">This bureaucratic segment is currently under secure maintenance.</p>
                </div>
              } />
            </Routes>
          </div>

          {/* Right Sidebar */}
          <TrendingSidebar trending={INITIAL_TRENDING} onSearch={setSearchQuery} />
        </div>
      </main>

      {/* Mobile Nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-slate-200 px-6 py-4 flex items-center justify-between z-40">
        <Link to="/" className={`p-2 transition-transform active:scale-90 ${location.pathname === '/' ? 'text-blue-600' : 'text-slate-400'}`}><Home className="w-7 h-7" /></Link>
        <Link to="/explore" className="p-2 transition-transform active:scale-90 text-slate-400"><Search className="w-7 h-7" /></Link>
        <div 
          onClick={() => navigate('/')}
          className="relative -top-10 bg-blue-600 p-5 rounded-3xl shadow-2xl shadow-blue-400 text-white border-4 border-slate-50 transform rotate-12 active:rotate-0 transition-transform active:scale-95"
        >
          <Plus className="w-7 h-7" />
        </div>
        <Link to="/guidelines" className={`p-2 transition-transform active:scale-90 ${location.pathname === '/guidelines' ? 'text-blue-600' : 'text-slate-400'}`}><Shield className="w-7 h-7" /></Link>
        <Link to="/profile" className={`p-2 transition-transform active:scale-90 ${location.pathname === '/profile' ? 'text-blue-600' : 'text-slate-400'}`}><UserIcon className="w-7 h-7" /></Link>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;
