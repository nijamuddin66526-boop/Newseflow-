
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Compass, Search, X, Bell, LogOut, Settings } from 'lucide-react';
import { User } from '../types.ts';
import { Button } from './Button.tsx';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSearch: (q: string) => void;
  onSearchSubmit?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  user, onLogout, onSearch, onSearchSubmit
}) => {
  const [searchValue, setSearchValue] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchSubmit?.();
  };

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm px-4 h-16 flex items-center justify-between gap-4">
      {/* Left: Branding */}
      <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
        <div className="bg-[#1877F2] w-9 h-9 rounded-full flex items-center justify-center shadow-lg shadow-blue-200">
           <Compass className="w-6 h-6 text-white fill-current" />
        </div>
        <span className="text-xl font-black text-[#1877F2] tracking-tighter hidden sm:block">NetSphere</span>
      </Link>

      {/* Center: Search */}
      <div className={`flex-1 flex justify-center ${isSearchOpen ? 'fixed inset-x-0 bg-white px-4 h-16 z-50 items-center animate-in slide-in-from-top-4' : 'max-w-xl hidden md:flex'}`}>
        <form onSubmit={handleSubmit} className="relative w-full flex items-center">
          <div className="flex-1 flex items-center bg-slate-100 rounded-full px-4 h-10 border border-transparent focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-500 transition-all">
            <Search className="w-4 h-4 text-slate-400" />
            <input 
              type="text" 
              value={searchValue}
              placeholder="Search reports and people..." 
              className="flex-1 bg-transparent px-3 text-sm font-medium text-slate-800 outline-none"
              onChange={(e) => { setSearchValue(e.target.value); onSearch(e.target.value); }}
            />
            {searchValue && (
              <X 
                className="w-4 h-4 text-slate-400 cursor-pointer hover:text-slate-600" 
                onClick={() => { setSearchValue(''); onSearch(''); }} 
              />
            )}
          </div>
          {isSearchOpen && (
            <button type="button" className="ml-2 text-slate-500 text-sm font-bold" onClick={() => setIsSearchOpen(false)}>
              Cancel
            </button>
          )}
        </form>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center space-x-2 flex-shrink-0">
        <button onClick={() => setIsSearchOpen(true)} className="md:hidden p-2.5 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
          <Search className="w-5 h-5" />
        </button>
        
        <button className="p-2.5 text-slate-600 hover:bg-slate-100 rounded-full relative transition-colors">
          <Bell className="w-6 h-6" />
          <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
        </button>

        {user && (
          <div className="relative ml-1">
            <button onClick={() => setShowMenu(!showMenu)} className="flex items-center space-x-2 group">
              <img src={user.avatar} className="w-10 h-10 rounded-full border border-slate-200 group-hover:opacity-80 transition-all shadow-sm" alt="Profile" />
            </button>
            
            {showMenu && (
              <>
                <div className="fixed inset-0 z-0" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 py-3 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-4 pb-3 border-b border-slate-50 flex items-center space-x-3">
                     <img src={user.avatar} className="w-10 h-10 rounded-full" />
                     <div className="truncate">
                        <p className="text-sm font-black text-slate-900 truncate">{user.name}</p>
                        <p className="text-[10px] font-bold text-slate-400">See your profile</p>
                     </div>
                  </div>
                  <div className="py-2">
                    <button className="w-full text-left px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50 flex items-center space-x-3">
                       <Settings className="w-4 h-4" /> <span>Settings & Privacy</span>
                    </button>
                    <button onClick={onLogout} className="w-full text-left px-4 py-2 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center space-x-3">
                       <LogOut className="w-4 h-4" /> <span>Logout</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
