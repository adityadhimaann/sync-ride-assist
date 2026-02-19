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
            <img src="/assets/RideSync (1).svg" alt="SyncRide" className={`${isTrackingPage ? "h-10 w-10" : "h-10 md:h-12"} w-auto`} />
            {!isTrackingPage && (
              <span className="text-xl md:text-2xl font-black tracking-tight hidden xl:inline">
                <span className="text-primary">Sync</span><span className="text-secondary">Ride</span>
              </span>
            )}
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

            {/* User Profile Icon for Mobile (Top Right) */}
            <div className="md:hidden">
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
                <Link to="/login">
                  <Button variant="hero" size="sm" className="h-9 px-4 rounded-xl text-xs shadow-lg">Login</Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile/Tablet Bottom Navigation Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-4 pb-4 pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <div className="bg-card/90 backdrop-blur-2xl border border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.2)] rounded-[2rem] p-2 flex items-center justify-around">
            {mobileNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.label}
                  to={item.href}
                  className="relative flex flex-col items-center justify-center py-2 px-1 w-full group"
                >
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`p-1.5 rounded-xl transition-all duration-300 ${isActive
                      ? "bg-primary text-primary-foreground shadow-lg shadow-primary/30"
                      : "text-muted-foreground group-hover:bg-accent/50"
                      }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? "stroke-[2.5px]" : "stroke-[2px]"}`} />
                  </motion.div>
                  <span className={`text-[10px] mt-1 font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
                    {item.label}
                  </span>
                  {isActive && (
                    <motion.div
                      layoutId="activeDot"
                      className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary"
                    />
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
