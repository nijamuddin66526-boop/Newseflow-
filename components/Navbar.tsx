
import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Home, Bell, LogOut, Search, Globe, ChevronDown, Check, Zap, X, Command } from 'lucide-react';
import { User } from '../types.ts';
import { Button } from './Button.tsx';
import { SUPPORTED_LANGUAGES } from '../constants.ts';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSearch: (q: string) => void;
  onSearchSubmit?: () => void;
  currentLanguage: string;
  onLanguageChange: (lang: string) => void;
  autoTranslate: boolean;
  onAutoTranslateChange: (auto: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, 
  onLogout, 
  onSearch, 
  onSearchSubmit,
  currentLanguage, 
  onLanguageChange,
  autoTranslate,
  onAutoTranslateChange
}) => {
  const location = useLocation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = (path: string) => location.pathname === path;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchValue(val);
    onSearch(val);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearchSubmit) {
      onSearchSubmit();
    }
  };

  const clearSearch = () => {
    setSearchValue('');
    onSearch('');
    inputRef.current?.focus();
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center space-x-2 group flex-shrink-0">
          <div className="bg-blue-600 p-2 rounded-2xl transition-all group-hover:rotate-12 group-active:scale-90 shadow-lg shadow-blue-200/50">
            <Compass className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-black text-slate-900 tracking-tighter hidden sm:block italic">NewsFlow</span>
        </Link>

        {/* Center: Repaired & Enhanced Search Bar */}
        <div className="flex-1 max-w-xl relative group">
          <div className={`flex items-center bg-slate-100/80 border transition-all duration-300 rounded-2xl px-3 h-11 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-500/10 ${searchValue ? 'border-blue-200 bg-white shadow-sm' : 'border-slate-100'}`}>
            <button 
              onClick={onSearchSubmit}
              className={`p-1.5 rounded-xl transition-colors ${searchValue ? 'text-blue-600 hover:bg-blue-50' : 'text-slate-400'}`}
              title="Global AI Search"
            >
              <Search className="w-4 h-4" />
            </button>
            
            <input 
              ref={inputRef}
              type="text" 
              value={searchValue}
              placeholder="Scan global intelligence nodes..." 
              className="flex-1 bg-transparent px-2 text-sm font-bold text-slate-800 outline-none placeholder:text-slate-400 placeholder:font-medium"
              onChange={handleSearchChange}
              onKeyDown={handleKeyDown}
            />

            {searchValue && (
              <button 
                onClick={clearSearch}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}

            <div className="hidden md:flex items-center space-x-1 ml-2 pl-3 border-l border-slate-200">
              <div className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-xs">
                <Command className="w-2.5 h-2.5 text-slate-400" />
              </div>
              <div className="bg-white border border-slate-200 px-1.5 py-0.5 rounded-md shadow-xs text-[9px] font-black text-slate-400">
                K
              </div>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
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
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Target Intel Language</p>
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
          
          {user ? (
            <div className="flex items-center space-x-2 ml-1">
              <Link to="/profile">
                <div className={`p-0.5 rounded-xl border-2 transition-all hover:scale-105 active:scale-95 ${isActive('/profile') ? 'border-blue-500 shadow-md' : 'border-transparent'}`}>
                  <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-lg object-cover" />
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-500 h-10 w-10 p-2 rounded-xl hover:text-red-500">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button size="sm" className="rounded-xl px-4 font-black shadow-lg shadow-blue-100">Join Network</Button>
          )}
        </div>
      </div>
    </nav>
  );
};
