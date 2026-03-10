import { motion } from "framer-motion";
import { ArrowRight, Shield, FileCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useContent } from "@/contexts/ContentContext";
import { config } from "@/lib/config";

const iconMap = { Shield, FileCheck };

const HeroSection = () => {
  const content = useContent();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const t = content.hero || {};
  const title = t.title || {};
  const trustBadges = t.trustBadges || [];

  return (
    <section
      className="relative overflow-hidden bg-hero pt-16"
      style={{
        backgroundImage: `url(${config.images.heroBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay",
      }}
    >
      <div className="absolute inset-0 bg-hero opacity-90" />

      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 h-72 w-72 rounded-full bg-accent blur-[120px]" />
        <div className="absolute bottom-10 right-10 h-96 w-96 rounded-full bg-info blur-[150px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8 lg:py-40">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary-foreground/20 bg-primary-foreground/5 px-4 py-1.5 text-sm text-primary-foreground/80">
              <Shield className="h-4 w-4" />
              {t.badge || "Enterprise-Grade Document Signing"}
            </div>
          </motion.div>

          <motion.h1
            className="font-display text-4xl font-bold tracking-tight text-primary-foreground sm:text-5xl lg:text-6xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            {title.line1 || "Sign Documents"}{" "}
            <span className="text-gradient-hero">{title.highlight || "Securely"}</span>
            <br />
            {title.line2 || "From Anywhere"}
          </motion.h1>

          <motion.p
            className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/70"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {t.description || "Upload, sign, and share legally binding documents with full audit trails."}
          </motion.p>

          <motion.div
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Button
              variant="hero"
              size="lg"
              onClick={() => navigate(isAuthenticated ? config.links.dashboard : config.links.signin)}
              className="gap-2 text-base"
            >
              {t.ctaPrimary || "Start Signing Free"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>

          <motion.div
            className="mt-16 flex items-center justify-center gap-8 text-sm text-primary-foreground/50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            {trustBadges.map((badge, i) => {
              const Icon = iconMap[badge.icon] || FileCheck;
              return (
                <div key={i} className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span>{badge.label}</span>
                </div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;