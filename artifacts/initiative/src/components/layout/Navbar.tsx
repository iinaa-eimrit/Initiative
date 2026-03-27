import { Link, useLocation } from "wouter";
import { Sparkles, Menu, X, LogOut, LayoutDashboard, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";

export function Navbar() {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Explore", href: "/initiatives" },
    ...(user ? [{ name: "Dashboard", href: "/dashboard" }] : []),
  ];

  return (
    <nav className="fixed top-0 w-full z-50 glass-card border-b border-border/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-teal-400 flex items-center justify-center text-white shadow-lg shadow-primary/20 group-hover:shadow-primary/40 group-hover:scale-105 transition-all duration-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <span className="font-display font-bold text-2xl tracking-tight">Initiative</span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <div className="flex gap-6">
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
            <div className="flex items-center gap-3">
              {user ? (
                <>
                  <Link href="/initiatives/new">
                    <Button className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                      Start an Initiative
                    </Button>
                  </Link>
                  <div className="flex items-center gap-2 pl-2 border-l border-border/50">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                      {user.name.charAt(0)}
                    </div>
                    <span className="text-sm font-medium max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
                    <button
                      onClick={() => {
                        logout();
                        window.location.href = "/";
                      }}
                      className="p-1.5 rounded-lg hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors"
                      title="Sign out"
                    >
                      <LogOut className="w-4 h-4" />
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login">
                    <Button variant="ghost" className="rounded-full px-5">
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup">
                    <Button className="rounded-full px-6 shadow-md shadow-primary/20 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-4 pt-2 pb-6 space-y-4 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    location === link.href ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              {user ? (
                <>
                  <Link href="/initiatives/new" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full mt-2">Start an Initiative</Button>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                      window.location.href = "/";
                    }}
                    className="flex items-center gap-2 px-3 py-2 text-base text-muted-foreground hover:text-foreground"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
