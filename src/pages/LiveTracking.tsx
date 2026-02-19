import { useState, useEffect, useMemo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  AtSign, Check, X, MapPin, Share2, Copy, Loader2, LocateFixed, Search as SearchIcon,
  Bus, Phone, MessageCircle, AlertTriangle, CheckCircle, Activity,
  Navigation, Shield, User, Battery, Wifi, Star,
  ChevronRight, Zap, ThermometerSun, Volume2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useAuth } from "@/contexts/AuthContext";
import { useLocationSharing } from "@/hooks/useLocationSharing";
import { toast } from "sonner";

// ── Custom map icons ──

const createIcon = (color: string, emoji: string) =>
  L.divIcon({
    className: "",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
    popupAnchor: [0, -42],
    html: `<div style="
      width:40px;height:40px;border-radius:12px;
      background:${color};border:3px solid white;
      box-shadow:0 2px 8px rgba(0,0,0,0.3);
      display:flex;align-items:center;justify-content:center;
      font-size:18px;
    ">${emoji}</div>`,
  });

const userIcon = createIcon("#3b82f6", "📍");
const driverIcon = createIcon("#22c55e", "🚗");
const busStationIcon = createIcon("#f97316", "🚏");
const busIcon = createIcon("#6366f1", "🚌");
const destinationIcon = createIcon("#ef4444", "🏁");

// Simulated coordinates for the route
const ROUTE_COORDS = {
  userHome: { lat: 12.9352, lng: 77.6245 },      // Koramangala
  driverPos: { lat: 12.9451, lng: 77.6105 },      // Driver en route
  busStation: { lat: 12.9767, lng: 77.5713 },      // Majestic Bus Stand
  busPos: { lat: 14.4520, lng: 75.9218 },          // Bus near Hubli
  destination: { lat: 15.4909, lng: 73.8278 },     // Goa (Panaji)
};

const routePath: [number, number][] = [
  [ROUTE_COORDS.userHome.lat, ROUTE_COORDS.userHome.lng],
  [ROUTE_COORDS.driverPos.lat, ROUTE_COORDS.driverPos.lng],
  [ROUTE_COORDS.busStation.lat, ROUTE_COORDS.busStation.lng],
];

const busRoutePath: [number, number][] = [
  [ROUTE_COORDS.busStation.lat, ROUTE_COORDS.busStation.lng],
  [13.3, 76.5],  // waypoint
  [ROUTE_COORDS.busPos.lat, ROUTE_COORDS.busPos.lng],
  [15.0, 74.5],  // waypoint
  [ROUTE_COORDS.destination.lat, ROUTE_COORDS.destination.lng],
];

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

// Component that animates driver position
// ── Map Controller Components ──

function MapSearch({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const map = useMap();

  useEffect(() => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      } catch (err) {
        console.error("Suggestion fetch failed", err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSelect = (s: any) => {
    const lat = parseFloat(s.lat);
    const lng = parseFloat(s.lon);
    map.flyTo([lat, lng], 14);
    onLocationSelect(lat, lng);
    setQuery(s.display_name);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`);
      const data = await response.json();
      if (data && data.length > 0) {
        handleSelect(data[0]);
      } else {
        toast.error("Location not found");
      }
    } catch (error) {
      toast.error("Search failed. Check your connection.");
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="absolute top-16 left-3 right-3 md:top-4 md:left-4 md:right-auto md:w-80 z-[1000]">
      <div className="relative group">
        <form onSubmit={handleSearch} className="relative">
          <button
            type="submit"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm z-10"
          >
            {searching ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <SearchIcon className="h-4 w-4" />
            )}
          </button>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Where to? (e.g. Bangalore)"
            className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-transparent bg-card/95 backdrop-blur-xl shadow-2xl text-sm font-medium placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-all ring-1 ring-border/50"
          />
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center gap-2 text-muted-foreground/50">
            <MapPin className="h-4 w-4" />
          </div>
        </form>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden"
            >
              {suggestions.map((s, i) => (
                <button
                  key={i}
                  onClick={() => handleSelect(s)}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-primary/10 transition-colors border-b border-border/50 last:border-0 flex items-start gap-3"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <span className="truncate">{s.display_name}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function LocateMe({ userPosition }: { userPosition: [number, number] }) {
  const map = useMap();
  const hasCenteredRef = useRef(false);

  // Auto-center on first real location
  useEffect(() => {
    if (userPosition[0] !== ROUTE_COORDS.userHome.lat && !hasCenteredRef.current) {
      map.flyTo(userPosition, 16);
      hasCenteredRef.current = true;
    }
  }, [userPosition, map]);

  const handleLocate = () => {
    map.flyTo(userPosition, 16);
  };

  return (
    <button
      onClick={handleLocate}
      className="absolute bottom-20 right-4 z-[1000] w-12 h-12 rounded-xl bg-card/90 backdrop-blur-md border border-border flex items-center justify-center shadow-lg hover:bg-accent transition-colors"
      title="Recenter to my location"
    >
      <LocateFixed className="h-5 w-5 text-primary" />
    </button>
  );
}

function AnimatedDriver({ progress }: { progress: number }) {
  const map = useMap();
  const [driverLat, driverLng] = useMemo(() => {
    const t = Math.min(progress / 100, 1);
    const startLat = ROUTE_COORDS.userHome.lat;
    const startLng = ROUTE_COORDS.userHome.lng;
    const endLat = ROUTE_COORDS.busStation.lat;
    const endLng = ROUTE_COORDS.busStation.lng;
    return [startLat + (endLat - startLat) * t, startLng + (endLng - startLng) * t];
  }, [progress]);

  return (
    <Marker position={[driverLat, driverLng]} icon={driverIcon}>
      <Popup>
        <div className="text-center p-1">
          <p className="font-semibold text-sm">Rajesh Kumar</p>
          <p className="text-xs text-gray-500">Auto • KA-51-AB-1234</p>
          <p className="text-xs font-medium text-green-600">⭐ 4.7 (320 rides)</p>
        </div>
      </Popup>
    </Marker>
  );
}

const LiveTracking = () => {
  const [eta, setEta] = useState(12);
  const [busStatus] = useState<"on_time" | "delayed">("on_time");
  const [progress, setProgress] = useState(20);
  const [activeTab, setActiveTab] = useState<"timeline" | "bus" | "safety">("timeline");
  const [showStatus, setShowStatus] = useState(false);
  const { user } = useAuth();
  const { isSharing, shareLink, startSharing, stopSharing, currentLocation } = useLocationSharing();

  useEffect(() => {
    const interval = setInterval(() => {
      setEta((prev) => Math.max(0, prev - 1));
      setProgress((prev) => Math.min(100, prev + 2));
    }, 10000);

    const handleToggle = () => setShowStatus(prev => !prev);
    window.addEventListener('toggle-trip-status', handleToggle);

    return () => {
      clearInterval(interval);
      window.removeEventListener('toggle-trip-status', handleToggle);
    };
  }, []);

  // Automatically request location on mount
  useEffect(() => {
    const requestLocation = async () => {
      if (!isSharing && navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          () => {
            // Permission granted, optionally start sharing or just fetch once
            // startSharing(); // We don't auto-start sharing, just ask for permission
          },
          (err) => {
            console.warn("Location permission denied:", err.message);
          }
        );
      }
    };
    requestLocation();
  }, []);

  // Use real location if sharing, otherwise use simulated
  const userPosition: [number, number] = currentLocation
    ? [currentLocation.coords.latitude, currentLocation.coords.longitude]
    : [ROUTE_COORDS.userHome.lat, ROUTE_COORDS.userHome.lng];

  const handleToggleSharing = async () => {
    if (isSharing) {
      await stopSharing();
      toast.success("Location sharing stopped");
    } else {
      const id = await startSharing({ durationMinutes: 120 });
      if (id) {
        toast.success("Real-time sharing activated!");
      }
    }
  };

  const copyLink = () => {
    if (shareLink) {
      navigator.clipboard.writeText(shareLink);
      toast.success("Share link copied!");
    }
  };

  return (
    <div className="min-h-screen bg-background md:pl-24 pb-12 relative overflow-x-hidden pt-0">
      {/* Real Map */}
      <div className="relative h-[45vh] md:h-[55vh] overflow-hidden">
        <MapContainer
          center={[ROUTE_COORDS.busStation.lat, ROUTE_COORDS.busStation.lng]}
          zoom={10}
          scrollWheelZoom={true}
          zoomControl={false}
          className="h-full w-full z-0"
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <MapSearch onLocationSelect={(lat, lng) => console.log("Searched:", lat, lng)} />
          <LocateMe userPosition={userPosition} />

          {!currentLocation && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] px-4 py-2 rounded-full bg-primary/95 text-white text-xs font-bold shadow-2xl flex items-center gap-2 backdrop-blur-md animate-pulse">
              <Loader2 className="h-3 w-3 animate-spin" />
              FETCHING YOUR GPS...
            </div>
          )}

          {/* Local route (user → bus station) */}
          <Polyline positions={routePath} color="#22c55e" weight={4} opacity={0.7} dashArray="8 6" />

          {/* Bus route (bus station → destination) */}
          <Polyline positions={busRoutePath} color="#6366f1" weight={4} opacity={0.5} dashArray="10 8" />

          {/* User marker */}
          <Marker position={userPosition} icon={userIcon}>
            <Popup>
              <div className="text-center p-1">
                <p className="font-semibold text-sm">You</p>
                <p className="text-xs text-gray-500">
                  {currentLocation
                    ? `${currentLocation.coords.latitude.toFixed(4)}, ${currentLocation.coords.longitude.toFixed(4)}`
                    : "Koramangala, Bangalore"
                  }
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Animated driver marker */}
          <AnimatedDriver progress={progress} />

          {/* Bus station marker */}
          <Marker position={[ROUTE_COORDS.busStation.lat, ROUTE_COORDS.busStation.lng]} icon={busStationIcon}>
            <Popup>
              <div className="text-center p-1">
                <p className="font-semibold text-sm">Majestic Bus Stand</p>
                <p className="text-xs text-gray-500">Boarding at Platform 4B</p>
              </div>
            </Popup>
          </Marker>

          {/* Bus marker */}
          <Marker position={[ROUTE_COORDS.busPos.lat, ROUTE_COORDS.busPos.lng]} icon={busIcon}>
            <Popup>
              <div className="text-center p-1">
                <p className="font-semibold text-sm">Goa Express — KA-01-F-9988</p>
                <p className="text-xs text-gray-500">VRL Travels • Sleeper AC</p>
                <p className="text-xs font-medium text-indigo-600">Near Hubli</p>
              </div>
            </Popup>
          </Marker>

          {/* Destination marker */}
          <Marker position={[ROUTE_COORDS.destination.lat, ROUTE_COORDS.destination.lng]} icon={destinationIcon}>
            <Popup>
              <div className="text-center p-1">
                <p className="font-semibold text-sm">Panaji, Goa</p>
                <p className="text-xs text-gray-500">Final destination • ETA 4:00 PM</p>
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        {/* Top Status Toggle Button (Mobile Only since Desktop has it in sidebar) */}
        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 md:hidden">
          <Button
            variant="hero"
            size="sm"
            onClick={() => setShowStatus(!showStatus)}
            className="rounded-full shadow-2xl h-10 px-4 font-bold border border-white/20 whitespace-nowrap"
          >
            <Activity className="h-4 w-4 mr-2" />
            Status
          </Button>
        </div>

        {/* Status floating card (shown only when toggled) */}
        <AnimatePresence>
          {showStatus && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.y) > 50) setShowStatus(false);
              }}
              className="absolute top-16 left-3 right-3 md:top-4 md:left-44 md:right-auto md:w-80 z-[1000] cursor-grab active:cursor-grabbing"
            >
              <div className="bg-card/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />

                {/* Drag Handle */}
                <div className="flex justify-center -mt-2 mb-2 md:hidden">
                  <div className="w-8 h-1 rounded-full bg-border" />
                </div>

                <button
                  onClick={() => setShowStatus(false)}
                  className="absolute top-2.5 right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${busStatus === "on_time" ? "bg-success/10" : "bg-warning/10"}`}>
                    {busStatus === "on_time" ? <CheckCircle className="h-5 w-5 text-success" /> : <AlertTriangle className="h-5 w-5 text-warning" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-foreground text-sm">Intercity Update</p>
                    <p className="text-muted-foreground text-[10px]">Bus departs 7:00 AM</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted-foreground uppercase tracking-wider">Journey Progress</span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-success via-primary to-secondary shadow-[0_0_10px_rgba(var(--primary),0.3)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> En Route</span>
                    <span className="font-bold text-foreground">ETA {eta} min</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Protection badge */}
        <div className="absolute top-4 right-4 z-[1000]">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/95 text-primary-foreground text-[11px] font-bold shadow-2xl backdrop-blur-md">
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Protected Trip</span>
            <span className="sm:hidden">Protected</span>
          </div>
        </div>

        {/* Live location sharing indicator */}
        {isSharing && (
          <div className="absolute bottom-4 left-4 z-[1000] hidden md:block">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-success/90 text-success-foreground text-[11px] font-bold shadow-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-success-foreground animate-pulse" />
              Live Sharing
            </div>
          </div>
        )}
      </div>

      {/* Bottom Sheet */}
      <div className="bg-card rounded-t-3xl -mt-6 relative z-10 border-t border-border min-h-[40vh]">
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
                className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
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
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full flex-shrink-0 border-2 ${item.status === "done" ? "bg-success border-success" :
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
                  { icon: Share2, title: isSharing ? "Sharing Active" : "Share Live Location", desc: isSharing ? "Everyone with the link can see you" : "Tap to start sharing your real-time GPS", color: isSharing ? "text-success" : "text-primary", action: handleToggleSharing },
                  { icon: Phone, title: "24/7 Emergency Support", desc: "One-tap SOS available anytime", color: "text-destructive" },
                  { icon: Star, title: "Verified Driver", desc: "Background checked & ID verified", color: "text-warning" },
                ].map((item) => (
                  <motion.div
                    key={item.title}
                    whileHover={{ scale: 1.01 }}
                    className={`glass-card p-3 flex items-center gap-3 cursor-pointer border-2 transition-all ${item.title === "Sharing Active" ? "border-success/30 bg-success/5" : "border-transparent"}`}
                    onClick={item.action}
                  >
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
              <p className="font-semibold text-foreground text-xs md:text-sm">Bus will wait for you!</p>
              <p className="text-muted-foreground text-[10px] md:text-xs">Conductor confirmed — auto arriving in {eta} min</p>
            </div>
          </motion.div>

          {/* Action Buttons */}
          <div className="flex gap-2 mt-4">
            <Button variant="destructive" size="lg" className="flex-1">
              <AlertTriangle className="h-4 w-4" />
              SOS Emergency
            </Button>
            <Button
              variant={isSharing ? "hero" : "outline"}
              size="lg"
              className="flex-1 transition-all"
              onClick={handleToggleSharing}
            >
              <Share2 className="h-4 w-4" />
              {isSharing ? "Sharing..." : "Share Trip"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
