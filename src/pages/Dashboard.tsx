import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Activity,
  ArrowRight,
  CalendarClock,
  Clock3,
  IndianRupee,
  MapPin,
  Navigation,
  Plus,
  Radar,
  Route,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserDashboardSnapshot,
  type DashboardSnapshot,
  type Trip,
  type UserActivity,
} from "@/lib/database";
import { getErrorMessage } from "@/lib/errors";
import { toast } from "sonner";

const formatDate = (timestamp: number) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(timestamp));

const formatTripDate = (date: string) => {
  if (!date) return "Date not set";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const getActivityIcon = (type: UserActivity["type"]) => {
  switch (type) {
    case "trip_booked":
      return Route;
    case "journey_search":
      return MapPin;
    case "location_sharing":
      return Radar;
    case "profile":
      return UserRound;
    case "safety":
      return ShieldCheck;
    default:
      return Activity;
  }
};

const Dashboard = () => {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardSnapshot | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    setLoading(true);
    getUserDashboardSnapshot(user.uid)
      .then(setData)
      .catch((error) => {
        toast.error(getErrorMessage(error, "Failed to load dashboard"));
      })
      .finally(() => setLoading(false));
  }, [user]);

  const trips = useMemo(() => {
    if (!data?.trips) return [] as Array<Trip & { id: string }>;
    return Object.entries(data.trips)
      .map(([id, trip]) => ({ id, ...trip }))
      .sort((a, b) => b.createdAt - a.createdAt);
  }, [data?.trips]);

  const stats = useMemo(() => {
    const totalSpent = trips.reduce((sum, trip) => sum + (trip.totalCost || 0), 0);
    const activeTrips = trips.filter((trip) => trip.status === "active").length;
    const protectedTrips = trips.filter((trip) => trip.protectionEnabled).length;

    return {
      totalTrips: trips.length,
      activeTrips,
      protectedTrips,
      totalSpent,
      searches: data?.searches.length || 0,
      liveShares: data?.activeShares.length || 0,
    };
  }, [trips, data?.searches.length, data?.activeShares.length]);

  const nextTrip = trips.find((trip) => trip.status === "active") || trips[0];
  const displayName = data?.profile?.name || user?.displayName || "Traveler";
  const avatarUrl = data?.profile?.photoURL || user?.photoURL;

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="text-center">
          <img src="/assets/RideSync.gif" className="h-16 w-auto mx-auto mb-4" alt="Loading dashboard" />
          <p className="text-sm font-semibold text-muted-foreground">Preparing your SyncRide dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.12),transparent_34%),linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted)/0.45))] pt-24 pb-16">
      <div className="container mx-auto px-4 max-w-7xl">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-5 mb-6"
        >
          <div className="relative rounded-[2rem] border border-border/50 bg-card/90 backdrop-blur-xl p-6 md:p-8 lg:p-10 shadow-2xl min-h-[300px]">
            <div className="absolute -right-20 -top-20 h-56 w-56 rounded-full bg-secondary/20 blur-3xl pointer-events-none" />
            <div className="absolute right-16 bottom-0 h-32 w-32 rounded-full bg-primary/20 blur-2xl pointer-events-none" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="flex flex-col sm:flex-row sm:items-center gap-5">
                <div className="h-20 w-20 rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 border border-border flex items-center justify-center shrink-0">
                  {avatarUrl ? (
                    <img src={avatarUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-9 w-9 text-primary" />
                  )}
                </div>
                <div className="min-w-0 max-w-3xl">
                  <div className="inline-flex max-w-full items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-bold text-primary mb-4">
                    <span className="whitespace-normal sm:whitespace-nowrap">Personal commute cockpit</span>
                  </div>
                  <h1 className="text-3xl md:text-5xl font-black tracking-tight text-foreground leading-[1.05]">
                    Welcome back, {displayName.split(" ")[0]}
                  </h1>
                  <p className="text-base md:text-lg text-muted-foreground mt-4 max-w-2xl leading-relaxed">
                    Track trips, searches, live sharing, and safety activity from one place.
                  </p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/" className="w-full sm:w-auto">
                  <Button variant="hero" size="lg" className="w-full sm:w-auto px-8">
                    <Plus className="h-4 w-4" />
                    Plan Journey
                  </Button>
                </Link>
                <Link to="/tracking" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto px-8">
                    <Navigation className="h-4 w-4" />
                    Live Track
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/50 bg-card/90 backdrop-blur-xl p-6 shadow-xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground mb-4">Current Focus</p>
            {nextTrip ? (
              <div>
                <div className="flex items-start gap-3 mb-5">
                  <div className="h-11 w-11 rounded-2xl bg-success/10 flex items-center justify-center">
                    <Route className="h-5 w-5 text-success" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="font-black text-xl text-foreground truncate">{nextTrip.from}</h2>
                    <p className="text-sm text-muted-foreground truncate">to {nextTrip.to}</p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-2xl bg-muted/60 p-3">
                    <p className="text-xs text-muted-foreground">Date</p>
                    <p className="text-sm font-bold text-foreground">{formatTripDate(nextTrip.date)}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/60 p-3">
                    <p className="text-xs text-muted-foreground">Cost</p>
                    <p className="text-sm font-bold text-foreground">₹{nextTrip.totalCost}</p>
                  </div>
                  <div className="rounded-2xl bg-muted/60 p-3">
                    <p className="text-xs text-muted-foreground">Status</p>
                    <p className="text-sm font-bold capitalize text-success">{nextTrip.status}</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl bg-muted/50 p-5 text-center">
                <CalendarClock className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="font-bold text-foreground">No trips booked yet</p>
                <p className="text-sm text-muted-foreground mt-1">Plan your first route to start tracking activity.</p>
              </div>
            )}
          </div>
        </motion.section>

        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 mb-6">
          {[
            { label: "Total Trips", value: stats.totalTrips, icon: Route, tone: "text-primary" },
            { label: "Active", value: stats.activeTrips, icon: Activity, tone: "text-success" },
            { label: "Protected", value: stats.protectedTrips, icon: ShieldCheck, tone: "text-secondary" },
            { label: "Spent", value: `₹${stats.totalSpent}`, icon: IndianRupee, tone: "text-foreground" },
            { label: "Searches", value: stats.searches, icon: MapPin, tone: "text-warning" },
            { label: "Live Shares", value: stats.liveShares, icon: Radar, tone: "text-destructive" },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="rounded-2xl border border-border/50 bg-card/85 p-4 shadow-sm"
            >
              <item.icon className={`h-5 w-5 ${item.tone} mb-3`} />
              <p className="text-xl md:text-2xl font-black text-foreground">{item.value}</p>
              <p className="text-xs font-semibold text-muted-foreground">{item.label}</p>
            </motion.div>
          ))}
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.1fr] gap-5">
          <div className="space-y-5">
            <div className="rounded-[2rem] border border-border/50 bg-card/90 p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-black text-foreground">Recent Trips</h2>
                <Link to="/tracking" className="text-xs font-bold text-primary hover:underline">Open tracking</Link>
              </div>
              <div className="space-y-3">
                {trips.slice(0, 4).map((trip) => (
                  <div key={trip.id} className="rounded-2xl border border-border/50 bg-background/60 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-bold text-foreground truncate">{trip.from}</p>
                        <p className="text-sm text-muted-foreground truncate">to {trip.to}</p>
                      </div>
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary">₹{trip.totalCost}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <Clock3 className="h-3.5 w-3.5" />
                      <span>{formatTripDate(trip.date)}</span>
                      {trip.protectionEnabled && <span className="text-success font-bold">Protected</span>}
                    </div>
                  </div>
                ))}
                {trips.length === 0 && (
                  <div className="rounded-2xl bg-muted/50 p-5 text-center text-sm text-muted-foreground">
                    Trips you book will appear here automatically.
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-[2rem] border border-border/50 bg-card/90 p-5 shadow-lg">
              <h2 className="text-lg font-black text-foreground mb-4">Recent Searches</h2>
              <div className="space-y-3">
                {(data?.searches || []).map((search) => (
                  <Link
                    key={`${search.createdAt}-${search.destination}`}
                    to={`/results?${new URLSearchParams({
                      from: search.startPoint,
                      bus: search.busStation,
                      to: search.destination,
                      ...(search.date && { date: search.date }),
                      ...(search.time && { time: search.time }),
                    }).toString()}`}
                    className="flex items-center justify-between gap-3 rounded-2xl bg-background/60 p-4 hover:bg-accent transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="font-bold text-foreground truncate">{search.destination}</p>
                      <p className="text-xs text-muted-foreground truncate">via {search.busStation}</p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                ))}
                {(data?.searches.length || 0) === 0 && (
                  <div className="rounded-2xl bg-muted/50 p-5 text-center text-sm text-muted-foreground">
                    Your route searches will be saved here.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/50 bg-card/90 p-5 shadow-lg">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-lg font-black text-foreground">Activity Timeline</h2>
                <p className="text-xs text-muted-foreground">Auth, booking, route search, and sharing events.</p>
              </div>
              <Activity className="h-5 w-5 text-primary" />
            </div>
            <div className="space-y-4">
              {(data?.activities || []).map((activity, index) => {
                const Icon = getActivityIcon(activity.type);
                return (
                  <motion.div
                    key={`${activity.createdAt}-${activity.title}-${index}`}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.035 }}
                    className="relative flex gap-4"
                  >
                    <div className="flex flex-col items-center">
                      <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
                        <Icon className="h-5 w-5 text-primary" />
                      </div>
                      {index < (data?.activities.length || 0) - 1 && <div className="w-px flex-1 bg-border my-2" />}
                    </div>
                    <div className="pb-4 min-w-0">
                      <p className="font-bold text-foreground">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">{formatDate(activity.createdAt)}</p>
                    </div>
                  </motion.div>
                );
              })}
              {(data?.activities.length || 0) === 0 && (
                <div className="rounded-2xl bg-muted/50 p-8 text-center">
                  <Activity className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                  <p className="font-bold text-foreground">No activity yet</p>
                  <p className="text-sm text-muted-foreground mt-1">Sign-ins, bookings, and location sharing will appear here.</p>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Dashboard;
