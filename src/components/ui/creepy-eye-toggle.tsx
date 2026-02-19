"use client";

import React, { useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface CreepyEyeToggleProps {
  isVisible: boolean;
  onToggle: () => void;
}

type Coords = { x: number; y: number };

export const CreepyEyeToggle = ({ isVisible, onToggle }: CreepyEyeToggleProps) => {
  const eyeRef = useRef<HTMLButtonElement>(null);
  const [eyeCoords, setEyeCoords] = useState<Coords>({ x: 0, y: 0 });

  const updateEyes = (e: React.MouseEvent) => {
    if (!eyeRef.current) return;

    const rect = eyeRef.current.getBoundingClientRect();
    const center = {
      x: rect.left + rect.width / 2,
      y: rect.top + rect.height / 2,
    };

    const dx = e.clientX - center.x;
    const dy = e.clientY - center.y;
    const angle = Math.atan2(-dy, dx) + Math.PI / 2;

    const visionRangeX = 200;
    const visionRangeY = 100;
    const distance = Math.hypot(dx, dy);

    const x = (Math.sin(angle) * Math.min(distance, visionRangeX)) / visionRangeX;
    const y = (Math.cos(angle) * Math.min(distance, visionRangeY)) / visionRangeY;

    setEyeCoords({ x, y });
  };

  const resetEyes = () => {
    setEyeCoords({ x: 0, y: 0 });
  };

  const pupilStyle = {
    transform: `translate(calc(-50% + ${eyeCoords.x * 3}px), calc(-50% + ${eyeCoords.y * 3}px))`,
  };

  return (
    <button
      ref={eyeRef}
      type="button"
      onClick={onToggle}
      onMouseMove={updateEyes}
      onMouseLeave={resetEyes}
      className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full cursor-pointer transition-all duration-200 group hover:bg-muted/50"
      aria-label={isVisible ? "Hide password" : "Show password"}
      title={isVisible ? "Hide password" : "Show password"}
    >
      <AnimatePresence mode="wait">
        {isVisible ? (
          /* Open eye — interactive tracking */
          <motion.div
            key="eye-open"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            {/* Eye shape (SVG outline) */}
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary transition-colors duration-200"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              {/* Outer iris circle */}
              <circle cx="12" cy="12" r="3.5" fill="currentColor" opacity="0.1" />
            </svg>
            {/* Animated pupil that follows cursor */}
            <span
              className="absolute top-1/2 left-1/2 w-[6px] h-[6px] bg-primary rounded-full pointer-events-none transition-transform duration-75 ease-out"
              style={pupilStyle}
            />
            {/* Pupil highlight */}
            <span
              className="absolute w-[2px] h-[2px] bg-white rounded-full pointer-events-none"
              style={{
                transform: `translate(calc(-50% + ${eyeCoords.x * 3 + 1}px), calc(-50% + ${eyeCoords.y * 3 - 1}px))`,
                top: "50%",
                left: "50%",
              }}
            />
          </motion.div>
        ) : (
          /* Closed eye — slash through */
          <motion.div
            key="eye-closed"
            initial={{ scaleY: 0 }}
            animate={{ scaleY: 1 }}
            exit={{ scaleY: 0 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="relative flex items-center justify-center"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-muted-foreground group-hover:text-foreground transition-colors duration-200"
            >
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
              <line x1="1" y1="1" x2="23" y2="23" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
};

export default CreepyEyeToggle;
