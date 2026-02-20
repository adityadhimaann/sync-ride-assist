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

  // Bus movement transforms
  // The road is vertical on the left, then curves horizontal at the top
  // Path: (Left side 20%) -> Bottom to Top -> Curve -> Top Horizontal
  const busY = useTransform(smoothProgress, [0, 0.8, 1], ["100%", "0%", "0%"]);
  const busX = useTransform(smoothProgress, [0, 0.8, 1], ["0%", "0%", "50vw"]);
  const busRotate = useTransform(smoothProgress, [0, 0.75, 0.85, 1], [0, 0, -90, -90]);

  return (
    <section ref={containerRef} className="py-24 md:py-40 bg-transparent relative overflow-visible">
      {/* Scroll-Responsive Road Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {/* Main Road Path: Vertical line on left, curves out at the top */}
          <path
            d="M 150 1000 L 150 150 Q 150 50 300 50 L 1000 50"
            className="stroke-slate-800 dark:stroke-slate-900/40 stroke-[40] md:stroke-[60] fill-none"
          />
          {/* Dashed Center line */}
          <path
            d="M 150 1000 L 150 150 Q 150 50 300 50 L 1000 50"
            className="stroke-white/30 stroke-[3] md:stroke-[4] stroke-dasharray-[20,25] fill-none"
          />
          {/* Journey Progress (Glowing highlight) */}
          <motion.path
            d="M 150 1000 L 150 150 Q 150 50 300 50 L 1000 50"
            style={{ pathLength: smoothProgress }}
            className="stroke-primary/40 stroke-[42] md:stroke-[62] fill-none blur-md"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-start relative z-10">
        {/* Left Column: The Journey Steps */}
        <div className="space-y-12 md:space-y-20 pl-4 md:pl-20 border-l-4 border-dashed border-primary/20 ml-4 md:ml-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="mb-8"
          >
            <h2 className="text-3xl md:text-5xl font-black text-foreground mb-4">How It Works</h2>
            <p className="text-muted-foreground text-lg md:text-xl max-w-md">
              Your seamless journey structured in four simple steps.
            </p>
          </motion.div>

          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="relative flex flex-col gap-4 group"
            >
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    <step.icon className="h-7 w-7 md:h-8 md:w-8 text-white" />
                  </div>
                  <span className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-secondary text-white text-xs font-black flex items-center justify-center shadow-lg border-2 border-background">
                    {step.step}
                  </span>
                </div>
                <h3 className="text-xl md:text-3xl font-black text-foreground group-hover:text-primary transition-colors">{step.title}</h3>
              </div>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed max-w-lg md:pl-20">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Right Column: Scrolling Bus View */}
        <div className="hidden lg:flex sticky top-40 h-[600px] flex-col items-center justify-center overflow-visible">
          {/* Road Perspective Container */}
          <div className="relative w-full h-full flex items-center justify-center">
            {/* The Scrolling Bus */}
            <motion.div
              style={{
                y: busY,
                x: busX,
                rotate: busRotate
              }}
              className="relative z-30"
            >
              <div className="relative w-48 h-20 drop-shadow-2xl">
                {/* Bus Body */}
                <div className="absolute inset-0 bg-primary rounded-2xl overflow-hidden shadow-2xl flex flex-col border-b-4 border-black/20">
                  <div className="w-1/2 h-2 bg-white/20 rounded-b-lg mx-auto" />
                  <div className="flex gap-2 mt-3 mx-3 h-6">
                    <div className="w-1/4 h-full bg-slate-900 rounded-l-lg shadow-inner" />
                    <div className="flex-1 h-full bg-slate-900 rounded-sm shadow-inner" />
                    <div className="flex-1 h-full bg-slate-900 rounded-sm shadow-inner" />
                    <div className="w-1/4 h-full bg-slate-900 rounded-r-lg shadow-inner" />
                  </div>
                  <div className="mt-auto flex justify-between px-3 pb-2">
                    <div className="w-3 h-3 bg-red-600 rounded-full shadow-[0_0_10px_red]" />
                    <div className="w-4 h-3 bg-yellow-400 rounded-full shadow-[0_0_15px_yellow]" />
                  </div>
                </div>
                {/* Wheels */}
                <div className="absolute -bottom-3 left-6 w-8 h-8 rounded-full bg-slate-900 border-4 border-slate-400" />
                <div className="absolute -bottom-3 right-6 w-8 h-8 rounded-full bg-slate-900 border-4 border-slate-400" />
              </div>
            </motion.div>

            {/* Background Context Elements */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background pointer-events-none" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
