import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Mic, Send } from "lucide-react";
import { startListening, stopListening } from "@/lib/speech";
import { sentenceToSignGloss, toLocalSignGloss } from "@/lib/translation";
import { storage } from "@/lib/storage";

interface Props {
  onLiveUpdate: (sentence: string, signs: string[]) => void;
  onCaptureResult: (sentence: string, signs: string[]) => void;
}

export function HearingCapture({ onLiveUpdate, onCaptureResult }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [fallbackText, setFallbackText] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const liveText = interim.trim() ? interim : fallbackText;

    if (!liveText.trim()) {
      onLiveUpdate("", []);
      return;
    }

    onLiveUpdate(liveText, toLocalSignGloss(liveText));
  }, [fallbackText, interim, onLiveUpdate]);

  const handleStart = () => {
    setError("");
    setIsListening(true);
    setInterim("");
    startListening({
      onInterim: (text) => setInterim(text),
      onFinal: async (text) => {
        setIsListening(false);
        setInterim(text);
        await processText(text);
      },
      onError: (err) => {
        setIsListening(false);
        const message = err instanceof Error ? err.message : String(err);
        if (message.includes("not supported") || message === "not-allowed") {
           setError("Speech recognition unavailable. Please type below.");
        } else {
           setError("I couldn't hear that clearly, try again.");
        }
      }
    });
  };

  const handleStop = () => {
  stopListening();
  setIsListening(false);
};

  const processText = async (text: string) => {
    const trimmed = text.trim();

    if (!trimmed) {
      setError("Type a sentence first.");
      return;
    }

    setError("");
    setIsProcessing(true);
    try {
      const isDemo = storage.getDemoMode();
      const apiKey = storage.getApiKey();
      const signs = await sentenceToSignGloss(trimmed, apiKey, isDemo);
      onCaptureResult(trimmed, signs);
      setFallbackText("");
    } catch (e) {
       if (e instanceof Error) {
         setError(e.message);
       } else {
         setError("Failed to translate to signs.");
       }
    } finally {
      setIsProcessing(false);
      setInterim("");
    }
  };

  return (
    <div className="flex w-full flex-col gap-4">
      {error && error.includes("type below") ? (
        <div className="grid gap-3">
          <div className="rounded-[1.6rem] border border-white/60 bg-white/62 p-4 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/5">
            <textarea
              data-testid="input-fallback-text"
              className="min-h-[120px] w-full rounded-[1.25rem] border border-white/65 bg-white/70 p-4 text-foreground outline-none focus:ring-2 focus:ring-sky-400 dark:border-white/10 dark:bg-white/6"
              placeholder="Type here..."
              value={fallbackText}
              onChange={e => setFallbackText(e.target.value)}
            />
          </div>
          <motion.button 
            data-testid="button-translate-text"
            whileTap={{ scale: 0.97 }}
            onClick={() => processText(fallbackText)}
            disabled={isProcessing || !fallbackText.trim()}
            className="glass-button-primary h-14 w-full gap-2"
          >
            {isProcessing ? "Translating..." : "Translate to signs"} <Send className="w-4 h-4" />
          </motion.button>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          <div className="rounded-[1.6rem] border border-white/60 bg-white/60 p-3.5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6">
            <div className="flex min-h-24 items-center justify-center rounded-[1.35rem] border border-white/65 bg-white/72 px-5 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] dark:border-white/10 dark:bg-white/5">
            {interim ? (
              <p className="text-lg font-medium text-slate-900 dark:text-white">"{interim}"</p>
            ) : error ? (
              <p className="text-sm font-medium text-red-500">{error}</p>
            ) : isProcessing ? (
              <p className="text-sm font-medium text-sky-700 dark:text-sky-300">
                Finalizing...
              </p>
            ) : (
              <p className="text-muted-foreground">Tap to speak</p>
            )}
            </div>
          </div>

          <div className="flex items-center justify-center rounded-[1.6rem] border border-white/60 bg-white/60 p-5 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6">
            <div className="relative">
            {isListening && (
              <>
                <motion.div 
                  className="absolute inset-0 rounded-full bg-sky-400/18"
                  animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute inset-0 rounded-full bg-sky-400/18"
                  animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                />
              </>
            )}
            <motion.button
              data-testid="button-mic-toggle"
              whileTap={{ scale: 0.9 }}
              onClick={isListening ? handleStop : handleStart}
              disabled={isProcessing}
              className={`relative z-10 flex h-24 w-24 items-center justify-center rounded-full border backdrop-blur-2xl shadow-[0_18px_42px_rgba(59,130,246,0.18)] transition-colors ${
                isListening
                  ? "border-white/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.24),rgba(255,255,255,0.08)),linear-gradient(135deg,rgba(91,173,255,0.96),rgba(58,120,255,0.92))] text-white"
                  : "border-white/70 bg-white/75 text-sky-600 dark:border-white/10 dark:bg-white/10 dark:text-sky-300"
              } ${isProcessing ? "opacity-50" : ""}`}
            >
              {isProcessing ? (
                <div className="flex gap-1">
                  {[0,1,2].map(i => (
                     <motion.div key={i} className="w-2 h-2 bg-current rounded-full" animate={{y:[-4,0,-4]}} transition={{duration:0.6, repeat:Infinity, delay:i*0.15}}/>
                  ))}
                </div>
              ) : (
                <Mic className={`w-10 h-10 ${isListening ? "animate-pulse" : ""}`} />
              )}
            </motion.button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
