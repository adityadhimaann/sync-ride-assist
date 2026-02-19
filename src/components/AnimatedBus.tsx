import { motion } from "framer-motion";
import { Bus } from "lucide-react";

interface AnimatedBusProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  direction?: "left" | "right";
  duration?: number;
  color?: string;
}

const sizes = {
  sm: "w-6 h-6",
  md: "w-8 h-8",
  lg: "w-10 h-10",
};

const iconSizes = {
  sm: "h-3 w-3",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

const AnimatedBus = ({ className = "", size = "md", direction = "right", duration = 8, color = "bg-primary" }: AnimatedBusProps) => {
  return (
    <motion.div
      className={`absolute ${className}`}
      animate={{
        x: direction === "right" ? ["-10%", "110%"] : ["110%", "-10%"],
      }}
      transition={{
        duration,
        repeat: Infinity,
        ease: "linear",
      }}
    >
      <motion.div
        animate={{ y: [0, -2, 0, -1, 0] }}
        transition={{ duration: 0.6, repeat: Infinity }}
        className="relative"
      >
        <div className={`${sizes[size]} rounded-lg ${color} shadow-lg flex items-center justify-center`}>
          <Bus className={`${iconSizes[size]} text-primary-foreground`} />
        </div>
        {/* Exhaust particles */}
        <motion.div
          className={`absolute top-1/2 -translate-y-1/2 ${direction === "right" ? "-left-3" : "-right-3"}`}
          animate={{ opacity: [0.4, 0, 0.4], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        >
          <div className="w-2 h-2 rounded-full bg-muted-foreground/20" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default AnimatedBus;
