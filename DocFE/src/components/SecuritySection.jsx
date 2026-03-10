import { motion } from "framer-motion";
import { Lock, ShieldCheck, FileKey, Globe } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";
import { config } from "@/lib/config";

const iconMap = { Lock, ShieldCheck, FileKey, Globe };

const SecuritySection = () => {
  const content = useContent();
  
  // Safely access security data from ContentContext
  const t = content.security || {};
  const items = t.items || [];

  return (
    <section
      id="security"
      className="relative py-24 sm:py-32"
      style={{
        backgroundImage: `url(${config.images.securityBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.title || "Security First"}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.subtitle || "Your documents deserve enterprise-grade protection."}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-3xl gap-6 sm:grid-cols-2">
          {items.map((item, i) => {
            const Icon = iconMap[item.icon] || Lock;
            return (
              <motion.div
                key={item.title || i}
                className="flex gap-4 rounded-xl border border-border bg-card p-5 shadow-card"
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display font-semibold text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default SecuritySection;