
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
  Play
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
}

type VideoQuality = '720p' | '1080p';

export const CreatePost: React.FC<CreatePostProps> = ({ currentUser, onPostCreated }) => {
  const [isOpen, setIsOpen] = useState(false);
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
    setIsOpen(false);
    setRecordingError(null);
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
        // Seek to 0.1s to avoid potential black frame at the very beginning
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
          
          // Generate thumbnail from first frame
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

  if (!isOpen) {
    return (
      <div 
        className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 mb-6 cursor-pointer hover:bg-slate-50 transition-colors"
        onClick={() => setIsOpen(true)}
      >
        <div className="flex items-center space-x-3">
          <img src={currentUser.avatar} alt="Me" className="w-10 h-10 rounded-full" />
          <div className="bg-slate-100 flex-1 rounded-full px-4 py-2.5 text-slate-500 text-sm">
            What's the latest news, {currentUser.name.split(' ')[0]}?
          </div>
        </div>
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-50 px-2">
          <div className="flex space-x-4">
            <div className="flex items-center text-blue-600 text-sm font-medium">
              <Type className="w-4 h-4 mr-1.5" /> Blog
            </div>
            <div className="flex items-center text-emerald-600 text-sm font-medium">
              <ImageIcon className="w-4 h-4 mr-1.5" /> Photo
            </div>
            <div className="flex items-center text-purple-600 text-sm font-medium">
              <Video className="w-4 h-4 mr-1.5" /> Video
            </div>
          </div>
          <Button size="sm" className="rounded-full px-5">
            Post
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="bg-blue-600 p-1.5 rounded-lg">
              <Compass className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-lg font-bold text-slate-900">File New Dispatch</h2>
          </div>
          <Button variant="ghost" size="sm" onClick={handleClose} className="rounded-full p-1 h-8 w-8">
            <X className="w-5 h-5 text-slate-400" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[85vh] overflow-y-auto custom-scrollbar">
          <div className="flex space-x-2 mb-2">
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
                className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-xl border-2 text-sm font-bold transition-all ${
                  type === t 
                    ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm' 
                    : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                {t === 'BLOG' && <Type className="w-4 h-4" />}
                {t === 'PHOTO' && <ImageIcon className="w-4 h-4" />}
                {t === 'VIDEO' && <Video className="w-4 h-4" />}
                <span className="capitalize">{t.toLowerCase()}</span>
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Archive Category</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none appearance-none"
              >
                {NEWS_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Media Source</label>
              <div className="relative">
                {videoThumbnail ? (
                  <div className="flex items-center space-x-3 bg-blue-50 border border-blue-200 rounded-xl px-3 py-1.5 group animate-in fade-in duration-300">
                    <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-blue-200 shadow-sm">
                      <img src={videoThumbnail} className="w-full h-full object-cover" alt="Video thumbnail" />
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                        <Play className="w-3 h-3 text-white fill-current" />
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-blue-600 uppercase tracking-wider">Video Captured</span>
                      <span className="text-[9px] text-blue-400 font-bold">First frame extracted</span>
                    </div>
                  </div>
                ) : (
                  <input 
                    type="text"
                    placeholder="External URL"
                    value={recordedVideoUrl ? "(Self-Recorded Dispatch)" : mediaUrl}
                    disabled={!!recordedVideoUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="flex items-center space-x-2">
              <MapPin className={`w-4 h-4 ${location ? 'text-blue-600' : 'text-slate-400'}`} />
              <span className={`text-[11px] font-bold ${location ? 'text-blue-600' : 'text-slate-500'}`}>
                {location ? location.name : 'No location tagged'}
              </span>
            </div>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              className="h-8 rounded-lg text-[10px] font-black uppercase tracking-wider"
              onClick={fetchLocation}
              disabled={isFetchingLocation}
            >
              {isFetchingLocation ? 'Fetching...' : location ? 'Re-tag Location' : 'Tag Location'}
            </Button>
          </div>

          {/* Video Recording Interface */}
          {type === 'VIDEO' && (
            <div className="space-y-4 animate-in slide-in-from-top-2">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 border-dashed">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-slate-500">
                      <Settings2 className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Broadcast Resolution</span>
                    </div>
                    {!isRecordingMode && !recordedVideoUrl && (
                      <div className="flex p-1 bg-slate-200/50 rounded-xl w-fit">
                        {(['720p', '1080p'] as VideoQuality[]).map((q) => (
                          <button
                            key={q}
                            type="button"
                            onClick={() => setVideoQuality(q)}
                            className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all flex items-center space-x-2 ${
                              videoQuality === q 
                                ? 'bg-white text-blue-600 shadow-sm' 
                                : 'text-slate-500 hover:text-slate-700'
                            }`}
                          >
                            <Monitor className="w-3 h-3" />
                            <span>{q === '720p' ? 'HD' : 'Full HD'}</span>
                          </button>
                        ))}
                      </div>
                    )}
                    {(isRecordingMode || recordedVideoUrl) && (
                      <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg w-fit">
                        <Check className="w-3 h-3" />
                        <span className="text-[10px] font-black uppercase tracking-wider">{videoQuality} Ready</span>
                      </div>
                    )}
                  </div>
                  
                  {!isRecordingMode && !recordedVideoUrl && (
                    <Button 
                      type="button" 
                      variant="primary" 
                      size="sm" 
                      className="rounded-xl font-bold h-11 px-6 shadow-lg shadow-blue-100" 
                      onClick={startStream}
                    >
                      <Camera className="w-4 h-4 mr-2" /> Start Recording
                    </Button>
                  )}
                </div>
              </div>

              {recordingError && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start space-x-2 text-red-600 text-xs font-medium">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{recordingError}</span>
                </div>
              )}

              {isRecordingMode && !recordedVideoUrl && (
                <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-2xl ring-4 ring-slate-100 ring-inset">
                  <video 
                    ref={videoPreviewRef} 
                    autoPlay 
                    muted 
                    playsInline 
                    className="w-full h-full object-cover mirror"
                  />
                  
                  <div className="absolute top-6 left-6 flex items-center space-x-3">
                    <div className="bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-[0.2em] border border-white/20 flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${isRecording ? 'bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.8)]' : 'bg-slate-400'}`} />
                      <span>{isRecording ? 'Recording Live' : 'Standby'}</span>
                    </div>
                    <div className="bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase border border-white/20">
                      {videoQuality}
                    </div>
                  </div>

                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent p-8 flex items-center justify-center">
                    <div className="flex items-center space-x-6">
                      {!isRecording ? (
                        <button 
                          type="button"
                          onClick={startRecording}
                          className="group relative flex items-center justify-center"
                        >
                          <div className="absolute inset-0 bg-red-600/20 rounded-full animate-ping group-hover:bg-red-600/30" />
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl relative transition-transform hover:scale-110 active:scale-95 border-8 border-slate-900">
                            <div className="w-6 h-6 bg-red-600 rounded-full" />
                          </div>
                        </button>
                      ) : (
                        <button 
                          type="button"
                          onClick={stopRecording}
                          className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl transition-transform hover:scale-110 active:scale-95 border-8 border-slate-900 animate-pulse"
                        >
                          <Square className="w-8 h-8 text-red-600 fill-current" />
                        </button>
                      )}
                      
                      {!isRecording && (
                        <button 
                          type="button"
                          onClick={() => { setIsRecordingMode(false); stopStream(); }}
                          className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white border border-white/30 transition-all"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {recordedVideoUrl && (
                <div className="space-y-3">
                  <div className="relative aspect-video bg-black rounded-3xl overflow-hidden shadow-xl border-4 border-blue-600 animate-in zoom-in-95">
                    <video 
                      src={recordedVideoUrl} 
                      controls 
                      poster={videoThumbnail || undefined}
                      className="w-full h-full object-contain"
                    />
                    <div className="absolute top-4 left-4 bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg flex items-center space-x-2">
                      <Video className="w-3.5 h-3.5" />
                      <span>{videoQuality} Verified Dispatch</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      fullWidth 
                      className="rounded-xl h-12 font-bold" 
                      onClick={resetRecording}
                    >
                      <RefreshCcw className="w-4 h-4 mr-2" /> Retake Dispatch
                    </Button>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      fullWidth 
                      className="rounded-xl h-12 font-bold text-red-500 hover:bg-red-50" 
                      onClick={() => { setRecordedVideoUrl(null); setVideoThumbnail(null); setIsRecordingMode(false); }}
                    >
                      <X className="w-4 h-4 mr-2" /> Remove Attachment
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Headline</label>
            <input 
              type="text"
              placeholder="Breaking: New developments in global policy..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border-b-2 border-slate-100 px-0 py-2 text-xl font-black focus:border-blue-600 outline-none placeholder:text-slate-200 transition-colors"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Dispatch</label>
            <textarea 
              placeholder={type === 'BLOG' ? "Deep dive into your journalistic investigation..." : "Summary of the visual report..."}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full min-h-[160px] bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              required
            />
          </div>

          <div className="pt-2">
            <Button 
              type="submit" 
              fullWidth 
              size="lg" 
              disabled={isRecording}
              className="rounded-2xl h-14 font-black shadow-xl shadow-blue-100"
            >
              Post to News Feed
            </Button>
          </div>
        </form>
      </div>
      <style>{`
        .mirror { transform: rotateY(180deg); }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
};
