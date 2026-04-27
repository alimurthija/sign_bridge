import { motion } from "framer-motion";
import { Hand, Mic } from "lucide-react";

export function ModeToggle({ mode, setMode }: { mode: "deaf" | "hearing", setMode: (m: "deaf" | "hearing") => void }) {
  return (
    <div className="flex p-1 bg-black/5 dark:bg-white/5 rounded-full relative w-fit mx-auto shadow-inner">
      <div 
        className="absolute inset-y-1 rounded-full bg-white dark:bg-white/10 shadow-sm transition-all duration-300 ease-out"
        style={{
          left: mode === "deaf" ? "4px" : "50%",
          width: "calc(50% - 4px)"
        }}
      />
      <button
        data-testid="button-mode-deaf"
        onClick={() => setMode("deaf")}
        className={`relative z-10 flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors w-32 ${
          mode === "deaf" ? "text-teal-700 dark:text-teal-300" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Hand className="w-4 h-4" />
        <span>Sign</span>
      </button>
      <button
        data-testid="button-mode-hearing"
        onClick={() => setMode("hearing")}
        className={`relative z-10 flex items-center justify-center gap-2 px-5 py-2 rounded-full text-sm font-medium transition-colors w-32 ${
          mode === "hearing" ? "text-amber-700 dark:text-amber-300" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Mic className="w-4 h-4" />
        <span>Speak</span>
      </button>
    </div>
  );
}
