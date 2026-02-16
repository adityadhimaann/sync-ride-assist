import { useState } from "react";
import { motion } from "framer-motion";
import {
  MapPin, Bus, Navigation, Clock, ChevronDown, ChevronUp, Shield,
  AlertTriangle, ArrowLeft, Wallet, Users, Wifi, Snowflake
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Footer from "@/components/Footer";
import type { JourneyLeg } from "@/types/trip";

const mockLegs: JourneyLeg[] = [
  {
    id: "1",
    type: "local_transport",
    from: "Koramangala, Bangalore",
    to: "Majestic Bus Stand",
    duration: 35,
    cost: 180,
    distance: 12,
    status: "upcoming",
    vehicle: "Auto Rickshaw",
    departureTime: "6:00 AM",
    arrivalTime: "6:35 AM",
  },
  {
    id: "2",
    type: "wait",
    from: "Majestic Bus Stand",
    to: "Majestic Bus Stand",
    duration: 20,
    cost: 0,
    status: "upcoming",
    departureTime: "6:35 AM",
    arrivalTime: "6:55 AM",
  },
  {
    id: "3",
    type: "intercity_bus",
    from: "Majestic Bus Stand, Bangalore",
    to: "Goa (Panaji)",
    duration: 540,
    cost: 1200,
    distance: 560,
    status: "upcoming",
    vehicle: "Volvo Multi-Axle Sleeper",
    operator: "VRL Travels",
    departureTime: "7:00 AM",
    arrivalTime: "4:00 PM",
  },
];

const legIcons: Record<string, typeof MapPin> = {
  local_transport: MapPin,
  wait: Clock,
  intercity_bus: Bus,
  walk: Navigation,
};

const legColors: Record<string, string> = {
  local_transport: "bg-success/10 text-success border-success/20",
  wait: "bg-warning/10 text-warning border-warning/20",
  intercity_bus: "bg-primary/10 text-primary border-primary/20",
  walk: "bg-muted text-muted-foreground border-border",
};

const JourneyResults = () => {
  const [expandedLeg, setExpandedLeg] = useState<string | null>(null);
  const [protectionEnabled, setProtectionEnabled] = useState(false);
  const navigate = useNavigate();

  const totalCost = mockLegs.reduce((sum, l) => sum + l.cost, 0) + (protectionEnabled ? 75 : 0);
  const totalDuration = mockLegs.reduce((sum, l) => sum + l.duration, 0);

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to search
          </button>

          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">Your Journey Plan</h1>
            <p className="text-muted-foreground">
              Koramangala → Majestic → Goa • {Math.floor(totalDuration / 60)}h {totalDuration % 60}m total
            </p>
          </div>

          {/* Traffic Alert */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex items-start gap-3 p-4 rounded-2xl bg-warning/10 border border-warning/20 mb-6"
          >
            <AlertTriangle className="h-5 w-5 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-sm">Heavy traffic detected on Hosur Road</p>
              <p className="text-muted-foreground text-sm">We've added a 10-min buffer. Consider leaving 5 minutes early.</p>
            </div>
          </motion.div>

          {/* Journey Timeline */}
          <div className="space-y-4 mb-8">
            {mockLegs.map((leg, i) => {
              const Icon = legIcons[leg.type];
              const isExpanded = expandedLeg === leg.id;

              return (
                <motion.div
                  key={leg.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="glass-card overflow-hidden"
                >
                  <button
                    onClick={() => setExpandedLeg(isExpanded ? null : leg.id)}
                    className="w-full p-5 flex items-center gap-4 text-left"
                  >
                    <div className="flex flex-col items-center">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${legColors[leg.type]}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      {i < mockLegs.length - 1 && (
                        <div className="w-0.5 h-6 bg-border mt-2" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-foreground text-sm">
                          {leg.type === "wait" ? "Buffer Time" : leg.vehicle || "Walking"}
                        </span>
                        <span className="text-sm font-bold text-foreground">
                          {leg.cost > 0 ? `₹${leg.cost}` : "Free"}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-sm truncate">
                        {leg.from} → {leg.to}
                      </p>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground">
                        <span>{leg.departureTime} - {leg.arrivalTime}</span>
                        <span>•</span>
                        <span>{leg.duration} min</span>
                        {leg.distance && (
                          <>
                            <span>•</span>
                            <span>{leg.distance} km</span>
                          </>
                        )}
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground" />
                    )}
                  </button>

                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-border px-5 pb-5"
                    >
                      <div className="pt-4 space-y-3">
                        {leg.operator && (
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Operator</span>
                            <span className="font-medium text-foreground">{leg.operator}</span>
                          </div>
                        )}
                        {leg.type === "intercity_bus" && (
                          <div className="flex gap-2 flex-wrap">
                            {[
                              { icon: Wifi, label: "WiFi" },
                              { icon: Snowflake, label: "AC" },
                              { icon: Users, label: "23 seats left" },
                            ].map(({ icon: AmenityIcon, label }) => (
                              <span key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-muted text-xs text-muted-foreground">
                                <AmenityIcon className="h-3.5 w-3.5" /> {label}
                              </span>
                            ))}
                          </div>
                        )}
                        {leg.type === "local_transport" && (
                          <Button variant="outline" size="sm" className="w-full">
                            <Users className="h-4 w-4" />
                            View Shared Ride Options (save ₹60)
                          </Button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>

          {/* Protection Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-2xl p-5 border-2 transition-colors cursor-pointer mb-8 ${
              protectionEnabled
                ? "border-primary bg-primary/5"
                : "border-border bg-card"
            }`}
            onClick={() => setProtectionEnabled(!protectionEnabled)}
          >
            <div className="flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                protectionEnabled ? "gradient-primary" : "bg-muted"
              }`}>
                <Shield className={`h-5 w-5 ${protectionEnabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">Guaranteed Arrival</span>
                  <span className="font-bold text-foreground">₹75</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  Bus waits up to 10 min or full refund + ₹500 compensation
                </p>
              </div>
              <div className={`w-12 h-7 rounded-full p-1 transition-colors ${protectionEnabled ? "bg-primary" : "bg-border"}`}>
                <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${protectionEnabled ? "translate-x-5" : ""}`} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-xl border-t border-border p-4 z-40">
        <div className="container mx-auto max-w-2xl flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-muted-foreground" />
              <span className="text-2xl font-bold text-foreground">₹{totalCost}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {Math.floor(totalDuration / 60)}h {totalDuration % 60}m • {protectionEnabled ? "Protected ✓" : "No protection"}
            </p>
          </div>
          <Button variant="hero" size="lg" onClick={() => navigate("/tracking")}>
            Book Now
          </Button>
        </div>
      </div>

      <div className="pb-24" />
      <Footer />
    </div>
  );
};

export default JourneyResults;
