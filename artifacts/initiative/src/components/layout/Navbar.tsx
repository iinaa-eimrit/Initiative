import { Link, useLocation } from "wouter";
import { Sparkles, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/initiatives" },
    { name: "Dashboard", href: "/dashboard" },
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-nav">
      <div className="page-container">
        <div className="flex justify-between items-center h-13">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary via-teal-400 to-cyan-400 flex items-center justify-center text-white shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold text-base tracking-tight">Initiative</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            <div className="flex bg-muted/50 rounded-lg p-0.5 mr-2">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-1 rounded-md text-[13px] font-medium transition-all duration-150 ${
                    location === link.href
                      ? "bg-card text-foreground shadow-xs"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-muted/60 text-muted-foreground hover:text-foreground transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <Link href="/initiatives/new">
              <Button size="sm" className="rounded-lg px-3.5 h-7 ml-1 text-[12px] shadow-sm bg-gradient-to-r from-primary to-teal-500 border-0 hover:shadow-md hover:-translate-y-px transition-all duration-200">
                <Sparkles className="w-3 h-3 mr-1" /> Generate with AI
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-1.5 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            </button>
            <button
              className="p-1.5 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-[18px] h-[18px]" /> : <Menu className="w-[18px] h-[18px]" />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card/95 backdrop-blur-xl border-b border-border overflow-hidden"
          >
            <div className="px-4 pt-1.5 pb-3 space-y-0.5 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    location === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/initiatives/new" onClick={() => setIsMobileMenuOpen(false)}>
                <Button size="sm" className="w-full mt-1 rounded-lg text-xs bg-gradient-to-r from-primary to-teal-500 border-0">
                  <Sparkles className="w-3 h-3 mr-1" /> Generate with AI
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
