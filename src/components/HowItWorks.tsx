import { motion } from "framer-motion";
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
  return (
    <section className="py-20 md:py-32 bg-transparent relative overflow-hidden">
      {/* Decorative Full-Section Road Background */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-20 dark:opacity-10 overflow-hidden">
        <svg className="w-full h-full" viewBox="0 0 1000 1000" preserveAspectRatio="none">
          {/* Main Road Path */}
          <path
            d="M 500 1000 L 500 250 Q 500 100 650 100 L 1050 100"
            className="stroke-slate-800 dark:stroke-slate-400 stroke-[60] fill-none"
          />
          {/* Dashed Center line */}
          <path
            d="M 500 1000 L 500 250 Q 500 100 650 100 L 1050 100"
            className="stroke-white/80 stroke-[4] stroke-dasharray-[25,25] fill-none"
          />
          {/* Road Glow */}
          <path
            d="M 500 1000 L 500 250 Q 500 100 650 100 L 1050 100"
            className="stroke-primary/5 stroke-[100] fill-none blur-3xl"
          />
        </svg>
      </div>

      {/* Decorative Road Animation Area (Top) */}
      <div className="w-full h-32 md:h-48 mb-16 md:mb-24 relative opacity-80 z-10">
        {/* Bus driving, stopping at the stop, then continuing */}
        <motion.div
          animate={{
            x: ["-20vw", "50vw", "50vw", "120vw"],
          }}
          transition={{
            duration: 12,
            times: [0, 0.45, 0.7, 1],
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-[2.5rem] md:bottom-[4.5rem] left-0 z-30"
        >
          {/* Subtle bounce for driving effect */}
          <motion.div
            animate={{ y: [0, -2, 0] }}
            transition={{ duration: 0.4, repeat: Infinity }}
            className="relative w-[140px] md:w-[200px] h-[50px] md:h-[70px] drop-shadow-2xl"
          >
            {/* Bus Body */}
            <div className="absolute inset-0 bg-primary rounded-xl md:rounded-2xl rounded-br-sm md:rounded-br-md rounded-bl-sm md:rounded-bl-md overflow-hidden flex flex-col border-b-2 border-primary-foreground/20">
              {/* Roof AC unit */}
              <div className="w-1/3 h-1.5 md:h-2 bg-primary-foreground/20 rounded-b-md mx-auto" />

              {/* Windows row */}
              <div className="flex gap-1.5 mt-2 md:mt-3 mx-2 md:mx-3 h-5 md:h-8">
                <div className="w-1/4 h-full bg-background rounded-l-md rounded-br-sm shadow-inner opacity-95 flex items-end justify-end px-1 pb-0.5">
                  <div className="w-2.5 h-3.5 bg-muted-foreground/30 rounded-t-full" />
                </div>
                <div className="flex-1 h-full bg-background rounded-sm shadow-inner opacity-95" />
                <div className="flex-1 h-full bg-background rounded-sm shadow-inner opacity-95" />
                <div className="flex-1 h-full bg-background rounded-r-md shadow-inner opacity-95 flex items-end justify-center pb-0.5">
                  <div className="w-2.5 h-3.5 bg-muted-foreground/20 rounded-t-full" />
                </div>
              </div>

              {/* Lower Body details */}
              <div className="mt-auto flex justify-between items-end px-1.5 md:px-2 pb-1.5 md:pb-2">
                <div className="w-2 md:w-2.5 h-2 md:h-2.5 bg-destructive rounded-full shadow-[0_0_8px_rgba(255,0,0,0.8)]" />
                <div className="flex-1 h-1 md:h-1.5 bg-secondary mx-3 md:mx-4 opacity-90 rounded-full" />
                <div className="w-2.5 md:w-3 h-2.5 md:h-3 bg-yellow-300 rounded-full shadow-[0_0_12px_rgba(255,255,0,0.9)]" />
              </div>
            </div>

            {/* Wheels */}
            <div className="absolute -bottom-2 md:-bottom-3 left-4 md:left-6 w-6 md:w-8 h-6 md:h-8 rounded-full bg-slate-800 border-[3px] md:border-[4px] border-slate-300 shadow-inner flex items-center justify-center">
              <div className="w-2 md:w-3 h-2 md:h-3 bg-slate-200 rounded-full" />
            </div>
            <div className="absolute -bottom-2 md:-bottom-3 right-4 md:right-6 w-6 md:w-8 h-6 md:h-8 rounded-full bg-slate-800 border-[3px] md:border-[4px] border-slate-300 shadow-inner flex items-center justify-center">
              <div className="w-2 md:w-3 h-2 md:h-3 bg-slate-200 rounded-full" />
            </div>
          </motion.div>
        </motion.div>

        {/* Bus Stop Area */}
        <div className="absolute bottom-[3rem] md:bottom-[5rem] left-[70vw] md:left-[63vw] flex gap-4 md:gap-5 z-20 items-end">
          <div className="w-1.5 h-16 md:h-24 bg-border/60 rounded-t-full absolute -right-4 md:-right-8 bottom-0 origin-bottom">
            <div className="absolute -top-3 -left-3 md:-left-4 w-7 md:w-10 h-7 md:h-10 rounded-full bg-primary flex items-center justify-center shadow-lg border-2 border-background">
              <Bus className="w-3 h-3 md:w-5 md:h-5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-10 md:mb-16 relative z-10 pointer-events-none"
      >
        <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">How It Works</h2>
        <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto px-6">
          From your doorstep to your destination, in four simple steps.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto px-6 md:px-12 relative z-10">
        {steps.map((step, i) => (
          <motion.div
            key={step.step}
            initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="flex items-start gap-4 md:gap-8 mb-8 md:mb-16 last:mb-0 group"
          >
            <div className="flex-shrink-0">
              <div className="relative">
                <motion.div
                  whileHover={{ scale: 1.15, rotate: 5 }}
                  className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl gradient-primary flex items-center justify-center shadow-lg"
                >
                  <step.icon className="h-6 w-6 md:h-8 md:w-8 text-primary-foreground" />
                </motion.div>
                <motion.span
                  whileHover={{ scale: 1.2 }}
                  className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-6 h-6 md:w-8 md:h-8 rounded-full bg-secondary text-secondary-foreground text-xs font-bold flex items-center justify-center shadow-md border-2 border-background"
                >
                  {step.step}
                </motion.span>
              </div>
              {i < steps.length - 1 && (
                <motion.div
                  initial={{ scaleY: 0 }}
                  whileInView={{ scaleY: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.15 + 0.3 }}
                  className="w-0.5 h-10 md:h-16 bg-gradient-to-b from-primary/30 to-transparent mx-auto mt-2 md:mt-3 origin-top"
                />
              )}
            </div>
            <div className="pt-1 md:pt-3">
              <h3 className="text-base md:text-2xl font-bold text-foreground mb-1.5 md:mb-3 group-hover:text-primary transition-colors">{step.title}</h3>
              <p className="text-muted-foreground text-sm md:text-lg leading-relaxed">{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default HowItWorks;
