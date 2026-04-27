import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { DeafCapture } from "./DeafCapture";
import { HearingCapture } from "./HearingCapture";
import { ModeToggle } from "./ModeToggle";
import { Trash2, HandHeart } from "lucide-react";
import { storage, ConversationMessage } from "@/lib/storage";

interface Props {
  mode: "deaf" | "hearing";
  setMode: (m: "deaf" | "hearing") => void;
}

export function ConversationView({ mode, setMode }: Props) {
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHistory(storage.getHistory());
  }, []);

  useEffect(() => {
    storage.setHistory(history);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleDeafCapture = (sign: string, meaning: string, confidence: number) => {
    const msg: ConversationMessage = {
      id: Date.now().toString(),
      role: "deaf",
      text: meaning,
      signConfidence: confidence,
      timestamp: Date.now()
    };
    setHistory(prev => [...prev, msg]);
  };

  const handleHearingCapture = (sentence: string, signs: string[]) => {
    const msg: ConversationMessage = {
      id: Date.now().toString(),
      role: "hearing",
      text: sentence,
      signs,
      timestamp: Date.now()
    };
    setHistory(prev => [...prev, msg]);
  };

  const clearHistory = () => {
    if (window.confirm("Clear this conversation?")) {
      setHistory([]);
    }
  };

  return (
    <div className="flex flex-col h-[100dvh] w-full max-w-md mx-auto relative z-10 pt-16">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 pb-4 space-y-4 scroll-smooth"
      >
        {history.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-60">
            <div className="w-16 h-16 bg-black/5 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
              <HandHeart className="w-8 h-8" />
            </div>
            <p className="font-medium">Say hello</p>
            <p className="text-sm">Sign or speak to begin</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {history.map(msg => (
              <MessageBubble key={msg.id} message={msg} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {history.length > 0 && (
        <div className="absolute top-4 left-4 z-20">
           <button 
             data-testid="button-clear-history"
             onClick={clearHistory}
             className="p-2 rounded-full bg-white/50 dark:bg-black/20 text-muted-foreground hover:bg-red-50 hover:text-red-500 backdrop-blur-sm"
           >
             <Trash2 className="w-4 h-4" />
           </button>
        </div>
      )}

      <div className="p-4 bg-white/60 dark:bg-black/40 backdrop-blur-xl border-t border-black/5 dark:border-white/5 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="mb-4">
          <ModeToggle mode={mode} setMode={setMode} />
        </div>
        
        <div className="min-h-[300px]">
          <AnimatePresence mode="wait">
            {mode === "deaf" ? (
              <motion.div key="deaf" initial={{opacity:0, x:-20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:20}} transition={{duration:0.2}}>
                <DeafCapture onCaptureResult={handleDeafCapture} />
              </motion.div>
            ) : (
              <motion.div key="hearing" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}} transition={{duration:0.2}}>
                <HearingCapture onCaptureResult={handleHearingCapture} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}