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
    <section className="py-14 md:py-28 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-xl mx-auto">
            From your doorstep to your destination, in four simple steps.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="flex items-start gap-4 md:gap-6 mb-8 md:mb-12 last:mb-0"
            >
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl md:rounded-2xl gradient-primary flex items-center justify-center">
                    <step.icon className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                  </div>
                  <span className="absolute -top-1.5 -right-1.5 md:-top-2 md:-right-2 w-5 h-5 md:w-7 md:h-7 rounded-full bg-secondary text-secondary-foreground text-[10px] md:text-xs font-bold flex items-center justify-center">
                    {step.step}
                  </span>
                </div>
                {i < steps.length - 1 && (
                  <div className="w-0.5 h-8 md:h-12 bg-border mx-auto mt-2 md:mt-3" />
                )}
              </div>
              <div className="pt-1 md:pt-2">
                <h3 className="text-base md:text-xl font-bold text-foreground mb-1.5 md:mb-2">{step.title}</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
