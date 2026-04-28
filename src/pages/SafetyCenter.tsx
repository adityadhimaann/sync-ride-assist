import { useState } from "react";
import { motion } from "framer-motion";
import {
  Shield, AlertTriangle, Phone, MapPin, UserCheck, Bell,
  Heart, Eye, Plus, X, CheckCircle, Siren, Share2, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Footer from "@/components/Footer";
import { useLocationSharing } from "@/hooks/useLocationSharing";
import { toast } from "sonner";
import { Copy, Loader2 } from "lucide-react";
import { getErrorMessage } from "@/lib/errors";

interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relation: string;
}

const mockContacts: EmergencyContact[] = [
  { id: "1", name: "Priya Sharma", phone: "+91 98765 43210", relation: "Sister" },
  { id: "2", name: "Amit Kumar", phone: "+91 87654 32109", relation: "Friend" },
];

const safetyFeatures = [
  {
    icon: Siren,
    title: "One-Tap SOS",
    description: "Instantly alert your emergency contacts and local authorities with your live location.",
    color: "bg-destructive/10 text-destructive border-destructive/20",
  },
  {
    icon: Share2,
    title: "Live Location Sharing",
    description: "Share real-time trip tracking with up to 5 trusted contacts throughout your journey.",
    color: "bg-primary/10 text-primary border-primary/20",
  },
  {
    icon: UserCheck,
    title: "Verified Drivers",
    description: "All drivers undergo background checks, live photo verification, and vehicle inspection.",
    color: "bg-success/10 text-success border-success/20",
  },
  {
    icon: Eye,
    title: "Route Deviation Alerts",
    description: "Automatic detection and alerts if your vehicle deviates from the planned route.",
    color: "bg-warning/10 text-warning border-warning/20",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const SafetyCenter = () => {
  const [contacts, setContacts] = useState(mockContacts);
  const [checkedIn, setCheckedIn] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);

  const {
    isSharing,
    shareLink,
    startSharing,
    stopSharing,
    currentLocation,
    error: locationError,
  } = useLocationSharing();

  const handleSOS = () => {
    setSosTriggered(true);
    // In production: send location to contacts + authorities
    setTimeout(() => setSosTriggered(false), 5000);
  };

  const handleCheckIn = () => {
    setCheckedIn(true);
    toast.success("Safe check-in sent to contacts!");
    setTimeout(() => setCheckedIn(false), 3000);
  };

  const handleToggleSharing = async () => {
    try {
      if (isSharing) {
        await stopSharing();
        toast.success("Location sharing stopped");
      } else {
        const id = await startSharing({ durationMinutes: 120 });
        if (id) toast.success("Location sharing started! Live for 2 hours.");
        else if (locationError) toast.error(locationError);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to toggle location sharing"));
    }
  };

  const copyShareLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied!");
    }
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-32">
      <div className="container mx-auto px-4 py-6 md:py-10 max-w-2xl">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Shield className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl md:text-3xl font-bold text-foreground">Safety Center</h1>
              <p className="text-muted-foreground text-xs md:text-sm">Your safety is our top priority</p>
            </div>
          </div>
        </motion.div>

        {/* SOS Button */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="glass-card-elevated p-6 md:p-8 text-center">
            <motion.button
              onClick={handleSOS}
              whileTap={{ scale: 0.95 }}
              className={`w-28 h-28 md:w-36 md:h-36 rounded-full mx-auto flex items-center justify-center transition-all duration-300 ${sosTriggered
                ? "bg-destructive animate-pulse shadow-[0_0_40px_hsla(0,84%,60%,0.5)]"
                : "bg-destructive/90 hover:bg-destructive shadow-[0_0_20px_hsla(0,84%,60%,0.3)] hover:shadow-[0_0_40px_hsla(0,84%,60%,0.5)]"
                }`}
            >
              <div className="text-center">
                <Siren className="h-8 w-8 md:h-10 md:w-10 text-destructive-foreground mx-auto mb-1" />
                <span className="text-destructive-foreground font-bold text-sm md:text-base">
                  {sosTriggered ? "SENDING..." : "SOS"}
                </span>
              </div>
            </motion.button>
            <p className="text-muted-foreground text-xs md:text-sm mt-4">
              {sosTriggered
                ? "🚨 Alerting your emergency contacts with your live location..."
                : "Tap in an emergency to alert contacts & local authorities"}
            </p>
            {sosTriggered && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 p-3 rounded-xl bg-destructive/10 border border-destructive/20"
              >
                <p className="text-destructive text-xs md:text-sm font-semibold">
                  📍 Location shared with {contacts.length} contacts
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 gap-3 mb-8"
        >
          <div className="flex flex-col gap-3">
            <button
              onClick={handleToggleSharing}
              className={`glass-card p-4 text-left transition-all w-full ${isSharing ? "border-primary/40 bg-primary/5" : ""
                }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${isSharing ? "bg-primary/10" : "bg-muted"
                }`}>
                <MapPin className={`h-4 w-4 ${isSharing ? "text-primary" : "text-muted-foreground"}`} />
              </div>
              <p className="font-semibold text-foreground text-xs md:text-sm">Live Sharing</p>
              <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                {isSharing ? "Active • Sharing Live GPS" : "Share location"}
              </p>
              {isSharing && (
                <span className="inline-flex items-center gap-1 mt-2 px-2 py-0.5 rounded-full bg-success/10 text-success text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" /> Live
                </span>
              )}
            </button>

            {isSharing && shareLink && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="px-1 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={shareLink}
                    readOnly
                    className="flex-1 h-8 px-3 rounded-lg border border-border bg-background text-[10px] text-muted-foreground truncate"
                  />
                  <Button variant="outline" size="sm" onClick={copyShareLink} className="gap-1.5 flex-shrink-0 h-8 text-[10px] px-2">
                    <Copy className="h-3 w-3" /> Copy
                  </Button>
                </div>
              </motion.div>
            )}
          </div>

          <button
            onClick={handleCheckIn}
            className={`glass-card p-4 text-left transition-all ${checkedIn ? "border-success/40 bg-success/5" : ""
              }`}
          >
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${checkedIn ? "bg-success/10" : "bg-muted"
              }`}>
              {checkedIn ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <Heart className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            <p className="font-semibold text-foreground text-xs md:text-sm">Safety Check-In</p>
            <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
              {checkedIn ? "✓ Sent to contacts" : "Let contacts know you're safe"}
            </p>
          </button>
        </motion.div>

        {/* Emergency Contacts */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-foreground text-base md:text-lg">Emergency Contacts</h2>
            <Button variant="ghost" size="sm" className="text-xs">
              <Plus className="h-3.5 w-3.5" /> Add
            </Button>
          </div>
          <div className="space-y-3">
            {contacts.map((contact) => (
              <div key={contact.id} className="glass-card p-3 md:p-4 flex items-center gap-3">
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-primary font-bold text-sm">{contact.name[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm truncate">{contact.name}</p>
                  <p className="text-xs text-muted-foreground">{contact.relation} • {contact.phone}</p>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <Button variant="outline" size="icon" className="h-8 w-8">
                    <Phone className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Safety Features */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="mb-8"
        >
          <h2 className="font-bold text-foreground text-base md:text-lg mb-4">Safety Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {safetyFeatures.map((feature) => (
              <motion.div
                key={feature.title}
                variants={itemVariants}
                className="glass-card p-4"
              >
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center border mb-3 ${feature.color}`}>
                  <feature.icon className="h-4 w-4" />
                </div>
                <p className="font-semibold text-foreground text-sm mb-1">{feature.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Night Travel Safety */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card-elevated p-4 md:p-5 mb-8"
        >
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Bell className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm mb-1">Night Travel Protocols</p>
              <ul className="space-y-1.5 text-xs text-muted-foreground">
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                  Auto check-in reminders every 2 hours
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                  Female driver preference option available
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                  Enhanced route deviation monitoring
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="h-3 w-3 text-success flex-shrink-0" />
                  Direct police helpline integration
                </li>
              </ul>
            </div>
          </div>
        </motion.div>

        {/* Helpline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="text-center mb-8"
        >
          <p className="text-muted-foreground text-xs mb-2">24/7 Safety Helpline</p>
          <a href="tel:+911800123456" className="text-xl md:text-2xl font-bold text-primary hover:underline">
            1800-123-456
          </a>
          <p className="text-muted-foreground text-[10px] mt-1">Toll-free • Available in English, Hindi, Punjabi</p>
        </motion.div>
      </div>
    </div>
  );
};

export default SafetyCenter;
