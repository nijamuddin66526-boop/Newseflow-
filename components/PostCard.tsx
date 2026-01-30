
import React, { useState, useRef, useEffect } from 'react';
import { Post, Comment } from '../types.ts';
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  Speaker,
  Bookmark,
  Loader2,
  Languages,
  RotateCcw,
  Volume2,
  CheckCircle2,
  Navigation,
  MoreVertical,
  Play
} from 'lucide-react';
import { Button } from './Button.tsx';
import { generateNewsAudio, translateDispatch } from '../services/geminiService.ts';
import { ShareModal } from './ShareModal.tsx';
import { SUPPORTED_LANGUAGES } from '../constants.ts';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  allPosts: Post[];
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onUpdateLocation: (postId: string, location: any) => void;
  targetLanguage: string;
  autoTranslate: boolean;
  layout?: 'grid' | 'immersive';
}

function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer, data.byteOffset, data.byteLength / 2);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

export const PostCard: React.FC<PostCardProps> = ({ 
  post, currentUserId, onLike, onShare, onSave, onComment, targetLanguage, autoTranslate, layout = 'grid'
}) => {
  const [showComments, setShowComments] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);
  const [translatedData, setTranslatedData] = useState<{ title: string; content: string } | null>(null);
  const [showOriginal, setShowOriginal] = useState(true);
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);

  const isLiked = post.likes.includes(currentUserId);
  const isSaved = post.savedBy?.includes(currentUserId);
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === targetLanguage) || SUPPORTED_LANGUAGES[0];

  const handleTranslate = async () => {
    if (translatedData) { setShowOriginal(false); return; }
    setIsTranslating(true);
    try {
      const result = await translateDispatch(post.title, post.content, currentLangObj.name);
      setTranslatedData(result);
      setShowOriginal(false);
    } catch (err) { console.error(err); }
    finally { setIsTranslating(false); }
  };

  useEffect(() => {
    if (autoTranslate && targetLanguage !== 'en' && !translatedData && !isTranslating) handleTranslate();
    else if (targetLanguage === 'en') setShowOriginal(true);
  }, [autoTranslate, targetLanguage, post.id]);

  const handleToggleNarration = async () => {
    const titleToRead = showOriginal ? post.title : (translatedData?.title || post.title);
    const contentToRead = showOriginal ? post.content : (translatedData?.content || post.content);
    if (isPlayingAudio) { sourceNodeRef.current?.stop(); setIsPlayingAudio(false); return; }
    setIsNarrating(true);
    try {
      const base64Data = await generateNewsAudio(titleToRead, contentToRead);
      if (!audioContextRef.current) audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      const buffer = await decodeAudioData(decodeBase64(base64Data), audioContextRef.current, 24000, 1);
      const source = audioContextRef.current.createBufferSource();
      source.buffer = buffer;
      source.connect(audioContextRef.current.destination);
      source.onended = () => setIsPlayingAudio(false);
      source.start();
      sourceNodeRef.current = source;
      setIsPlayingAudio(true);
    } catch (err) { alert("Narration failed."); }
    finally { setIsNarrating(false); }
  };

  const displayedTitle = showOriginal ? post.title : (translatedData?.title || post.title);
  const displayedContent = showOriginal ? post.content : (translatedData?.content || post.content);

  // Layout: GRID (YouTube Home style)
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
          {post.type === 'VIDEO' && (
            <div className="absolute bottom-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-bold text-white">
              0:15
            </div>
          )}
        </div>
        <div className="flex space-x-3 mt-3 px-1 pb-4">
          <img src={post.authorAvatar} className="w-9 h-9 rounded-full bg-slate-200 border border-slate-100 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors">
              {displayedTitle}
            </h3>
            <div className="flex items-center space-x-1 mt-1">
              <span className="text-xs text-slate-500 font-medium truncate">{post.authorName}</span>
              <CheckCircle2 className="w-3 h-3 text-slate-400" />
            </div>
            <div className="text-[11px] text-slate-500 font-medium flex items-center space-x-1">
              <span>{(post.views / 1000).toFixed(1)}k views</span>
              <span>•</span>
              <span>1 day ago</span>
            </div>
          </div>
          <button className="h-fit p-1 text-slate-400 hover:text-slate-900">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // Layout: IMMERSIVE (YouTube Shorts style)
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
          <div className={`p-3 rounded-full transition-all group-active:scale-125 ${isLiked ? 'bg-red-500 text-white' : 'bg-white/10 text-white hover:bg-white/20'}`}>
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

        <button onClick={handleToggleNarration} disabled={isNarrating} className="flex flex-col items-center group">
          <div className={`p-3 rounded-full transition-all ${isPlayingAudio ? 'bg-emerald-500 text-white animate-pulse' : 'bg-white/10 text-white hover:bg-white/20'}`}>
            {isNarrating ? <Loader2 className="w-6 h-6 animate-spin" /> : (isPlayingAudio ? <Volume2 className="w-6 h-6" /> : <Speaker className="w-6 h-6" />)}
          </div>
        </button>
      </div>

      <div className="absolute bottom-0 inset-x-0 p-6 z-10 flex flex-col justify-end min-h-[40%] text-white pointer-events-none">
        <div className="max-w-[85%] pointer-events-auto">
          {targetLanguage !== 'en' && (
            <button 
              onClick={showOriginal ? handleTranslate : () => setShowOriginal(true)}
              className="mb-3 flex items-center space-x-2 px-3 py-1 rounded-lg bg-blue-600/30 border border-blue-400/30 text-[9px] font-black uppercase tracking-widest text-blue-200"
            >
              {isTranslating ? <Loader2 className="w-2.5 h-2.5 animate-spin" /> : <Languages className="w-2.5 h-2.5" />}
              <span>{showOriginal ? `Translate to ${currentLangObj.native}` : 'Original Intel'}</span>
            </button>
          )}
          <h2 className="text-xl font-black mb-2 tracking-tight line-clamp-2 leading-tight drop-shadow-lg">{displayedTitle}</h2>
          <p className="text-sm font-medium text-white/80 line-clamp-3 leading-relaxed drop-shadow-md">{displayedContent}</p>
        </div>
      </div>

      {showComments && (
        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-white z-50 rounded-t-[2.5rem] p-6 animate-in slide-in-from-bottom duration-300 pointer-events-auto">
          <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-6" onClick={() => setShowComments(false)} />
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-black text-slate-900 uppercase text-xs tracking-widest">Analysis Feed ({post.comments.length})</h3>
            <button onClick={() => setShowComments(false)} className="text-slate-400 hover:text-slate-900">
              <RotateCcw className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4 h-[calc(100%-120px)] overflow-y-auto no-scrollbar">
            {post.comments.map(c => (
              <div key={c.id} className="flex space-x-3">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black uppercase">{c.userName[0]}</div>
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
              className="flex-1 bg-slate-100 rounded-xl px-4 py-2 text-xs outline-none focus:ring-1 focus:ring-blue-500" placeholder="Dispatch comment..."
            />
            <Button size="sm" onClick={() => { if(commentText.trim()) { onComment(post.id, commentText); setCommentText(''); } }}>Send</Button>
          </div>
        </div>
      )}

      <ShareModal post={post} isOpen={showShareModal} onClose={() => setShowShareModal(false)} />
    </div>
  );
};
