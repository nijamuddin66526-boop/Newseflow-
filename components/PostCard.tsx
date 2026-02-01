
import React, { useState } from 'react';
import { Post, Comment } from '../types.ts';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  RotateCcw,
  CheckCircle2,
  MoreVertical
} from 'lucide-react';
import { Button } from './Button.tsx';
import { ShareModal } from './ShareModal.tsx';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  allPosts: Post[];
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onUpdateLocation: (postId: string, location: any) => void;
  layout?: 'grid' | 'immersive';
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, currentUserId, onLike, onShare, onSave, onComment, layout = 'grid'
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  const isLiked = post.likes.includes(currentUserId);
  const isSaved = post.savedBy?.includes(currentUserId);

  if (layout === 'grid') {
    return (
      <div className="bg-white group cursor-pointer animate-in fade-in zoom-in-95 duration-300">
        <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 shadow-sm">
          {post.mediaUrl ? (
            <img src={post.mediaUrl} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          ) : (
            <div className="w-full h-full bg-slate-900 flex items-center justify-center p-6 text-center">
              <p className="text-white text-xs font-black uppercase tracking-widest line-clamp-3">{post.title}</p>
            </div>
          )}
        </div>
        <div className="flex space-x-3 mt-3 px-1 pb-4">
          <img src={post.authorAvatar} className="w-9 h-9 rounded-full bg-slate-200 border border-slate-100 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
              {post.title}
            </h3>
            <div className="flex items-center space-x-1 mt-1 text-[11px] text-slate-500 font-medium">
              <span>{post.authorName}</span>
              <span>•</span>
              <span>{(post.views / 1000).toFixed(1)}k views</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative w-full aspect-[9/16] bg-black overflow-hidden sm:rounded-[2.5rem] shadow-2xl group border-b sm:border border-slate-800">
      <div className="absolute inset-0 z-0">
        {post.type === 'VIDEO' && post.mediaUrl ? (
          <video src={post.mediaUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-80" />
        ) : post.mediaUrl ? (
          <img src={post.mediaUrl} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-slate-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
      </div>

      <div className="absolute top-0 inset-x-0 p-5 z-20 flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <img src={post.authorAvatar} className="w-10 h-10 rounded-full border-2 border-white/20" alt={post.authorName} />
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-white text-sm font-black tracking-tight">{post.authorName}</span>
              <CheckCircle2 className="w-3 h-3 text-blue-400 fill-current" />
            </div>
            <p className="text-[10px] text-white/60 font-black uppercase tracking-widest">@{post.authorUsername}</p>
          </div>
        </div>
        <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-wider border border-white/10">
          {post.category}
        </div>
      </div>

      <div className="absolute right-3 bottom-24 z-20 flex flex-col items-center space-y-6">
        <button onClick={() => onLike(post.id)} className="flex flex-col items-center group">
          <div className={`p-3 rounded-full transition-all group-active:scale-125 ${isLiked ? 'bg-red-500 text-white shadow-lg' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[10px] font-black text-white mt-1 drop-shadow-md">{post.likes.length}</span>
        </button>

        <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center group">
          <div className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black text-white mt-1 drop-shadow-md">{post.comments.length}</span>
        </button>

        <button onClick={() => setShowShareModal(true)} className="flex flex-col items-center group">
          <div className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-black text-white mt-1 drop-shadow-md">{post.shares}</span>
        </button>

        <button onClick={() => onSave(post.id)} className="flex flex-col items-center group">
          <div className={`p-3 rounded-full transition-all ${isSaved ? 'bg-blue-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            <Bookmark className={`w-6 h-6 ${isSaved ? 'fill-current' : ''}`} />
          </div>
        </button>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-6 z-10 flex flex-col justify-end min-h-[40%] text-white pointer-events-none">
        <div className="max-w-[85%] pointer-events-auto">
          <h2 className="text-xl font-black mb-2 tracking-tight line-clamp-2 leading-tight drop-shadow-lg">{post.title}</h2>
          <p className="text-sm font-medium text-white/80 line-clamp-3 leading-relaxed drop-shadow-md">{post.content}</p>
        </div>
      </div>

      {showComments && (
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-white z-50 rounded-t-[2.5rem] p-6 animate-in slide-in-from-bottom duration-300 pointer-events-auto">
          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" onClick={() => setShowComments(false)} />
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Discussion ({post.comments.length})</h3>
            <button onClick={() => setShowComments(false)} className="p-2 text-slate-400 hover:text-slate-900">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4 h-[calc(100%-120px)] overflow-y-auto no-scrollbar">
            {post.comments.map(c => (
              <div key={c.id} className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-black uppercase">{c.userName[0]}</div>
                <div className="flex-1">
                  <p className="text-[10px] font-black text-slate-900">@{c.userName}</p>
                  <p className="text-xs text-slate-600 font-medium">{c.text}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="absolute bottom-6 inset-x-6 flex items-center space-x-2">
            <input 
              value={commentText} onChange={e => setCommentText(e.target.value)}
              className="flex-1 bg-slate-100 rounded-xl px-4 py-3 text-xs outline-none focus:ring-1 focus:ring-blue-500" placeholder="Type a message..."
            />
            <Button size="sm" className="rounded-xl px-6 h-10 font-bold" onClick={() => { if(commentText.trim()) { onComment(post.id, commentText); setCommentText(''); } }}>Post</Button>
          </div>
        </div>
      )}

      <ShareModal post={post} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
};
