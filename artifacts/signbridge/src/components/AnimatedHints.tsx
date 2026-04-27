import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const HINTS = [
  "Hold steady",
  "Frame your hands",
  "Move closer",
  "Good lighting helps"
];

export function AnimatedHints() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((i) => (i + 1) % HINTS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none z-10">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 5 }}
          transition={{ duration: 0.4 }}
          className="bg-black/50 backdrop-blur-md text-white text-xs font-medium px-3 py-1.5 rounded-full"
        >
          {HINTS[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
