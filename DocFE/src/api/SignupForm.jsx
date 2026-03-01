import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';

const SignupForm = ({ onSuccess }) => {
  // Keep 'name' here; AuthContext will map it to 'username' for the backend
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Passes name, email, and password to the AuthContext signup function
      // Your AuthContext is already configured to add { roles: null } 
      await signup(formData.name, formData.email, formData.password); 
      // immediately sign in so user has valid auth state before redirecting
      await login(formData.email, formData.password);
      if (onSuccess) onSuccess();
    } catch (err) {
      // Catches server errors (401/403/400) or connection failures
      setError(err.message || 'Could not create account');
    } finally {
      setLoading(false);
    }
  };

  // Helper to keep state updates clean
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          placeholder="Enter your name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Work Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="name@company.com"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="Minimum 8 characters"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <Button 
        type="submit" 
        className="w-full bg-black text-white hover:bg-zinc-800 h-11" 
        disabled={loading}
      >
        {loading ? 'Creating account...' : 'Get Started'}
      </Button>
    </form>
  );
};

export default SignupForm;