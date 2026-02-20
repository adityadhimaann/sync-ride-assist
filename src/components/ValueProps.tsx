import { motion } from "framer-motion";
import { Bus } from "lucide-react";
import RoadAnimation from "@/components/RoadAnimation";



const ValueProps = () => {
  return (
    <section className="pt-14 md:pt-28 pb-4 md:pb-8 bg-transparent relative overflow-hidden">
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

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-8 max-w-5xl mx-auto overflow-hidden p-2">
          {[
            {
              title: "Never Miss Your Bus",
              description: "Guaranteed Arrival protection ensures your bus waits for you. Peace of mind for just ₹50.",
            },
            {
              title: "Instant Local Rides",
              description: "Pay a small premium to leave immediately. No more waiting for shared autos to fill up.",
            },
            {
              title: "100% Refund Protection",
              description: "Missed your bus? Get a full refund + ₹500 compensation and instant rebooking.",
            },
          ].map((prop, i) => (
            <motion.div
              key={prop.title}
              initial={{ opacity: 0, x: i % 2 === 0 ? -100 : 100 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: i * 0.1, ease: "easeOut" }}
              className={`p-6 md:p-8 text-center cursor-default rounded-none shadow-lg ${i % 2 === 0 ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground"
                }`}
            >
              <h3 className="text-lg md:text-xl font-bold mb-2 md:mb-3">{prop.title}</h3>
              <p className="text-sm md:text-base leading-relaxed opacity-90">{prop.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValueProps;
