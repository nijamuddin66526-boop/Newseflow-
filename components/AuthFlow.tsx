
import React, { useState } from 'react';
import { User } from '../types.ts';
import { ChevronLeft, Mail, Smartphone, MessageCircle, Phone, Eye, EyeOff, X } from 'lucide-react';
import { Button } from './Button.tsx';

interface AuthFlowProps {
  onComplete: (user: User) => void;
}

type AuthStep = 
  | 'LANDING' 
  | 'NAME' 
  | 'BIRTHDAY' 
  | 'GENDER' 
  | 'CONTACT' 
  | 'PASSWORD' 
  | 'TERMS' 
  | 'VERIFICATION_METHOD' 
  | 'VERIFICATION_CODE' 
  | 'SAVE_LOGIN';

export const AuthFlow: React.FC<AuthFlowProps> = ({ onComplete }) => {
  const [step, setStep] = useState<AuthStep>('LANDING');
  const [data, setData] = useState({
    firstName: '',
    lastName: '',
    birthday: '1998-01-24',
    gender: '',
    contact: '',
    isEmail: false,
    password: '',
    verificationCode: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const next = (nextStep: AuthStep) => setStep(nextStep);
  const back = () => {
    if (step === 'NAME') setStep('LANDING');
    else if (step === 'BIRTHDAY') setStep('NAME');
    else if (step === 'GENDER') setStep('BIRTHDAY');
    else if (step === 'CONTACT') setStep('GENDER');
    else if (step === 'PASSWORD') setStep('CONTACT');
    else if (step === 'TERMS') setStep('PASSWORD');
    else if (step === 'VERIFICATION_METHOD') setStep('TERMS');
    else if (step === 'VERIFICATION_CODE') setStep('VERIFICATION_METHOD');
    else if (step === 'SAVE_LOGIN') setStep('VERIFICATION_CODE');
  };

  const handleComplete = () => {
    onComplete({
      id: Math.random().toString(36).substr(2, 9),
      name: `${data.firstName} ${data.lastName}`,
      username: `${data.firstName.toLowerCase()}${Math.floor(Math.random() * 100)}`,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${data.firstName}`,
      bio: 'Verified NetSphere Correspondent.',
      phone: !data.isEmail ? data.contact : undefined,
      email: data.isEmail ? data.contact : undefined
    });
  };

  const ScreenHeader = ({ title, subtitle }: { title: string, subtitle?: string }) => (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-[#1c1e21] mb-2">{title}</h2>
      {subtitle && <p className="text-[15px] text-[#65676b] leading-tight">{subtitle}</p>}
    </div>
  );

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center h-full px-6 py-12 bg-white animate-in fade-in">
      <div className="w-full max-w-sm text-center">
        <img src="https://upload.wikimedia.org/wikipedia/commons/e/ee/Social_media_art.png" className="w-full mb-8 rounded-[2rem] shadow-sm" />
        <h1 className="text-3xl font-black text-[#1c1e21] mb-2 tracking-tighter">Join NetSphere News</h1>
        <p className="text-[15px] text-[#65676b] mb-10 leading-relaxed px-4">Create an account to connect with correspondents and share live reports from around the world.</p>
        <div className="space-y-4">
          <Button fullWidth className="bg-[#0064E0] hover:bg-[#0057C2] h-12 rounded-full font-bold text-base" onClick={() => next('NAME')}>
            Create new account
          </Button>
          <button className="w-full text-[#1877F2] font-bold text-[15px] py-3">
            Find my account
          </button>
        </div>
      </div>
    </div>
  );

  const renderName = () => (
    <div className="flex flex-col h-full bg-white p-6 animate-in slide-in-from-right duration-300">
      <button onClick={back} className="mb-6 w-10 h-10 flex items-center justify-center rounded-full hover:bg-slate-100"><ChevronLeft className="w-6 h-6 text-[#1c1e21]" /></button>
      <ScreenHeader title="What's your name?" subtitle="Enter the name you use in real life." />
      <div className="flex space-x-4 mb-8">
        <input 
          className="flex-1 border-2 border-slate-200 rounded-xl p-4 text-slate-900 outline-none focus:border-[#0064E0] transition-colors font-medium" 
          placeholder="First name"
          value={data.firstName}
          onChange={e => setData({...data, firstName: e.target.value})}
        />
        <input 
          className="flex-1 border-2 border-slate-200 rounded-xl p-4 text-slate-900 outline-none focus:border-[#0064E0] transition-colors font-medium" 
          placeholder="Last name"
          value={data.lastName}
          onChange={e => setData({...data, lastName: e.target.value})}
        />
      </div>
      <Button fullWidth className="bg-[#0064E0] h-12 rounded-full font-bold text-base shadow-lg shadow-blue-100" disabled={!data.firstName || !data.lastName} onClick={() => next('BIRTHDAY')}>
        Next
      </Button>
    </div>
  );

  const renderBirthday = () => (
    <div className="flex flex-col h-full bg-white p-6 animate-in slide-in-from-right duration-300">
      <button onClick={back} className="mb-6"><ChevronLeft className="w-6 h-6 text-[#1c1e21]" /></button>
      <ScreenHeader title="What's your birthday?" subtitle="Choose your date of birth. You can always make this private later. Why do I need to provide my birthday?" />
      <div className="border-2 border-slate-200 rounded-xl p-4 mb-8 bg-slate-50">
        <label className="text-[11px] text-[#65676b] font-bold uppercase mb-1 block">Birthday (28 years old)</label>
        <input 
          type="date"
          className="bg-transparent w-full text-slate-900 font-bold outline-none text-lg"
          value={data.birthday}
          onChange={e => setData({...data, birthday: e.target.value})}
        />
      </div>
      <Button fullWidth className="bg-[#0064E0] h-12 rounded-full font-bold" onClick={() => next('GENDER')}>
        Next
      </Button>
      <button className="mt-auto text-[#1877F2] font-bold text-[15px] text-center pb-8">Find my account</button>
    </div>
  );

  const renderGender = () => (
    <div className="flex flex-col h-full bg-white p-6 animate-in slide-in-from-right duration-300">
      <button onClick={back} className="mb-6"><ChevronLeft className="w-6 h-6 text-[#1c1e21]" /></button>
      <ScreenHeader title="What's your gender?" subtitle="You can change who sees your gender on your profile later." />
      <div className="border-2 border-slate-200 rounded-2xl p-4 space-y-6 mb-8">
        {['Female', 'Male', 'Custom'].map(g => (
          <label key={g} className="flex items-center justify-between cursor-pointer">
            <span className="text-slate-900 font-bold text-base">{g}</span>
            <input 
              type="radio" name="gender" 
              checked={data.gender === g}
              onChange={() => setData({...data, gender: g})}
              className="w-6 h-6 accent-[#0064E0]" 
            />
          </label>
        ))}
      </div>
      <Button fullWidth className="bg-[#0064E0] h-12 rounded-full font-bold" disabled={!data.gender} onClick={() => next('CONTACT')}>
        Next
      </Button>
    </div>
  );

  const renderContact = () => (
    <div className="flex flex-col h-full bg-white p-6 animate-in slide-in-from-right duration-300">
      <button onClick={back} className="mb-6"><ChevronLeft className="w-6 h-6 text-[#1c1e21]" /></button>
      <ScreenHeader title={data.isEmail ? "What's your email?" : "What's your mobile number?"} subtitle={`Enter the ${data.isEmail ? 'email' : 'mobile number'} where you can be contacted.`} />
      <input 
        className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 outline-none focus:border-[#0064E0] mb-8 font-medium" 
        placeholder={data.isEmail ? "Email" : "Mobile number"}
        value={data.contact}
        onChange={e => setData({...data, contact: e.target.value})}
      />
      <Button fullWidth className="bg-[#0064E0] h-12 rounded-full font-bold mb-4" disabled={!data.contact} onClick={() => next('PASSWORD')}>
        Next
      </Button>
      <button 
        className="w-full border-2 border-slate-200 rounded-full h-12 text-[#1c1e21] font-bold text-[15px] hover:bg-slate-50 transition-colors"
        onClick={() => setData({...data, isEmail: !data.isEmail, contact: ''})}
      >
        Sign up with {data.isEmail ? 'mobile number' : 'email'}
      </button>
    </div>
  );

  const renderPassword = () => (
    <div className="flex flex-col h-full bg-white p-6 animate-in slide-in-from-right duration-300">
      <button onClick={back} className="mb-6"><ChevronLeft className="w-6 h-6 text-[#1c1e21]" /></button>
      <ScreenHeader title="Create a password" subtitle="Create a password with at least 6 letters or numbers. It should be something others can't guess." />
      <div className="relative mb-8">
        <input 
          type={showPassword ? "text" : "password"}
          className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 outline-none focus:border-[#0064E0] font-medium" 
          placeholder="Password"
          value={data.password}
          onChange={e => setData({...data, password: e.target.value})}
        />
        <button onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
          {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
        </button>
      </div>
      <Button fullWidth className="bg-[#0064E0] h-12 rounded-full font-bold" disabled={data.password.length < 6} onClick={() => next('TERMS')}>
        Next
      </Button>
    </div>
  );

  const renderTerms = () => (
    <div className="flex flex-col h-full bg-white p-6 animate-in slide-in-from-right duration-300">
      <button onClick={back} className="mb-6"><ChevronLeft className="w-6 h-6 text-[#1c1e21]" /></button>
      <h2 className="text-2xl font-bold text-[#1c1e21] mb-6">Agree to NetSphere News's terms and policies</h2>
      <div className="space-y-4 text-[#65676b] text-[15px] leading-relaxed mb-10">
        <p>People who use our service may have uploaded your contact information to NetSphere News. <span className="text-[#1877F2] font-bold">Learn more</span></p>
        <p>By tapping I agree, you agree to create an account and to NetSphere News's <span className="text-[#1877F2] font-bold">Terms</span>, <span className="text-[#1877F2] font-bold">Privacy Policy</span> and <span className="text-[#1877F2] font-bold">Cookies Policy</span>.</p>
        <p>The <span className="text-[#1877F2] font-bold">Privacy Policy</span> describes the ways we can use the information we collect when you create an account.</p>
      </div>
      <Button fullWidth className="bg-[#0064E0] h-14 rounded-full font-bold text-lg" onClick={() => next('VERIFICATION_METHOD')}>
        I agree
      </Button>
    </div>
  );

  const renderVerificationMethod = () => (
    <div className="flex flex-col h-full bg-white p-6 animate-in slide-in-from-right duration-300">
      <ScreenHeader title="Confirm your mobile number" subtitle={`Choose how you want to confirm that ${data.contact} belongs to you.`} />
      <div className="border-2 border-slate-200 rounded-2xl p-4 space-y-8 mb-8">
        <label className="flex items-center space-x-4 cursor-pointer">
          <MessageCircle className="w-7 h-7 text-[#25D366]" />
          <p className="flex-1 text-[#1c1e21] font-bold text-base">Send code via WhatsApp</p>
          <input type="radio" name="verify" defaultChecked className="w-6 h-6 accent-[#0064E0]" />
        </label>
        <label className="flex items-center space-x-4 cursor-pointer">
          <Phone className="w-7 h-7 text-[#65676b]" />
          <p className="flex-1 text-[#1c1e21] font-bold text-base">Confirm via phone call</p>
          <input type="radio" name="verify" className="w-6 h-6 accent-[#0064E0]" />
        </label>
        <label className="flex items-center space-x-4 cursor-pointer">
          <Smartphone className="w-7 h-7 text-[#65676b]" />
          <p className="flex-1 text-[#1c1e21] font-bold text-base">Send code via SMS</p>
          <input type="radio" name="verify" className="w-6 h-6 accent-[#0064E0]" />
        </label>
      </div>
      <Button fullWidth className="bg-[#0064E0] h-12 rounded-full font-bold" onClick={() => next('VERIFICATION_CODE')}>
        Continue
      </Button>
    </div>
  );

  const renderVerificationCode = () => (
    <div className="flex flex-col h-full bg-white p-6 animate-in slide-in-from-right duration-300">
      <button onClick={back} className="mb-6"><ChevronLeft className="w-6 h-6 text-[#1c1e21]" /></button>
      <ScreenHeader title="Enter the confirmation code" subtitle={`To confirm your account, enter the 5-digit code we sent via WhatsApp to ${data.contact}.`} />
      <input 
        className="w-full border-2 border-slate-200 rounded-xl p-4 text-slate-900 outline-none focus:border-[#0064E0] mb-8 font-black text-center text-2xl tracking-[0.5em]" 
        placeholder="•••••"
        maxLength={5}
        value={data.verificationCode}
        onChange={e => setData({...data, verificationCode: e.target.value.replace(/[^0-9]/g, '')})}
      />
      <Button fullWidth className="bg-[#0064E0] h-12 rounded-full font-bold mb-4 shadow-lg shadow-blue-100" disabled={data.verificationCode.length < 5} onClick={() => next('SAVE_LOGIN')}>
        Next
      </Button>
      <button className="w-full border-2 border-slate-200 rounded-full h-12 text-[#1c1e21] font-bold text-[15px]">
        I didn't get the code
      </button>
    </div>
  );

  const renderSaveLogin = () => (
    <div className="flex flex-col h-full bg-white p-6 animate-in slide-in-from-right duration-300">
      <button onClick={back} className="mb-6"><ChevronLeft className="w-6 h-6 text-[#1c1e21]" /></button>
      <ScreenHeader title="Save your login info?" subtitle={`We'll save the login info for ${data.firstName}, so you won't need to enter it next time you log in.`} />
      <div className="space-y-4">
        <Button fullWidth className="bg-[#0064E0] h-12 rounded-full font-bold" onClick={handleComplete}>
          Save
        </Button>
        <button className="w-full border-2 border-slate-200 rounded-full h-12 text-[#1c1e21] font-bold text-[15px]" onClick={handleComplete}>
          Not now
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto no-scrollbar">
      <div className="max-w-md mx-auto h-full shadow-2xl relative">
        {step === 'LANDING' && renderLanding()}
        {step === 'NAME' && renderName()}
        {step === 'BIRTHDAY' && renderBirthday()}
        {step === 'GENDER' && renderGender()}
        {step === 'CONTACT' && renderContact()}
        {step === 'PASSWORD' && renderPassword()}
        {step === 'TERMS' && renderTerms()}
        {step === 'VERIFICATION_METHOD' && renderVerificationMethod()}
        {step === 'VERIFICATION_CODE' && renderVerificationCode()}
        {step === 'SAVE_LOGIN' && renderSaveLogin()}
      </div>
    </div>
  );
};
