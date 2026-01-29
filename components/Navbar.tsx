
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Home, Bell, LogOut, Search, Globe, ChevronDown, Check, Zap } from 'lucide-react';
import { User } from '../types.ts';
import { Button } from './Button.tsx';
import { SUPPORTED_LANGUAGES } from '../constants.ts';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSearch: (q: string) => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  autoTranslate: boolean;
  onAutoTranslateChange: (auto: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogout, 
  onSearch, 
  currentLanguage, 
  onLanguageChange,
  autoTranslate,
  onAutoTranslateChange
}) => {
  const location = useLocation();
  const [isLangOpen, setIsLangOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-blue-600 p-1.5 rounded-xl transition-transform group-hover:rotate-12 group-active:scale-95 shadow-lg shadow-blue-100">
            <Compass className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tight hidden sm:block">NewsFlow</span>
        </Link>

        {/* Center: Search (Mobile hidden) */}
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search global news..." 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-inner"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          {/* Auto Translate Toggle */}
          <button 
            onClick={() => onAutoTranslateChange(!autoTranslate)}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl border transition-all ${autoTranslate ? 'bg-amber-50 border-amber-200 text-amber-600 shadow-sm' : 'bg-white border-transparent text-slate-400 hover:bg-slate-50'}`}
            title="Auto language translate"
          >
            <Zap className={`w-3.5 h-3.5 ${autoTranslate ? 'fill-current' : ''}`} />
            <span className="text-[10px] font-black uppercase tracking-widest hidden lg:block">Auto-Sync</span>
          </button>

          {/* Language Switcher */}
          <div className="relative">
            <button 
              onClick={() => setIsLangOpen(!isLangOpen)}
              className="flex items-center space-x-2 px-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors border border-transparent hover:border-slate-200 group"
            >
              <Globe className="w-4 h-4 text-blue-600" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 hidden lg:block">{currentLangObj.native}</span>
              <ChevronDown className={`w-3 h-3 text-slate-400 transition-transform ${isLangOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangOpen && (
              <>
                <div className="fixed inset-0" onClick={() => setIsLangOpen(false)} />
                <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-4 py-2 border-b border-slate-50 mb-1">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Intelligence Language</p>
                  </div>
                  {SUPPORTED_LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        onLanguageChange(lang.code);
                        setIsLangOpen(false);
                      }}
                      className="w-full px-4 py-2.5 text-left flex items-center justify-between hover:bg-blue-50 transition-colors group"
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-700 group-hover:text-blue-600">{lang.native}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase">{lang.name}</span>
                      </div>
                      {currentLanguage === lang.code && <Check className="w-4 h-4 text-blue-600" />}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <Link to="/">
            <Button variant="ghost" size="sm" className={`rounded-xl p-2 h-10 w-10 ${isActive('/') ? 'text-blue-600 bg-blue-50 shadow-inner' : 'text-slate-500'}`}>
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          
          {user ? (
            <div className="flex items-center space-x-2 ml-2">
              <Link to="/profile">
                <div className={`p-0.5 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${isActive('/profile') ? 'border-blue-500 shadow-md' : 'border-transparent'}`}>
                  <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-lg object-cover" />
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-500 h-10 w-10 p-2 rounded-xl">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button size="sm" className="rounded-xl px-4 font-black">Join NewsFlow</Button>
          )}
        </div>
      </div>
    </nav>
  );
};
