import { motion } from "framer-motion";
import { Shield, Zap, RotateCcw } from "lucide-react";

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

const ValueProps = () => {
  return (
    <section className="py-14 md:py-28 bg-background">
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
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto">
          {props.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -5 }}
              className="glass-card p-6 md:p-8 text-center group cursor-default"
            >
              <div className={`inline-flex items-center justify-center w-12 h-12 md:w-14 md:h-14 rounded-2xl ${prop.color} mb-4 md:mb-5 group-hover:scale-110 transition-transform`}>
                <prop.icon className="h-6 w-6 md:h-7 md:w-7" />
              </div>
              <h3 className="text-lg md:text-xl font-bold text-foreground mb-2 md:mb-3">{prop.title}</h3>
              <p className="text-muted-foreground text-sm md:text-base leading-relaxed">{prop.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
