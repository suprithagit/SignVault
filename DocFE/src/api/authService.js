import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Mail, Lock, User } from 'lucide-react';

const SignupForm = ({ onSuccess }) => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Calls authService.signup(name, email, password)
      await signup(formData.name, formData.email, formData.password);
      if (onSuccess) onSuccess();
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-950/40 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
        <div className="relative group">
          <User className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
          <input 
            type="text" 
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
            placeholder="John Doe"
            onChange={(e) => setFormData({...formData, name: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
        <div className="relative group">
          <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
          <input 
            type="email" 
            required
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
            placeholder="name@company.com"
            onChange={(e) => setFormData({...formData, email: e.target.value})}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
        <div className="relative group">
          <Lock className="absolute left-3 top-3 w-5 h-5 text-gray-500 group-focus-within:text-red-500 transition-colors" />
          <input 
            type="password" 
            required
            minLength={8}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
            placeholder="Min. 8 characters"
            onChange={(e) => setFormData({...formData, password: e.target.value})}
          />
        </div>
      </div>

      <button 
        disabled={loading}
        className="w-full bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Creating account...' : 'Create account'}
      </button>
    </form>
  );
};

export default SignupForm;