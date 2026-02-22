import { FileSignature } from "lucide-react";
import { useContent } from "@/contexts/ContentContext";

const Footer = () => {
  const content = useContent();
  const t = content.footer || {};

  return (
    <footer className="border-t border-border bg-card py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-4 sm:flex-row sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <FileSignature className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-lg font-bold text-foreground">{t.brand || "SignVault"}</span>
        </div>
        <p className="text-sm text-muted-foreground">{t.copyright || "© 2026 SignVault. All rights reserved."}</p>
      </div>
    </footer>
  );
};

export default Footer;