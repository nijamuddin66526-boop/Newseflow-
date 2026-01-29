
import React from 'react';
import { ShieldCheck, Scale, Mic2, HeartHandshake, EyeOff, AlertTriangle, CheckCircle2, BookOpen } from 'lucide-react';
import { Button } from './Button.tsx';

export const Guidelines: React.FC = () => {
  const standards = [
    {
      icon: <ShieldCheck className="w-6 h-6 text-blue-600" />,
      title: "Absolute Accuracy",
      description: "Verify every fact before dispatching. Misinformation undermines the collective intelligence of the network. If a report is unconfirmed, label it as 'Developing'."
    },
    {
      icon: <Scale className="w-6 h-6 text-emerald-600" />,
      title: "Neutral Independence",
      description: "Our correspondents must remain free of outside interests. Disclosure of potential conflicts of interest is mandatory for all high-impact reports."
    },
    {
      icon: <EyeOff className="w-6 h-6 text-purple-600" />,
      title: "Privacy & Ethics",
      description: "Respect the dignity of subjects. Avoid sensationalism. Hidden camera footage and private data leaks must serve a clear public interest."
    },
    {
      icon: <HeartHandshake className="w-6 h-6 text-orange-600" />,
      title: "Civil Discourse",
      description: "NewsFlow is a platform for intelligence, not vitriol. Debate the data, not the individual. Harassment leads to immediate credential revocation."
    }
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-500 max-w-3xl mx-auto">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        <div className="bg-slate-900 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)', backgroundSize: '32px 32px'}} />
          <div className="relative z-10">
            <div className="inline-flex items-center space-x-2 bg-blue-500/20 text-blue-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-blue-500/30">
              <BookOpen className="w-3 h-3" />
              <span>Official Protocol</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter mb-4 italic">Standards Bureau</h1>
            <p className="text-slate-400 max-w-md mx-auto font-medium leading-relaxed">
              The NewsFlow Manifesto: Ensuring the integrity of global information through decentralized verification and ethical reporting.
            </p>
          </div>
        </div>

        <div className="p-8 sm:p-12 space-y-12">
          <section>
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center">
              <span className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center mr-3 text-xs">01</span>
              The Four Pillars of NewsFlow
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {standards.map((s, idx) => (
                <div key={idx} className="group p-6 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-blue-50/30 transition-all duration-300">
                  <div className="mb-4 transform group-hover:scale-110 transition-transform duration-300">{s.icon}</div>
                  <h3 className="font-bold text-slate-900 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium">{s.description}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
            <div className="flex items-start space-x-4">
              <div className="p-2 bg-white rounded-xl shadow-sm">
                <AlertTriangle className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <h3 className="font-bold text-amber-900 mb-1 text-sm uppercase tracking-tight">Zero Tolerance Protocol</h3>
                <p className="text-sm text-amber-700 font-medium leading-relaxed">
                  Deepfakes, AI-generated fabrications without clear labeling, and incitement of violence will result in permanent hardware-level bans from the NewsFlow network.
                </p>
              </div>
            </div>
          </section>

          <section className="pt-8 border-t border-slate-100 text-center">
            <div className="max-w-sm mx-auto">
              <CheckCircle2 className="w-12 h-12 text-blue-600 mx-auto mb-4" />
              <h3 className="text-lg font-black text-slate-900 mb-2">Correspondent's Pledge</h3>
              <p className="text-sm text-slate-500 mb-8 font-medium italic">
                "I hereby commit to the pursuit of truth, the verification of data, and the protection of the NewsFlow ecosystem."
              </p>
              <Button fullWidth size="lg" className="rounded-2xl shadow-xl shadow-blue-100 font-black">
                Confirm Credentials
              </Button>
            </div>
          </section>
        </div>
      </div>
      
      <div className="text-center pb-12">
        <p className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">
          Version 4.2.0 • Last Revised: June 2025
        </p>
      </div>
    </div>
  );
};
