import { motion } from "framer-motion";
import { Hand } from "lucide-react";

export function SignChip({ sign }: { sign: string }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1.5 rounded-full border border-white/65 bg-white/70 px-3 py-1.5 text-xs font-semibold tracking-[0.16em] text-slate-800 shadow-sm backdrop-blur-xl dark:border-white/10 dark:bg-white/8 dark:text-slate-100"
    >
      <Hand className="w-3.5 h-3.5 text-sky-500" />
      <span>{sign}</span>
    </motion.div>
  );
}
