import React from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthModal = ({ isOpen, type, onClose, onSwitch, brandName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-white/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
        <button onClick={onClose} className="absolute right-6 top-6 text-zinc-400 hover:text-black">
          <X className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center mb-8">
          <div className="font-bold text-xl mb-2">{brandName}</div>
          <h2 className="text-2xl font-bold">
            {type === 'login' ? 'Welcome back' : 'Create account'}
          </h2>
        </div>

        {type === 'login' ? <LoginForm /> : <SignupForm />}

        <div className="mt-6 text-center text-sm text-zinc-500">
          {type === 'login' ? (
            <>Don't have an account? <button onClick={() => onSwitch('signup')} className="font-bold text-black underline">Sign up</button></>
          ) : (
            <>Already have an account? <button onClick={() => onSwitch('login')} className="font-bold text-black underline">Sign in</button></>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;