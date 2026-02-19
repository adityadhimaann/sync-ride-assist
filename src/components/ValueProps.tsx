import { motion } from "framer-motion";
import { Shield, Zap, RotateCcw, Bus } from "lucide-react";
import RoadAnimation from "@/components/RoadAnimation";

const props = [
  {
    icon: Shield,
    title: "Never Miss Your Bus",
    description: "Guaranteed Arrival protection ensures your bus waits for you. Peace of mind for just ₹50.",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Zap,
    title: "Instant Local Rides",
    description: "Pay a small premium to leave immediately. No more waiting for shared autos to fill up.",
    color: "bg-secondary/10 text-secondary",
  },
  {
    icon: RotateCcw,
    title: "100% Refund Protection",
    description: "Missed your bus? Get a full refund + ₹500 compensation and instant rebooking.",
    color: "bg-success/10 text-success",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.15 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 40, scale: 0.95 } as const,
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: "easeOut" as const } },
};

const ValueProps = () => {
  return (
    <section className="py-14 md:py-28 bg-background relative overflow-hidden">
      {/* Floating bus silhouettes */}
      <motion.div
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute top-8 opacity-[0.04] pointer-events-none"
      >
        <Bus className="h-16 w-16 text-foreground" />
      </motion.div>
      <motion.div
        animate={{ x: ["200%", "-100%"] }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear", delay: 5 }}
        className="absolute bottom-12 opacity-[0.04] pointer-events-none"
      >
        <Bus className="h-12 w-12 text-foreground" />
      </motion.div>

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10 md:mb-16"
        >
          <h2 className="text-2xl md:text-4xl font-bold text-foreground mb-3 md:mb-4">
            Why Travelers Love <span className="gradient-text">SyncRide</span>
          </h2>
          <p className="text-muted-foreground text-sm md:text-lg max-w-2xl mx-auto">
            We solve the #1 problem in Indian intercity travel — getting to your bus on time.
          </p>
          <RoadAnimation className="max-w-xs mx-auto mt-6" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto"
        >
          {props.map((prop) => (
            <motion.div
              key={prop.title}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="glass-card p-6 md:p-8 text-center group cursor-default"
            >
              <motion.div
                whileHover={{ rotate: [0, -10, 10, 0], transition: { duration: 0.4 } }}
                className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl ${prop.color} mb-4 md:mb-5 group-hover:scale-110 transition-transform`}
              >
                <prop.icon className="h-6 w-6 md:h-7 md:w-7" />
              </motion.div>
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3">{prop.title}</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{prop.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ValueProps;
