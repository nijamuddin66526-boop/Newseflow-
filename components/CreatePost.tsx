
import React, { useState, useRef, useEffect } from 'react';
import { PostType, User } from '../types.ts';
import { 
  Type, 
  Image as ImageIcon, 
  Video, 
  X,
  Plus,
  Camera,
  Mic,
  Square,
  RefreshCcw,
  Check,
  AlertCircle,
  Settings2,
  Monitor,
  Compass,
  MapPin,
  Play,
  Sparkles,
  Loader2,
  Zap
} from 'lucide-react';
import { Button } from './Button.tsx';
import { NEWS_CATEGORIES } from '../constants.ts';
import { generateAIImage } from '../services/geminiService.ts';

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
type PhotoSource = 'URL' | 'AI';

export const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreated, onClose }) => {
  const [type, setType] = useState<PostType>('BLOG');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState(NEWS_CATEGORIES[0]);
  const [mediaUrl, setMediaUrl] = useState('');
  const [location, setLocation] = useState<{ name: string; lat: number; lng: number } | null>(null);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  // AI Image states
  const [photoSource, setPhotoSource] = useState<PhotoSource>('URL');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const [aiImageError, setAiImageError] = useState<string | null>(null);

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
    setAiPrompt('');
    setPhotoSource('URL');
    setLocation(null);
    stopStream();
    setRecordedVideoUrl(null);
    setVideoThumbnail(null);
    setIsRecordingMode(false);
    setIsRecording(false);
    setRecordingError(null);
    setAiImageError(null);
    onClose();
  };

  const handleGenerateImage = async () => {
    if (!aiPrompt.trim()) return;
    setIsGeneratingImage(true);
    setAiImageError(null);
    try {
      const imageUrl = await generateAIImage(aiPrompt);
      setMediaUrl(imageUrl);
    } catch (err) {
      setAiImageError("Intelligence network timeout. Could not generate visual dispatch.");
    } finally {
      setIsGeneratingImage(false);
    }
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
      (error) => {
        console.error("Geolocation error:", error);
        alert("Failed to access location services.");
        setIsFetchingLocation(false);
      },
      { enableHighAccuracy: true }
    );
  };

  const generateThumbnail = (videoUrl: string): Promise<string> => {
    return new Promise((resolve) => {
      const video = document.createElement('video');
      video.src = videoUrl;
      video.muted = true;
      video.playsInline = true;
      
      video.onloadeddata = () => {
        video.currentTime = 0.1;
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve('');
        }
      };

      video.onerror = () => resolve('');
    });
  };

  const startStream = async () => {
    try {
      setRecordingError(null);
      const constraints = {
        video: { 
          facingMode: 'user', 
          width: { ideal: videoQuality === '1080p' ? 1920 : 1280 }, 
          height: { ideal: videoQuality === '1080p' ? 1080 : 720 } 
        }, 
        audio: true 
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      if (videoPreviewRef.current) {
        videoPreviewRef.current.srcObject = stream;
      }
      setIsRecordingMode(true);
    } catch (err) {
      console.error("Error accessing camera/mic:", err);
      setRecordingError("Could not access camera or microphone. Please check permissions.");
    }
  };

  const stopStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (videoPreviewRef.current) {
      videoPreviewRef.current.srcObject = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) return;
    chunksRef.current = [];
    const options = { mimeType: 'video/webm;codecs=vp9,opus' };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options.mimeType = 'video/webm';
    }
    try {
      const recorder = new MediaRecorder(streamRef.current, options);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
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
    } catch (err) {
      console.error("Recording error:", err);
      setRecordingError("Failed to start recording.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      stopStream();
    }
  };

  const resetRecording = () => {
    setRecordedVideoUrl(null);
    setVideoThumbnail(null);
    startStream();
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
              <h2 className="text-xl font-black text-slate-900 tracking-tight">New Intel Dispatch</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Digital Correspondent: {currentUser.name}</p>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="w-10 h-10 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-red-500 hover:border-red-100 transition-all active:scale-90"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6 max-h-[75vh] overflow-y-auto no-scrollbar">
          <div className="flex p-1 bg-slate-100 rounded-2xl">
            {(['BLOG', 'PHOTO', 'VIDEO'] as PostType[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => {
                  setType(t);
                  if (t !== 'VIDEO') {
                    setIsRecordingMode(false);
                    stopStream();
                  }
                }}
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl text-xs font-black transition-all ${
                  type === t 
                    ? 'bg-white text-blue-600 shadow-md scale-[1.02]' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Intelligence Sector</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-black focus:ring-2 focus:ring-blue-500 outline-none appearance-none cursor-pointer"
              >
                {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Localized Field</label>
              <div className="flex items-center justify-between bg-slate-50 p-1.5 rounded-2xl border border-slate-200">
                <div className="flex items-center space-x-3 px-2">
                  <MapPin className={`w-4 h-4 ${location ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span className={`text-[10px] font-black uppercase tracking-tight truncate max-w-[80px] ${location ? 'text-blue-600' : 'text-slate-500'}`}>
                    {location ? location.name : 'Unknown'}
                  </span>
                </div>
                <button 
                  type="button" 
                  onClick={fetchLocation} 
                  disabled={isFetchingLocation}
                  className="bg-white px-3 py-1.5 rounded-xl border border-slate-100 text-[9px] font-black text-blue-600 uppercase hover:bg-blue-50 transition-colors disabled:opacity-50"
                >
                  {isFetchingLocation ? 'Ping...' : 'Ping'}
                </button>
              </div>
            </div>
          </div>

          {type === 'PHOTO' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="flex p-1 bg-slate-100 rounded-2xl">
                <button
                  type="button"
                  onClick={() => setPhotoSource('URL')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                    photoSource === 'URL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5" />
                  <span>External Source</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoSource('AI')}
                  className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-xl text-[10px] font-black uppercase transition-all ${
                    photoSource === 'AI' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>AI Gen Visual</span>
                </button>
              </div>

              {photoSource === 'URL' ? (
                <input 
                  type="text"
                  placeholder="Paste digital visual link..."
                  value={mediaUrl.startsWith('data:') ? '' : mediaUrl}
                  onChange={(e) => setMediaUrl(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-inner"
                />
              ) : (
                <div className="space-y-3 bg-blue-50 border border-blue-100 rounded-3xl p-5">
                  <div className="relative">
                    <textarea 
                      placeholder="Describe the news visual... (e.g. 'A futuristic city skyline during sunset')"
                      value={aiPrompt}
                      onChange={(e) => setAiPrompt(e.target.value)}
                      className="w-full bg-white border border-blue-100 rounded-2xl px-4 py-3 text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 shadow-inner"
                    />
                    {isGeneratingImage && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-sm rounded-2xl flex flex-col items-center justify-center space-y-2">
                        <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                        <span className="text-[9px] font-black text-blue-600 uppercase tracking-widest">Generating Visual...</span>
                      </div>
                    )}
                  </div>
                  <Button 
                    type="button" 
                    fullWidth 
                    onClick={handleGenerateImage} 
                    disabled={isGeneratingImage || !aiPrompt.trim()}
                    className="rounded-2xl h-11 font-black bg-slate-900 hover:bg-black"
                  >
                    <Zap className="w-4 h-4 mr-2 text-yellow-400 fill-current" />
                    Process Visual Intel
                  </Button>
                </div>
              )}

              {mediaUrl && (
                <div className="relative aspect-video bg-slate-100 rounded-[2rem] overflow-hidden border-2 border-slate-200 group shadow-2xl">
                  <img src={mediaUrl} className="w-full h-full object-cover" alt="Preview" />
                  <button 
                    type="button" 
                    onClick={() => setMediaUrl('')}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-md w-10 h-10 rounded-2xl flex items-center justify-center text-white hover:bg-red-500 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          {type === 'VIDEO' && (
            <div className="space-y-4 animate-in fade-in">
              {!isRecordingMode && !recordedVideoUrl && (
                <div className="p-8 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 text-center flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                    <Video className="w-8 h-8 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Field Camera Node</h3>
                    <p className="text-[10px] text-slate-400 font-bold max-w-[200px] mt-1 mx-auto">Capture live dispatch directly from your terminal lens.</p>
                  </div>
                  <Button type="button" onClick={startStream} className="rounded-2xl px-8 h-12 font-black shadow-lg shadow-blue-100">
                    <Camera className="w-4 h-4 mr-2" /> Activate Sensor
                  </Button>
                </div>
              )}

              {isRecordingMode && !recordedVideoUrl && (
                <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-slate-900">
                  <video ref={videoPreviewRef} autoPlay muted playsInline className="w-full h-full object-cover mirror" />
                  <div className="absolute top-6 left-6 flex items-center space-x-2 bg-black/40 backdrop-blur-md px-4 py-2 rounded-full border border-white/10">
                    <div className={`w-2.5 h-2.5 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-slate-400'}`} />
                    <span className="text-[10px] font-black text-white uppercase tracking-widest">{isRecording ? 'Capturing' : 'Ready'}</span>
                  </div>
                  <div className="absolute inset-x-0 bottom-8 flex items-center justify-center">
                    {!isRecording ? (
                      <button type="button" onClick={startRecording} className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border-8 border-slate-900 active:scale-90 transition-transform">
                        <div className="w-6 h-6 bg-red-600 rounded-full" />
                      </button>
                    ) : (
                      <button type="button" onClick={stopRecording} className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl border-8 border-slate-900 active:scale-90 animate-pulse">
                        <Square className="w-6 h-6 text-red-600 fill-current" />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {recordedVideoUrl && (
                <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-blue-600 animate-in zoom-in-95">
                  <video src={recordedVideoUrl} controls poster={videoThumbnail || undefined} className="w-full h-full object-contain" />
                  <button 
                    type="button" 
                    onClick={resetRecording}
                    className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-white/40 transition-all"
                  >
                    <RefreshCcw className="w-5 h-5" />
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch Headline</label>
            <input 
              type="text"
              placeholder="Headline of the digital event..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b-2 border-slate-100 px-0 py-3 text-2xl font-black focus:border-blue-600 outline-none placeholder:text-slate-200 transition-colors bg-transparent"
              required
            />
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dispatch Narrative</label>
            <textarea 
              placeholder="Provide deep context for the intel feed..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[160px] bg-slate-50 border border-slate-200 rounded-[1.5rem] px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none shadow-inner"
              required
            />
          </div>

          <Button 
            type="submit" 
            fullWidth 
            size="lg" 
            className="rounded-[1.5rem] h-16 font-black text-lg shadow-2xl shadow-blue-100 mt-4"
          >
            Dispatch Intel to Global Feed
          </Button>
        </form>
      </div>
    </div>
  );
};
