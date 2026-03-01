import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Security from '../components/home/Security';
import Footer from '../components/layout/Footer';
import AuthModal from '../api/AuthModal';

const LandingPage = ({ data }) => {
  const [authModal, setAuthModal] = useState({ isOpen: false, type: 'login' });
  const navigate = useNavigate();

  // Navigation handlers
  const openAuth = (type) => setAuthModal({ isOpen: true, type });
  const closeAuth = () => setAuthModal({ ...authModal, isOpen: false });

  // Redirect to dashboard on successful login/signup
  const handleAuthSuccess = () => {
    closeAuth();
    navigate(import.meta.env.VITE_DASHBOARD_LINK || '/dashboard');
  };

  // Data mapping from your JSON 
  const navbarData = data?.navbar || {};
  const heroData = data?.hero || {};
  const featuresData = data?.features || {};
  const securityData = data?.security || {};
  const footerData = data?.footer || {};

  return (
    <div className="relative">
      <Navbar 
        navbarData={navbarData} 
        onSignInClick={() => openAuth('login')}
        onGetStartedClick={() => openAuth('signup')}
      />
      
      <main>
        <Hero 
          heroData={heroData} 
          onAuthClick={openAuth} 
        />
        
        {/* Added missing sections to match your package structure */}
        <Features featuresData={featuresData} />
        <Security securityData={securityData} />
      </main>

      <AuthModal 
        isOpen={authModal.isOpen}
        type={authModal.type}
        brandName={navbarData.brand}
        onClose={closeAuth}
        onSuccess={handleAuthSuccess}
        onSwitch={(type) => setAuthModal({ ...authModal, type })}
      />
      
      <Footer footerData={footerData} />
    </div>
  );
};

export default LandingPage;