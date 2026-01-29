
import React, { useState } from 'react';
import { 
  X, 
  Facebook, 
  Linkedin, 
  Send, 
  Link as LinkIcon, 
  Check,
  Globe,
  Share2,
  Twitter
} from 'lucide-react';
import { Button } from './Button.tsx';
import { Post } from '../types.ts';

interface ShareModalProps {
  post: Post;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ post, isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareUrl = window.location.href; // In a real app, this would be the post's unique URL
  const shareText = `Check out this dispatch: "${post.title}" on NewsFlow.`;

  const socialNetworks = [
    {
      name: 'X (Twitter)',
      icon: <Twitter className="w-5 h-5" />,
      color: 'bg-slate-900',
      action: () => window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`, '_blank')
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-5 h-5" />,
      color: 'bg-[#1877F2]',
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`, '_blank')
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-5 h-5" />,
      color: 'bg-[#0A66C2]',
      action: () => window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`, '_blank')
    },
    {
      name: 'WhatsApp',
      icon: <Send className="w-5 h-5 rotate-45" />,
      color: 'bg-[#25D366]',
      action: () => window.open(`https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`, '_blank')
    }
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
        {/* Header */}
        <div className="p-8 text-center bg-slate-50 border-b border-slate-100">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <Share2 className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight">Broadcast Dispatch</h2>
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-1">External Network Link</p>
        </div>

        {/* Social Grid */}
        <div className="p-8">
          <div className="grid grid-cols-2 gap-4 mb-8">
            {socialNetworks.map((net) => (
              <button
                key={net.name}
                onClick={net.action}
                className="flex flex-col items-center justify-center p-4 rounded-3xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50 transition-all group"
              >
                <div className={`${net.color} text-white p-3 rounded-2xl mb-2 shadow-md group-hover:scale-110 transition-transform`}>
                  {net.icon}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600">{net.name}</span>
              </button>
            ))}
          </div>

          {/* Copy Link Section */}
          <div className="space-y-3">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Direct Intelligence Link</p>
            <div className="flex items-center bg-slate-50 border border-slate-200 rounded-2xl p-2 pl-4">
              <span className="text-xs text-slate-500 font-medium truncate flex-1 mr-2">{shareUrl}</span>
              <Button 
                size="sm" 
                onClick={handleCopy}
                className={`rounded-xl h-10 px-4 font-black transition-all ${copied ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-900'}`}
              >
                {copied ? <Check className="w-4 h-4 mr-2" /> : <LinkIcon className="w-4 h-4 mr-2" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
            </div>
          </div>

          <Button 
            variant="ghost" 
            fullWidth 
            onClick={onClose}
            className="mt-6 rounded-2xl font-black text-slate-400 hover:text-slate-900"
          >
            Close Broadcast Menu
          </Button>
        </div>
      </div>
    </div>
  );
};
