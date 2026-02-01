
import React, { useState, useRef } from 'react';
import { PostType, User } from '../types.ts';
import { 
  Type, 
  Image as ImageIcon, 
  Video, 
  X,
  Camera,
  Square,
  RefreshCcw,
  MapPin,
  Compass
} from 'lucide-react';
import { Button } from './Button.tsx';
import { NEWS_CATEGORIES } from '../constants.ts';

interface CreatePostProps {
  currentUser: User;
  onPostCreated: (post: {
    type: PostType;
    category: string;
    title: string;
    content: string;
    mediaUrl?: string;
    location?: { name: string; lat: number; lng: number };
    thumbnailUrl?: string;
  }) => void;
  onClose: () => void;
}

type VideoQuality = '720p' | '1080p';

export const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreated, onClose }) => {
  const [type, setType] = useState<PostType>('BLOG');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(NEWS_CATEGORIES[0]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [location, setLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // Recording states
  const [isRecordingMode, setIsRecordingMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [videoQuality, setVideoQuality] = useState<VideoQuality>('720p');
  const [recordedVideoUrl, setRecordedVideoUrl] = useState<string | null>(null);
  const [videoThumbnail, setVideoThumbnail] = useState<string | null>(null);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  
  const videoPreviewRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !content) return;
    
    onPostCreated({
      type,
      category,
      title,
      content,
      mediaUrl: recordedVideoUrl || mediaUrl || undefined,
      location: location || undefined,
      thumbnailUrl: videoThumbnail || undefined
    });

    handleClose();
  };

  const handleClose = () => {
    setTitle('');
    setContent('');
    setMediaUrl('');
    setLocation(null);
    stopStream();
    setRecordedVideoUrl(null);
    setVideoThumbnail(null);
    setIsRecordingMode(false);
    setIsRecording(false);
    onClose();
  };

  const fetchLocation = () => {
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          name: "Verified Dispatch Field",
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
        setIsFetchingLocation(false);
      },
      () => {
        alert("Failed to access location services.");
        setIsFetchingLocation(false);
      }
    );
  };

  const generateThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      video.onloadeddata = () => { video.currentTime = 0.1; };
      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else resolve('');
      };
      video.onerror = () => resolve('');
    });
  };

  const startStream = async () => {
    try {
      const constraints = {
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } }, 
        audio: true 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoPreviewRef.current) videoPreviewRef.current.srcObject = stream;
      setIsRecordingMode(true);
    } catch (err) {
      setRecordingError("Access denied.");
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoPreviewRef.current) videoPreviewRef.current.srcObject = null;
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const options = { mimeType: 'video/webm' };
    const recorder = new MediaRecorder(streamRef.current, options);
    recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: 'video/webm' });
      const reader = new FileReader();
      reader.onloadend = async () => {
        const videoDataUrl = reader.result as string;
        setRecordedVideoUrl(videoDataUrl);
        const thumb = await generateThumbnail(videoDataUrl);
        setVideoThumbnail(thumb);
      };
      reader.readAsDataURL(blob);
    };
    mediaRecorderRef.current = recorder;
    recorder.start();
    setIsRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopStream();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-white/20">
        <div className="px-8 py-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center space-x-3">
            <div className="bg-blue-600 p-2 rounded-2xl shadow-lg shadow-blue-200">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Create Post</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{currentUser.name}</p>
            </div>
          </div>
          <button onClick={handleClose} className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 transition-all">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            {(['BLOG', 'PHOTO', 'VIDEO'] as PostType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setType(t); if (t !== 'VIDEO') { setIsRecordingMode(false); stopStream(); } }}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-black transition-all ${type === t ? 'bg-white text-blue-600 shadow-md' : 'text-slate-500'}`}
              >
                {t === 'BLOG' && <Type className="w-4 h-4" />}
                {t === 'PHOTO' && <ImageIcon className="w-4 h-4" />}
                {t === 'VIDEO' && <Video className="w-4 h-4" />}
                <span className="uppercase tracking-widest">{t}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black outline-none appearance-none cursor-pointer"
              >
                {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Location</label>
              <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-3 px-2">
                  <MapPin className={`w-4 h-4 ${location ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-tight truncate max-w-[80px] ${location ? 'text-blue-600' : 'text-slate-500'}`}>
                    {location ? 'Tagged' : 'None'}
                  </span>
                </div>
                <button type="button" onClick={fetchLocation} disabled={isFetchingLocation} className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 text-[9px] font-black text-blue-600 uppercase">
                  {isFetchingLocation ? '...' : 'Tag'}
                </button>
              </div>
            </div>
          </div>

          {type === 'PHOTO' && (
            <div className="space-y-4">
              <input 
                type="text"
                placeholder="Paste image link..."
                value={mediaUrl}
                onChange={(e) => setMediaUrl(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium outline-none"
              />
              {mediaUrl && (
                <div className="relative aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-slate-200 group">
                  <img src={mediaUrl} className="w-full h-full object-cover" alt="Preview" />
                  <button type="button" onClick={() => setMediaUrl('')} className="absolute top-4 right-4 bg-white/20 backdrop-blur-md w-10 h-10 rounded-2xl flex items-center justify-center text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {type === 'VIDEO' && (
            <div className="space-y-4">
              {!isRecordingMode && !recordedVideoUrl && (
                <Button type="button" onClick={startStream} fullWidth className="rounded-2xl h-12 font-black shadow-lg">
                  <Camera className="w-4 h-4 mr-2" /> Open Camera
                </Button>
              )}
              {isRecordingMode && !recordedVideoUrl && (
                <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden border-4 border-slate-900">
                  <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  <div className="absolute inset-x-0 bottom-8 flex items-center justify-center">
                    {!isRecording ? (
                      <button type="button" onClick={startRecording} className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-2xl border-4 border-slate-900">
                        <div className="w-4 h-4 bg-red-600 rounded-full" />
                      </button>
                    ) : (
                      <button type="button" onClick={stopRecording} className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-4 border-slate-900">
                        <Square className="w-4 h-4 text-red-600 fill-current" />
                      </button>
                    )}
                  </div>
                </div>
              )}
              {recordedVideoUrl && (
                <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden border-4 border-blue-600">
                  <video src={recordedVideoUrl} controls className="w-full h-full object-contain" />
                  <button type="button" onClick={() => { setRecordedVideoUrl(null); startStream(); }} className="absolute top-4 right-4 bg-white/20 p-3 rounded-2xl text-white">
                    <RefreshCcw className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <input 
            type="text"
            placeholder="Headline..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border-b-2 border-slate-100 px-0 py-3 text-2xl font-black focus:border-blue-600 outline-none placeholder:text-slate-200 transition-colors bg-transparent"
            required
          />

          <textarea 
            placeholder="Write your content here..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full min-h-[160px] bg-slate-50 border border-slate-200 rounded-[1.5rem] px-5 py-4 text-sm font-medium outline-none resize-none shadow-inner"
            required
          />

          <Button type="submit" fullWidth size="lg" className="rounded-[1.5rem] h-16 font-black text-lg">
            Post to Feed
          </Button>
        </form>
      </div>
    </div>
  );
};
