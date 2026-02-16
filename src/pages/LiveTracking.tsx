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
      <div className="relative h-[60vh] bg-muted overflow-hidden">
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
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 800 500">
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
            <div className="w-6 h-6 rounded-full bg-primary shadow-lg" />
            <div className="absolute inset-0 w-6 h-6 rounded-full bg-primary/30 animate-ping" />
          </div>
        </motion.div>

        {/* Driver location */}
        <motion.div
          animate={{ x: [0, 15, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute left-[35%] top-[45%]"
        >
          <div className="w-10 h-10 rounded-xl bg-success shadow-lg flex items-center justify-center">
            <Navigation className="h-5 w-5 text-success-foreground" />
          </div>
        </motion.div>

        {/* Bus station marker */}
        <div className="absolute left-[50%] top-[50%]">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-secondary shadow-lg flex items-center justify-center">
              <MapPin className="h-5 w-5 text-secondary-foreground" />
            </div>
            <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-xs font-semibold text-foreground whitespace-nowrap bg-card px-2 py-0.5 rounded-md shadow">
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
          <div className="w-10 h-10 rounded-xl bg-primary shadow-lg flex items-center justify-center">
            <Bus className="h-5 w-5 text-primary-foreground" />
          </div>
        </motion.div>

        {/* Status Banner */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="absolute top-4 left-4 right-4 mx-auto max-w-md"
        >
          <div className="glass-card-elevated p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                busStatus === "on_time" ? "bg-success/10" : "bg-warning/10"
              }`}>
                {busStatus === "on_time" ? (
                  <CheckCircle className="h-5 w-5 text-success" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-warning" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground text-sm">
                  {busStatus === "on_time" ? "On the way to boarding point" : "Running slightly delayed"}
                </p>
                <p className="text-muted-foreground text-xs">
                  Auto arriving in {eta} min • Bus departs at 7:00 AM
                </p>
              </div>
            </div>
            <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
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
        <div className="absolute top-4 right-4">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-primary-foreground text-xs font-semibold shadow-lg">
            <Shield className="h-3.5 w-3.5" />
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

        <div className="px-6 pb-8">
          {/* ETA Card */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Auto ETA</p>
              <p className="text-3xl font-bold text-foreground">{eta} min</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Bus Departs</p>
              <p className="text-3xl font-bold text-foreground">7:00 AM</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Status</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-success" />
                <span className="font-semibold text-success">On Time</span>
              </div>
            </div>
          </div>

          {/* Driver Card */}
          <div className="glass-card p-4 mb-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
                <User className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <p className="font-semibold text-foreground">Rajesh Kumar</p>
                <p className="text-sm text-muted-foreground">Auto • KA-51-AB-1234 • ⭐ 4.7</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="icon">
                  <Phone className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon">
                  <MessageCircle className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Trip Timeline */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" /> Trip Timeline
            </h3>
            {[
              { time: "6:00 AM", label: "Auto pickup from Koramangala", status: "done" },
              { time: "6:35 AM", label: "Arrive at Majestic Bus Stand", status: "current" },
              { time: "7:00 AM", label: "Bus departs to Goa", status: "upcoming" },
              { time: "4:00 PM", label: "Arrive in Goa (Panaji)", status: "upcoming" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full flex-shrink-0 ${
                  item.status === "done" ? "bg-success" :
                  item.status === "current" ? "bg-primary animate-pulse" :
                  "bg-border"
                }`} />
                <div className="flex-1">
                  <p className={`text-sm ${item.status === "upcoming" ? "text-muted-foreground" : "text-foreground font-medium"}`}>
                    {item.label}
                  </p>
                </div>
                <span className="text-sm text-muted-foreground">{item.time}</span>
              </div>
            ))}
          </div>

          {/* Bus waiting notification */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 }}
            className="mt-6 p-4 rounded-2xl bg-success/10 border border-success/20 flex items-start gap-3"
          >
            <Bus className="h-5 w-5 text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-sm">
                🚌 Bus will wait for you!
              </p>
              <p className="text-muted-foreground text-sm">
                Conductor confirmed — arriving in {eta} minutes
              </p>
            </div>
          </motion.div>

          {/* Emergency button */}
          <Button variant="destructive" size="lg" className="w-full mt-6">
            <AlertTriangle className="h-4 w-4" />
            Emergency Support
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
