
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
  Maximize,
  Minimize,
  Eye,
  Bookmark,
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  ExternalLink,
  Navigation,
  Info,
  Subtitles
} from 'lucide-react';
import { Button } from './Button.tsx';

interface PostCardProps {
  post: Post;
  currentUserId: string;
  allPosts: Post[];
  onLike: (postId: string) => void;
  onShare: (postId: string) => void;
  onSave: (postId: string) => void;
  onComment: (postId: string, text: string) => void;
  onUpdateLocation?: (postId: string, location: { name: string; lat: number; lng: number }) => void;
}

const MOCK_CAPTIONS = [
  { start: 0, end: 3, text: "Welcome to NewsFlow - Your Trusted Source for Global News." },
  { start: 3, end: 6, text: "Independent journalists bringing you the truth from every corner." },
  { start: 6, end: 10, text: "Join the conversation and stay informed with our latest updates." },
  { start: 10, end: 15, text: "Bringing you closer to the stories that matter most." }
];

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
  const [showMap, setShowMap] = useState(false);
  const [isTaggingLocation, setIsTaggingLocation] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Video and Swipe Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<number | null>(null);
  const pointerStartX = useRef<number | null>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [duration, setDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [currentCaption, setCurrentCaption] = useState<string | null>(null);
  
  // Persistent Caption State
  const [showCaptions, setShowCaptions] = useState<boolean>(() => {
    const saved = localStorage.getItem('newsflow_show_captions');
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem('newsflow_show_captions', JSON.stringify(showCaptions));
  }, [showCaptions]);

  const isLiked = post.likes.includes(currentUserId);
  const isSaved = post.savedBy?.includes(currentUserId);
  const isAuthor = post.userId === currentUserId;

  const handleTagLocation = () => {
    if (!onUpdateLocation) return;
    setIsTaggingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        onUpdateLocation(post.id, {
          name: "Verified News Hub",
          lat: latitude,
          lng: longitude
        });
        setIsTaggingLocation(false);
      },
      (error) => {
        console.error("Error tagging location:", error);
        alert("Permission denied or location unavailable.");
        setIsTaggingLocation(false);
      },
      { enableHighAccuracy: true }
    );
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

  // Video Controls
  const togglePlay = () => {
    if (videoRef.current) {
      if (videoRef.current.paused) videoRef.current.play();
      else videoRef.current.pause();
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const cur = videoRef.current.currentTime;
      setProgress((cur / videoRef.current.duration) * 100);
      
      const caption = MOCK_CAPTIONS.find(c => cur >= c.start && cur <= c.end);
      setCurrentCaption(caption ? caption.text : null);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  // Gallery Navigation with Swipe Support
  const navigateGallery = (direction: 'next' | 'prev') => {
    if (!post.galleryImages) return;
    const len = post.galleryImages.length;
    if (direction === 'next') {
      setCurrentImageIndex(prev => (prev + 1) % len);
    } else {
      setCurrentImageIndex(prev => (prev - 1 + len) % len);
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    pointerStartX.current = e.clientX;
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (pointerStartX.current === null) return;
    const diff = e.clientX - pointerStartX.current;
    const threshold = 50; // Minimum distance for a swipe

    if (Math.abs(diff) > threshold) {
      if (diff > 0) {
        navigateGallery('prev');
      } else {
        navigateGallery('next');
      }
    }
    pointerStartX.current = null;
  };

  const getMapUrl = () => {
    if (post.location?.lat && post.location?.lng) {
      return `https://maps.google.com/maps?q=${post.location.lat},${post.location.lng}&z=14&output=embed`;
    }
    if (post.location?.name) {
      return `https://maps.google.com/maps?q=${encodeURIComponent(post.location.name)}&z=14&output=embed`;
    }
    return '';
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-6 transition-all hover:shadow-md animate-in fade-in duration-500">
        {/* Post Header */}
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src={post.authorAvatar} alt={post.authorName} className="w-10 h-10 rounded-full object-cover border border-slate-100 shadow-sm" />
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-bold text-slate-900">{post.authorName}</h3>
                {post.location && (
                  <button 
                    onClick={() => setShowMap(true)}
                    className="flex items-center space-x-1 px-2 py-0.5 bg-blue-50 rounded-full group/loc transition-colors hover:bg-blue-100"
                  >
                    <MapPin className="w-3 h-3 text-blue-600 transition-transform group-hover/loc:scale-110" />
                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-tight underline">{post.location.name}</span>
                  </button>
                )}
                {!post.location && isAuthor && (
                  <button 
                    onClick={handleTagLocation}
                    disabled={isTaggingLocation}
                    className="flex items-center space-x-1 text-slate-400 hover:text-blue-600 transition-colors"
                  >
                    <MapPin className={`w-3 h-3 ${isTaggingLocation ? 'animate-pulse' : ''}`} />
                    <span className="text-[10px] font-bold uppercase tracking-tight">{isTaggingLocation ? 'Tagging...' : 'Add Location'}</span>
                  </button>
                )}
              </div>
              <div className="flex items-center space-x-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <span>@{post.authorUsername}</span>
                <span>•</span>
                <div className="flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  {timeAgo(post.createdAt)}
                </div>
              </div>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full p-2 h-8 w-8">
            <MoreHorizontal className="w-4 h-4 text-slate-400" />
          </Button>
        </div>

        {/* Post Content */}
        <div className="px-4 pb-3">
          <div className="mb-2">
            <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[9px] font-black uppercase tracking-[0.2em] rounded mb-1">{post.category}</span>
            <h2 className="text-lg font-black text-slate-900 leading-tight tracking-tight">{post.title}</h2>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">{post.content}</p>
        </div>

        {/* Media Rendering */}
        <div className="relative">
          {post.type === 'PHOTO' && post.galleryImages && (
            <div 
              className="relative aspect-video bg-slate-100 group overflow-hidden touch-pan-y"
              onPointerDown={handlePointerDown}
              onPointerUp={handlePointerUp}
              onPointerLeave={() => pointerStartX.current = null}
              style={{ cursor: post.galleryImages.length > 1 ? 'grab' : 'default' }}
            >
              <img 
                src={post.galleryImages[currentImageIndex]} 
                alt={`Gallery ${currentImageIndex + 1}`} 
                className="w-full h-full object-cover transition-all duration-500 ease-out select-none"
                draggable="false"
              />
              {post.galleryImages.length > 1 && (
                <>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigateGallery('prev'); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/60 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-10 hidden sm:block"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button 
                    onClick={(e) => { e.stopPropagation(); navigateGallery('next'); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/60 backdrop-blur-md p-2 rounded-full text-white opacity-0 group-hover:opacity-100 transition-all z-10 hidden sm:block"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10">
                    {post.galleryImages.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentImageIndex ? 'bg-white w-4' : 'bg-white/40 w-1.5'}`} 
                      />
                    ))}
                  </div>
                  <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] font-black text-white uppercase tracking-widest z-10">
                    {currentImageIndex + 1} / {post.galleryImages.length}
                  </div>
                </>
              )}
            </div>
          )}

          {post.type === 'VIDEO' && post.mediaUrl && (
            <div 
              ref={containerRef}
              className="relative aspect-video bg-black group overflow-hidden"
              onMouseMove={() => { setShowControls(true); clearTimeout(controlsTimeoutRef.current!); controlsTimeoutRef.current = window.setTimeout(() => setShowControls(false), 3000) }}
            >
              <video 
                ref={videoRef}
                src={post.mediaUrl}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
              
              {/* Overlay Controls */}
              <div className={`absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-4 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>
                {showCaptions && currentCaption && (
                  <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur-sm px-4 py-2 rounded-xl text-white text-xs font-medium text-center max-w-[80%] border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {currentCaption}
                  </div>
                )}
                
                <div className="flex items-center space-x-4 mb-2">
                  <button onClick={togglePlay} className="text-white hover:scale-110 transition-transform">
                    {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                  </button>
                  <div className="flex-1 h-1.5 bg-white/30 rounded-full relative overflow-hidden group/seek">
                    <div 
                      className="absolute left-0 top-0 bottom-0 bg-blue-500 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex items-center space-x-3">
                    <button 
                      onClick={() => setShowCaptions(!showCaptions)} 
                      className={`transition-all hover:scale-110 ${showCaptions ? 'text-blue-400' : 'text-white opacity-50'}`}
                      title={showCaptions ? "Disable Captions" : "Enable Captions"}
                    >
                      <Subtitles className="w-5 h-5" />
                    </button>
                    <button onClick={toggleMute} className="text-white hover:scale-110 transition-transform">
                      {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>
              
              {!isPlaying && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-16 h-16 bg-blue-600/90 rounded-full flex items-center justify-center text-white shadow-2xl">
                    <Play className="w-8 h-8 fill-current ml-1" />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-6">
              <button 
                onClick={() => onLike(post.id)}
                className={`flex items-center space-x-2 transition-colors ${isLiked ? 'text-red-500' : 'text-slate-500 hover:text-red-500'}`}
              >
                <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
                <span className="text-xs font-black">{post.likes.length}</span>
              </button>
              <button 
                onClick={() => setShowComments(!showComments)}
                className="flex items-center space-x-2 text-slate-500 hover:text-blue-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                <span className="text-xs font-black">{post.comments.length}</span>
              </button>
              <button 
                onClick={() => onShare(post.id)}
                className="flex items-center space-x-2 text-slate-500 hover:text-emerald-600 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-xs font-black">{post.shares}</span>
              </button>
            </div>
            <button 
              onClick={() => onSave(post.id)}
              className={`transition-colors ${isSaved ? 'text-blue-600' : 'text-slate-500 hover:text-blue-600'}`}
            >
              <Bookmark className={`w-5 h-5 ${isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>

          {/* Comment Section */}
          {showComments && (
            <div className="pt-4 border-t border-slate-100 animate-in slide-in-from-top-2">
              <form 
                onSubmit={(e) => { e.preventDefault(); if(commentText.trim()) { onComment(post.id, commentText); setCommentText(''); } }}
                className="flex space-x-3 mb-4"
              >
                <div className="flex-1 relative">
                  <input 
                    type="text" 
                    placeholder="Contribute to the intelligence..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <Button size="sm" type="submit" disabled={!commentText.trim()}>Post</Button>
              </form>
              <div className="space-y-4 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex space-x-3">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold">
                      {comment.userName.charAt(0)}
                    </div>
                    <div className="flex-1 bg-slate-50 rounded-2xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-black text-slate-900">{comment.userName}</span>
                        <span className="text-[9px] text-slate-400 font-bold">{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Interactive Map Modal */}
      {showMap && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-600 p-2 rounded-xl">
                  <Navigation className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-black text-slate-900">Verified Dispatch Location</h2>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{post.location?.name}</p>
                </div>
              </div>
              <button onClick={() => setShowMap(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
            
            <div className="aspect-video bg-slate-100 relative group">
              <iframe 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                style={{ border: 0 }} 
                src={getMapUrl()} 
                allowFullScreen
                className="grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
              />
              <div className="absolute top-4 right-4 flex flex-col space-y-2">
                <a 
                  href={`https://www.google.com/maps/search/?api=1&query=${post.location?.lat || post.location?.name},${post.location?.lng || ''}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white px-4 py-2 rounded-xl shadow-lg border border-slate-200 flex items-center space-x-2 text-xs font-bold text-slate-900 hover:bg-slate-50 transition-all hover:scale-105"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open in Navigation</span>
                </a>
              </div>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100 grid grid-cols-2 gap-4">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dispatch Status</h4>
                  <p className="text-xs font-bold text-slate-900">Verified Field Presence</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Coverage Hub</h4>
                  <p className="text-xs font-bold text-slate-900">Active Reporting Zone</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
