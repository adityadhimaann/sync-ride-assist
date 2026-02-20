import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Calendar, Clock, ArrowRight, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { MapContainer, TileLayer, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";


// Helper to fetch suggestions from Nominatim
const fetchSuggestions = async (query: string) => {
  if (query.length < 3) return [];
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=in&limit=5`);
    return await response.json();
  } catch (err) {
    console.error("Fetch suggestions error:", err);
    return [];
  }
};

const SuggestionsList = ({ currentQuery, onSelect, visible }: { currentQuery: string, onSelect: (val: string) => void, visible: boolean }) => {
  const [items, setItems] = useState<any[]>([]);

  useEffect(() => {
    const timer = setTimeout(async () => {
      const results = await fetchSuggestions(currentQuery);
      setItems(results);
    }, 400);
    return () => clearTimeout(timer);
  }, [currentQuery]);

  if (!visible || items.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute top-full left-0 right-0 mt-2 bg-card border border-border shadow-2xl rounded-xl overflow-hidden z-[100]"
    >
      {items.map((item, i) => (
        <button
          key={i}
          onClick={() => onSelect(item.display_name)}
          className="w-full px-4 py-3 text-left text-sm hover:bg-primary/10 transition-colors border-b border-border/50 last:border-0 flex items-start gap-3"
        >
          <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
          <span className="truncate">{item.display_name}</span>
        </button>
      ))}
    </motion.div>
  );
};

const HeroSection = () => {
  const [startPoint, setStartPoint] = useState("");
  const [busStation, setBusStation] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [loading, setLoading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [activeField, setActiveField] = useState<"start" | "bus" | "dest" | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();

  // Handle auto-locate
  const handleLocateMe = async () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const resp = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`);
          const data = await resp.json();
          setStartPoint(data.display_name || "Current Location");
          toast.success("Location fetched!");
        } catch (err) {
          toast.error("Failed to resolve address");
        } finally {
          setLocating(false);
        }
      },
      (err) => {
        toast.error("Location permission denied");
        setLocating(false);
      }
    );
  };

  const handlePlanJourney = () => {
    // Validate required fields
    if (!startPoint.trim() || !busStation.trim() || !destination.trim()) {
      toast.error("Please fill in your start point, bus station, and destination");
      return;
    }

    setLoading(true);

    // Build query params to pass journey search data to results page
    const params = new URLSearchParams({
      from: startPoint.trim(),
      bus: busStation.trim(),
      to: destination.trim(),
      ...(date && { date }),
      ...(time && { time }),
    });

    // Simulate brief loading for UX
    setTimeout(() => {
      setLoading(false);
      navigate(`/results?${params.toString()}`);
    }, 1500);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center pt-24 pb-8 md:pt-32 md:pb-0 overflow-x-hidden bg-background">
      {/* Dynamic Map Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-transparent to-background/80 z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/20 via-transparent to-background/20 z-10" />

        <div className="absolute inset-0 opacity-80 dark:opacity-50">
          <MapContainer
            center={[20.5937, 78.9629]} // India center
            zoom={4.5}
            className="h-full w-full grayscale contrast-[0.9] brightness-[1] dark:brightness-[0.4]"
            zoomControl={false}
            dragging={false}
            doubleClickZoom={false}
            scrollWheelZoom={false}
            attributionControl={false}
          >
            <TileLayer
              url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
            />
            {/* Simulated Active Routes */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1, duration: 2 }}>
              <Polyline
                positions={[[28.6139, 77.2090], [19.0760, 72.8777]]}
                pathOptions={{ color: '#3b82f6', weight: 2, opacity: 0.3, dashArray: '10, 10' }}
              />
              <Polyline
                positions={[[12.9716, 77.5946], [13.0827, 80.2707]]}
                pathOptions={{ color: '#22c55e', weight: 2, opacity: 0.3, dashArray: '10, 10' }}
              />
            </motion.div>
          </MapContainer>
        </div>
      </div>



      <div className="container mx-auto px-4 relative z-10 py-12 lg:py-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left Column: Text & Planner */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
              <span className="inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 backdrop-blur-md text-primary/90 text-xs md:text-sm font-medium mb-4 md:mb-6">
                Trusted by 50,000+ travelers across India
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-2xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4 md:mb-6 leading-tight"
            >
              Never Miss Your
              <br />
              <span className="text-secondary">
                Intercity Bus
              </span>{" "}
              Again
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="text-base md:text-xl text-muted-foreground mb-6 md:mb-10 max-w-2xl px-2 lg:px-0"
            >
              Smart last-mile coordination with guaranteed arrival protection.
              <br className="hidden md:block" />
              From your doorstep to your destination, stress-free.
            </motion.p>

            {/* Journey Planner Card */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="w-full max-w-2xl bg-card/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl relative overflow-hidden mx-auto lg:mx-0"
            >
              <div className="space-y-4">
                {/* Start Point */}
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-success z-20" />
                  <input
                    type="text"
                    placeholder="Your home address"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    onFocus={() => { setActiveField("start"); setShowSuggestions(true); }}
                    className="w-full h-12 pl-12 pr-12 rounded-xl border-2 border-border bg-background text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all"
                  />
                  <button
                    onClick={handleLocateMe}
                    disabled={locating}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-primary transition-colors z-20"
                    title="Use current location"
                  >
                    {locating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Navigation className="h-4 w-4" />}
                  </button>
                  {activeField === "start" && <SuggestionsList currentQuery={startPoint} onSelect={(val) => { setStartPoint(val); setShowSuggestions(false); }} visible={showSuggestions} />}
                </div>

                {/* Bus Boarding Point */}
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20">
                    <img src="/assets/RideSync (1).svg" className="h-5 w-5" alt="Bus" />
                  </div>
                  <input
                    type="text"
                    placeholder="Bus boarding point"
                    value={busStation}
                    onChange={(e) => setBusStation(e.target.value)}
                    onFocus={() => { setActiveField("bus"); setShowSuggestions(true); }}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all"
                  />
                  {activeField === "bus" && <SuggestionsList currentQuery={busStation} onSelect={(val) => { setBusStation(val); setShowSuggestions(false); }} visible={showSuggestions} />}
                </div>

                {/* Final Destination */}
                <div className="relative group">
                  <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive z-20" />
                  <input
                    type="text"
                    placeholder="Final destination"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    onFocus={() => { setActiveField("dest"); setShowSuggestions(true); }}
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all"
                  />
                  {activeField === "dest" && <SuggestionsList currentQuery={destination} onSelect={(val) => { setDestination(val); setShowSuggestions(false); }} visible={showSuggestions} />}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 w-full">
                  <div className="relative w-full sm:flex-1 min-w-0">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-20" />
                    <input
                      type={date ? "date" : "text"}
                      placeholder="Date of journey"
                      onFocus={(e) => (e.target.type = "date")}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                      }}
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div className="relative w-full sm:flex-1 min-w-0">
                    <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none z-20" />
                    <input
                      type={time ? "time" : "text"}
                      placeholder="Time of journey"
                      onFocus={(e) => (e.target.type = "time")}
                      onBlur={(e) => {
                        if (!e.target.value) e.target.type = "text";
                      }}
                      value={time}
                      onChange={(e) => setTime(e.target.value)}
                      className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <Button
                  variant="hero"
                  size="xl"
                  className="w-full"
                  onClick={handlePlanJourney}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <img src="/assets/RideSync.gif" className="h-6 w-auto object-contain mr-2" alt="Loading" />
                      Finding Best Routes...
                    </>
                  ) : (
                    <>
                      Plan My Journey
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-6 md:mt-8 flex flex-wrap items-center justify-center lg:justify-start gap-4 md:gap-6 text-muted-foreground text-xs md:text-sm"
            >
              <span className="flex items-center gap-1.5">
                100+ cities
              </span>
              <span className="flex items-center gap-1.5">
                500+ bus operators
              </span>
              <span className="flex items-center gap-1.5">
                4.8★ rating
              </span>
            </motion.div>
          </div>

          {/* Right Column: Coded Animated Illustration */}
          <div className="hidden lg:flex relative w-full aspect-square flex-col items-center justify-center p-8 mx-auto xl:-mr-20 z-20 overflow-visible scale-90 xl:scale-[1.15] -mt-16 xl:-mt-32">
            {/* Context: Road */}
            <div className="absolute bottom-[10%] w-[130%] h-40 bg-slate-800/80 dark:bg-slate-900/80 rounded-[100%] blur-[3px] transform -rotate-[4deg] scale-y-[0.35]"></div>
            <div className="absolute bottom-[10%] w-[130%] h-40 border-t-[8px] border-dashed border-white/60 rounded-[100%] transform -rotate-[4deg] scale-y-[0.35]"></div>

            <div className="absolute inset-0 bg-primary/25 blur-[120px] rounded-full hidden lg:block -z-10 transform -translate-y-12" />

            {/* The Bus - driving away */}
            <motion.div
              animate={{ x: [0, 45, -5, 0], y: [0, -6, 2, 0] }}
              transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
              className="absolute right-[2%] bottom-[18%] z-20"
            >
              {/* Bus Shadow */}
              <div className="absolute -bottom-6 left-2 right-2 h-8 bg-black/50 blur-lg rounded-[100%]"></div>

              {/* Bus Body */}
              <div className="w-72 h-64 bg-slate-50 dark:bg-slate-200 rounded-[36px] rounded-tr-2xl rounded-tl-2xl shadow-2xl overflow-hidden relative border-b-[10px] border-slate-300 dark:border-slate-400 flex flex-col items-center z-10">
                <div className="w-full h-1/2 bg-gradient-to-b from-[#1a44a1]/15 to-transparent absolute top-0"></div>

                {/* Roof unit (AC) */}
                <div className="absolute -top-1 w-48 h-5 bg-slate-300 border border-slate-400 rounded-b-lg shadow-inner flex items-center justify-around px-4 z-0 opacity-80">
                  <div className="w-8 h-1 bg-slate-500 rounded-full"></div>
                  <div className="w-8 h-1 bg-slate-500 rounded-full"></div>
                </div>

                {/* Bus Back Window */}
                <div className="w-64 h-32 bg-slate-800/95 rounded-[20px] mt-6 relative overflow-hidden border-[5px] border-slate-700/80 shadow-[inset_0_4px_20px_rgba(0,0,0,0.8)] flex items-center justify-center">
                  <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/10 to-white/0 transform rotate-45 translate-x-12 -translate-y-4"></div>

                  {/* Inside silhouette */}
                  <div className="absolute bottom-0 left-8 w-10 h-14 bg-slate-900/80 justify-center flex rounded-t-xl"><div className="w-6 h-6 bg-slate-950 rounded-full -mt-4"></div></div>
                  <div className="absolute bottom-0 right-14 w-8 h-12 bg-slate-900/80 justify-center flex rounded-t-xl"><div className="w-5 h-5 bg-slate-950 rounded-full -mt-3"></div></div>

                  <motion.div animate={{ opacity: [0.6, 1, 0.6] }} transition={{ repeat: Infinity, duration: 2.5 }} className="text-white/80 font-black text-2xl tracking-[0.35em] font-sans drop-shadow-[0_0_10px_rgba(255,255,255,0.4)] z-10">
                    SYNCRIDE
                  </motion.div>
                </div>

                {/* Stripes */}
                <div className="w-full h-12 mt-4 flex flex-col gap-1.5 shadow-sm">
                  <div className="w-full h-5 bg-primary"></div>
                  <div className="w-full h-3 bg-secondary"></div>
                </div>

                {/* Taillights */}
                <div className="absolute bottom-8 left-6 w-9 h-9 flex items-center justify-center">
                  <div className="w-full h-full bg-red-600 rounded-md shadow-[0_0_25px_rgba(239,68,68,1)] border-2 border-red-800 animate-pulse"></div>
                  <div className="w-4 h-full bg-orange-500 absolute -right-5 rounded-md shadow-[0_0_15px_rgba(249,115,22,1)] border border-orange-700"></div>
                </div>

                <div className="absolute bottom-8 right-6 w-9 h-9 flex items-center justify-center">
                  <div className="w-full h-full bg-red-600 rounded-md shadow-[0_0_25px_rgba(239,68,68,1)] border-2 border-red-800 animate-pulse"></div>
                  <div className="w-4 h-full bg-orange-500 absolute -left-5 rounded-md shadow-[0_0_15px_rgba(249,115,22,1)] border border-orange-700"></div>
                </div>

                {/* License plate */}
                <div className="absolute bottom-5 w-24 h-7 bg-yellow-400 rounded-md flex items-center justify-center shadow-md border-2 border-yellow-500">
                  <span className="text-xs font-black text-slate-900 tracking-widest uppercase">SY 01 NR</span>
                </div>

                {/* Bumper guards */}
                <div className="absolute bottom-0 left-8 w-12 h-3 bg-slate-800 rounded-t-md"></div>
                <div className="absolute bottom-0 right-8 w-12 h-3 bg-slate-800 rounded-t-md"></div>

                {/* Engine Vents */}
                <div className="absolute bottom-[72px] right-1/2 translate-x-1/2 flex gap-2 z-10 opacity-60">
                  <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
                  <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
                  <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
                  <div className="w-1.5 h-6 bg-slate-800 rounded-full"></div>
                </div>
              </div>

              {/* Wheels */}
              <div className="absolute -bottom-5 left-10 w-12 h-16 bg-slate-950 rounded-xl border-t-4 border-slate-700 shadow-xl z-0"></div>
              <div className="absolute -bottom-5 right-10 w-12 h-16 bg-slate-950 rounded-xl border-t-4 border-slate-700 shadow-xl z-0"></div>

              {/* Exhaust smoke */}
              <motion.div
                animate={{ opacity: [0, 0.8, 0], scale: [0.5, 2.5, 4], x: [0, -50, -100], y: [0, -15, -30] }}
                transition={{ repeat: Infinity, duration: 1.8, ease: "easeOut" }}
                className="absolute left-0 bottom-4 w-20 h-20 bg-slate-300 dark:bg-slate-600 rounded-full blur-[25px] -z-10"
              />
              <motion.div
                animate={{ opacity: [0, 0.6, 0], scale: [0.5, 3, 5], x: [0, -40, -80], y: [0, -10, -20] }}
                transition={{ repeat: Infinity, duration: 1.8, delay: 0.3, ease: "easeOut" }}
                className="absolute left-6 bottom-0 w-16 h-16 bg-slate-400 dark:bg-slate-500 rounded-full blur-[20px] -z-10"
              />
            </motion.div>

            {/* The Passengers running frantically */}
            <motion.div
              animate={{ x: [0, 35, 0], y: [0, -12, 0] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
              className="absolute left-[4%] bottom-[5%] z-30 flex items-end gap-12 scale-110"
            >
              {/* Passenger 1 (Woman) with Suitcase */}
              <div className="relative z-20">
                {/* Shadow */}
                <div className="absolute -bottom-2 -left-4 w-12 h-4 bg-black/30 rounded-full blur-sm transform scale-x-150"></div>

                {/* Body */}
                <div className="w-9 h-24 bg-pink-500 rounded-full transform rotate-[25deg] origin-bottom shadow-lg relative z-20">
                  {/* Head */}
                  <div className="absolute -top-9 left-1 w-10 h-10 bg-orange-200 rounded-full flex items-center justify-center overflow-hidden border border-orange-300/50 z-30">
                    <div className="w-[120%] h-full bg-amber-800 rounded-full absolute -top-1 -right-2"></div>
                  </div>
                </div>

                {/* Rolling Suitcase */}
                <motion.div
                  animate={{ rotate: [-8, -20, -8], y: [0, -4, 0] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="absolute -left-16 bottom-0 origin-bottom-right z-10 flex flex-col items-center"
                >
                  <div className="absolute -top-7 right-2 w-8 h-7 border-[3px] border-slate-800 rounded-t-md"></div>
                  <div className="w-14 h-20 bg-red-500 rounded-lg shadow-xl border-[3px] border-red-700 relative overflow-hidden">
                    <div className="absolute top-2 w-full h-full border-t-[3px] border-red-400/50"></div>
                  </div>
                  <div className="absolute -bottom-2 left-1.5 w-5 h-5 bg-slate-800 rounded-full border border-slate-600"></div>
                  <div className="absolute -bottom-2 right-1.5 w-5 h-5 bg-slate-800 rounded-full border border-slate-600"></div>
                </motion.div>

                {/* Arm holding suitcase */}
                <motion.div
                  animate={{ rotate: [30, 50, 30] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="absolute top-5 -left-4 w-14 h-3 bg-pink-400 rounded-full origin-right z-20"
                />
                {/* Arm reaching out */}
                <motion.div
                  animate={{ rotate: [-10, -30, -10] }}
                  transition={{ repeat: Infinity, duration: 0.6 }}
                  className="absolute top-5 right-0 w-14 h-3 bg-pink-400 rounded-full origin-left z-20"
                />

                {/* Panic Lines */}
                <motion.div animate={{ opacity: [1, 0], scale: [1, 0.5] }} transition={{ repeat: Infinity, duration: 0.6 }} className="absolute -top-14 left-0 font-black text-rose-500 rotate-[-10deg] text-xl drop-shadow-sm">!?!</motion.div>
              </div>

              {/* Passenger 2 (Man) with Backpack */}
              <motion.div
                animate={{ y: [0, -14, 0] }}
                transition={{ repeat: Infinity, duration: 0.35 }}
                className="relative -ml-6 z-10"
              >
                {/* Shadow */}
                <div className="absolute -bottom-4 left-0 w-12 h-3 bg-black/20 rounded-full blur-sm transform scale-x-150"></div>

                {/* Body */}
                <div className="w-11 h-28 bg-emerald-500 rounded-full transform rotate-[30deg] origin-bottom shadow-lg relative z-20">
                  {/* Head */}
                  <div className="absolute -top-10 left-2 w-11 h-11 bg-orange-200 rounded-full flex items-center justify-center overflow-hidden border border-orange-300/50 z-30">
                    <div className="w-[110%] h-[110%] bg-slate-800 rounded-full absolute -top-3"></div>
                  </div>
                </div>

                {/* Backpack */}
                <div className="absolute top-2 -left-8 w-11 h-16 bg-amber-400 rounded-2xl shadow-xl border-4 border-amber-600 z-10 transform rotate-12"></div>

                {/* Arm pumping back */}
                <motion.div
                  animate={{ rotate: [80, 120, 80] }}
                  transition={{ repeat: Infinity, duration: 0.35 }}
                  className="absolute top-6 -left-2 w-12 h-3.5 bg-emerald-400 rounded-full origin-right z-30"
                />
                {/* Arm reaching out frantically */}
                <motion.div
                  animate={{ rotate: [-10, -35, -10] }}
                  transition={{ repeat: Infinity, duration: 0.35 }}
                  className="absolute top-5 right-4 w-16 h-3.5 bg-emerald-400 rounded-full origin-left z-30 flex items-center justify-end"
                >
                  <div className="w-5 h-4 bg-orange-200 rounded-full -mr-1 shadow-sm"></div>
                </motion.div>

                {/* Sweat drops */}
                <motion.div animate={{ y: [0, 15], opacity: [1, 0], scale: [1, 0] }} transition={{ repeat: Infinity, duration: 0.5 }} className="absolute -top-8 -left-3 w-2 h-4 bg-blue-400 rounded-full blur-[0.5px]"></motion.div>
                <motion.div animate={{ y: [0, 18], opacity: [1, 0], scale: [1, 0] }} transition={{ repeat: Infinity, duration: 0.5, delay: 0.2 }} className="absolute -top-4 -right-1 w-2 h-4 bg-blue-400 rounded-full blur-[0.5px]"></motion.div>

                <motion.div animate={{ y: [0, -8], opacity: [1, 0], scale: [1, 1.5], x: [0, 5] }} transition={{ repeat: Infinity, duration: 0.7 }} className="absolute -top-16 left-8 text-base font-black text-slate-800 dark:text-slate-200 rotate-[15deg] whitespace-nowrap drop-shadow-[0_2px_2px_rgba(255,255,255,0.8)]">HEY WAIT!</motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
