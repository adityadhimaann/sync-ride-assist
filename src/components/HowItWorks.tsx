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
  const busY = useTransform(smoothProgress, [0, 1], ["0%", "100%"]);

  return (
    <section className="py-24 md:py-40 bg-transparent relative overflow-visible">
      <div className="max-w-7xl mx-auto px-4 md:px-6 relative z-10">

        {/* Header - Stays outside the track alignment */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-16 md:mb-24 text-center md:text-left md:pl-[20%]"
        >
          <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg md:text-xl max-w-md mx-auto md:mx-0">
            Your seamless journey structured in four simple steps.
          </p>
        </motion.div>

        {/* Steps Container with Track */}
        <div ref={containerRef} className="relative pl-[15%] md:pl-[20%] space-y-24 md:space-y-40">

          {/* Scroll-Responsive Road Background - Relative to Steps */}
          <div className="absolute top-0 bottom-0 left-0 w-full pointer-events-none overflow-hidden -ml-6 md:-ml-10">
            <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
              <path
                d="M 150 0 L 150 1000"
                className="stroke-slate-100 dark:stroke-slate-900/30 stroke-[80] md:stroke-[120] fill-none"
              />
              <path
                d="M 150 0 L 150 1000"
                className="stroke-slate-800 dark:stroke-slate-900/40 stroke-[3] md:stroke-[4] stroke-dasharray-[20,30] fill-none"
              />
              <motion.path
                d="M 150 0 L 150 1000"
                style={{ pathLength: smoothProgress }}
                className="stroke-primary/40 stroke-[82] md:stroke-[122] fill-none blur-md"
              />
            </svg>

            {/* The Scaled-Down Scrolling Bus */}
            <motion.div
              style={{
                y: busY,
                left: "15%",
              }}
              className="absolute top-0 z-30 -translate-x-1/2"
            >
              <div className="relative w-12 md:w-16 h-20 md:h-28 drop-shadow-xl flex flex-col items-center">
                <div className="w-full h-full bg-primary rounded-lg md:rounded-xl overflow-hidden shadow-2xl flex flex-col border-x-2 md:border-x-[3px] border-black/10">
                  <div className="w-3/4 h-1 bg-white/20 rounded-b-lg mx-auto" />

                  {/* Compact windshield */}
                  <div className="mx-1 mt-1.5 h-6 md:h-8 bg-slate-900/95 rounded-t-md shadow-inner relative" />

                  {/* Windows */}
                  <div className="mx-1 mt-1 flex flex-col gap-0.5 flex-1">
                    <div className="h-3 md:h-4 bg-slate-900/80 rounded-sm" />
                    <div className="h-3 md:h-4 bg-slate-900/80 rounded-sm" />
                  </div>

                  {/* Tiny Lights */}
                  <div className="mt-auto flex justify-between px-1.5 pb-1.5">
                    <div className="w-2 h-1.5 bg-yellow-200 rounded-full shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
                    <div className="w-2 h-1.5 bg-yellow-200 rounded-full shadow-[0_0_8px_rgba(253,224,71,0.8)]" />
                  </div>
                </div>
                {/* Micro Wheels */}
                <div className="absolute top-1/5 -left-1 w-1.5 md:w-2 h-6 bg-slate-950 rounded-l-md" />
                <div className="absolute top-1/5 -right-1 w-1.5 md:w-2 h-6 bg-slate-950 rounded-r-md" />
                <div className="absolute top-3/4 -left-1 w-1.5 md:w-2 h-6 bg-slate-950 rounded-l-md" />
                <div className="absolute top-3/4 -right-1 w-1.5 md:w-2 h-6 bg-slate-950 rounded-r-md" />
              </div>
            </motion.div>
          </div>

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative flex flex-col gap-4 md:gap-6 group"
            >
              <div className="flex items-center gap-4 md:gap-6">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-white dark:bg-slate-900 border-2 border-primary/10 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <step.icon className="h-6 w-6 md:h-8 md:w-8 text-primary" />
                  </div>
                  <span className="absolute -top-2 -right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-secondary text-white text-[10px] md:text-xs font-black flex items-center justify-center shadow-lg border-2 border-background">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl md:text-3xl font-black text-foreground group-hover:text-primary transition-colors leading-tight">{step.title}</h3>
              </div>
              <p className="text-muted-foreground text-sm md:text-lg leading-relaxed max-w-xl">
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
