import { motion } from "framer-motion";

export function ConfidenceBar({ confidence }: { confidence: number }) {
  // Color shifts from amber (low) to teal (high)
  const isHigh = confidence >= 80;
  const isMed = confidence >= 50 && confidence < 80;

  const colorClass = isHigh
    ? "bg-gradient-to-r from-cyan-400 to-sky-500"
    : isMed
      ? "bg-gradient-to-r from-sky-400 to-indigo-500"
      : "bg-gradient-to-r from-rose-400 to-orange-400";

  return (
    <div className="w-full flex items-center gap-2 mt-2">
      <div className="text-[10px] font-semibold opacity-60 uppercase tracking-[0.18em] w-12">
        Conf
      </div>
      <div className="flex-1 h-2 rounded-full overflow-hidden bg-slate-900/7 dark:bg-white/10">
        <motion.div
          className={`h-full ${colorClass}`}
          initial={{ width: 0 }}
          animate={{ width: `${confidence}%` }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        />
      </div>
      <div className="text-[10px] font-bold opacity-70 w-6 text-right">
        {confidence}%
      </div>
    </div>
  );
}
