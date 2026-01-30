
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Search, Globe, ChevronDown, Check, Zap, X, Bell, User as UserIcon } from 'lucide-react';
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
  user, onSearch, onSearchSubmit, currentLanguage, onLanguageChange, autoTranslate, onAutoTranslateChange
}) => {
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage) || SUPPORTED_LANGUAGES[0];

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-100 px-4 h-16 flex items-center justify-between gap-4">
      {/* Left: Branding */}
      <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
        <Compass className="w-7 h-7 text-blue-600 fill-current" />
        <span className="text-xl font-black text-slate-900 tracking-tighter italic">NewsFlow</span>
      </Link>

      {/* Center: Expandable Search (YouTube Style) */}
      <div className={`flex-1 flex justify-center ${isSearchOpen ? 'fixed inset-x-0 bg-white px-4 h-16 z-50 items-center' : 'max-w-md hidden md:flex'}`}>
        <div className="relative w-full flex items-center">
          <div className="flex-1 flex items-center bg-slate-100 rounded-full px-4 h-10 border border-transparent focus-within:bg-white focus-within:border-blue-500/20 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchValue}
              placeholder="Search reports..." 
              className="flex-1 bg-transparent px-3 text-sm font-bold text-slate-800 outline-none"
              onChange={(e) => { setSearchValue(e.target.value); onSearch(e.target.value); }}
              onKeyDown={(e) => e.key === 'Enter' && onSearchSubmit?.()}
            />
            {searchValue && <X className="w-4 h-4 text-slate-400 cursor-pointer" onClick={() => { setSearchValue(''); onSearch(''); }} />}
          </div>
          {isSearchOpen && <Button variant="ghost" className="ml-2" onClick={() => setIsSearchOpen(false)}>Cancel</Button>}
        </div>
      </div>

      {/* Right: Icon Actions */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button onClick={() => setIsSearchOpen(true)} className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-full">
          <Search className="w-6 h-6" />
        </button>
        
        <button onClick={() => setIsLangOpen(!isLangOpen)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full group flex items-center">
          <Globe className="w-6 h-6" />
          <span className="hidden lg:block text-[10px] font-black ml-1 uppercase">{currentLangObj.native}</span>
        </button>

        <button onClick={() => onAutoTranslateChange(!autoTranslate)} className={`p-2 rounded-full ${autoTranslate ? 'text-blue-600 bg-blue-50' : 'text-slate-600 hover:bg-slate-100'}`}>
          <Zap className={`w-6 h-6 ${autoTranslate ? 'fill-current' : ''}`} />
        </button>

        <button className="p-2 text-slate-600 hover:bg-slate-100 rounded-full relative">
          <Bell className="w-6 h-6" />
          <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {user && (
          <Link to="/profile" className="ml-2 hidden sm:block">
            <img src={user.avatar} className="w-8 h-8 rounded-full border border-slate-200" alt="Me" />
          </Link>
        )}
      </div>

      {/* Language Modal */}
      {isLangOpen && (
        <>
          <div className="fixed inset-0 z-50 bg-black/20" onClick={() => setIsLangOpen(false)} />
          <div className="absolute right-4 top-16 w-48 bg-white border rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                onClick={() => { onLanguageChange(lang.code); setIsLangOpen(false); }}
                className="w-full px-4 py-2 text-left flex items-center justify-between hover:bg-slate-50"
              >
                <span className="text-xs font-black text-slate-700">{lang.native}</span>
                {currentLanguage === lang.code && <Check className="w-4 h-4 text-blue-600" />}
              </button>
            ))}
          </div>
        </>
      )}
    </nav>
  );
};
