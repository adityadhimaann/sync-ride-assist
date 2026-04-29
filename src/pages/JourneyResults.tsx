import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Bus, Navigation, Clock, ChevronDown, ChevronUp, Shield,
  AlertTriangle, ArrowLeft, Wallet, Users, Wifi, Snowflake, Star,
  RefreshCw, Zap, Banknote
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import Footer from "@/components/Footer";
import {
  planJourney,
  saveJourneySearch,
  saveJourneyPlan,
  type JourneyPlan,
  type JourneySearchParams,
  type JourneyPlanAlternative,
} from "@/lib/journey-planner";
import { logUserActivity, saveTrip, startLocationSharing, updateUserTripTracking } from "@/lib/database";
import { useAuth } from "@/contexts/AuthContext";
import type { JourneyLeg } from "@/types/trip";
import { getErrorMessage } from "@/lib/errors";

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

const severityColors: Record<string, string> = {
  low: "bg-blue-500/10 border-blue-500/20",
  medium: "bg-warning/10 border-warning/20",
  high: "bg-destructive/10 border-destructive/20",
};

const severityIcons: Record<string, string> = {
  low: "text-blue-500",
  medium: "text-warning",
  high: "text-destructive",
};

const JourneyResults = () => {
  const [searchParams] = useSearchParams();
  const [expandedLeg, setExpandedLeg] = useState<string | null>(null);
  const [protectionEnabled, setProtectionEnabled] = useState(false);
  const [selectedAlt, setSelectedAlt] = useState<string | null>(null); // null = main plan
  const [booking, setBooking] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  // Parse search params
  const journeyParams: JourneySearchParams = useMemo(() => ({
    startPoint: searchParams.get("from") || "",
    busStation: searchParams.get("bus") || "",
    destination: searchParams.get("to") || "",
    date: searchParams.get("date") || new Date().toISOString().split("T")[0],
    time: searchParams.get("time") || "07:00",
  }), [searchParams]);

  // Generate the journey plan (memoized so it doesn't regenerate on every render)
  const journeyPlan: JourneyPlan = useMemo(() => {
    return planJourney(journeyParams);
  }, [journeyParams]);

  // Save search to Firebase when user is logged in
  useEffect(() => {
    if (user && journeyParams.startPoint) {
      saveJourneySearch(user.uid, journeyParams).catch(() => { });
    }
  }, [user, journeyParams]);

  // Which legs to display (main or alternative)
  const activeLegs: JourneyLeg[] = useMemo(() => {
    if (!selectedAlt) return journeyPlan.legs;
    const alt = journeyPlan.alternatives.find((a) => a.id === selectedAlt);
    return alt ? alt.legs : journeyPlan.legs;
  }, [selectedAlt, journeyPlan]);

  const activePlan = useMemo(() => {
    if (!selectedAlt) return journeyPlan;
    const alt = journeyPlan.alternatives.find((a) => a.id === selectedAlt);
    if (!alt) return journeyPlan;
    return {
      ...journeyPlan,
      legs: alt.legs,
      totalCost: alt.totalCost,
      totalDuration: alt.totalDuration,
      totalDistance: alt.totalDistance,
      departureTime: alt.departureTime,
      arrivalTime: alt.arrivalTime,
    };
  }, [selectedAlt, journeyPlan]);

  const totalCost = activePlan.totalCost + (protectionEnabled ? 75 : 0);
  const totalDuration = activePlan.totalDuration;

  // Refresh route (re-randomize)
  const handleRefresh = () => {
    // Force re-navigation to regenerate the plan
    const params = new URLSearchParams({
      from: journeyParams.startPoint,
      bus: journeyParams.busStation,
      to: journeyParams.destination,
      ...(journeyParams.date && { date: journeyParams.date }),
      ...(journeyParams.time && { time: journeyParams.time }),
      _t: Date.now().toString(), // cache buster
    });
    navigate(`/results?${params.toString()}`, { replace: true });
  };

  // Book journey
  const handleBookNow = async () => {
    if (!user) {
      toast.error("Please sign in to book your journey");
      navigate("/login");
      return;
    }

    setBooking(true);
    try {
      // Save the journey plan to Firebase
      await saveJourneyPlan(user.uid, activePlan as JourneyPlan);

      // Also save as a trip
      const tripId = await saveTrip({
        userId: user.uid,
        from: journeyParams.startPoint,
        to: journeyParams.destination,
        date: journeyParams.date,
        totalCost,
        protectionEnabled,
        status: "active",
        legs: activeLegs.map((leg) => ({
          id: leg.id,
          type: leg.type,
          from: leg.from,
          to: leg.to,
          duration: leg.duration,
          cost: leg.cost,
          distance: leg.distance || 0,
          status: leg.status,
          vehicle: leg.vehicle || "",
          operator: leg.operator || "",
          departureTime: leg.departureTime,
          arrivalTime: leg.arrivalTime,
        })),
        createdAt: Date.now(),
      });

      await logUserActivity(user.uid, {
        type: "trip_booked",
        title: "Journey booked",
        description: `${journeyParams.startPoint} to ${journeyParams.destination}`,
        metadata: {
          tripId,
          totalCost,
          protectionEnabled,
        },
      }).catch(() => undefined);

      await updateUserTripTracking(user.uid, tripId, {
        status: "active",
        phase: "pickup",
        progress: 1,
        etaMinutes: totalDuration,
        currentLegId: activeLegs[0]?.id,
      }).catch(() => undefined);

      await startLocationSharing(user.uid, user.displayName || user.email || "SyncRide user", {
        tripId,
        durationMinutes: Math.max(totalDuration + 60, 120),
      })
        .then((shareId) =>
          logUserActivity(user.uid, {
            type: "location_sharing",
            title: "Live tracking started",
            description: "Your journey tracking session started after booking.",
            metadata: { tripId, shareId },
          }).catch(() => undefined)
        )
        .catch(() => {
          toast.warning("Journey booked. Open tracking and allow location access to share live GPS.");
        });

      toast.success("Journey started. Opening live tracking...");
      navigate(`/tracking?trip=${tripId}`);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to book journey"));
    } finally {
      setBooking(false);
    }
  };

  // If no search params, redirect to home
  if (!journeyParams.startPoint && !journeyParams.destination) {
    return (
      <div className="min-h-screen bg-background pt-20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-bold text-foreground">No journey details provided</h2>
          <p className="text-muted-foreground">Please plan your journey from the home page.</p>
          <Button variant="hero" onClick={() => navigate("/")}>
            Go to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20">
      <div className="container mx-auto px-4 py-6 md:py-8 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <button onClick={() => navigate("/")} className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 md:mb-6 transition-colors text-sm">
            <ArrowLeft className="h-4 w-4" /> Back to search
          </button>

          <div className="mb-6 md:mb-8">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl md:text-3xl font-bold text-foreground mb-1 md:mb-2 truncate">Your Journey Plan</h1>
                <p className="text-muted-foreground text-xs md:text-base leading-relaxed break-words">
                  <span className="font-medium text-foreground/80">{journeyParams.startPoint}</span>
                  <span className="mx-2 opacity-50">→</span>
                  <span className="font-medium text-foreground/80">{journeyParams.busStation}</span>
                  <span className="mx-2 opacity-50">→</span>
                  <span className="font-medium text-foreground/80">{journeyParams.destination}</span>
                  <span className="block mt-1 text-[10px] md:text-sm font-semibold text-primary uppercase tracking-wider">
                    {Math.floor(totalDuration / 60)}h {totalDuration % 60}m total journey time
                  </span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                className="gap-2 shrink-0 py-5 px-4 rounded-xl border-primary/20 hover:border-primary/50 hover:bg-primary/5 transition-all shadow-sm"
              >
                <RefreshCw className="h-4 w-4 text-primary" />
                <span className="hidden sm:inline font-semibold">Refresh</span>
              </Button>
            </div>
          </div>

          {/* Traffic Alert */}
          {journeyPlan.trafficAlert && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className={`flex items-start gap-3 p-3 md:p-4 rounded-xl md:rounded-2xl border mb-5 md:mb-6 ${severityColors[journeyPlan.trafficAlert.severity]}`}
            >
              <AlertTriangle className={`h-4 w-4 md:h-5 md:w-5 flex-shrink-0 mt-0.5 ${severityIcons[journeyPlan.trafficAlert.severity]}`} />
              <div>
                <p className="font-semibold text-foreground text-xs md:text-sm">{journeyPlan.trafficAlert.message}</p>
                <p className="text-muted-foreground text-xs md:text-sm">
                  We've added a {journeyPlan.trafficAlert.extraBuffer}-min buffer. Consider leaving early.
                </p>
              </div>
            </motion.div>
          )}

          {/* Alternative Routes */}
          {journeyPlan.alternatives.length > 0 && (
            <div className="mb-5 md:mb-6">
              <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Route Options</p>
              <div className="flex gap-2 overflow-x-auto pb-1">
                <button
                  onClick={() => setSelectedAlt(null)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-medium border transition-all whitespace-nowrap flex-shrink-0 ${!selectedAlt
                    ? "bg-primary/10 border-primary/30 text-primary"
                    : "bg-card border-border text-muted-foreground hover:border-primary/20"
                    }`}
                >
                  <Star className="h-3.5 w-3.5" />
                  Recommended
                  <span className="font-bold">₹{journeyPlan.totalCost}</span>
                </button>
                {journeyPlan.alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => setSelectedAlt(alt.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs md:text-sm font-medium border transition-all whitespace-nowrap flex-shrink-0 ${selectedAlt === alt.id
                      ? "bg-primary/10 border-primary/30 text-primary"
                      : "bg-card border-border text-muted-foreground hover:border-primary/20"
                      }`}
                  >
                    {alt.label.includes("Budget") ? <Banknote className="h-3.5 w-3.5" /> : <Zap className="h-3.5 w-3.5" />}
                    {alt.label.replace(/[^\w\s]/g, "").trim()}
                    <span className="font-bold">₹{alt.totalCost}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Journey Timeline */}
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            {activeLegs.map((leg, i) => {
              const Icon = legIcons[leg.type] || MapPin;
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
                    className="w-full p-4 md:p-5 flex items-center gap-3 md:gap-4 text-left"
                  >
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center border ${legColors[leg.type] || legColors.walk}`}>
                        <Icon className="h-4 w-4 md:h-5 md:w-5" />
                      </div>
                      {i < activeLegs.length - 1 && (
                        <div className="w-0.5 h-4 md:h-6 bg-border mt-1.5 md:mt-2" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5 md:mb-1">
                        <span className="font-semibold text-foreground text-xs md:text-sm truncate">
                          {leg.type === "wait" ? "Buffer Time" : leg.vehicle || "Walking"}
                        </span>
                        <span className="text-xs md:text-sm font-bold text-foreground flex-shrink-0">
                          {leg.cost > 0 ? `₹${leg.cost}` : "Free"}
                        </span>
                      </div>
                      <p className="text-muted-foreground text-xs md:text-sm truncate">
                        {leg.from} → {leg.to}
                      </p>
                      <div className="flex items-center gap-2 md:gap-3 mt-1 md:mt-1.5 text-[10px] md:text-xs text-muted-foreground flex-wrap">
                        <span>{leg.departureTime} - {leg.arrivalTime}</span>
                        <span>•</span>
                        <span>{leg.duration >= 60 ? `${Math.floor(leg.duration / 60)}h ${leg.duration % 60}m` : `${leg.duration} min`}</span>
                        {leg.distance && (
                          <>
                            <span>•</span>
                            <span>{leg.distance} km</span>
                          </>
                        )}
                      </div>
                    </div>

                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    )}
                  </button>

                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border px-4 md:px-5 pb-4 md:pb-5"
                      >
                        <div className="pt-3 md:pt-4 space-y-3">
                          {leg.operator && (
                            <div className="flex items-center justify-between text-xs md:text-sm">
                              <span className="text-muted-foreground">Operator</span>
                              <span className="font-medium text-foreground">{leg.operator}</span>
                            </div>
                          )}
                          {leg.type === "intercity_bus" && (
                            <div className="flex gap-2 flex-wrap">
                              {[
                                { icon: Wifi, label: "WiFi" },
                                { icon: Snowflake, label: "AC" },
                                { icon: Users, label: `${Math.floor(Math.random() * 20) + 5} seats left` },
                              ].map(({ icon: AmenityIcon, label }) => (
                                <span key={label} className="flex items-center gap-1 md:gap-1.5 px-2 md:px-3 py-1 md:py-1.5 rounded-lg bg-muted text-[10px] md:text-xs text-muted-foreground">
                                  <AmenityIcon className="h-3 w-3 md:h-3.5 md:w-3.5" /> {label}
                                </span>
                              ))}
                            </div>
                          )}
                          {leg.type === "local_transport" && (
                            <Button variant="outline" size="sm" className="w-full text-xs md:text-sm">
                              <Users className="h-4 w-4" />
                              View Shared Ride Options (save ₹{Math.round(leg.cost * 0.35)})
                            </Button>
                          )}
                          {leg.type === "wait" && (
                            <p className="text-xs text-muted-foreground">
                              Use this buffer time to grab a snack or rest at the bus station. Your bus departs shortly after.
                            </p>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>

          {/* Journey Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="rounded-xl md:rounded-2xl p-4 md:p-5 bg-card border border-border mb-5 md:mb-6"
          >
            <h3 className="text-sm font-semibold text-foreground mb-3">Journey Summary</h3>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg md:text-xl font-bold text-foreground">
                  {Math.floor(totalDuration / 60)}h {totalDuration % 60}m
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Total Time</p>
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold text-foreground">
                  {activePlan.totalDistance} km
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Total Distance</p>
              </div>
              <div>
                <p className="text-lg md:text-xl font-bold text-primary">
                  ₹{totalCost}
                </p>
                <p className="text-[10px] md:text-xs text-muted-foreground">Total Cost</p>
              </div>
            </div>
          </motion.div>

          {/* Protection Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`rounded-xl md:rounded-2xl p-4 md:p-5 border-2 transition-colors cursor-pointer mb-6 md:mb-8 ${protectionEnabled
              ? "border-primary bg-primary/5"
              : "border-border bg-card"
              }`}
            onClick={() => setProtectionEnabled(!protectionEnabled)}
          >
            <div className="flex items-center gap-3 md:gap-4">
              <div className={`w-9 h-9 md:w-11 md:h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${protectionEnabled ? "gradient-primary" : "bg-muted"
                }`}>
                <Shield className={`h-4 w-4 md:h-5 md:w-5 ${protectionEnabled ? "text-primary-foreground" : "text-muted-foreground"}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-foreground text-sm md:text-base">Guaranteed Arrival</span>
                  <span className="font-bold text-foreground text-sm md:text-base">₹75</span>
                </div>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Bus waits up to 10 min or full refund + ₹500 compensation
                </p>
              </div>
              <div className={`w-10 h-6 md:w-12 md:h-7 rounded-full p-0.5 md:p-1 transition-colors flex-shrink-0 ${protectionEnabled ? "bg-primary" : "bg-border"}`}>
                <div className={`w-5 h-5 rounded-full bg-card shadow transition-transform ${protectionEnabled ? "translate-x-4 md:translate-x-5" : ""}`} />
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Inline Booking Card (Replaces Floating Bar) */}
      <div className="container mx-auto px-4 mt-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card glass-card-elevated border border-border/50 rounded-[2rem] p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl"
          >
            <div className="flex flex-col items-center md:items-start">
              <p className="text-xs md:text-sm text-muted-foreground font-bold uppercase tracking-widest opacity-70 mb-1">
                Total Journey Amount
              </p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">₹{totalCost}</span>
                <span className="text-sm text-muted-foreground font-medium">all inclusive</span>
              </div>
              <p className="text-xs text-muted-foreground font-medium mt-2 hidden md:block">
                {Math.floor(totalDuration / 60)}h {totalDuration % 60}m • {protectionEnabled ? "Protected ✓" : "No protection"}
              </p>
            </div>

            <Button
              variant="hero"
              size="xl"
              onClick={handleBookNow}
              disabled={booking}
              className="w-full md:w-auto text-lg px-12 md:px-16 rounded-[1.5rem] h-16 shadow-xl shadow-primary/25 hover:scale-[1.03] active:scale-95 transition-all duration-300 font-bold"
            >
              {booking ? (
                <div className="flex items-center gap-3">
                  <img src="/assets/RideSync.gif" className="h-6 w-auto object-contain" alt="Loading" />
                  <span>Booking...</span>
                </div>
              ) : (
                "Book Now"
              )}
            </Button>

            <p className="text-xs text-center text-muted-foreground font-medium md:hidden">
              {Math.floor(totalDuration / 60)}h {totalDuration % 60}m • {protectionEnabled ? "Protected ✓" : "No protection"}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="pb-32 md:pb-12" />
    </div>
  );
};

export default JourneyResults;
