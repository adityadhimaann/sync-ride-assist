import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu, X, Shield, User, LogOut,
  MapPin, Navigation, Calendar,
  Settings, Home, Contact, Lock, Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, type UserProfile } from "@/lib/database";
import { toast } from "sonner";

const navItems = [
  { label: "Plan Journey", href: "/", icon: Home },
  { label: "Live Tracking", href: "/tracking", icon: Navigation },
  { label: "Safety", href: "/safety", icon: Shield },
  { label: "Insurance", href: "/insurance", icon: Lock },
  { label: "Conductor", href: "/conductor", icon: Contact },
];

const mobileNavItems = [
  { label: "Plan", href: "/", icon: Home },
  { label: "Tracking", href: "/tracking", icon: Navigation },
  { label: "Safety", href: "/safety", icon: Shield },
  { label: "Conductor", href: "/conductor", icon: Contact },
  { label: "Profile", href: "/profile", icon: User },
];

const Navbar = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const isTrackingPage = location.pathname === "/tracking";

  useEffect(() => {
    if (!user) { setProfile(null); return; }
    getUserProfile(user.uid).then((p) => setProfile(p));
  }, [user]);

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
    navigate("/");
  };

  const displayName = profile?.username ? `@${profile.username}` : profile?.name || user?.displayName || user?.email;
  const avatarUrl = profile?.photoURL || user?.photoURL;

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed z-50 transition-all duration-500 ${isTrackingPage
          ? "hidden md:flex md:top-0 md:left-0 md:bottom-0 md:w-24 md:h-full md:border-r border-border/40 bg-card/80 backdrop-blur-3xl overflow-y-auto overflow-x-hidden"
          : "top-0 left-0 right-0 h-16 md:h-20 border-b border-border/40 bg-background/80 backdrop-blur-xl"
          }`}
      >
        <div className={`flex h-full px-4 md:px-8 ${isTrackingPage ? "flex-col py-6 items-center w-full" : "max-w-7xl mx-auto items-center justify-between w-full"
          }`}>
          <Link to="/" className={`flex items-center gap-2 ${isTrackingPage ? "mb-10" : ""}`}>
            <span className="text-xl md:text-2xl font-black tracking-tight">
              <span className="text-primary">Sync</span><span className="text-secondary">Ride</span>
            </span>
          </Link>

          {/* Nav Items */}
          <div className={`flex ${isTrackingPage ? "flex-col gap-6" : "hidden md:flex items-center gap-2"}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  title={item.label}
                  className={`transition-all flex items-center gap-2 ${isTrackingPage
                    ? `p-3 rounded-2xl ${isActive ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30" : "text-muted-foreground hover:bg-accent"}`
                    : `px-2 lg:px-3 xl:px-4 py-2 rounded-xl text-sm font-semibold ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`
                    }`}
                >
                  <Icon className={`${isTrackingPage ? "h-6 w-6" : "h-4 w-4"}`} />
                  {!isTrackingPage && <span className="hidden xl:inline">{item.label}</span>}
                </Link>
              );
            })}

            {/* Trip Status Toggle in Sidebar (Desktop Tracking Only) */}
            {isTrackingPage && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('toggle-trip-status'))}
                title="Trip Status"
                className="p-3 rounded-2xl text-muted-foreground hover:bg-accent hover:text-primary transition-all mt-2 group"
              >
                <Activity className="h-6 w-6 group-hover:scale-110 transition-transform" />
              </button>
            )}
          </div>

          <div className={`flex items-center ${isTrackingPage ? "mt-auto flex-col gap-6" : "gap-3"}`}>
            {user ? (
              <div className={`flex ${isTrackingPage ? "flex-col gap-6" : "hidden md:flex items-center gap-4"}`}>
                <Link to="/profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                  <div className={`rounded-full overflow-hidden bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center border-2 border-primary/20 shadow-sm ${isTrackingPage ? "w-12 h-12" : "w-10 h-10 md:w-11 md:h-11"
                    }`}>
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-bold text-primary">
                        {(profile?.name || user.displayName || "U")[0].toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
                {!isTrackingPage ? (
                  <Button variant="outline" size="sm" onClick={handleLogout} className="rounded-xl font-bold">
                    <LogOut className="h-4 w-4 xl:mr-2" />
                    <span className="hidden xl:inline">Logout</span>
                  </Button>
                ) : (
                  <button onClick={handleLogout} className="p-3 text-muted-foreground hover:text-destructive transition-colors" title="Logout">
                    <LogOut className="h-6 w-6" />
                  </button>
                )}
              </div>
            ) : (
              <div className={`flex ${isTrackingPage ? "flex-col gap-4" : "hidden md:flex items-center gap-2"}`}>
                <Link to="/login">
                  <Button variant="ghost" size="sm" className="font-bold">{isTrackingPage ? "L" : "Login"}</Button>
                </Link>
                {!isTrackingPage && (
                  <Link to="/signup">
                    <Button variant="hero" size="sm" className="px-6">Sign Up</Button>
                  </Link>
                )}
              </div>
            )}

            {/* User Profile / Mobile Actions (Top Right) */}
            <div className="md:hidden flex items-center gap-3">
              {user ? (
                <Link to="/profile">
                  <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-primary/20 bg-card/80 backdrop-blur-md">
                    {avatarUrl ? (
                      <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-primary font-bold">
                        {(profile?.name || user.displayName || "U")[0].toUpperCase()}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="h-9 px-3 rounded-xl text-xs font-bold">Login</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="hero" size="sm" className="h-9 px-4 rounded-xl text-xs shadow-lg">Sign Up</Button>
                  </Link>
                </div>
              )}

              {/* Two bars toggle */}
              <button
                className="p-1 pl-2 text-foreground focus:outline-none"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="flex flex-col gap-1.5 w-6 items-end">
                  <span className={`block h-[2px] w-full bg-current transition-all duration-300 rounded-full ${isMobileMenuOpen ? 'rotate-45 translate-y-[8px]' : ''}`} />
                  <span className={`block h-[2px] bg-current transition-all duration-300 rounded-full ${isMobileMenuOpen ? 'w-full -rotate-45' : 'w-1/2'}`} />
                </div>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile/Tablet Dropdown Navigation Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-border/40 z-40 shadow-xl max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="flex flex-col p-4 gap-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.label}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-all ${isActive ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-accent"}`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-semibold text-sm">{item.label}</span>
                  </Link>
                );
              })}


              {user && (
                <>
                  <div className="h-px bg-border/50 my-2" />
                  <button
                    onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }}
                    className="flex items-center gap-3 p-3 rounded-xl transition-all text-destructive hover:bg-destructive/10 w-full text-left"
                  >
                    <LogOut className="h-5 w-5" />
                    <span className="font-semibold text-sm">Logout</span>
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
