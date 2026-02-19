import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Bus, Phone, MessageCircle, AlertTriangle, CheckCircle,
  Navigation, Shield, User, Share2, Battery, Wifi, Star,
  ChevronRight, Zap, ThermometerSun, Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";

const tripSteps = [
  { time: "6:00 AM", label: "Auto pickup from Koramangala", status: "done", detail: "Picked up on time" },
  { time: "6:20 AM", label: "Crossed Silk Board Junction", status: "done", detail: "Mild traffic" },
  { time: "6:35 AM", label: "Arrive at Majestic Bus Stand", status: "current", detail: "ETA 12 min" },
  { time: "7:00 AM", label: "Bus departs to Goa", status: "upcoming", detail: "Platform 4B" },
  { time: "1:30 PM", label: "Lunch break — Hubli", status: "upcoming", detail: "30 min halt" },
  { time: "4:00 PM", label: "Arrive in Goa (Panaji)", status: "upcoming", detail: "Final stop" },
];

const busAmenities = [
  { icon: Wifi, label: "WiFi" },
  { icon: Zap, label: "Charging" },
  { icon: ThermometerSun, label: "AC" },
  { icon: Volume2, label: "Entertainment" },
];

const LiveTracking = () => {
  const [eta, setEta] = useState(12);
  const [busStatus] = useState<"on_time" | "delayed">("on_time");
  const [progress, setProgress] = useState(20);
  const [activeTab, setActiveTab] = useState<"timeline" | "bus" | "safety">("timeline");

  useEffect(() => {
    const interval = setInterval(() => {
      setEta((prev) => Math.max(0, prev - 1));
      setProgress((prev) => Math.min(100, prev + 2));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background pt-16 relative">
      {/* Map Area */}
      <div className="relative h-[45vh] md:h-[55vh] bg-muted overflow-hidden">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
            `,
            backgroundSize: "40px 40px",
          }}
        />

        {/* Animated route path */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="routeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="hsl(var(--success))" />
              <stop offset="50%" stopColor="hsl(var(--primary))" />
              <stop offset="100%" stopColor="hsl(var(--secondary))" />
            </linearGradient>
          </defs>
          <path d="M 120 380 Q 250 250 350 280 Q 450 310 550 200 Q 620 140 700 120" stroke="hsl(var(--border))" strokeWidth="6" fill="none" strokeLinecap="round" />
          <motion.path
            d="M 120 380 Q 250 250 350 280 Q 450 310 550 200 Q 620 140 700 120"
            stroke="url(#routeGrad)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: progress / 100 }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </svg>

        {/* User location */}
        <motion.div animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 2, repeat: Infinity }} className="absolute left-[14%] top-[72%]">
          <div className="relative">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary shadow-lg border-2 border-primary-foreground" />
            <div className="absolute inset-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/30 animate-ping" />
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold text-primary bg-card px-1.5 py-0.5 rounded shadow whitespace-nowrap">You</span>
          </div>
        </motion.div>

        {/* Driver (auto) */}
        <motion.div animate={{ x: [0, 12, 0], y: [0, -4, 0] }} transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[30%] top-[50%]">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-success shadow-lg flex items-center justify-center border-2 border-success-foreground/20">
            <Navigation className="h-4 w-4 md:h-5 md:w-5 text-success-foreground" />
          </div>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold text-success bg-card px-1.5 py-0.5 rounded shadow whitespace-nowrap">Rajesh • 12 min</span>
        </motion.div>

        {/* Bus station */}
        <div className="absolute left-[48%] top-[48%] md:left-[50%]">
          <motion.div animate={{ y: [0, -4, 0] }} transition={{ duration: 2.5, repeat: Infinity }}>
            <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-secondary shadow-lg flex items-center justify-center border-2 border-secondary-foreground/20">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 text-secondary-foreground" />
            </div>
          </motion.div>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold text-secondary bg-card px-1.5 py-0.5 rounded shadow whitespace-nowrap">Majestic Stand</span>
        </div>

        {/* Intercity bus */}
        <motion.div animate={{ x: [-8, 8, -8] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }} className="absolute left-[72%] md:left-[75%] top-[24%]">
          <div className="w-9 h-9 md:w-11 md:h-11 rounded-xl bg-primary shadow-lg flex items-center justify-center border-2 border-primary-foreground/20">
            <Bus className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
          </div>
          <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] md:text-[10px] font-bold text-primary bg-card px-1.5 py-0.5 rounded shadow whitespace-nowrap">KA-01-F-9988</span>
        </motion.div>

        {/* Top status banner */}
        <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="absolute top-3 left-3 right-3 md:top-4 md:left-4 md:right-4 mx-auto max-w-md">
          <div className="glass-card-elevated p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${busStatus === "on_time" ? "bg-success/10" : "bg-warning/10"}`}>
                {busStatus === "on_time" ? <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success" /> : <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-warning" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-xs md:text-sm">On the way to boarding point</p>
                <p className="text-muted-foreground text-[10px] md:text-xs truncate">Auto arriving in {eta} min • Bus departs 7:00 AM</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0"><Share2 className="h-4 w-4" /></Button>
            </div>
            <div className="mt-2.5 h-1.5 md:h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-success via-primary to-secondary"
                initial={{ width: "20%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 1 }}
              />
            </div>
          </div>
        </motion.div>

        {/* Protection badge */}
        <div className="absolute top-[72px] md:top-4 right-3 md:right-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] md:text-xs font-semibold shadow-lg">
            <Shield className="h-3 w-3 md:h-3.5 md:w-3.5" />
            Protected
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="bg-card rounded-t-3xl -mt-6 relative z-10 border-t border-border min-h-[50vh]">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-border" />
        </div>

        <div className="px-4 md:px-6 pb-8">
          {/* ETA Card */}
          <div className="grid grid-cols-3 gap-2 mb-5 md:mb-6">
            {[
              { label: "Auto ETA", value: `${eta} min`, color: "text-success" },
              { label: "Bus Departs", value: "7:00 AM", color: "text-primary" },
              { label: "Arrives Goa", value: "4:00 PM", color: "text-secondary" },
            ].map((item) => (
              <motion.div key={item.label} whileHover={{ scale: 1.03 }} className="glass-card p-3 text-center">
                <p className="text-[10px] md:text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-lg md:text-2xl font-bold ${item.color}`}>{item.value}</p>
              </motion.div>
            ))}
          </div>

          {/* Driver Card */}
          <motion.div whileHover={{ scale: 1.01 }} className="glass-card-elevated p-3 md:p-4 mb-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                <User className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm md:text-base">Rajesh Kumar</p>
                <p className="text-xs text-muted-foreground truncate">Auto • KA-51-AB-1234</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3 w-3 text-warning fill-warning" />
                  <span className="text-xs font-medium text-foreground">4.7</span>
                  <span className="text-[10px] text-muted-foreground">(320 rides)</span>
                  <span className="ml-1 text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full font-medium">Verified</span>
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl"><Phone className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl"><MessageCircle className="h-4 w-4" /></Button>
              </div>
            </div>
          </motion.div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-4">
            {(["timeline", "bus", "safety"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
                }`}
              >
                {tab === "timeline" ? "Timeline" : tab === "bus" ? "Bus Info" : "Safety"}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <AnimatePresence mode="wait">
            {activeTab === "timeline" && (
              <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-0">
                {tripSteps.map((item, i) => (
                  <div key={i} className="flex gap-3 md:gap-4">
                    {/* Vertical line + dot */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${
                        item.status === "done" ? "bg-success border-success" :
                        item.status === "current" ? "bg-primary border-primary animate-pulse" :
                        "bg-card border-border"
                      }`} />
                      {i < tripSteps.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-[32px] ${item.status === "done" ? "bg-success/40" : "bg-border"}`} />
                      )}
                    </div>
                    <div className="pb-4 flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-xs md:text-sm ${item.status === "upcoming" ? "text-muted-foreground" : "text-foreground font-medium"}`}>{item.label}</p>
                        <span className="text-[10px] md:text-xs text-muted-foreground flex-shrink-0 ml-2">{item.time}</span>
                      </div>
                      <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === "bus" && (
              <motion.div key="bus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-foreground text-sm">Goa Express — Sleeper AC</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                      <span className="text-sm font-medium text-foreground">4.5</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-muted-foreground">Operator</span><p className="font-medium text-foreground">VRL Travels</p></div>
                    <div><span className="text-muted-foreground">Seat</span><p className="font-medium text-foreground">L12 (Lower Berth)</p></div>
                    <div><span className="text-muted-foreground">Platform</span><p className="font-medium text-foreground">4B — Gate 2</p></div>
                    <div><span className="text-muted-foreground">Vehicle</span><p className="font-medium text-foreground">KA-01-F-9988</p></div>
                  </div>
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2">Amenities</p>
                  <div className="grid grid-cols-4 gap-2">
                    {busAmenities.map((a) => (
                      <div key={a.label} className="flex flex-col items-center gap-1 p-2.5 rounded-xl bg-muted">
                        <a.icon className="h-4 w-4 text-primary" />
                        <span className="text-[10px] font-medium text-foreground">{a.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 text-[10px] md:text-xs">
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 text-success font-medium"><Battery className="h-3 w-3" /> Charging available</div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary font-medium"><Wifi className="h-3 w-3" /> Free WiFi</div>
                </div>
              </motion.div>
            )}

            {activeTab === "safety" && (
              <motion.div key="safety" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                {[
                  { icon: Shield, title: "Trip Protection Active", desc: "Bus guaranteed to wait — ₹500 coverage", color: "text-success" },
                  { icon: Share2, title: "Live Location Shared", desc: "With Mom, Dad • Updated every 30s", color: "text-primary" },
                  { icon: Phone, title: "24/7 Emergency Support", desc: "One-tap SOS available anytime", color: "text-destructive" },
                  { icon: Star, title: "Verified Driver", desc: "Background checked & ID verified", color: "text-warning" },
                ].map((item) => (
                  <motion.div key={item.title} whileHover={{ scale: 1.01 }} className="glass-card p-3 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl bg-muted flex items-center justify-center flex-shrink-0`}>
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-xs md:text-sm">{item.title}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Bus waiting notification */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-5 p-3 md:p-4 rounded-2xl bg-success/10 border border-success/20 flex items-start gap-3"
          >
            <Bus className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-xs md:text-sm">🚌 Bus will wait for you!</p>
              <p className="text-muted-foreground text-[10px] md:text-xs">Conductor confirmed — auto arriving in {eta} min</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-5">
            <Button variant="destructive" size="lg" className="flex-1">
              <AlertTriangle className="h-4 w-4" />
              SOS Emergency
            </Button>
            <Button variant="outline" size="lg" className="flex-1">
              <Share2 className="h-4 w-4" />
              Share Trip
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
