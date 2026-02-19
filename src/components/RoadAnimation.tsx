import { motion } from "framer-motion";

const RoadAnimation = ({ className = "" }: { className?: string }) => {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Road surface */}
      <div className="w-full h-1 bg-border rounded-full relative overflow-hidden">
        {/* Moving dashes */}
        <motion.div
          className="absolute inset-y-0 flex gap-4"
          animate={{ x: [0, -80] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="w-6 h-0.5 bg-muted-foreground/30 rounded-full my-auto flex-shrink-0" />
          ))}
        </motion.div>
      </div>
    </div>
  );
};

export default RoadAnimation;
