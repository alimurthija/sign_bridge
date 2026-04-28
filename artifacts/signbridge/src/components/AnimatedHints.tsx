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
    <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center pointer-events-none">
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.35 }}
          className="rounded-full border border-white/65 bg-white/55 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-slate-600 uppercase shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/8 dark:text-slate-100"
        >
          {HINTS[index]}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
