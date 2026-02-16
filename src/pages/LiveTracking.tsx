import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Bus, Phone, MessageCircle, AlertTriangle, CheckCircle,
  Clock, Navigation, ChevronUp, Shield, User
} from "lucide-react";
import { Button } from "@/components/ui/button";

const LiveTracking = () => {
  const [eta, setEta] = useState(12);
  const [busStatus, setBusStatus] = useState<"on_time" | "delayed">("on_time");
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setEta((prev) => Math.max(0, prev - 1));
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background pt-16 relative">
      {/* Mock Map Area */}
      <div className="relative h-[50vh] md:h-[60vh] bg-muted overflow-hidden">
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

        {/* Mock route line */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500" preserveAspectRatio="xMidYMid meet">
          <path
            d="M 150 350 Q 300 200 400 250 Q 500 300 650 150"
            stroke="hsl(var(--primary))"
            strokeWidth="4"
            fill="none"
            strokeDasharray="8 4"
            opacity="0.6"
          />
        </svg>

        {/* User location */}
        <motion.div
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute left-[18%] top-[65%]"
        >
          <div className="relative">
            <div className="w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary shadow-lg" />
            <div className="absolute inset-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-primary/30 animate-ping" />
          </div>
        </motion.div>

        {/* Driver location */}
        <motion.div
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute left-[35%] top-[45%]"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-success shadow-lg flex items-center justify-center">
            <Navigation className="h-4 w-4 md:h-5 md:w-5 text-success-foreground" />
          </div>
        </motion.div>

        {/* Bus station marker */}
        <div className="absolute left-[50%] top-[50%]">
          <div className="relative">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-secondary shadow-lg flex items-center justify-center">
              <MapPin className="h-4 w-4 md:h-5 md:w-5 text-secondary-foreground" />
            </div>
            <span className="absolute -bottom-5 left-1/2 -translate-x-1/2 text-[10px] md:text-xs font-semibold text-foreground whitespace-nowrap bg-card px-1.5 py-0.5 rounded-md shadow">
              Majestic Bus Stand
            </span>
          </div>
        </div>

        {/* Bus location */}
        <motion.div
          animate={{ x: [-10, 10, -10] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute left-[75%] top-[28%]"
        >
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-primary shadow-lg flex items-center justify-center">
            <Bus className="h-4 w-4 md:h-5 md:w-5 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-3 left-3 right-3 md:top-4 md:left-4 md:right-4 mx-auto max-w-md"
        >
          <div className="glass-card-elevated p-3 md:p-4">
            <div className="flex items-center gap-2 md:gap-3">
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                busStatus === "on_time" ? "bg-success/10" : "bg-warning/10"
              }`}>
                {busStatus === "on_time" ? (
                  <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-4 w-4 md:h-5 md:w-5 text-warning" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-xs md:text-sm">
                  {busStatus === "on_time" ? "On the way to boarding point" : "Running slightly delayed"}
                </p>
                <p className="text-muted-foreground text-[10px] md:text-xs truncate">
                  Auto arriving in {eta} min • Bus departs at 7:00 AM
                </p>
              </div>
            </div>
            <div className="mt-2 md:mt-3 h-1.5 md:h-2 rounded-full bg-muted overflow-hidden">
              <motion.div
                initial={{ width: "20%" }}
                animate={{ width: "55%" }}
                transition={{ duration: 2 }}
                className="h-full rounded-full gradient-primary"
              />
            </div>
          </div>
        </motion.div>

        {/* Protection badge */}
        <div className="absolute top-16 md:top-4 right-3 md:right-4">
          <div className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-full bg-primary text-primary-foreground text-[10px] md:text-xs font-semibold shadow-lg">
            <Shield className="h-3 w-3 md:h-3.5 md:w-3.5" />
            Protected
          </div>
        </div>
      </div>

      {/* Bottom Sheet */}
      <div className="bg-card rounded-t-3xl -mt-6 relative z-10 border-t border-border min-h-[40vh]">
        <button
          onClick={() => setSheetOpen(!sheetOpen)}
          className="w-full flex justify-center pt-3 pb-2"
        >
          <div className="w-10 h-1.5 rounded-full bg-border" />
        </button>

        <div className="px-4 md:px-6 pb-8">
          {/* ETA Card */}
          <div className="flex items-center justify-between mb-5 md:mb-6 gap-2">
            <div className="min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Auto ETA</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{eta} min</p>
            </div>
            <div className="text-center min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Bus Departs</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">7:00 AM</p>
            </div>
            <div className="text-right min-w-0">
              <p className="text-xs md:text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-1 justify-end">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="font-semibold text-success text-sm md:text-base">On Time</span>
              </div>
            </div>
          </div>

          {/* Driver Card */}
          <div className="glass-card p-3 md:p-4 mb-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                <User className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm md:text-base">Rajesh Kumar</p>
                <p className="text-xs md:text-sm text-muted-foreground truncate">Auto • KA-51-AB-1234 • ⭐ 4.7</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <Button variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-10">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="h-9 w-9 md:h-10 md:w-10">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Trip Timeline */}
          <div className="space-y-3 md:space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm md:text-base">
              <Clock className="h-4 w-4" /> Trip Timeline
            </h3>
            {[
              { time: "6:00 AM", label: "Auto pickup from Koramangala", status: "done" },
              { time: "6:35 AM", label: "Arrive at Majestic Bus Stand", status: "current" },
              { time: "7:00 AM", label: "Bus departs to Goa", status: "upcoming" },
              { time: "4:00 PM", label: "Arrive in Goa (Panaji)", status: "upcoming" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 md:gap-4">
                <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0 ${
                  item.status === "done" ? "bg-success" :
                  item.status === "current" ? "bg-primary animate-pulse" :
                  "bg-border"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs md:text-sm ${item.status === "upcoming" ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                    {item.label}
                  </p>
                </div>
                <span className="text-xs md:text-sm text-muted-foreground flex-shrink-0">{item.time}</span>
              </div>
            ))}
          </div>

          {/* Bus waiting notification */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-5 md:mt-6 p-3 md:p-4 rounded-2xl bg-success/10 border border-success/20 flex items-start gap-3"
          >
            <Bus className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-xs md:text-sm">
                🚌 Bus will wait for you!
              </p>
              <p className="text-muted-foreground text-xs md:text-sm">
                Conductor confirmed — arriving in {eta} minutes
              </p>
            </div>
          </motion.div>

          {/* Emergency button */}
          <Button variant="destructive" size="lg" className="w-full mt-5 md:mt-6">
            <AlertTriangle className="h-4 w-4" />
            Emergency Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
