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



      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary/10 backdrop-blur-md text-primary/90 text-xs md:text-sm font-medium mb-4 md:mb-6">
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
            className="text-base md:text-xl text-muted-foreground mb-6 md:mb-10 max-w-xl mx-auto px-2"
          >
            Smart last-mile coordination with guaranteed arrival protection.
            From your doorstep to your destination, stress-free.
          </motion.p>

          {/* Journey Planner Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="w-full max-w-2xl bg-card/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl mx-auto relative overflow-hidden"
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
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none transition-colors box-border"
                  />
                </div>
                <div className="relative w-full sm:flex-1 min-w-0">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full h-11 pl-11 pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none transition-colors box-border"
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
            className="mt-6 md:mt-8 flex items-center justify-center gap-4 md:gap-6 text-muted-foreground text-xs md:text-sm"
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
      </div>
    </section>
  );
};

export default HeroSection;
