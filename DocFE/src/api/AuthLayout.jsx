import React from 'react';
import { PenTool, Shield, FileCheck } from 'lucide-react';
// Assuming your JSON is imported or passed as a prop
import { config } from "@/lib/config";

const AuthLayout = ({ children, title, subtitle }) => {
  const { navbar, hero, footer } = content;

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#fafafa]">
      {/* Left Side: Brand & Value Proposition (Hidden on Mobile) */}
      <div className="hidden lg:flex flex-col justify-between p-16 bg-[#000000] text-white">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white/10 rounded-lg">
            <PenTool className="w-8 h-8 text-white" />
          </div>
          {/* Brand from JSON */}
          <span className="text-2xl font-bold tracking-tight">{navbar.brand}</span>
        </div>
        
        <div className="space-y-8">
          {/* Badge from JSON */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-medium text-gray-300">
            <Shield className="w-3 h-3" />
            {hero.badge}
          </div>
          
          {/* Title Lines from JSON */}
          <h1 className="text-6xl font-bold leading-tight">
            {hero.title.line1} <br />
            <span className="text-gray-400">{hero.title.highlight}</span> <br />
            {hero.title.line2}
          </h1>
          
          {/* Description from JSON */}
          <p className="text-gray-400 text-lg max-w-md leading-relaxed">
            {hero.description}
          </p>

          {/* Trust Badges mapped from JSON */}
          <div className="flex gap-8 pt-4">
            {hero.trustBadges.slice(0, 2).map((badge, index) => (
              <div key={index} className="flex flex-col gap-1">
                {badge.icon === "Shield" ? (
                  <Shield className="w-5 h-5 text-gray-300" />
                ) : (
                  <FileCheck className="w-5 h-5 text-gray-300" />
                )}
                <span className="text-sm font-medium">{badge.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer from JSON */}
        <div className="text-sm text-gray-500">
          {footer.copyright}
        </div>
      </div>

      {/* Right Side: Form Content */}
      <div className="flex flex-col justify-center px-8 py-12 sm:px-12 lg:px-24 bg-white">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile Logo Only */}
          <div className="mb-10 lg:hidden flex items-center gap-2">
             <PenTool className="w-8 h-8 text-black" />
             <span className="text-xl font-bold">{navbar.brand}</span>
          </div>
          
          <h2 className="text-4xl font-bold text-gray-900 mb-3">{title}</h2>
          <p className="text-gray-500 mb-10 text-lg">{subtitle}</p>
          
          <div className="bg-white">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;