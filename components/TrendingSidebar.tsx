
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingItem } from '../types.ts';
import { TrendingUp, Search, Globe, Loader2, Sparkles, ChevronRight } from 'lucide-react';
import { Button } from './Button.tsx';

interface TrendingSidebarProps {
  trending: TrendingItem[];
  onSearch: (q: string) => void;
  isLoading?: boolean;
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({ trending, onSearch, isLoading = false }) => {
  return (
    <div className="w-80 hidden lg:block sticky top-24 h-fit space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
      {/* Search Hub */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        </div>
        <input 
          type="text" 
          placeholder="Scan intelligence tags..." 
          className="w-full bg-white border border-slate-200 rounded-2xl pl-11 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all placeholder:text-slate-300"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Trending Intel */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4">
          <Sparkles className="w-4 h-4 text-blue-100" />
        </div>
        
        <div className="p-6 border-b border-slate-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              <h2 className="font-black text-slate-900 tracking-tight text-sm uppercase">Global Trending Hub</h2>
            </div>
            {isLoading && <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />}
          </div>
        </div>
        
        <div className="divide-y divide-slate-50">
          {isLoading ? (
            <div className="p-12 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-blue-200 mx-auto animate-spin" />
              <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.2em]">Syncing Trends...</p>
            </div>
          ) : (
            trending.map((item, idx) => (
              <div 
                key={item.id} 
                className="p-5 hover:bg-slate-50 cursor-pointer transition-all group flex items-start space-x-4"
                onClick={() => onSearch(item.tag.replace('#', ''))}
              >
                <div className="text-slate-200 font-black text-lg italic mt-1 leading-none">0{idx + 1}</div>
                <div className="flex-1">
                  <div className="flex items-center space-x-1.5 mb-1">
                    <Globe className="w-3 h-3 text-blue-400" />
                    <p className="text-[9px] text-slate-400 font-black uppercase tracking-widest">Active Intelligence</p>
                  </div>
                  <p className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors">{item.tag}</p>
                  <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">{item.postCount.toLocaleString()} Reports Synchronized</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-200 group-hover:text-blue-600 group-hover:translate-x-1 transition-all mt-1" />
              </div>
            ))
          )}
        </div>
        
        <button className="w-full p-5 text-[10px] font-black text-blue-600 hover:bg-blue-50 text-center transition-colors uppercase tracking-[0.2em] border-t border-slate-50">
          Exploration Mode
        </button>
      </div>

      {/* Verified Correspondents */}
      <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-50">
          <h2 className="font-black text-slate-900 tracking-tight text-sm uppercase">Elite Correspondents</h2>
        </div>
        <div className="p-6 space-y-6">
          {[
            { name: 'Diana Prince', handle: '@diana_intel', img: 'https://picsum.photos/seed/diana/200' },
            { name: 'Clark Kent', handle: '@dailyplanet_field', img: 'https://picsum.photos/seed/clark/200' },
            { name: 'Lois Lane', handle: '@loislane_verified', img: 'https://picsum.photos/seed/lois/200' },
          ].map((user, idx) => (
            <div key={idx} className="flex items-center justify-between group">
              <div className="flex items-center space-x-3">
                <img src={user.img} alt={user.name} className="w-10 h-10 rounded-[1.2rem] shadow-md group-hover:scale-110 transition-transform" />
                <div>
                  <p className="text-xs font-black text-slate-900 leading-none">{user.name}</p>
                  <p className="text-[9px] text-slate-500 font-bold mt-1 uppercase tracking-tighter">{user.handle}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-8 px-4 text-[9px] rounded-xl font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all">
                Connect
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Network Meta */}
      <div className="px-6 text-[9px] text-slate-400 flex flex-wrap gap-x-4 gap-y-2 font-black uppercase tracking-widest">
        <Link to="/guidelines" className="hover:text-blue-600 transition-colors">Protocol</Link>
        <span className="cursor-pointer hover:text-blue-600 transition-colors">Terms</span>
        <span className="cursor-pointer hover:text-blue-600 transition-colors">Privacy</span>
        <span className="cursor-pointer hover:text-blue-600 transition-colors">Support</span>
        <span className="text-slate-200">© 2025 NEWSFLOW</span>
      </div>
    </div>
  );
};
