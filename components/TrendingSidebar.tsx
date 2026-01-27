
import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingItem } from '../types.ts';
import { TrendingUp, UserPlus, Search } from 'lucide-react';
import { Button } from './Button.tsx';

interface TrendingSidebarProps {
  trending: TrendingItem[];
  onSearch: (q: string) => void;
}

export const TrendingSidebar: React.FC<TrendingSidebarProps> = ({ trending, onSearch }) => {
  return (
    <div className="w-80 hidden lg:block sticky top-[84px] h-fit space-y-6">
      {/* Search */}
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
        <input 
          type="text" 
          placeholder="Search news keywords..." 
          className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none shadow-sm transition-all"
          onChange={(e) => onSearch(e.target.value)}
        />
      </div>

      {/* Trending */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h2 className="font-bold text-slate-900">Trending Topics</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {trending.map(item => (
            <div key={item.id} className="p-4 hover:bg-slate-50 cursor-pointer transition-colors group">
              <p className="text-xs text-slate-400 font-medium">Trending Worldwide</p>
              <p className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors mt-0.5">{item.tag}</p>
              <p className="text-xs text-slate-500 mt-0.5">{item.postCount.toLocaleString()} posts</p>
            </div>
          ))}
        </div>
        <button className="w-full p-4 text-sm font-medium text-blue-600 hover:bg-blue-50 text-left transition-colors">
          Show more
        </button>
      </div>

      {/* Recommended Journalists */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-900">Top Reporters</h2>
          <Button variant="ghost" size="sm" className="h-6 text-[10px] text-blue-600">See all</Button>
        </div>
        <div className="p-4 space-y-4">
          {[
            { name: 'Diana Prince', handle: '@diana_p', img: 'https://picsum.photos/seed/diana/200' },
            { name: 'Clark Kent', handle: '@dailyplanet_clark', img: 'https://picsum.photos/seed/clark/200' },
            { name: 'Lois Lane', handle: '@loislane_news', img: 'https://picsum.photos/seed/lois/200' },
          ].map((user, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <img src={user.img} alt={user.name} className="w-8 h-8 rounded-full" />
                <div>
                  <p className="text-xs font-bold text-slate-900 leading-none">{user.name}</p>
                  <p className="text-[10px] text-slate-500 mt-1">{user.handle}</p>
                </div>
              </div>
              <Button size="sm" variant="outline" className="h-7 px-3 text-[10px] rounded-full">
                Follow
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 text-[10px] text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
        <Link to="/guidelines" className="hover:text-blue-600 transition-colors">Journalistic Standards</Link>
        <span>Terms of Service</span>
        <span>Privacy Policy</span>
        <span>Cookie Policy</span>
        <span>Accessibility</span>
        <span>Ads info</span>
        <span>More...</span>
        <span>© 2025 NewsFlow Inc.</span>
      </div>
    </div>
  );
};
