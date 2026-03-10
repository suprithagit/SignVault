import { motion } from "framer-motion";
import { Upload, PenTool, Share2, FileDown, Shield, Clock } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import { config } from "@/lib/config";

const iconMap = { Upload, PenTool, Share2, FileDown, Shield, Clock };

const FeaturesSection = () => {
  const content = useContent();
  const t = content.features || {};
  const items = t.items || [];

  return (
    <section
      id="features"
      className="relative py-24 sm:py-32"
      style={{
        backgroundImage: `url(${config.images.featuresBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.title || "Everything You Need to Sign"}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.subtitle || "A complete document signing platform built for security and simplicity."}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((feature, i) => {
            const Icon = iconMap[feature.icon] || Upload;
            return (
              <motion.div
                key={feature.title || i}
                className="group rounded-xl border border-border bg-card p-6 shadow-card transition-all duration-300 hover:shadow-card-hover"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;