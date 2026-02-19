import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Navigation, Bus, Calendar, Clock, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import heroTravel1 from "@/assets/hero-travel-1.jpg";
import heroTravel2 from "@/assets/hero-travel-2.jpg";
import heroTravel3 from "@/assets/hero-travel-3.jpg";

const heroImages = [heroTravel1, heroTravel2, heroTravel3];

const HeroSection = () => {
  const [startPoint, setStartPoint] = useState("");
  const [busStation, setBusStation] = useState("");
  const [destination, setDestination] = useState("");
  const [loading, setLoading] = useState(false);
  const [currentImage, setCurrentImage] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImage((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handlePlanJourney = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigate("/results");
    }, 1500);
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 pb-8 md:pt-16 md:pb-0">
      {/* Full-width cycling background images */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentImage}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
          <img
            src={heroImages[currentImage]}
            alt="Travel background"
            className="w-full h-full object-cover"
          />
        </motion.div>
      </AnimatePresence>
      {/* Dark overlay for text readability */}
      <div className="absolute inset-0 bg-foreground/60" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span className="inline-flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full bg-primary-foreground/10 backdrop-blur-md text-primary-foreground/90 text-xs md:text-sm font-medium mb-4 md:mb-6">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              Trusted by 50,000+ travelers across India
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl md:text-6xl lg:text-7xl font-bold text-primary-foreground mb-4 md:mb-6 leading-tight"
          >
            Never Miss Your
            <br />
            <span className="text-secondary">Intercity Bus</span> Again
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-base md:text-xl text-primary-foreground/70 mb-6 md:mb-10 max-w-xl mx-auto px-2"
          >
            Smart last-mile coordination with guaranteed arrival protection.
            From your doorstep to your destination, stress-free.
          </motion.p>

          {/* Journey Planner Card */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="bg-card/95 backdrop-blur-xl rounded-2xl md:rounded-3xl p-4 md:p-8 shadow-2xl max-w-2xl mx-auto"
          >
            <div className="space-y-3 md:space-y-4">
              <div className="relative">
                <MapPin className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-success" />
                <input
                  type="text"
                  placeholder="Your home address"
                  value={startPoint}
                  onChange={(e) => setStartPoint(e.target.value)}
                  className="w-full h-11 md:h-12 pl-10 md:pl-12 pr-3 md:pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="relative">
                <Bus className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-secondary" />
                <input
                  type="text"
                  placeholder="Bus boarding point"
                  value={busStation}
                  onChange={(e) => setBusStation(e.target.value)}
                  className="w-full h-11 md:h-12 pl-10 md:pl-12 pr-3 md:pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="relative">
                <Navigation className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-destructive" />
                <input
                  type="text"
                  placeholder="Final destination"
                  value={destination}
                  onChange={(e) => setDestination(e.target.value)}
                  className="w-full h-11 md:h-12 pl-10 md:pl-12 pr-3 md:pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm md:text-base placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
                />
              </div>

              <div className="flex gap-2 md:gap-3">
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  <input
                    type="date"
                    className="w-full h-11 md:h-12 pl-10 md:pl-12 pr-2 md:pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
                  />
                </div>
                <div className="relative flex-1">
                  <Clock className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 h-4 w-4 md:h-5 md:w-5 text-muted-foreground" />
                  <input
                    type="time"
                    className="w-full h-11 md:h-12 pl-10 md:pl-12 pr-2 md:pr-4 rounded-xl border-2 border-border bg-background text-foreground text-sm focus:border-primary focus:outline-none transition-colors"
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
            className="mt-6 md:mt-8 flex items-center justify-center gap-4 md:gap-6 text-primary-foreground/50 text-xs md:text-sm"
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
