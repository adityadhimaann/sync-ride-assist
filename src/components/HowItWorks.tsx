import { useRef } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { MapPin, Clock, Bus, CheckCircle } from "lucide-react";


const steps = [
  {
    icon: MapPin,
    step: "01",
    title: "Enter Your Journey",
    description: "Tell us your home address, bus boarding point, and final destination. We plan every leg.",
  },
  {
    icon: Clock,
    step: "02",
    title: "Get Smart Timing",
    description: "AI calculates buffer time based on traffic, weather, and historical data. Never cut it close.",
  },
  {
    icon: Bus,
    step: "03",
    title: "Travel with Protection",
    description: "Enable Guaranteed Arrival. If you're delayed, your bus waits — or you get a full refund.",
  },
  {
    icon: CheckCircle,
    step: "04",
    title: "Arrive Stress-Free",
    description: "Real-time tracking, conductor coordination, and instant rebooking if anything goes wrong.",
  },
];

const HowItWorks = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Track scroll progress within this section
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"]
  });

  // Smooth out the scroll value
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Bus movement transforms - scrolling DOWN the track
  // Road at 15% width (M 150 in 1000 viewBox)
  const busY = useTransform(smoothProgress, [0, 1], ["0%", "95%"]);

  return (
    <section ref={containerRef} className="py-24 md:py-40 bg-transparent relative overflow-visible">

      {/* Scroll-Responsive Road Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {/* Main Road Path: Vertical line on left */}
          <path
            d="M 150 0 L 150 1000"
            className="stroke-slate-800 dark:stroke-slate-900/40 stroke-[40] md:stroke-[60] fill-none"
          />
          {/* Dashed Center line */}
          <path
            d="M 150 0 L 150 1000"
            className="stroke-white/30 stroke-[3] md:stroke-[4] stroke-dasharray-[20,25] fill-none"
          />
          {/* Journey Progress (Glowing highlight) */}
          <motion.path
            d="M 150 0 L 150 1000"
            style={{ pathLength: smoothProgress }}
            className="stroke-primary/40 stroke-[42] md:stroke-[62] fill-none blur-md"
          />
        </svg>

        {/* The Scrolling Bus - Mounted on the vertical track */}
        <motion.div
          style={{
            y: busY,
            left: "15%", // Matches M 150 in 1000px
          }}
          className="absolute top-0 z-30 -translate-x-1/2"
        >
          <div className="relative w-24 md:w-32 h-40 md:h-52 drop-shadow-2xl flex flex-col items-center">
            {/* Bus Body (Vertical orientation for top-down road) */}
            <div className="w-full h-full bg-primary rounded-2xl overflow-hidden shadow-2xl flex flex-col border-x-4 border-black/10">
              <div className="w-3/4 h-2 bg-white/20 rounded-b-lg mx-auto" />

              {/* Front windshield */}
              <div className="mx-2 mt-4 h-12 md:h-16 bg-slate-900/90 rounded-t-lg shadow-inner relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/10 to-transparent" />
              </div>

              {/* Passenger windows */}
              <div className="mx-2 mt-2 flex flex-col gap-1.5 flex-1">
                <div className="h-6 md:h-8 bg-slate-900/80 rounded-sm" />
                <div className="h-6 md:h-8 bg-slate-900/80 rounded-sm" />
                <div className="h-6 md:h-8 bg-slate-900/80 rounded-sm" />
              </div>

              {/* Lights (Headlights) */}
              <div className="mt-auto flex justify-between px-3 pb-3">
                <div className="w-4 h-4 bg-yellow-200 rounded-full shadow-[0_0_15px_rgba(253,224,71,0.8)]" />
                <div className="w-4 h-4 bg-yellow-200 rounded-full shadow-[0_0_15px_rgba(253,224,71,0.8)]" />
              </div>
            </div>
            {/* Wheels tucked under body */}
            <div className="absolute top-1/4 -left-2 w-4 h-12 bg-slate-950 rounded-l-xl" />
            <div className="absolute top-1/4 -right-2 w-4 h-12 bg-slate-950 rounded-r-xl" />
            <div className="absolute top-3/4 -left-2 w-4 h-12 bg-slate-950 rounded-l-xl" />
            <div className="absolute top-3/4 -right-2 w-4 h-12 bg-slate-950 rounded-r-xl" />
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="space-y-24 md:space-y-40 pl-[25%] md:pl-[30%]">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-12"
          >
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-md">
              Your seamless journey structured in four simple steps.
            </p>
          </motion.div>

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative flex flex-col gap-6 group"
            >
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-slate-50 dark:bg-slate-900 border-2 border-primary/20 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <step.icon className="h-8 w-8 md:h-10 md:w-10 text-primary" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-white text-xs font-black flex items-center justify-center shadow-lg border-2 border-background">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-2xl md:text-4xl font-black text-foreground group-hover:text-primary transition-colors">{step.title}</h3>
              </div>
              <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
