import { motion } from "framer-motion";
import { Hand, Mic } from "lucide-react";

export function ModeToggle({ mode, setMode }: { mode: "deaf" | "hearing", setMode: (m: "deaf" | "hearing") => void }) {
  return (
    <div className="relative flex w-full max-w-[21rem] rounded-full border border-white/60 bg-white/55 p-1 shadow-[0_12px_32px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-white/8 sm:w-fit">
      <div
        className="absolute inset-y-1 rounded-full bg-gradient-to-r from-cyan-500 to-sky-500 shadow-[0_10px_24px_rgba(56,189,248,0.32)] transition-all duration-300 ease-out"
        style={{
          left: mode === "deaf" ? "4px" : "50%",
          width: "calc(50% - 4px)"
        }}
      />
      <button
        data-testid="button-mode-deaf"
        onClick={() => setMode("deaf")}
        className={`relative z-10 flex w-1/2 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors sm:w-36 ${
          mode === "deaf" ? "text-white" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Hand className="w-4 h-4" />
        <span>Camera</span>
      </button>
      <button
        data-testid="button-mode-hearing"
        onClick={() => setMode("hearing")}
        className={`relative z-10 flex w-1/2 items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors sm:w-36 ${
          mode === "hearing" ? "text-white" : "text-muted-foreground hover:text-foreground"
        }`}
      >
        <Mic className="w-4 h-4" />
        <span>Mic</span>
      </button>
    </div>
  );
}
