
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Globe, 
  ExternalLink, 
  Loader2, 
  Newspaper, 
  MapPin, 
  Search, 
  AlertTriangle, 
  Send, 
  PlusCircle,
  TrendingUp,
  LayoutGrid
} from 'lucide-react';

// Interfaces
interface LocalPost {
  id: string;
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  location: string;
  isBreaking: boolean;
  timestamp: string;
}

interface Article {
  title: string;
  description: string;
  urlToImage: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

type TabType = 'LOCAL' | 'WORLD' | 'CHILL';

const App: React.FC = () => {
  // State
  const [activeTab, setActiveTab] = useState<TabType>('LOCAL');
  const [localPosts, setLocalPosts] = useState<LocalPost[]>(() => {
    const saved = localStorage.getItem('netsphere_local_posts');
    return saved ? JSON.parse(saved) : [
      {
        id: '1',
        author: 'Arif Ahmed',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Arif',
        title: 'Water logging issue in Mirpur 10',
        content: 'Heavy rain since morning has caused severe water logging in Mirpur 10 area. Commuters are facing extreme difficulties.',
        location: 'Mirpur, Dhaka',
        isBreaking: true,
        timestamp: new Date().toISOString()
      },
      {
        id: '2',
        author: 'Sumana Roy',
        authorAvatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sumana',
        title: 'New Community Library Opening',
        content: 'A new library is opening next week for local students. Everyone is invited to the inauguration.',
        location: 'Salt Lake, Kolkata',
        isBreaking: false,
        timestamp: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  });
  
  const [worldNews, setWorldNews] = useState<Article[]>([]);
  const [loadingWorld, setLoadingWorld] = useState(false);
  const [searchArea, setSearchArea] = useState('');
  
  // New Post Form State
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({
    title: '',
    content: '',
    location: '',
    isBreaking: false
  });

  // Save to LocalStorage
  useEffect(() => {
    localStorage.setItem('netsphere_local_posts', JSON.stringify(localPosts));
  }, [localPosts]);

  // Fetch World News
  useEffect(() => {
    if (activeTab === 'WORLD' && worldNews.length === 0) {
      const fetchNews = async () => {
        setLoadingWorld(true);
        try {
          const res = await fetch('https://saurav.tech/NewsAPI/top-headlines/category/general/us.json');
          const data = await res.json();
          if (data.status === 'ok') setWorldNews(data.articles);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingWorld(false);
        }
      };
      fetchNews();
    }
  }, [activeTab]);

  // Handle Post Creation
  const handlePostSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.location || !newPost.content) {
      alert("Please fill all fields (Title, Content, and Location)");
      return;
    }

    const post: LocalPost = {
      id: Date.now().toString(),
      author: 'Citizen Reporter',
      authorAvatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${Date.now()}`,
      title: newPost.title,
      content: newPost.content,
      location: newPost.location,
      isBreaking: newPost.isBreaking,
      timestamp: new Date().toISOString()
    };

    setLocalPosts([post, ...localPosts]);
    setNewPost({ title: '', content: '', location: '', isBreaking: false });
    setShowForm(false);
  };

  // Filter local posts by area
  const filteredLocalPosts = useMemo(() => {
    return localPosts.filter(p => 
      p.location.toLowerCase().includes(searchArea.toLowerCase()) ||
      p.title.toLowerCase().includes(searchArea.toLowerCase())
    );
  }, [localPosts, searchArea]);

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter']">
      {/* Navbar */}
      <nav className="bg-[#1877F2] text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Newspaper className="w-6 h-6" />
            <h1 className="text-xl font-black tracking-tighter">NetSphere Citizen News 🌎</h1>
          </div>
          <button 
            onClick={() => setShowForm(!showForm)}
            className="bg-white text-[#1877F2] px-4 py-2 rounded-full font-black text-xs uppercase flex items-center shadow-lg hover:scale-105 transition-transform"
          >
            <PlusCircle className="w-4 h-4 mr-2" /> Report News
          </button>
        </div>
      </nav>

      {/* Hero Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-5xl mx-auto px-6 flex items-center space-x-8 h-14 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('LOCAL')}
            className={`flex items-center space-x-2 text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-4 transition-all h-full ${activeTab === 'LOCAL' ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-slate-400'}`}
          >
            <LayoutGrid className="w-4 h-4" /> <span>Local Reports</span>
          </button>
          <button 
            onClick={() => setActiveTab('WORLD')}
            className={`flex items-center space-x-2 text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-4 transition-all h-full ${activeTab === 'WORLD' ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-slate-400'}`}
          >
            <Globe className="w-4 h-4" /> <span>World News</span>
          </button>
          <button 
            onClick={() => setActiveTab('CHILL')}
            className={`flex items-center space-x-2 text-sm font-black uppercase tracking-widest whitespace-nowrap border-b-4 transition-all h-full ${activeTab === 'CHILL' ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-slate-400'}`}
          >
            <TrendingUp className="w-4 h-4" /> <span>Chill Zone</span>
          </button>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-6 py-8">
        {/* Post Form Overlay */}
        {showForm && (
          <div className="mb-10 bg-white rounded-3xl p-8 border-2 border-blue-500 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Citizen Report Filing</h2>
              <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500">✕</button>
            </div>
            <form onSubmit={handlePostSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input 
                  type="text" 
                  placeholder="Headline of the news..." 
                  className="w-full bg-slate-100 border-2 border-transparent focus:border-blue-500 rounded-2xl px-4 py-3 outline-none font-bold text-sm"
                  value={newPost.title}
                  onChange={e => setNewPost({...newPost, title: e.target.value})}
                />
                <input 
                  type="text" 
                  placeholder="📍 Location / Area (e.g. Mirpur, Dhaka)" 
                  className="w-full bg-slate-100 border-2 border-transparent focus:border-blue-500 rounded-2xl px-4 py-3 outline-none font-bold text-sm"
                  value={newPost.location}
                  onChange={e => setNewPost({...newPost, location: e.target.value})}
                />
              </div>
              <textarea 
                placeholder="Describe the incident in detail..."
                className="w-full bg-slate-100 border-2 border-transparent focus:border-blue-500 rounded-2xl px-4 py-3 outline-none font-medium text-sm h-32 resize-none"
                value={newPost.content}
                onChange={e => setNewPost({...newPost, content: e.target.value})}
              />
              <div className="flex items-center justify-between pt-2">
                <label className="flex items-center space-x-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    className="w-5 h-5 accent-red-600 rounded"
                    checked={newPost.isBreaking}
                    onChange={e => setNewPost({...newPost, isBreaking: e.target.checked})}
                  />
                  <span className="text-xs font-black uppercase text-red-600 tracking-widest group-hover:underline">Mark as Breaking News 🚨</span>
                </label>
                <button type="submit" className="bg-[#1877F2] text-white px-8 py-3 rounded-2xl font-black text-sm uppercase shadow-lg flex items-center">
                  Dispatch Report <Send className="w-4 h-4 ml-2" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Local Feed Content */}
        {activeTab === 'LOCAL' && (
          <div className="space-y-6">
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search news by area (e.g. Dhaka, Gulshan)..."
                className="w-full h-14 bg-white border border-slate-200 rounded-2xl pl-14 pr-6 outline-none focus:ring-4 focus:ring-blue-50 shadow-sm font-bold text-sm transition-all"
                value={searchArea}
                onChange={e => setSearchArea(e.target.value)}
              />
            </div>

            {filteredLocalPosts.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-slate-400 font-bold">No reports found for "{searchArea}"</p>
              </div>
            ) : (
              filteredLocalPosts.map(post => (
                <div 
                  key={post.id} 
                  className={`bg-white rounded-[2rem] p-8 shadow-sm border-2 transition-all hover:shadow-xl ${post.isBreaking ? 'border-red-100' : 'border-slate-100 hover:border-blue-100'}`}
                >
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                      <img src={post.authorAvatar} className="w-10 h-10 rounded-full border border-slate-100 bg-slate-50" />
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-black text-slate-900">{post.author}</h4>
                          <span className="bg-blue-50 text-blue-600 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest border border-blue-100">
                            Citizen Reporter
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          {new Date(post.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Just now
                        </p>
                      </div>
                    </div>
                    <div className="bg-slate-50 text-[#1877F2] px-4 py-2 rounded-xl flex items-center text-xs font-black border border-slate-100">
                      <MapPin className="w-3 h-3 mr-1.5" /> {post.location}
                    </div>
                  </div>

                  {post.isBreaking && (
                    <div className="inline-flex items-center space-x-2 bg-red-600 text-white px-4 py-1.5 rounded-full mb-4 animate-pulse">
                      <AlertTriangle className="w-3 h-3" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Breaking Local News</span>
                    </div>
                  )}

                  <h3 className="text-2xl font-black text-slate-900 mb-4 leading-tight">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 font-medium leading-relaxed mb-6">
                    {post.content}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                    <div className="flex items-center space-x-4">
                      <button className="text-slate-400 hover:text-blue-500 text-xs font-bold uppercase tracking-widest">Upvote</button>
                      <button className="text-slate-400 hover:text-blue-500 text-xs font-bold uppercase tracking-widest">Verify</button>
                    </div>
                    <button className="text-slate-300 hover:text-[#1877F2]"><ExternalLink className="w-4 h-4" /></button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* World News Tab */}
        {activeTab === 'WORLD' && (
          <div className="space-y-8 animate-in fade-in duration-500">
            {loadingWorld ? (
              <div className="py-20 flex flex-col items-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 font-bold">Syncing global feeds...</p>
              </div>
            ) : (
              worldNews.map((article, idx) => (
                <div key={idx} className="bg-white rounded-3xl overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl transition-all">
                  <div className="h-64 overflow-hidden relative">
                    <img 
                      src={article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-4 left-4 bg-[#1877F2] text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest">
                      {article.source.name}
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-xl font-black mb-4 leading-tight group-hover:text-blue-600 transition-colors">{article.title}</h3>
                    <p className="text-slate-500 text-sm mb-6 line-clamp-3 font-medium">{article.description}</p>
                    <a 
                      href={article.url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center text-[#1877F2] font-black text-xs uppercase tracking-[0.2em] hover:underline"
                    >
                      Read Source Report <ExternalLink className="w-3 h-3 ml-2" />
                    </a>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Chill Zone / Trending Placeholder */}
        {activeTab === 'CHILL' && (
          <div className="py-20 text-center">
            <TrendingUp className="w-16 h-16 text-slate-200 mx-auto mb-6" />
            <h2 className="text-2xl font-black text-slate-800 italic tracking-tighter mb-2">Social Hub Coming Soon</h2>
            <p className="text-slate-400 font-medium">Join the discussion about the latest trends with other reporters.</p>
          </div>
        )}
      </main>

      <footer className="bg-white border-t border-slate-200 mt-20 py-12">
        <div className="max-w-5xl mx-auto px-6 text-center">
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">
            NetSphere Network • Decentralized Citizen Journalism • v3.0.1
          </p>
        </div>
      </footer>
    </div>
  );
};

export default App;
