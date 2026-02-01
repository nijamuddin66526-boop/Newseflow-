
import React, { useState, useEffect } from 'react';
import { Globe, ExternalLink, Loader2, Newspaper } from 'lucide-react';

interface Article {
  title: string;
  description: string;
  urlToImage: string;
  url: string;
  source: { name: string };
  publishedAt: string;
}

const App: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch('https://saurav.tech/NewsAPI/top-headlines/category/general/us.json');
        const data = await response.json();
        if (data.status === 'ok') {
          setArticles(data.articles);
        }
      } catch (error) {
        console.error('Error fetching news:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 font-['Inter']">
      {/* Navbar */}
      <nav className="bg-[#1877F2] text-white shadow-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm border border-white/30">
              <Newspaper className="w-8 h-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter">NetSphere News 🌎</h1>
          </div>
          <div className="hidden sm:flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-black/10 px-4 py-2 rounded-full border border-white/10">
              <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              <span className="text-xs font-black uppercase tracking-widest">Live Feed</span>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 space-y-6">
            <div className="relative">
              <Loader2 className="w-16 h-16 text-[#1877F2] animate-spin" />
              <Globe className="w-8 h-8 text-[#1877F2] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="text-xl font-black text-slate-800 animate-pulse tracking-tight italic">
              Loading latest headlines...
            </p>
          </div>
        ) : (
          <>
            <div className="mb-10 flex items-end justify-between">
              <div>
                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-2 italic underline decoration-[#1877F2] decoration-8 underline-offset-8">
                  Top Stories
                </h2>
                <p className="text-slate-500 font-bold uppercase text-[10px] tracking-[0.3em]">
                  Real-time Global Intel Dispatch
                </p>
              </div>
              <p className="text-slate-400 text-xs font-bold hidden md:block">
                Showing {articles.length} verified reports
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {articles.map((article, idx) => (
                <div 
                  key={idx} 
                  className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200 overflow-hidden flex flex-col hover:shadow-2xl hover:border-blue-100 transition-all duration-500 group"
                >
                  {/* Image Holder */}
                  <div className="h-56 relative overflow-hidden bg-slate-100">
                    <img 
                      src={article.urlToImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800'} 
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?auto=format&fit=crop&q=80&w=800';
                      }}
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-[#1877F2] text-white text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                        {article.source.name}
                      </span>
                    </div>
                  </div>

                  {/* Text Content */}
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-center space-x-2 text-slate-400 text-[10px] font-black uppercase tracking-widest mb-4">
                      <span>{new Date(article.publishedAt).toDateString()}</span>
                      <span className="w-1 h-1 bg-slate-300 rounded-full" />
                      <span>{new Date(article.publishedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    
                    <h3 className="text-xl font-black text-slate-900 mb-4 leading-[1.2] group-hover:text-[#1877F2] transition-colors line-clamp-2">
                      {article.title}
                    </h3>
                    
                    <p className="text-sm text-slate-500 mb-8 line-clamp-3 font-medium leading-relaxed">
                      {article.description || "The specific details for this report are being processed. Click the Read More button below to access the full primary source coverage."}
                    </p>
                    
                    <div className="mt-auto pt-4 border-t border-slate-50">
                      <a 
                        href={article.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-full bg-slate-50 text-[#1877F2] border-2 border-slate-200 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-[#1877F2] hover:text-white hover:border-[#1877F2] transition-all duration-300 shadow-sm"
                      >
                        Read Full Dispatch
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-2">
            <Newspaper className="w-6 h-6 text-[#1877F2]" />
            <span className="text-lg font-black tracking-tighter text-slate-900">NetSphere News</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              Data Stream: saurav.tech/NewsAPI • Interface v2.5.0
            </p>
            <p className="text-slate-300 text-[9px] font-bold mt-1">
              © 2025 NETSPHERE DISPATCH NETWORK. ALL RIGHTS RESERVED.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
