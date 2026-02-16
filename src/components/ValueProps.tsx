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
    <section className="py-20 md:py-28 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Why Travelers Love <span className="gradient-text">SyncRide</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            We solve the #1 problem in Indian intercity travel — getting to your bus on time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {props.map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              whileHover={{ y: -5 }}
              className="glass-card p-8 text-center group cursor-default"
            >
              <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl ${prop.color} mb-5 group-hover:scale-110 transition-transform`}>
                <prop.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-3">{prop.title}</h3>
              <p className="text-muted-foreground leading-relaxed">{prop.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
