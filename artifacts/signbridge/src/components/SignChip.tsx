import { motion } from "framer-motion";
import { Hand } from "lucide-react";

export function SignChip({ sign }: { sign: string }) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/50 dark:bg-black/30 border border-black/5 dark:border-white/10 text-xs font-semibold tracking-wider text-foreground shadow-sm"
    >
      <Hand className="w-3.5 h-3.5 text-primary" />
      <span>{sign}</span>
    </motion.div>
  );
}
