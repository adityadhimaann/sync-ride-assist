import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Navigation, Bus, Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [startPoint, setStartPoint] = useState("");
  const [busStation, setBusStation] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePlanJourney = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/results");
    }, 1500);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Animated gradient background */}
      <div className="absolute inset-0 gradient-hero opacity-95" />
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 50%, hsla(24, 95%, 53%, 0.3) 0%, transparent 50%),
                           radial-gradient(circle at 80% 20%, hsla(224, 76%, 60%, 0.4) 0%, transparent 50%),
                           radial-gradient(circle at 50% 80%, hsla(24, 95%, 53%, 0.2) 0%, transparent 50%)`,
        }}
      />

      {/* Floating elements */}
      <motion.div
        animate={{ y: [-10, 10, -10] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-32 right-[15%] hidden lg:block"
      >
        <div className="w-16 h-16 rounded-2xl bg-secondary/20 backdrop-blur-md flex items-center justify-center">
          <Bus className="h-8 w-8 text-secondary" />
        </div>
      </motion.div>
      <motion.div
        animate={{ y: [10, -10, 10] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-40 left-[10%] hidden lg:block"
      >
        <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 backdrop-blur-md flex items-center justify-center">
          <Navigation className="h-6 w-6 text-primary-foreground/70" />
        </div>
      </motion.div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-foreground/10 backdrop-blur-md text-primary-foreground/90 text-sm font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Trusted by 50,000+ travelers across India
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-6 leading-tight"
          >
            Never Miss Your
            <br />
            <span className="text-secondary">Intercity Bus</span> Again
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-xl text-primary-foreground/70 mb-10 max-w-xl mx-auto"
          >
            Smart last-mile coordination with guaranteed arrival protection.
            From your doorstep to your destination, stress-free.
          </motion.p>

          {/* Journey Planner Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-card/95 backdrop-blur-xl rounded-3xl p-6 md:p-8 shadow-2xl max-w-2xl mx-auto"
          >
            <div className="space-y-4">
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-success" />
                <input
                  type="text"
                  placeholder="Your home address"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="relative">
                <Bus className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-secondary" />
                <input
                  type="text"
                  placeholder="Bus boarding point"
                  value={busStation}
                  onChange={(e) => setBusStation(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="relative">
                <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-destructive" />
                <input
                  type="text"
                  placeholder="Final destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-3">
                <div className="relative flex-1">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="date"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="relative flex-1">
                  <Clock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <input
                    type="time"
                    className="w-full h-12 pl-12 pr-4 rounded-xl border-2 border-border bg-background text-foreground focus:border-primary focus:outline-none transition-colors"
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
                    <Loader2 className="h-5 w-5 animate-spin" />
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
            className="mt-8 flex items-center justify-center gap-6 text-primary-foreground/50 text-sm"
          >
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              100+ cities
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              500+ bus operators
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success" />
              4.8★ rating
            </span>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
