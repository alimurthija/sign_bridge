import { motion } from "framer-motion";
import { SignChip } from "./SignChip";
import type { ConversationMessage } from "@/lib/storage";

export function MessageBubble({ message }: { message: ConversationMessage }) {
  const isDeaf = message.role === "deaf";
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={`flex flex-col max-w-[85%] ${isDeaf ? "self-start" : "self-end"}`}
    >
      <div className={`text-[10px] uppercase font-bold tracking-wider mb-1 px-1 opacity-60 ${isDeaf ? "text-left text-teal-700 dark:text-teal-400" : "text-right text-amber-700 dark:text-amber-400"}`}>
        {isDeaf ? "Signing" : "Speaking"}
      </div>
      
      <div className={`px-4 py-3 rounded-2xl shadow-sm border ${
        isDeaf 
          ? "bg-teal-50/80 dark:bg-teal-900/30 border-teal-200/50 dark:border-teal-800/50 rounded-tl-sm text-teal-950 dark:text-teal-50" 
          : "bg-amber-50/80 dark:bg-amber-900/30 border-amber-200/50 dark:border-amber-800/50 rounded-tr-sm text-amber-950 dark:text-amber-50"
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
      
      <div className={`text-[10px] opacity-40 mt-1 px-1 ${isDeaf ? "text-left" : "text-right"}`}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </div>
    </motion.div>
  );
}
