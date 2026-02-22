import React from 'react';
import Navbar from '../components/layout/Navbar';
import Hero from '../components/home/Hero';
import Features from '../components/home/Features';
import Security from '../components/home/Security';
import Footer from '../components/layout/Footer';

const LandingPage = ({ data, onNavigate }) => {
  // Ensuring data exists to prevent rendering errors
  const navbarData = data?.navbar || {};
  const heroData = data?.hero || {};
  const featuresData = data?.features || {};
  const securityData = data?.security || {};
  const footerData = data?.footer || {};

  return (
    <>
      <Navbar navbarData={navbarData} onNavigate={onNavigate} />
      <main>
        <Hero heroData={heroData} onNavigate={onNavigate} />
        <Features featuresData={featuresData} />
        <Security securityData={securityData} />
      </main>
      <Footer footerData={footerData} />
    </>
  );
};

export default LandingPage;