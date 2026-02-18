import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bus, Menu, X, Shield, User } from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Plan Journey", href: "/" },
  { label: "Live Tracking", href: "/tracking" },
  { label: "Safety", href: "/safety" },
  { label: "Insurance", href: "/insurance" },
  { label: "Conductor", href: "/conductor" },
];

const Navbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 nav-blur"
    >
      <div className="container mx-auto flex items-center justify-between h-16 px-4">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="gradient-primary rounded-xl p-2">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">
            Sync<span className="text-secondary">Ride</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.label}
              to={item.href}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                location.pathname === item.href
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Button variant="ghost" size="sm">
            <User className="h-4 w-4" />
            Login
          </Button>
          <Button variant="hero" size="sm">
            <Shield className="h-4 w-4" />
            Get Protected
          </Button>
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-xl hover:bg-accent"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-border/50 bg-background/95 backdrop-blur-xl"
          >
            <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-foreground hover:bg-accent"
                >
                  {item.label}
                </Link>
              ))}
              <div className="flex gap-2 pt-2">
                <Button variant="ghost" size="sm" className="flex-1">Login</Button>
                <Button variant="hero" size="sm" className="flex-1">Get Protected</Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

export default Navbar;
