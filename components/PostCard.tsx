
import React, { useState } from 'react';
import { Post, Comment } from '../types.ts';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark,
  RotateCcw,
  CheckCircle2,
  Trash2,
  MoreHorizontal
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
  onDelete: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onUpdateLocation: (postId: string, location: any) => void;
  layout?: 'grid' | 'immersive';
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, currentUserId, onLike, onShare, onSave, onDelete, onComment, layout = 'grid'
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  
  const isLiked = post.likes.includes(currentUserId);
  const isSaved = post.savedBy?.includes(currentUserId);
  const isOwner = post.userId === currentUserId || post.userId === 'system-rss';

  if (layout === 'grid') {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden animate-in fade-in duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 pb-2">
          <div className="flex items-center space-x-3">
            <img src={post.authorAvatar} className="w-10 h-10 rounded-full bg-slate-100" />
            <div>
              <div className="flex items-center space-x-1">
                <h4 className="text-sm font-bold text-slate-900 hover:underline cursor-pointer">{post.authorName}</h4>
                <CheckCircle2 className="w-3 h-3 text-[#1877F2] fill-current" />
              </div>
              <p className="text-[10px] text-slate-500 font-medium">
                {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
             {isOwner && (
               <button 
                 onClick={() => onDelete(post.id)}
                 className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
                 title="Delete Post"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
             )}
             <button className="p-2 text-slate-400 hover:bg-slate-50 rounded-full">
                <MoreHorizontal className="w-5 h-5" />
             </button>
          </div>
        </div>

        {/* Content */}
        <div className="px-4 py-2">
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Media */}
        {post.mediaUrl && (
          <div className="mt-2 bg-slate-50 border-y border-slate-100 overflow-hidden max-h-[500px] flex items-center justify-center">
            <img 
              src={post.mediaUrl} 
              className="w-full object-contain" 
              alt={post.title} 
              onError={(e) => (e.currentTarget.style.display = 'none')}
            />
          </div>
        )}

        {/* Stats */}
        <div className="px-4 py-3 flex items-center justify-between text-xs text-slate-500 font-medium border-b border-slate-50">
          <div className="flex items-center space-x-1">
            <div className="bg-[#1877F2] p-1 rounded-full text-white">
               <Heart className="w-2 h-2 fill-current" />
            </div>
            <span>{post.likes.length} others liked this</span>
          </div>
          <div className="flex space-x-3">
             <span>{post.comments.length} comments</span>
             <span>{post.shares} shares</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-2 py-1 flex items-center justify-between">
           <button 
             onClick={() => onLike(post.id)}
             className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-slate-50 transition-colors ${isLiked ? 'text-[#1877F2] font-bold' : 'text-slate-600'}`}
           >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
              <span className="text-sm">Like</span>
           </button>
           <button 
             onClick={() => setShowComments(!showComments)}
             className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
           >
              <MessageCircle className="w-5 h-5" />
              <span className="text-sm">Comment</span>
           </button>
           <button 
             onClick={() => setShowShareModal(true)}
             className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-slate-50 transition-colors text-slate-600"
           >
              <Share2 className="w-5 h-5" />
              <span className="text-sm">Share</span>
           </button>
        </div>

        {/* Comments Section */}
        {showComments && (
          <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-300 border-t border-slate-50">
             <div className="space-y-4 mt-4">
                {post.comments.map(c => (
                   <div key={c.id} className="flex space-x-3">
                      <div className="w-8 h-8 rounded-full bg-[#1877F2] text-white flex items-center justify-center text-[10px] font-black uppercase flex-shrink-0">
                        {c.userName[0]}
                      </div>
                      <div className="bg-slate-100 rounded-2xl px-4 py-2 flex-1">
                        <p className="text-[11px] font-bold text-slate-900">@{c.userName}</p>
                        <p className="text-xs text-slate-700">{c.text}</p>
                      </div>
                   </div>
                ))}
                
                <div className="flex items-center space-x-2 mt-4 pt-2">
                  <img src={post.authorAvatar} className="w-8 h-8 rounded-full" />
                  <div className="flex-1 flex items-center bg-slate-100 rounded-2xl px-4 py-2">
                    <input 
                      type="text"
                      placeholder="Write a comment..."
                      className="bg-transparent text-xs w-full outline-none"
                      value={commentText}
                      onChange={e => setCommentText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && commentText.trim()) {
                          onComment(post.id, commentText);
                          setCommentText('');
                        }
                      }}
                    />
                  </div>
                </div>
             </div>
          </div>
        )}
        <ShareModal post={post} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
      </div>
    );
  }

  // Immersive layout for Shorts/Live Dispatch
  return (
    <div className="relative w-full aspect-[9/16] bg-black overflow-hidden sm:rounded-[2rem] shadow-2xl group border-b sm:border border-slate-800">
      <div className="absolute inset-0 z-0">
        {post.mediaUrl ? (
          <img src={post.mediaUrl} className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-slate-900 to-black" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/40" />
      </div>

      <div className="absolute top-0 inset-x-0 p-5 z-20 flex justify-between items-start">
        <div className="flex items-center space-x-3">
          <img src={post.authorAvatar} className="w-10 h-10 rounded-full border-2 border-white/20 shadow-lg" alt={post.authorName} />
          <div>
            <div className="flex items-center space-x-1">
              <span className="text-white text-sm font-bold tracking-tight">{post.authorName}</span>
              <CheckCircle2 className="w-3 h-3 text-[#1877F2] fill-current" />
            </div>
            <p className="text-[10px] text-white/60 font-bold uppercase tracking-widest">@{post.authorUsername}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
           {isOwner && (
             <button onClick={() => onDelete(post.id)} className="p-2 bg-black/20 hover:bg-red-500 text-white rounded-full backdrop-blur-md transition-colors">
               <Trash2 className="w-4 h-4" />
             </button>
           )}
           <div className="bg-white/10 backdrop-blur-md px-3 py-1 rounded-full text-[9px] font-black text-white uppercase tracking-wider border border-white/10">
            {post.category}
           </div>
        </div>
      </div>

      <div className="absolute right-4 bottom-24 z-20 flex flex-col items-center space-y-6">
        <button onClick={() => onLike(post.id)} className="flex flex-col items-center group">
          <div className={`p-3 rounded-full transition-all group-active:scale-125 ${isLiked ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            <Heart className={`w-6 h-6 ${isLiked ? 'fill-current' : ''}`} />
          </div>
          <span className="text-[10px] font-bold text-white mt-1">{post.likes.length}</span>
        </button>

        <button onClick={() => setShowComments(!showComments)} className="flex flex-col items-center group">
          <div className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
            <MessageCircle className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-white mt-1">{post.comments.length}</span>
        </button>

        <button onClick={() => setShowShareModal(true)} className="flex flex-col items-center group">
          <div className="p-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-all">
            <Share2 className="w-6 h-6" />
          </div>
          <span className="text-[10px] font-bold text-white mt-1">{post.shares}</span>
        </button>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-6 z-10 flex flex-col justify-end min-h-[40%] text-white pointer-events-none">
        <div className="max-w-[85%] pointer-events-auto">
          <h2 className="text-lg font-black mb-2 tracking-tight line-clamp-2 leading-tight drop-shadow-lg">{post.title}</h2>
          <p className="text-xs font-medium text-white/80 line-clamp-3 leading-relaxed drop-shadow-md">{post.content}</p>
        </div>
      </div>
      <ShareModal post={post} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
};
