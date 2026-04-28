import { motion } from "framer-motion";
import { SignChip } from "./SignChip";
import type { ConversationMessage } from "@/lib/storage";

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const isDeaf = message.role === "deaf";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col max-w-[88%] ${isDeaf ? "self-start" : "self-end"}`}
    >
      <div className={`rounded-[1.4rem] border px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl ${
        isDeaf 
          ? "rounded-tl-md border-cyan-200/70 bg-white/72 text-slate-900 dark:border-cyan-400/20 dark:bg-cyan-400/8 dark:text-slate-50"
          : "rounded-tr-md border-sky-200/70 bg-slate-950 text-white dark:border-sky-400/20 dark:bg-sky-500/14"
      }`}>
        <p className="text-[15px] leading-relaxed">{message.text}</p>
        
        {message.signs && message.signs.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {message.signs.map((sign, i) => (
              <SignChip key={i} sign={sign} />
            ))}
          </div>
        )}
      </div>
      
      <div className={`mt-1 px-1 text-[10px] opacity-35 ${isDeaf ? "text-left" : "text-right"}`}>
        {message.isLive
          ? "Live"
          : new Date(message.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
      </div>
    </motion.div>
  );
}
