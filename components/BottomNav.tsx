
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Bookmark, User as UserIcon, TrendingUp, Plus } from 'lucide-react';

interface BottomNavProps {
  onAddClick: () => void;
  viewMode: 'HOME' | 'SHORTS';
  onViewChange: (view: 'HOME' | 'SHORTS') => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onAddClick, viewMode, onViewChange }) => {
  const location = useLocation();
  const isProfile = location.pathname === '/profile';
  const isGuidelines = location.pathname === '/guidelines';

  return (
    <div className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 px-6 py-2 z-40 lg:hidden flex items-center justify-between">
      <Link 
        to="/" 
        onClick={() => onViewChange('HOME')}
        className={`flex flex-col items-center space-y-1 ${viewMode === 'HOME' && !isProfile && !isGuidelines ? 'text-black font-black' : 'text-slate-400 font-medium'}`}
      >
        <Home className={`w-6 h-6 ${viewMode === 'HOME' && !isProfile && !isGuidelines ? 'fill-current' : ''}`} />
        <span className="text-[9px] uppercase tracking-tighter">Home</span>
      </Link>
      
      <Link 
        to="/" 
        onClick={() => onViewChange('SHORTS')}
        className={`flex flex-col items-center space-y-1 ${viewMode === 'SHORTS' && !isProfile && !isGuidelines ? 'text-black font-black' : 'text-slate-400 font-medium'}`}
      >
        <TrendingUp className={`w-6 h-6 ${viewMode === 'SHORTS' && !isProfile && !isGuidelines ? 'fill-current' : ''}`} />
        <span className="text-[9px] uppercase tracking-tighter">Shorts</span>
      </Link>

      <button 
        onClick={onAddClick}
        className="bg-slate-100 text-black w-10 h-10 rounded-full flex items-center justify-center active:scale-90 transition-transform"
      >
        <Plus className="w-7 h-7" />
      </button>

      <Link 
        to="/guidelines" 
        className={`flex flex-col items-center space-y-1 ${isGuidelines ? 'text-black font-black' : 'text-slate-400 font-medium'}`}
      >
        <Bookmark className={`w-6 h-6 ${isGuidelines ? 'fill-current' : ''}`} />
        <span className="text-[9px] uppercase tracking-tighter">Saved</span>
      </Link>

      <Link 
        to="/profile" 
        className={`flex flex-col items-center space-y-1 ${isProfile ? 'text-black font-black' : 'text-slate-400 font-medium'}`}
      >
        <UserIcon className={`w-6 h-6 ${isProfile ? 'fill-current' : ''}`} />
        <span className="text-[9px] uppercase tracking-tighter">You</span>
      </Link>
    </div>
  );
};
