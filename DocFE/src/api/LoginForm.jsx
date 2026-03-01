import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Loader2 } from "lucide-react";

const LoginForm = ({ onSuccess }) => {
  // renamed state from 'email' to 'identifier' for clarity
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      // Passes the identifier (could be name or email) to the login service
      await login(identifier, password); 
      if (onSuccess) onSuccess();
    } catch (err) {
      // Backend returns 401 if neither username nor email match
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}
      
      <div className="space-y-2">
        {/* Updated label to inform user they can use either name or email */}
        <Label htmlFor="identifier" className="text-gray-700 font-medium">
          Email or Full Name
        </Label>
        <Input 
          id="identifier" 
          type="text" // Changed from 'email' to 'text' to allow name input
          placeholder="Enter your email or name" 
          value={identifier} 
          onChange={(e) => setIdentifier(e.target.value)} 
          className="h-11 focus-visible:ring-black"
          required 
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password" className="text-gray-700 font-medium">Password</Label>
        <Input 
          id="password" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          className="h-11 focus-visible:ring-black"
          required 
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-black text-white h-11 hover:bg-zinc-900 active:bg-black transition-colors disabled:opacity-70" 
        disabled={loading}
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Signing in...</span>
          </div>
        ) : (
          'Sign In'
        )}
      </Button>
    </form>
  );
};

export default LoginForm;