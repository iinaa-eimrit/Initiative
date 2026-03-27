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
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-14">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-display font-bold text-xl tracking-tight">Initiative</span>
          </Link>

          <div className="hidden md:flex items-center gap-6">
            <div className="flex gap-5">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/initiatives/new">
              <Button size="sm" className="rounded-full px-5 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate with AI
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-muted/50 text-muted-foreground"
              aria-label="Toggle theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              className="p-2 text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
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
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <div className="px-4 pt-2 pb-4 space-y-2 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                    location === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <Link href="/initiatives/new" onClick={() => setIsMobileMenuOpen(false)}>
                <Button size="sm" className="w-full mt-1">
                  <Sparkles className="w-3.5 h-3.5 mr-1.5" /> Generate with AI
                </Button>
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
