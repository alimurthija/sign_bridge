import { motion } from "framer-motion";

export function ConfidenceBar({ confidence }: { confidence: number }) {
  // Color shifts from amber (low) to teal (high)
  const isHigh = confidence >= 80;
  const isMed = confidence >= 50 && confidence < 80;

  const colorClass = isHigh
    ? "bg-teal-500"
    : isMed
      ? "bg-amber-400"
      : "bg-red-400";

  return (
    <div className="w-full flex items-center gap-2 mt-2">
      <div className="text-[10px] font-semibold opacity-60 uppercase tracking-widest w-12">
        Conf
      </div>
      <div className="flex-1 h-1.5 bg-black/5 dark:bg-white/10 rounded-full overflow-hidden">
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
