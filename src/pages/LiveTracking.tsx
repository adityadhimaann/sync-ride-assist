import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  Battery,
  Bus,
  CheckCircle,
  ChevronRight,
  Clock3,
  Copy,
  Loader2,
  LocateFixed,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  Route,
  Search as SearchIcon,
  Share2,
  Shield,
  Star,
  User,
  Wifi,
  X,
} from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useLocationSharing } from "@/hooks/useLocationSharing";
import {
  ensureUserTripTracking,
  getUserActiveTrip,
  onUserTripTrackingChange,
  updateUserTripTracking,
  type TrackingLocation,
  type Trip,
  type TripLeg,
  type TripTrackingState,
} from "@/lib/database";
import { getErrorMessage } from "@/lib/errors";
import { isGoogleMapsConfigured, loadGoogleMaps } from "@/lib/google-maps";

const DEFAULT_CENTER: [number, number] = [20.5937, 78.9629];

interface GeocodedPoint {
  lat: number;
  lng: number;
  label: string;
}

interface ActiveTrip extends Trip {
  id: string;
}

interface PlacePrediction {
  description: string;
  place_id: string;
}

type GoogleLatLng = { lat: number; lng: number };

interface GoogleMapInstance {
  fitBounds: (bounds: GoogleBounds, padding?: number) => void;
  panTo: (position: GoogleLatLng) => void;
  setCenter: (position: GoogleLatLng) => void;
  setZoom: (zoom: number) => void;
}

interface GoogleBounds {
  extend: (position: GoogleLatLng) => void;
  isEmpty: () => boolean;
}

interface GoogleMarker {
  addListener: (eventName: string, handler: () => void) => void;
  setMap: (map: GoogleMapInstance | null) => void;
}

interface GooglePolyline {
  setMap: (map: GoogleMapInstance | null) => void;
}

interface GoogleDirectionsRenderer {
  setDirections: (result: unknown) => void;
  setMap: (map: GoogleMapInstance | null) => void;
}

interface GoogleInfoWindow {
  open: (options: { anchor: GoogleMarker; map: GoogleMapInstance }) => void;
}

interface GoogleGeocoderResult {
  formatted_address?: string;
  geometry?: {
    location?: {
      lat: () => number;
      lng: () => number;
    };
  };
}

interface GoogleMapsApi {
  DirectionsRenderer: new (options: Record<string, unknown>) => GoogleDirectionsRenderer;
  DirectionsService: new () => {
    route: (request: Record<string, unknown>, callback: (result: unknown, status: string) => void) => void;
  };
  Geocoder: new () => {
    geocode: (
      request: Record<string, unknown>,
      callback: (results: GoogleGeocoderResult[] | null, status: string) => void
    ) => void;
  };
  InfoWindow: new (options: Record<string, unknown>) => GoogleInfoWindow;
  LatLngBounds: new () => GoogleBounds;
  Map: new (element: HTMLElement, options: Record<string, unknown>) => GoogleMapInstance;
  Marker: new (options: Record<string, unknown>) => GoogleMarker;
  Point: new (x: number, y: number) => unknown;
  Polyline: new (options: Record<string, unknown>) => GooglePolyline;
  Size: new (width: number, height: number) => unknown;
  TravelMode: { DRIVING: string };
  places: {
    AutocompleteService: new () => {
      getPlacePredictions: (
        request: Record<string, unknown>,
        callback: (predictions: PlacePrediction[] | null, status: string) => void
      ) => void;
    };
    PlacesServiceStatus: { OK: string };
  };
}

const getMapsApi = (google: { maps: Record<string, unknown> }) => google.maps as unknown as GoogleMapsApi;

const stopMapScrollCapture = (event: React.WheelEvent | React.TouchEvent) => {
  event.stopPropagation();
};

const formatMinutes = (minutes: number) => {
  if (!Number.isFinite(minutes) || minutes <= 0) return "Updating";
  if (minutes < 60) return `${Math.round(minutes)} min`;
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  return mins ? `${hours}h ${mins}m` : `${hours}h`;
};

const formatDate = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(date);
};

const getLegLabel = (leg: TripLeg) => {
  if (leg.type === "local_transport") return leg.vehicle || "Local pickup";
  if (leg.type === "intercity_bus") return leg.operator || "Intercity bus";
  if (leg.type === "wait") return "Boarding buffer";
  return "Walk";
};

const getPhaseCopy = (tracking: TripTrackingState | null, trip: ActiveTrip | null) => {
  if (!trip) return "No active journey";
  if (!tracking) return "Preparing live tracking";
  if (tracking.phase === "pickup") return "Pickup in progress";
  if (tracking.phase === "boarding") return "Boarding window";
  if (tracking.phase === "intercity") return "Bus journey active";
  if (tracking.phase === "arriving") return "Approaching destination";
  return "Trip completed";
};

const toMarkerPoint = (location?: TrackingLocation | null): GeocodedPoint | null => {
  if (!location || !Number.isFinite(location.lat) || !Number.isFinite(location.lng)) return null;
  if (location.lat === 0 && location.lng === 0) return null;
  return { lat: location.lat, lng: location.lng, label: location.label || "Live location" };
};

const getGeocodeCacheKey = (label: string) => `syncride:google-geo:${encodeURIComponent(label.toLowerCase().trim())}`;

const geocodeLocation = async (label: string): Promise<GeocodedPoint | null> => {
  const normalized = label.trim();
  if (!normalized) return null;

  const cached = localStorage.getItem(getGeocodeCacheKey(normalized));
  if (cached) return JSON.parse(cached) as GeocodedPoint;

  const google = await loadGoogleMaps();
  const maps = getMapsApi(google);
  const geocoder = new maps.Geocoder();

  const point = await new Promise<GeocodedPoint | null>((resolve, reject) => {
    geocoder.geocode({ address: normalized, region: "in" }, (results, status) => {
      if (status !== "OK") {
        if (status === "ZERO_RESULTS") resolve(null);
        else reject(new Error(`Google geocoding failed: ${status}`));
        return;
      }

      const result = results?.[0];
      const location = result?.geometry?.location;
      if (!location) {
        resolve(null);
        return;
      }

      resolve({
        lat: location.lat(),
        lng: location.lng(),
        label: result.formatted_address || normalized,
      });
    });
  });

  if (point) localStorage.setItem(getGeocodeCacheKey(normalized), JSON.stringify(point));
  return point;
};

const createMarkerIcon = (maps: GoogleMapsApi, label: string, color: string) => {
  const svg = `
    <svg width="52" height="62" viewBox="0 0 52 62" fill="none" xmlns="http://www.w3.org/2000/svg">
      <filter id="shadow" x="0" y="0" width="52" height="62" filterUnits="userSpaceOnUse">
        <feDropShadow dx="0" dy="7" stdDeviation="5" flood-color="#020617" flood-opacity=".32"/>
      </filter>
      <path filter="url(#shadow)" d="M26 58s18-16.7 18-34A18 18 0 1 0 8 24c0 17.3 18 34 18 34Z" fill="${color}"/>
      <circle cx="26" cy="24" r="13" fill="white" fill-opacity=".18"/>
      <text x="26" y="29" text-anchor="middle" font-family="Arial, sans-serif" font-size="9" font-weight="800" fill="white">${label}</text>
    </svg>`;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new maps.Size(52, 62),
    anchor: new maps.Point(26, 58),
  };
};

function GoogleMapSearch({ onLocationSelect }: { onLocationSelect: (point: GeocodedPoint) => void }) {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<PlacePrediction[]>([]);
  const [searching, setSearching] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    if (!isGoogleMapsConfigured || query.trim().length < 3) {
      setSuggestions([]);
      return;
    }

    const timer = window.setTimeout(async () => {
      try {
        const google = await loadGoogleMaps();
        const maps = getMapsApi(google);
        const service = new maps.places.AutocompleteService();
        service.getPlacePredictions(
          {
            input: query,
            componentRestrictions: { country: "in" },
          },
          (predictions: PlacePrediction[] | null, status: string) => {
            if (status !== maps.places.PlacesServiceStatus.OK || !predictions) {
              setSuggestions([]);
              return;
            }
            setSuggestions(predictions);
            setShowSuggestions(true);
          }
        );
      } catch (error) {
        console.error("Google place suggestions failed", error);
      }
    }, 350);

    return () => window.clearTimeout(timer);
  }, [query]);

  const selectLocation = async (label: string) => {
    setSearching(true);
    try {
      const point = await geocodeLocation(label);
      if (!point) {
        toast.error("Location not found in Google Maps");
        return;
      }
      setQuery(point.label);
      setSuggestions([]);
      setShowSuggestions(false);
      onLocationSelect(point);
    } catch (error) {
      toast.error(getErrorMessage(error, "Google Maps search failed"));
    } finally {
      setSearching(false);
    }
  };

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    if (query.trim()) void selectLocation(query);
  };

  return (
    <div className="absolute top-16 left-3 right-3 md:top-4 md:left-4 md:right-auto md:w-80 z-[1000]">
      <div className="relative">
        <form onSubmit={handleSearch} className="relative">
          <button
            type="submit"
            className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-all shadow-sm z-10"
          >
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <SearchIcon className="h-4 w-4" />}
          </button>
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search with Google Maps"
            className="w-full h-12 pl-12 pr-4 rounded-2xl border-2 border-transparent bg-card/95 backdrop-blur-xl shadow-2xl text-sm font-medium placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-all ring-1 ring-border/50"
          />
        </form>

        <AnimatePresence>
          {showSuggestions && suggestions.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-card/95 backdrop-blur-xl border border-border shadow-2xl rounded-2xl overflow-hidden"
            >
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion.place_id}
                  onClick={() => selectLocation(suggestion.description)}
                  className="w-full px-4 py-3 text-left text-sm hover:bg-primary/10 transition-colors border-b border-border/50 last:border-0 flex items-start gap-3"
                >
                  <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{suggestion.description}</span>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function GoogleTrackingMap({
  routePoints,
  userPosition,
  trackingUserPoint,
  driverPoint,
  busPoint,
  selectedPoint,
  center,
}: {
  routePoints: GeocodedPoint[];
  userPosition: [number, number] | null;
  trackingUserPoint: GeocodedPoint | null;
  driverPoint: GeocodedPoint | null;
  busPoint: GeocodedPoint | null;
  selectedPoint: GeocodedPoint | null;
  center: [number, number];
}) {
  const mapElementRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<GoogleMapInstance | null>(null);
  const markersRef = useRef<GoogleMarker[]>([]);
  const polylineRef = useRef<GooglePolyline | null>(null);
  const directionsRendererRef = useRef<GoogleDirectionsRenderer | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapsLoaded, setMapsLoaded] = useState(false);

  useEffect(() => {
    if (!mapElementRef.current) return;
    if (!isGoogleMapsConfigured) {
      setMapError("Add VITE_GOOGLE_MAPS_API_KEY to .env, enable Maps JavaScript API, then restart Vite.");
      return;
    }

    let cancelled = false;
    loadGoogleMaps()
      .then((google) => {
        if (cancelled || !mapElementRef.current) return;
        const maps = getMapsApi(google);
        mapRef.current = new maps.Map(mapElementRef.current, {
          center: { lat: center[0], lng: center[1] },
          zoom: 12,
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          clickableIcons: true,
          gestureHandling: "greedy",
          styles: [
            { featureType: "poi", stylers: [{ visibility: "off" }] },
            { featureType: "transit", elementType: "labels.icon", stylers: [{ visibility: "off" }] },
          ],
        });
        setMapsLoaded(true);
      })
      .catch((error) => setMapError(getErrorMessage(error, "Could not load Google Maps")));

    return () => {
      cancelled = true;
    };
  }, [center]);

  useEffect(() => {
    if (!mapsLoaded || !mapRef.current) return;

    let cancelled = false;

    loadGoogleMaps().then((google) => {
      if (cancelled || !mapRef.current) return;
      const maps = getMapsApi(google);

      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
      polylineRef.current?.setMap(null);
      directionsRendererRef.current?.setMap(null);

      const addMarker = (point: GeocodedPoint, label: string, color: string, title: string) => {
        const marker = new maps.Marker({
          map: mapRef.current,
          position: { lat: point.lat, lng: point.lng },
          title,
          icon: createMarkerIcon(maps, label, color),
        });
        const infoWindow = new maps.InfoWindow({
          content: `<div style="max-width:240px"><strong>${title}</strong><br/><span>${point.label}</span></div>`,
        });
        marker.addListener("click", () => infoWindow.open({ anchor: marker, map: mapRef.current }));
        markersRef.current.push(marker);
      };

      routePoints.forEach((point, index) => {
        const isFirst = index === 0;
        const isLast = index === routePoints.length - 1;
        addMarker(point, isFirst ? "A" : isLast ? "END" : "STOP", isFirst ? "#16a34a" : isLast ? "#dc2626" : "#f97316", isFirst ? "Start" : isLast ? "Destination" : "Route stop");
      });

      const liveUserPoint = userPosition
        ? { lat: userPosition[0], lng: userPosition[1], label: "Current GPS location" }
        : trackingUserPoint;

      if (liveUserPoint) addMarker(liveUserPoint, "YOU", "#2563eb", "You");
      if (driverPoint) addMarker(driverPoint, "DRV", "#0891b2", "Driver location");
      if (busPoint) addMarker(busPoint, "BUS", "#4f46e5", "Bus location");
      if (selectedPoint) addMarker(selectedPoint, "PIN", "#7c3aed", "Selected location");

      const bounds = new maps.LatLngBounds();
      [...routePoints, ...(liveUserPoint ? [liveUserPoint] : []), ...(selectedPoint ? [selectedPoint] : [])].forEach((point) => {
        bounds.extend({ lat: point.lat, lng: point.lng });
      });

      if (routePoints.length >= 2) {
        const directionsService = new maps.DirectionsService();
        const directionsRenderer = new maps.DirectionsRenderer({
          map: mapRef.current,
          suppressMarkers: true,
          preserveViewport: true,
          polylineOptions: {
            strokeColor: "#4f46e5",
            strokeOpacity: 0.78,
            strokeWeight: 5,
          },
        });
        directionsRendererRef.current = directionsRenderer;

        directionsService.route(
          {
            origin: { lat: routePoints[0].lat, lng: routePoints[0].lng },
            destination: { lat: routePoints[routePoints.length - 1].lat, lng: routePoints[routePoints.length - 1].lng },
            waypoints: routePoints.slice(1, -1).map((point) => ({
              location: { lat: point.lat, lng: point.lng },
              stopover: true,
            })),
            travelMode: maps.TravelMode.DRIVING,
          },
          (result, status) => {
            if (status === "OK") {
              directionsRenderer.setDirections(result);
              return;
            }

            polylineRef.current = new maps.Polyline({
              map: mapRef.current,
              path: routePoints.map((point) => ({ lat: point.lat, lng: point.lng })),
              strokeColor: "#4f46e5",
              strokeOpacity: 0.78,
              strokeWeight: 5,
            });
          }
        );
      }

      if (!bounds.isEmpty()) {
        mapRef.current.fitBounds(bounds, 72);
      } else {
        mapRef.current.setCenter({ lat: center[0], lng: center[1] });
        mapRef.current.setZoom(12);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [busPoint, center, driverPoint, mapsLoaded, routePoints, selectedPoint, trackingUserPoint, userPosition]);

  const recenter = () => {
    if (!mapRef.current) return;
    mapRef.current.panTo({ lat: center[0], lng: center[1] });
    mapRef.current.setZoom(15);
  };

  return (
    <>
      <div ref={mapElementRef} className="h-full w-full" />
      <button
        onClick={recenter}
        className="absolute bottom-20 right-4 md:bottom-6 md:left-6 md:right-auto z-[1000] w-12 h-12 rounded-xl bg-card/90 backdrop-blur-md border border-border flex items-center justify-center shadow-lg hover:bg-accent transition-colors"
        title="Recenter map"
      >
        <LocateFixed className="h-5 w-5 text-primary" />
      </button>
      {mapError && (
        <div className="absolute inset-0 z-[1000] bg-background/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="max-w-lg rounded-3xl border border-border bg-card p-6 text-center shadow-2xl">
            <MapPin className="h-10 w-10 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-black text-foreground">Google Maps setup needed</h2>
            <p className="text-sm text-muted-foreground mt-2">{mapError}</p>
          </div>
        </div>
      )}
    </>
  );
}

const LiveTracking = () => {
  const { user } = useAuth();
  const { isSharing, shareLink, startSharing, stopSharing, currentLocation, error: locationError } = useLocationSharing();
  const [activeTrip, setActiveTrip] = useState<ActiveTrip | null>(null);
  const [tracking, setTracking] = useState<TripTrackingState | null>(null);
  const [routePoints, setRoutePoints] = useState<GeocodedPoint[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<GeocodedPoint | null>(null);
  const [loadingTrip, setLoadingTrip] = useState(true);
  const [geocoding, setGeocoding] = useState(false);
  const [activeTab, setActiveTab] = useState<"timeline" | "bus" | "safety">("timeline");
  const [showStatus, setShowStatus] = useState(false);
  const [isPanelHidden, setIsPanelHidden] = useState(false);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;
    setLoadingTrip(true);

    getUserActiveTrip(user.uid)
      .then(async (trip) => {
        if (cancelled) return;
        setActiveTrip(trip);
        if (trip) {
          const existingTracking = await ensureUserTripTracking(user.uid, trip.id, trip);
          if (!cancelled) setTracking(existingTracking);
        }
      })
      .catch((error) => toast.error(getErrorMessage(error, "Could not load your active trip")))
      .finally(() => {
        if (!cancelled) setLoadingTrip(false);
      });

    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user || !activeTrip) return;

    const unsubscribe = onUserTripTrackingChange(user.uid, activeTrip.id, setTracking);
    return () => unsubscribe();
  }, [activeTrip, user]);

  useEffect(() => {
    if (!activeTrip || !isGoogleMapsConfigured) {
      setRoutePoints([]);
      return;
    }

    let cancelled = false;
    const labels = Array.from(
      new Set(activeTrip.legs.flatMap((leg) => [leg.from, leg.to]).filter(Boolean))
    );

    setGeocoding(true);
    Promise.all(labels.map((label) => geocodeLocation(label).catch(() => null)))
      .then((points) => {
        if (cancelled) return;
        setRoutePoints(points.filter(Boolean) as GeocodedPoint[]);
      })
      .finally(() => {
        if (!cancelled) setGeocoding(false);
      });

    return () => {
      cancelled = true;
    };
  }, [activeTrip]);

  useEffect(() => {
    if (!user || !activeTrip || !currentLocation) return;

    const location = {
      lat: currentLocation.coords.latitude,
      lng: currentLocation.coords.longitude,
      label: "User GPS",
      updatedAt: Date.now(),
    };

    updateUserTripTracking(user.uid, activeTrip.id, { lastKnownUserLocation: location }).catch(() => undefined);
  }, [activeTrip, currentLocation, user]);

  useEffect(() => {
    const handleToggle = () => setShowStatus((value) => !value);
    window.addEventListener("toggle-trip-status", handleToggle);
    return () => window.removeEventListener("toggle-trip-status", handleToggle);
  }, []);

  const userPosition: [number, number] | null = currentLocation
    ? [currentLocation.coords.latitude, currentLocation.coords.longitude]
    : null;

  const trackingUserPoint = toMarkerPoint(tracking?.lastKnownUserLocation);
  const driverPoint = toMarkerPoint(tracking?.driverLocation);
  const busPoint = toMarkerPoint(tracking?.busLocation);
  const intercityLeg = activeTrip?.legs.find((leg) => leg.type === "intercity_bus");
  const localLeg = activeTrip?.legs.find((leg) => leg.type === "local_transport");
  const etaMinutes = tracking?.etaMinutes ?? activeTrip?.legs.reduce((sum, leg) => sum + leg.duration, 0) ?? 0;
  const progress = Math.max(0, Math.min(100, tracking?.progress ?? 0));
  const protectedTrip = Boolean(activeTrip?.protectionEnabled);
  const mapCenter = userPosition || (trackingUserPoint ? [trackingUserPoint.lat, trackingUserPoint.lng] as [number, number] : routePoints[0] ? [routePoints[0].lat, routePoints[0].lng] as [number, number] : DEFAULT_CENTER);

  const handleToggleSharing = async () => {
    if (isSharing) {
      await stopSharing();
      toast.success("Location sharing stopped");
      return;
    }

    const id = await startSharing({ durationMinutes: 120, tripId: activeTrip?.id });
    if (id) toast.success("Real-time sharing activated");
  };

  const copyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    toast.success("Share link copied");
  };

  if (loadingTrip) {
    return (
      <div className="min-h-screen bg-background md:pl-24 flex items-center justify-center px-4">
        <div className="glass-card-elevated p-8 text-center max-w-md">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <h1 className="text-2xl font-black text-foreground">Loading real trip data</h1>
          <p className="text-sm text-muted-foreground mt-2">Reading your Firebase trip and tracking records.</p>
        </div>
      </div>
    );
  }

  if (!activeTrip) {
    return (
      <div className="min-h-screen bg-background md:pl-24 px-4 py-24">
        <div className="container mx-auto max-w-3xl">
          <div className="rounded-[2rem] border border-border bg-card p-8 md:p-12 text-center shadow-2xl">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
              <Route className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-3xl md:text-5xl font-black text-foreground">No booked trip to track yet</h1>
            <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
              Tracking uses your real Firebase trip records. Plan and book a journey first, then this page will show
              Google Maps, live GPS, saved legs, and bus updates.
            </p>
            <Link to="/">
              <Button variant="hero" size="lg" className="mt-6">
                <Navigation className="h-4 w-4" />
                Plan Journey
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background md:pl-24 md:h-screen md:overflow-hidden relative overflow-x-hidden pt-0">
      <div className="relative h-[45vh] md:h-screen overflow-hidden">
        <GoogleTrackingMap
          routePoints={routePoints}
          userPosition={userPosition}
          trackingUserPoint={trackingUserPoint}
          driverPoint={driverPoint}
          busPoint={busPoint}
          selectedPoint={selectedPoint}
          center={mapCenter}
        />

        <GoogleMapSearch onLocationSelect={setSelectedPoint} />

        <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2 md:hidden">
          <Button
            variant="hero"
            size="sm"
            onClick={() => setShowStatus(!showStatus)}
            className="rounded-full shadow-2xl h-10 px-4 font-bold border border-white/20 whitespace-nowrap"
          >
            <Clock3 className="h-4 w-4 mr-2" />
            Status
          </Button>
        </div>

        <AnimatePresence>
          {showStatus && (
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -20, opacity: 0 }}
              className="absolute top-16 left-3 right-3 md:top-4 md:left-44 md:right-auto md:w-96 z-[1000]"
            >
              <div className="bg-card/95 backdrop-blur-xl rounded-2xl p-4 shadow-2xl border border-border/50 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
                <button
                  onClick={() => setShowStatus(false)}
                  className="absolute top-2.5 right-2.5 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-success/10">
                    <CheckCircle className="h-5 w-5 text-success" />
                  </div>
                  <div className="flex-1 min-w-0 pr-8">
                    <p className="font-bold text-foreground text-sm">{getPhaseCopy(tracking, activeTrip)}</p>
                    <p className="text-muted-foreground text-[10px] truncate">{activeTrip.from} to {activeTrip.to}</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-muted-foreground uppercase tracking-wider">Journey Progress</span>
                    <span className="text-primary">{progress}%</span>
                  </div>
                  <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-success via-primary to-secondary"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-muted-foreground pt-1">
                    <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> Google Maps live tracking</span>
                    <span className="font-bold text-foreground">ETA {formatMinutes(etaMinutes)}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute top-4 right-4 z-[1000]">
          <div className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/95 text-primary-foreground text-[11px] font-bold shadow-2xl backdrop-blur-md">
            <Shield className="h-3.5 w-3.5" />
            <span>{protectedTrip ? "Protected Trip" : "Standard Trip"}</span>
          </div>
        </div>

        {isSharing && (
          <div className="absolute bottom-4 left-4 z-[1000] hidden md:block">
            <div className="flex items-center gap-2 px-3 py-2 rounded-full bg-success/90 text-success-foreground text-[11px] font-bold shadow-xl backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-success-foreground animate-pulse" />
              Live GPS sharing
            </div>
          </div>
        )}

        {(geocoding || !currentLocation) && (
          <div className="absolute bottom-4 right-4 z-[1000] hidden md:flex items-center gap-2 px-3 py-2 rounded-full bg-card/95 text-foreground text-[11px] font-bold shadow-xl border border-border">
            <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
            {geocoding ? "Mapping saved stops with Google" : "Waiting for GPS"}
          </div>
        )}

        <AnimatePresence>
          {isPanelHidden ? (
            <motion.button
              key="show-panel"
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              onClick={() => setIsPanelHidden(false)}
              className="hidden md:flex absolute right-6 top-20 z-[1000] items-center gap-2 rounded-full bg-card/95 px-4 py-3 text-sm font-black text-foreground shadow-2xl ring-1 ring-border/70 backdrop-blur-xl hover:bg-card"
            >
              <Route className="h-4 w-4 text-primary" />
              Show trip
            </motion.button>
          ) : (
            <motion.aside
              key="desktop-panel"
              initial={{ opacity: 0, x: 36, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 36, scale: 0.98 }}
              transition={{ type: "spring", damping: 24, stiffness: 260 }}
              className="hidden md:flex absolute right-6 top-20 bottom-6 z-[1000] w-[420px] min-h-0 flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-background/88 shadow-[0_24px_80px_rgba(2,6,23,0.35)] ring-1 ring-border/70 backdrop-blur-2xl"
              onWheel={stopMapScrollCapture}
              onTouchMove={stopMapScrollCapture}
            >
              <div className="border-b border-border/70 p-5">
                <div className="mb-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                      <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
                      Live ride
                    </div>
                    <h1 className="text-2xl font-black leading-tight text-foreground">{getPhaseCopy(tracking, activeTrip)}</h1>
                    <p className="mt-1 line-clamp-2 text-xs font-medium text-muted-foreground">
                      {activeTrip.from} to {activeTrip.to}
                    </p>
                  </div>
                  <button
                    onClick={() => setIsPanelHidden(true)}
                    className="rounded-2xl border border-border bg-card/80 p-2 text-muted-foreground shadow-sm transition hover:text-foreground"
                    title="Hide trip panel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: "ETA", value: formatMinutes(etaMinutes), tone: "text-success" },
                    { label: "Date", value: formatDate(activeTrip.date), tone: "text-primary" },
                    { label: "Cost", value: `₹${activeTrip.totalCost}`, tone: "text-secondary" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl border border-border/70 bg-card/75 p-3 text-center">
                      <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground">{item.label}</p>
                      <p className={`mt-1 text-base font-black ${item.tone}`}>{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-5 pr-3 [scrollbar-gutter:stable]">
                <div className="mb-4 rounded-3xl border border-border/70 bg-card/75 p-4">
                  <div className="mb-3 flex items-center gap-3">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20">
                      <User className="h-5 w-5 text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-foreground">Google Maps + Firebase live</p>
                      <p className="text-xs text-muted-foreground">
                        {tracking?.status || activeTrip.status} • {protectedTrip ? "Protected" : "Standard"}
                      </p>
                    </div>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-2xl">
                      <Phone className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-2xl">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-black">
                      <span className="uppercase tracking-wider text-muted-foreground">Progress</span>
                      <span className="text-primary">{progress}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-gradient-to-r from-success via-primary to-secondary" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>

                <div className="mb-4 grid grid-cols-3 gap-1 rounded-2xl bg-muted p-1">
                  {(["timeline", "bus", "safety"] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`rounded-xl py-2 text-xs font-black transition-all ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                    >
                      {tab === "timeline" ? "Route" : tab === "bus" ? "Bus" : "Safety"}
                    </button>
                  ))}
                </div>

                <AnimatePresence mode="wait">
                  {activeTab === "timeline" && (
                    <motion.div key="desktop-timeline" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-0 rounded-3xl border border-border/70 bg-card/65 p-4">
                      {activeTrip.legs.map((leg, index) => {
                        const stepProgress = activeTrip.legs.length <= 1 ? 100 : (index / (activeTrip.legs.length - 1)) * 100;
                        const isDone = progress > stepProgress + 15;
                        const isCurrent = !isDone && progress >= stepProgress - 10;

                        return (
                          <div key={leg.id} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className={`h-3 w-3 rounded-full border-2 ${isDone ? "border-success bg-success" : isCurrent ? "border-primary bg-primary animate-pulse" : "border-border bg-card"}`} />
                              {index < activeTrip.legs.length - 1 && (
                                <div className={`min-h-[42px] w-0.5 flex-1 ${isDone ? "bg-success/40" : "bg-border"}`} />
                              )}
                            </div>
                            <div className="min-w-0 flex-1 pb-4">
                              <div className="flex items-center justify-between gap-3">
                                <p className="truncate text-sm font-black text-foreground">{getLegLabel(leg)}</p>
                                <span className="shrink-0 text-[11px] font-bold text-muted-foreground">{leg.departureTime}</span>
                              </div>
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{leg.from} to {leg.to}</p>
                              <p className="mt-1 text-[11px] font-bold text-muted-foreground">{formatMinutes(leg.duration)} • ₹{leg.cost}</p>
                            </div>
                          </div>
                        );
                      })}
                    </motion.div>
                  )}

                  {activeTab === "bus" && (
                    <motion.div key="desktop-bus" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-3">
                      <div className="rounded-3xl border border-border/70 bg-card/70 p-4">
                        <div className="mb-3 flex items-center justify-between gap-3">
                          <h2 className="text-base font-black text-foreground">{intercityLeg?.vehicle || "Bus details pending"}</h2>
                          <span className="rounded-full bg-warning/10 px-2 py-1 text-[11px] font-black text-warning">Real trip</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div><span className="text-muted-foreground">Operator</span><p className="font-bold text-foreground">{intercityLeg?.operator || "Awaiting update"}</p></div>
                          <div><span className="text-muted-foreground">Distance</span><p className="font-bold text-foreground">{intercityLeg?.distance || 0} km</p></div>
                          <div><span className="text-muted-foreground">Boarding</span><p className="line-clamp-2 font-bold text-foreground">{intercityLeg?.from || localLeg?.to || activeTrip.from}</p></div>
                          <div><span className="text-muted-foreground">Arrival</span><p className="font-bold text-foreground">{intercityLeg?.arrivalTime || "Updating"}</p></div>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                        <div className="rounded-2xl bg-success/10 px-3 py-2 text-success"><Battery className="mr-1 inline h-3 w-3" /> From booking</div>
                        <div className="rounded-2xl bg-primary/10 px-3 py-2 text-primary"><Wifi className="mr-1 inline h-3 w-3" /> Google live</div>
                      </div>
                    </motion.div>
                  )}

                  {activeTab === "safety" && (
                    <motion.div key="desktop-safety" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-2">
                      {[
                        { icon: Shield, title: protectedTrip ? "Trip Protection Active" : "Trip Protection Off", desc: protectedTrip ? "Enabled during booking" : "Booked without protection", color: protectedTrip ? "text-success" : "text-muted-foreground" },
                        { icon: Share2, title: isSharing ? "Sharing Active" : "Share Live Location", desc: isSharing ? "Private link is live" : "Start real-time GPS sharing", color: isSharing ? "text-success" : "text-primary", action: handleToggleSharing },
                        { icon: Copy, title: "Copy Share Link", desc: shareLink || "Start sharing first", color: "text-primary", action: copyLink },
                        { icon: AlertTriangle, title: "SOS Emergency", desc: "Emergency workflow placeholder", color: "text-destructive" },
                      ].map((item) => (
                        <button
                          key={item.title}
                          onClick={item.action}
                          className="flex w-full items-center gap-3 rounded-2xl border border-border/70 bg-card/70 p-3 text-left transition hover:bg-card"
                        >
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted">
                            <item.icon className={`h-5 w-5 ${item.color}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-black text-foreground">{item.title}</p>
                            <p className="truncate text-xs text-muted-foreground">{item.desc}</p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </button>
                      ))}
                      {locationError && <p className="text-xs text-destructive">{locationError}</p>}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="grid grid-cols-2 gap-2 border-t border-border/70 p-5">
                <Button variant="destructive" size="lg" className="rounded-2xl">
                  <AlertTriangle className="h-4 w-4" />
                  SOS
                </Button>
                <Button variant={isSharing ? "hero" : "outline"} size="lg" className="rounded-2xl" onClick={handleToggleSharing}>
                  <Share2 className="h-4 w-4" />
                  {isSharing ? "Sharing" : "Share"}
                </Button>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>
      </div>

      <div className="bg-card rounded-t-3xl -mt-6 relative z-10 border-t border-border min-h-[40vh] md:hidden">
        <div className="w-full flex justify-center pt-3 pb-1">
          <div className="w-10 h-1.5 rounded-full bg-border" />
        </div>

        <div className="px-4 md:px-6 pb-8">
          <div className="grid grid-cols-3 gap-2 mb-5 md:mb-6">
            {[
              { label: "ETA", value: formatMinutes(etaMinutes), color: "text-success" },
              { label: "Trip Date", value: formatDate(activeTrip.date), color: "text-primary" },
              { label: "Cost", value: `₹${activeTrip.totalCost}`, color: "text-secondary" },
            ].map((item) => (
              <motion.div key={item.label} whileHover={{ scale: 1.03 }} className="glass-card p-3 text-center">
                <p className="text-[10px] md:text-xs text-muted-foreground">{item.label}</p>
                <p className={`text-base md:text-2xl font-bold ${item.color}`}>{item.value}</p>
              </motion.div>
            ))}
          </div>

          <motion.div whileHover={{ scale: 1.01 }} className="glass-card-elevated p-3 md:p-4 mb-4">
            <div className="flex items-center gap-3 md:gap-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0">
                <User className="h-6 w-6 md:h-7 md:w-7 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm md:text-base">{getPhaseCopy(tracking, activeTrip)}</p>
                <p className="text-xs text-muted-foreground truncate">{activeTrip.from} to {activeTrip.to}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Star className="h-3 w-3 text-warning fill-warning" />
                  <span className="text-xs font-medium text-foreground">Google Maps + Firebase live</span>
                  <span className="ml-1 text-[10px] bg-success/10 text-success px-1.5 py-0.5 rounded-full font-medium">
                    {tracking?.status || activeTrip.status}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl"><Phone className="h-4 w-4" /></Button>
                <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl"><MessageCircle className="h-4 w-4" /></Button>
              </div>
            </div>
          </motion.div>

          <div className="flex gap-1 p-1 bg-muted rounded-xl mb-4">
            {(["timeline", "bus", "safety"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${activeTab === tab ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}
              >
                {tab === "timeline" ? "Timeline" : tab === "bus" ? "Bus Info" : "Safety"}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "timeline" && (
              <motion.div key="timeline" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-0">
                {activeTrip.legs.map((leg, index) => {
                  const stepProgress = activeTrip.legs.length <= 1 ? 100 : (index / (activeTrip.legs.length - 1)) * 100;
                  const isDone = progress > stepProgress + 15;
                  const isCurrent = !isDone && progress >= stepProgress - 10;

                  return (
                    <div key={leg.id} className="flex gap-3 md:gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`w-3 h-3 rounded-full shrink-0 border-2 ${isDone ? "bg-success border-success" : isCurrent ? "bg-primary border-primary animate-pulse" : "bg-card border-border"}`} />
                        {index < activeTrip.legs.length - 1 && (
                          <div className={`w-0.5 flex-1 min-h-[38px] ${isDone ? "bg-success/40" : "bg-border"}`} />
                        )}
                      </div>
                      <div className="pb-4 flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-3">
                          <p className={`text-xs md:text-sm ${isCurrent || isDone ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                            {getLegLabel(leg)}: {leg.from} to {leg.to}
                          </p>
                          <span className="text-[10px] md:text-xs text-muted-foreground shrink-0">{leg.departureTime}</span>
                        </div>
                        <p className="text-[10px] md:text-xs text-muted-foreground mt-0.5">
                          {formatMinutes(leg.duration)} • ₹{leg.cost} • arrives {leg.arrivalTime}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </motion.div>
            )}

            {activeTab === "bus" && (
              <motion.div key="bus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-4">
                <div className="glass-card p-4">
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <h4 className="font-semibold text-foreground text-sm">{intercityLeg?.vehicle || "Bus details pending"}</h4>
                    <div className="flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 text-warning fill-warning" />
                      <span className="text-sm font-medium text-foreground">Real trip</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div><span className="text-muted-foreground">Operator</span><p className="font-medium text-foreground">{intercityLeg?.operator || "Awaiting update"}</p></div>
                    <div><span className="text-muted-foreground">Distance</span><p className="font-medium text-foreground">{intercityLeg?.distance || 0} km</p></div>
                    <div><span className="text-muted-foreground">Boarding</span><p className="font-medium text-foreground">{intercityLeg?.from || localLeg?.to || activeTrip.from}</p></div>
                    <div><span className="text-muted-foreground">Arrival</span><p className="font-medium text-foreground">{intercityLeg?.arrivalTime || "Updating"}</p></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] md:text-xs">
                  <div className="flex items-center gap-1 px-2 py-2 rounded-xl bg-success/10 text-success font-medium"><Battery className="h-3 w-3" /> Data from booking</div>
                  <div className="flex items-center gap-1 px-2 py-2 rounded-xl bg-primary/10 text-primary font-medium"><Wifi className="h-3 w-3" /> Google live ready</div>
                </div>
              </motion.div>
            )}

            {activeTab === "safety" && (
              <motion.div key="safety" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="space-y-3">
                {[
                  { icon: Shield, title: protectedTrip ? "Trip Protection Active" : "Trip Protection Off", desc: protectedTrip ? "Protection was enabled during booking" : "This trip was booked without protection", color: protectedTrip ? "text-success" : "text-muted-foreground" },
                  { icon: Share2, title: isSharing ? "Sharing Active" : "Share Live Location", desc: isSharing ? "Everyone with the link can see your live GPS" : "Tap to start real-time GPS sharing", color: isSharing ? "text-success" : "text-primary", action: handleToggleSharing },
                  { icon: Copy, title: "Copy Share Link", desc: shareLink || "Start sharing first to generate a private link", color: "text-primary", action: copyLink },
                  { icon: AlertTriangle, title: "SOS Emergency", desc: "Emergency workflow placeholder for now", color: "text-destructive" },
                ].map((item) => (
                  <motion.div
                    key={item.title}
                    whileHover={{ scale: 1.01 }}
                    className={`glass-card p-3 flex items-center gap-3 cursor-pointer border-2 transition-all ${item.title === "Sharing Active" ? "border-success/30 bg-success/5" : "border-transparent"}`}
                    onClick={item.action}
                  >
                    <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center shrink-0">
                      <item.icon className={`h-5 w-5 ${item.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground text-xs md:text-sm">{item.title}</p>
                      <p className="text-[10px] md:text-xs text-muted-foreground truncate">{item.desc}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </motion.div>
                ))}
                {locationError && <p className="text-xs text-destructive">{locationError}</p>}
              </motion.div>
            )}
          </AnimatePresence>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-5 p-3 md:p-4 rounded-2xl bg-primary/10 border border-primary/20 flex items-start gap-3"
          >
            <Bus className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-foreground text-xs md:text-sm">Tracking now uses Google Maps + Firebase</p>
              <p className="text-muted-foreground text-[10px] md:text-xs">
                Driver and bus pins appear only when conductor/driver updates write real coordinates.
              </p>
            </div>
          </motion.div>

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
              {isSharing ? "Sharing" : "Share Trip"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LiveTracking;
