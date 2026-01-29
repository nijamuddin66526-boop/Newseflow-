
import React, { useState, useRef, useEffect } from 'react';
import { Post, Comment } from '../types.ts';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal, 
  Clock, 
  Play,
  Pause,
  Volume2,
  VolumeX,
  Eye,
  Bookmark,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Loader2,
  Speaker,
  Zap,
  Check
} from 'lucide-react';
import { Button } from './Button.tsx';
import { generateNewsAudio } from '../services/geminiService.ts';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  allPosts: Post[];
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onUpdateLocation: (postId: string, location: any) => void;
}

// Audio helper functions for PCM data
function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, 
  currentUserId, 
  onLike, 
  onShare, 
  onSave, 
  onComment,
  onUpdateLocation
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Audio/TTS States
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);
  const audioBufferRef = useRef<AudioBuffer | null>(null);

  const isLiked = post.likes.includes(currentUserId);
  const isSaved = post.savedBy?.includes(currentUserId);

  useEffect(() => {
    return () => {
      sourceNodeRef.current?.stop();
    };
  }, []);

  const handleToggleNarration = async () => {
    if (isPlayingAudio) {
      sourceNodeRef.current?.stop();
      setIsPlayingAudio(false);
      return;
    }

    if (audioBufferRef.current && audioContextRef.current) {
      const source = audioContextRef.current.createBufferSource();
      source.buffer = audioBufferRef.current;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlayingAudio(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlayingAudio(true);
      return;
    }

    setIsNarrating(true);
    try {
      const base64Data = await generateNewsAudio(post.title, post.content);
      const audioData = decodeBase64(base64Data);
      
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      
      const buffer = await decodeAudioData(audioData, audioContextRef.current, 24000, 1);
      audioBufferRef.current = buffer;

      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlayingAudio(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlayingAudio(true);
    } catch (err) {
      console.error("Narration failed", err);
      alert("AI Narration failed. Check your network or API key.");
    } finally {
      setIsNarrating(false);
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hrs = Math.floor(mins / 60);
    const days = Math.floor(hrs / 24);
    if (days > 0) return `${days}d ago`;
    if (hrs > 0) return `${hrs}h ago`;
    if (mins > 0) return `${mins}m ago`;
    return 'Just now';
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-6 transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-50" />
          <div>
            <div className="flex items-center space-x-1">
              <h3 className="text-sm font-black text-slate-900 leading-none">{post.authorName}</h3>
              <Check className="w-3 h-3 text-blue-600 fill-blue-600" />
            </div>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">@{post.authorUsername} • {timeAgo(post.createdAt)}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-slate-100 px-3 py-1 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-wider">
            {post.category}
          </div>
          <Button variant="ghost" size="sm" className="rounded-full p-1.5 h-8 w-8">
            <MoreHorizontal className="w-5 h-5 text-slate-400" />
          </Button>
        </div>
      </div>

      {/* Content Section */}
      <div className="px-4 pb-4">
        <h2 className="text-xl font-black text-slate-900 mb-2 leading-tight tracking-tight">{post.title}</h2>
        <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-3 mb-4">{post.content}</p>
        
        {/* Media */}
        {post.type === 'PHOTO' && post.mediaUrl && (
          <div className="relative aspect-video rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 mb-4 group">
            <img src={post.mediaUrl} className="w-full h-full object-cover" alt="Visual Report" />
            <div className="absolute top-4 left-4">
              <div className="bg-black/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/20">
                Photo Dispatch
              </div>
            </div>
          </div>
        )}

        {post.type === 'VIDEO' && post.mediaUrl && (
          <div className="relative aspect-video rounded-2xl overflow-hidden bg-black mb-4">
            <video src={post.mediaUrl} controls className="w-full h-full object-contain" />
          </div>
        )}

        {/* AI Narration UI */}
        <div className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${isPlayingAudio ? 'bg-blue-600 border-blue-500 shadow-lg shadow-blue-100' : 'bg-slate-50 border-slate-100'}`}>
          <div className="flex items-center space-x-3">
            <button 
              onClick={handleToggleNarration}
              disabled={isNarrating}
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${isPlayingAudio ? 'bg-white text-blue-600' : 'bg-blue-600 text-white shadow-md'}`}
            >
              {isNarrating ? <Loader2 className="w-5 h-5 animate-spin" /> : (isPlayingAudio ? <Pause className="w-5 h-5 fill-current" /> : <Speaker className="w-5 h-5" />)}
            </button>
            <div>
              <p className={`text-[10px] font-black uppercase tracking-widest leading-none mb-1 ${isPlayingAudio ? 'text-blue-100' : 'text-slate-400'}`}>
                {isPlayingAudio ? 'Broadcasting Narration' : 'AI Audio Brief'}
              </p>
              <p className={`text-xs font-bold ${isPlayingAudio ? 'text-white' : 'text-slate-900'}`}>
                {isNarrating ? 'Generating Anchor Voice...' : (isPlayingAudio ? 'Now playing field report...' : 'Listen to this dispatch')}
              </p>
            </div>
          </div>
          {isPlayingAudio && (
            <div className="flex space-x-1 pr-2">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="w-1 bg-white/40 rounded-full animate-pulse" style={{ height: `${Math.random() * 16 + 8}px`, animationDelay: `${i * 0.1}s` }} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="px-4 py-3 border-t border-slate-50 flex items-center justify-between bg-slate-50/30">
        <div className="flex items-center space-x-4">
          <button onClick={() => onLike(post.id)} className="flex items-center space-x-1.5 group">
            <div className={`p-2 rounded-full transition-colors ${isLiked ? 'text-red-500 bg-red-50' : 'text-slate-400 group-hover:bg-slate-100'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </div>
            <span className={`text-xs font-black ${isLiked ? 'text-red-500' : 'text-slate-500'}`}>{post.likes.length}</span>
          </button>
          <button onClick={() => setShowComments(!showComments)} className="flex items-center space-x-1.5 group">
            <div className="p-2 rounded-full text-slate-400 group-hover:bg-slate-100 transition-colors">
              <MessageCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-500">{post.comments.length}</span>
          </button>
          <button onClick={() => onShare(post.id)} className="flex items-center space-x-1.5 group">
            <div className="p-2 rounded-full text-slate-400 group-hover:bg-slate-100 transition-colors">
              <Share2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-black text-slate-500">{post.shares}</span>
          </button>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-slate-300 mr-2">
            <Eye className="w-4 h-4 mr-1" />
            <span className="text-[10px] font-black uppercase tracking-widest">{(post.views / 1000).toFixed(1)}k Views</span>
          </div>
          <button onClick={() => onSave(post.id)} className={`p-2 rounded-full transition-colors ${isSaved ? 'text-blue-600 bg-blue-50' : 'text-slate-400 hover:bg-slate-100'}`}>
            <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Comments Drawer */}
      {showComments && (
        <div className="border-t border-slate-100 p-4 bg-slate-50/50 animate-in slide-in-from-top-2 duration-300">
          <div className="space-y-4 mb-4">
            {post.comments.map(comment => (
              <div key={comment.id} className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-black text-blue-600 uppercase">
                  {comment.userName.charAt(0)}
                </div>
                <div className="flex-1 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-slate-900">{comment.userName}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase">{timeAgo(comment.createdAt)}</span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium">{comment.text}</p>
                </div>
              </div>
            ))}
            {post.comments.length === 0 && (
              <p className="text-center py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">No investigative discourse yet.</p>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <input 
              type="text" 
              placeholder="Add your verified analysis..." 
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="flex-1 bg-white border border-slate-200 rounded-xl px-4 py-2 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && commentText.trim()) {
                  onComment(post.id, commentText);
                  setCommentText('');
                }
              }}
            />
            <Button size="sm" className="rounded-xl font-black h-9 px-4" onClick={() => {
              if (commentText.trim()) {
                onComment(post.id, commentText);
                setCommentText('');
              }
            }}>Reply</Button>
          </div>
        </div>
      )}
    </div>
  );
};