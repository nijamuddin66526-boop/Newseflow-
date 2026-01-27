
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, Home, Bell, MessageSquare, User as UserIcon, LogOut, Search } from 'lucide-react';
import { User } from '../types.ts';
import { Button } from './Button.tsx';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSearch: (q: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onSearch }) => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo */}
        <Link to="/" className="flex items-center space-x-2 group">
          <div className="bg-blue-600 p-1.5 rounded-lg transition-transform group-hover:scale-105">
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
            className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            onChange={(e) => onSearch(e.target.value)}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Link to="/">
            <Button variant="ghost" size="sm" className={`rounded-full p-2 h-10 w-10 ${isActive('/') ? 'text-blue-600 bg-blue-50' : 'text-slate-500'}`}>
              <Home className="w-5 h-5" />
            </Button>
          </Link>
          <Button variant="ghost" size="sm" className="rounded-full p-2 h-10 w-10 text-slate-500">
            <Bell className="w-5 h-5" />
          </Button>
          
          {user ? (
            <div className="flex items-center space-x-2 ml-2">
              <Link to="/profile">
                <div className={`p-0.5 rounded-full border-2 transition-colors ${isActive('/profile') ? 'border-blue-500' : 'border-transparent'}`}>
                  <img src={user.avatar} alt="Profile" className="w-8 h-8 rounded-full object-cover" />
                </div>
              </Link>
              <Button variant="ghost" size="sm" onClick={onLogout} className="text-slate-500 h-10 w-10 p-2 rounded-full">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          ) : (
            <Button size="sm" className="rounded-full px-4">Sign In</Button>
          )}
        </div>
      </div>
    </nav>
  );
};
