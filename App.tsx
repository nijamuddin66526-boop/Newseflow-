
import React, { useState, useEffect, useMemo } from 'react';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut,
  signInWithPhoneNumber,
  RecaptchaVerifier
} from 'firebase/auth';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  Timestamp 
} from 'firebase/firestore';
import { 
  Globe, 
  Newspaper, 
  MapPin, 
  Send, 
  PlusCircle,
  LayoutGrid,
  LogOut,
  ExternalLink,
  Loader2,
  Coffee,
  Filter
} from 'lucide-react';
import { fetchBengaliMultiSourceNews } from './services/geminiService.ts';

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA-PRjsQiFEdGONMjNoI9rFZK3JyiFdmKc",
  authDomain: "netsphere-newse.firebaseapp.com",
  projectId: "netsphere-newse",
  storageBucket: "netsphere-newse.firebasestorage.app",
  messagingSenderId: "473828924979",
  appId: "1:473828924979:web:58fda4998f31c1a2184d46",
  measurementId: "G-TH887ZP06P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Types
interface CitizenPost {
  id: string;
  author: string;
  authorAvatar: string;
  title: string;
  content: string;
  location: string;
  timestamp: any;
}

interface Article {
  title: string;
  description: string;
  urlToImage: string;
  url: string;
  source: { name: string };
  publishedAt: string;
  category: string;
}

type TabType = 'CITIZEN' | 'WORLD' | 'CHILL';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<TabType>('CITIZEN');
  const [citizenPosts, setCitizenPosts] = useState<CitizenPost[]>([]);
  const [worldNews, setWorldNews] = useState<Article[]>([]);
  const [loadingWorld, setLoadingWorld] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  // Auth Form State
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const [authError, setAuthError] = useState('');
  
  // New Post Form State
  const [showForm, setShowForm] = useState(false);
  const [newPost, setNewPost] = useState({ title: '', content: '', location: '' });

  // Filter Categories
  const categories = ['All', 'Politics', 'Sports', 'Entertainment', 'International'];

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // Firestore Feed Listener
  useEffect(() => {
    if (user && activeTab === 'CITIZEN') {
      const q = query(collection(db, "posts"), orderBy("timestamp", "desc"));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as CitizenPost[];
        setCitizenPosts(posts);
      });
      return () => unsubscribe();
    }
  }, [user, activeTab]);

  // World News Fetch (Multi-Source RSS)
  useEffect(() => {
    if (user && activeTab === 'WORLD' && worldNews.length === 0) {
      const fetchNews = async () => {
        setLoadingWorld(true);
        try {
          const news = await fetchBengaliMultiSourceNews();
          setWorldNews(news);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingWorld(false);
        }
      };
      fetchNews();
    }
  }, [user, activeTab, worldNews.length]);

  // Derived Filtered News
  const filteredWorldNews = useMemo(() => {
    if (categoryFilter === 'All') return worldNews;
    return worldNews.filter(article => 
      article.category?.toLowerCase().includes(categoryFilter.toLowerCase()) ||
      article.title?.toLowerCase().includes(categoryFilter.toLowerCase())
    );
  }, [worldNews, categoryFilter]);

  // Auth Actions
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const setupRecaptcha = () => {
    if (!(window as any).recaptchaVerifier) {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
      });
    }
  };

  const handlePhoneLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setupRecaptcha();
    const appVerifier = (window as any).recaptchaVerifier;
    try {
      const result = await signInWithPhoneNumber(auth, phone, appVerifier);
      setConfirmationResult(result);
    } catch (err: any) {
      setAuthError(err.message);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await confirmationResult.confirm(verificationCode);
    } catch (err: any) {
      setAuthError("Invalid verification code.");
    }
  };

  const handleLogout = () => signOut(auth);

  const handlePostSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title || !newPost.location || !newPost.content) return;

    try {
      await addDoc(collection(db, "posts"), {
        author: user.displayName || user.phoneNumber || "Citizen Reporter",
        authorAvatar: user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`,
        title: newPost.title,
        content: newPost.content,
        location: newPost.location,
        timestamp: Timestamp.now()
      });
      setNewPost({ title: '', content: '', location: '' });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden p-10 text-center">
          <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-100">
            <Newspaper className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">NetSphere News</h1>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">Join the world's most advanced citizen journalism network.</p>
          
          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              className="w-full bg-slate-900 text-white h-14 rounded-2xl font-bold flex items-center justify-center hover:bg-black transition-all shadow-lg"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-6 h-6 mr-3 bg-white p-1 rounded-full" />
              Continue with Google
            </button>

            {!confirmationResult ? (
              <form onSubmit={handlePhoneLogin} className="space-y-3">
                <div className="flex bg-slate-100 rounded-2xl p-1">
                  <input 
                    type="tel" 
                    placeholder="+1 555 000 0000"
                    className="flex-1 bg-transparent px-4 py-3 outline-none font-bold text-sm"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                  />
                  <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-black text-xs uppercase tracking-widest">
                    Code
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyCode} className="space-y-3">
                <input 
                  type="text" 
                  placeholder="Enter 6-digit code"
                  className="w-full bg-slate-100 border-2 border-blue-100 rounded-2xl px-6 py-4 outline-none font-black text-center text-xl tracking-[0.5em]"
                  value={verificationCode}
                  onChange={e => setVerificationCode(e.target.value)}
                  maxLength={6}
                />
                <button type="submit" className="w-full bg-blue-600 text-white h-14 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg">
                  Verify & Access
                </button>
              </form>
            )}
            
            {authError && <p className="text-red-500 text-[11px] font-bold mt-2 uppercase tracking-tight">{authError}</p>}
          </div>

          <p className="mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-loose">
            By joining, you agree to the <br/> Decentralized Intelligence Protocol
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8fafc] font-['Inter']">
      {/* Navbar */}
      <nav className="bg-[#1877F2] text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
              <Newspaper className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black tracking-tighter">NetSphere News</h1>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-3 bg-white/10 px-4 py-1.5 rounded-full border border-white/5">
              <img src={user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`} className="w-6 h-6 rounded-full border border-white/20" />
              <span className="text-[11px] font-black uppercase tracking-tight">{user.displayName || 'Correspondent'}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </nav>

      {/* Tabs */}
      <div className="bg-white border-b border-slate-200 sticky top-16 z-40">
        <div className="max-w-6xl mx-auto px-6 flex items-center space-x-12 h-14 overflow-x-auto no-scrollbar">
          <button 
            onClick={() => setActiveTab('CITIZEN')}
            className={`flex items-center space-x-2 text-xs font-black uppercase tracking-[0.2em] transition-all h-full border-b-2 ${activeTab === 'CITIZEN' ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-slate-400'}`}
          >
            <LayoutGrid className="w-4 h-4" /> <span>Citizen Feed</span>
          </button>
          <button 
            onClick={() => setActiveTab('WORLD')}
            className={`flex items-center space-x-2 text-xs font-black uppercase tracking-[0.2em] transition-all h-full border-b-2 ${activeTab === 'WORLD' ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-slate-400'}`}
          >
            <Globe className="w-4 h-4" /> <span>World News</span>
          </button>
          <button 
            onClick={() => setActiveTab('CHILL')}
            className={`flex items-center space-x-2 text-xs font-black uppercase tracking-[0.2em] transition-all h-full border-b-2 ${activeTab === 'CHILL' ? 'border-[#1877F2] text-[#1877F2]' : 'border-transparent text-slate-400'}`}
          >
            <Coffee className="w-4 h-4" /> <span>Chill Zone</span>
          </button>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-6 py-10 pb-24">
        {activeTab === 'WORLD' && (
          <div className="mb-8">
            <div className="flex items-center space-x-3 mb-6 overflow-x-auto pb-2 no-scrollbar">
              <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${categoryFilter === cat ? 'bg-[#1877F2] text-white shadow-md' : 'bg-white text-slate-400 border border-slate-200 hover:border-blue-300'}`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* View Content */}
        {activeTab === 'CITIZEN' && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Create Post Card */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200">
               <div className="flex items-center space-x-4 mb-6">
                 <img src={user.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${user.uid}`} className="w-12 h-12 rounded-2xl" />
                 <button 
                   onClick={() => setShowForm(true)}
                   className="flex-1 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-4 text-left text-slate-400 font-bold hover:bg-slate-100 transition-colors"
                 >
                   What's happening in your area?
                 </button>
               </div>
            </div>

            {showForm && (
              <div className="fixed inset-0 z-[60] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
                <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Report Dispatch</h2>
                    <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-red-500 font-black">✕</button>
                  </div>
                  <form onSubmit={handlePostSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <input 
                        type="text" 
                        placeholder="Headline of the report..." 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none font-bold text-sm focus:border-blue-500 transition-colors"
                        value={newPost.title}
                        onChange={e => setNewPost({...newPost, title: e.target.value})}
                        required
                      />
                      <input 
                        type="text" 
                        placeholder="📍 Location / Field Coordinates" 
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3 outline-none font-bold text-sm focus:border-blue-500 transition-colors"
                        value={newPost.location}
                        onChange={e => setNewPost({...newPost, location: e.target.value})}
                        required
                      />
                    </div>
                    <textarea 
                      placeholder="Detailed intelligence report..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-5 py-4 outline-none font-medium text-sm h-40 resize-none focus:border-blue-500 transition-colors"
                      value={newPost.content}
                      onChange={e => setNewPost({...newPost, content: e.target.value})}
                      required
                    />
                    <button type="submit" className="w-full bg-[#1877F2] text-white h-16 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg flex items-center justify-center space-x-2">
                      <span>Dispatch Now</span> <Send className="w-4 h-4" />
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* Posts List */}
            <div className="space-y-6">
              {citizenPosts.length === 0 ? (
                <div className="text-center py-20">
                  <Loader2 className="w-10 h-10 text-slate-200 animate-spin mx-auto mb-4" />
                  <p className="text-slate-400 font-bold">Scanning for local reports...</p>
                </div>
              ) : (
                citizenPosts.map(post => (
                  <div key={post.id} className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-200 group hover:border-blue-200 transition-all">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-3">
                        <img src={post.authorAvatar} className="w-10 h-10 rounded-full bg-slate-100" />
                        <div>
                          <h4 className="text-sm font-black text-slate-900">{post.author}</h4>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">Citizen Correspondent</p>
                        </div>
                      </div>
                      <div className="bg-blue-50 text-blue-600 px-4 py-1.5 rounded-full flex items-center text-[10px] font-black uppercase tracking-widest border border-blue-100">
                        <MapPin className="w-3 h-3 mr-1.5" /> {post.location}
                      </div>
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-4 tracking-tight leading-tight">
                      {post.title}
                    </h3>
                    <p className="text-slate-600 font-medium leading-relaxed mb-6">
                      {post.content}
                    </p>
                    <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                        Reported {post.timestamp?.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <button className="text-blue-600 font-black text-[10px] uppercase tracking-widest hover:underline">
                        Verify Report
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'WORLD' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-500">
            {loadingWorld ? (
              <div className="py-20 flex flex-col items-center col-span-full">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                <p className="text-slate-400 font-black uppercase tracking-[0.2em]">Syncing Bengali News Hub...</p>
              </div>
            ) : (
              filteredWorldNews.map((article, idx) => (
                <div key={idx} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-200 group hover:shadow-xl transition-all h-full flex flex-col">
                  <div className="h-48 overflow-hidden relative flex-shrink-0">
                    <img 
                      src={article.urlToImage} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 left-4 bg-[#1877F2] text-white text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg">
                      {article.source.name}
                    </div>
                    {article.category && (
                      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-slate-900 text-[9px] font-black px-4 py-2 rounded-full uppercase tracking-[0.2em] shadow-lg border border-white/20">
                        {article.category}
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex flex-col flex-1">
                    <h3 className="text-lg font-black mb-3 leading-tight group-hover:text-blue-600 transition-colors tracking-tight line-clamp-2">{article.title}</h3>
                    <p className="text-slate-500 text-xs mb-6 line-clamp-3 font-medium leading-relaxed flex-1">{article.description}</p>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">
                        {new Date(article.publishedAt).toLocaleDateString()}
                      </p>
                      <a 
                        href={article.url} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center text-[#1877F2] font-black text-[10px] uppercase tracking-widest hover:underline"
                      >
                        Read More <ExternalLink className="w-3 h-3 ml-2" />
                      </a>
                    </div>
                  </div>
                </div>
              ))
            )}
            {!loadingWorld && filteredWorldNews.length === 0 && (
              <div className="col-span-full text-center py-20">
                <p className="text-slate-400 font-bold uppercase tracking-widest">No reports found in this category.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'CHILL' && (
          <div className="py-24 text-center space-y-8 animate-in zoom-in-95 duration-500">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mx-auto animate-bounce duration-[2000ms]">
               <Coffee className="w-10 h-10 text-orange-600" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-4 italic">Chill Zone Alpha</h2>
              <p className="text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
                A sanctuary for correspondents to relax and discuss non-breaking news topics.
              </p>
            </div>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 inline-block">
               <p className="text-[10px] font-black uppercase text-blue-600 tracking-[0.3em]">Status: Implementing Community Protocols</p>
            </div>
          </div>
        )}
      </main>

      {/* Footer / Floating Button */}
      <footer className="fixed bottom-6 right-6">
        <button 
          onClick={() => setShowForm(true)}
          className="bg-[#1877F2] text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all"
        >
          <PlusCircle className="w-8 h-8" />
        </button>
      </footer>
    </div>
  );
};

export default App;
