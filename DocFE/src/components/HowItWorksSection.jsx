import { motion } from "framer-motion";
import { useContent } from "@/contexts/ContentContext";
import { config } from "@/lib/config";

const HowItWorksSection = () => {
  const content = useContent();
  
  // Safely accessing translation data
  const t = content.howItWorks || {};
  
  // Default steps in case the JSON hasn't loaded or is missing data
  const defaultSteps = [
    { number: "1", title: "Upload", description: "Upload your document in PDF or Word format." },
    { number: "2", title: "Prepare", description: "Drag and drop signature and initial fields." },
    { number: "3", title: "Send", description: "Email the document to recipients securely." },
    { number: "4", title: "Sign", description: "Recipients sign from any device instantly." }
  ];

  const steps = t.steps || defaultSteps;

  return (
    <section
      id="how-it-works"
      className="relative py-24 sm:py-32"
      style={{
        backgroundImage: `url(${config.images.howItWorksBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-background/80" />
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            {t.title || "How It Works"}
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            {t.subtitle || "Four simple steps from document to signed agreement."}
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, i) => (
            <motion.div
              key={step.number || i}
              className="relative text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
            >
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                {step.number}
              </div>
              <h3 className="font-display text-lg font-semibold text-foreground">
                {step.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;