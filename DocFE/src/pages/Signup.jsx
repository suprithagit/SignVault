import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import SignupForm from '../api/SignupForm';

const Signup = ({ data }) => {
  const navigate = useNavigate();
  const brandName = data?.navbar?.brand || "SignVault";
  const getStartedLabel = data?.navbar?.getStartedButton || "Get Started";

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center gap-2 font-bold text-2xl tracking-tight text-black">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            {brandName}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-center">
            {getStartedLabel}
          </h1>
          <p className="text-zinc-500 text-center text-sm">
            {data?.hero?.description}
          </p>
        </div>

        <SignupForm onSuccess={() => navigate('/dashboard')} />

        <p className="text-center text-sm text-zinc-500">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-black hover:underline">
            {data?.navbar?.signInButton || "Login"}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;