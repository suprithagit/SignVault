import { FileSignature, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useContent } from "@/contexts/ContentContext";
import { config } from "@/lib/config";

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const isDashboard = location.pathname === config.links.dashboard;
  const content = useContent();
  const t = content.navbar || {};

  const menuItems = t.menuItems || [];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-card/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link to={config.links.home} className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
            <FileSignature className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold text-foreground">{t.brand || "SignVault"}</span>
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {!isDashboard &&
            menuItems.map((item) => (
              <a
                key={item.sectionId}
                href={`#${item.sectionId}`}
                className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </a>
            ))}
        </div>

        <div className="hidden items-center gap-3 md:flex">
          {isDashboard ? (
            <Link to={config.links.home}>
              <Button variant="ghost" size="sm">{t.backToHomeButton || "Back to Home"}</Button>
            </Link>
          ) : (
            <>
              <Link to={config.links.signin}>
                <Button variant="ghost" size="sm">{t.signInButton || "Sign In"}</Button>
              </Link>
              <Link to={config.links.signup}>
                <Button size="sm">{t.getStartedButton || "Get Started"}</Button>
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-card px-4 py-4 md:hidden">
          <div className="flex flex-col gap-2">
            {!isDashboard &&
              menuItems.map((item) => (
                <a
                  key={item.sectionId}
                  href={`#${item.sectionId}`}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-muted-foreground"
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </a>
              ))}
            <Link to={config.links.signup}>
              <Button className="w-full mt-2" size="sm">{t.getStartedButton || "Get Started"}</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;