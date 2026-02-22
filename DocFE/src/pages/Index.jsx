import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import FeaturesSection from "@/components/FeaturesSection"; // Ensure this matches the filename
import HowItWorksSection from "@/components/HowItWorksSection";
import SecuritySection from "@/components/SecuritySection";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <FeaturesSection />
      <HowItWorksSection />
      <SecuritySection />
      <Footer />
    </div>
  );
};

export default Index;