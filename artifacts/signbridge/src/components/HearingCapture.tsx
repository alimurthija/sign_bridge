import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, Send, AlertCircle } from "lucide-react";
import { startListening, stopListening } from "@/lib/speech";
import { sentenceToSignGloss } from "@/lib/gemini";
import { storage } from "@/lib/storage";

interface Props {
  onCaptureResult: (sentence: string, signs: string[]) => void;
}

export function HearingCapture({ onCaptureResult }: Props) {
  const [isListening, setIsListening] = useState(false);
  const [interim, setInterim] = useState("");
  const [fallbackText, setFallbackText] = useState("");
  const [error, setError] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleStart = () => {
    setError("");
    setIsListening(true);
    setInterim("");
    startListening({
      onInterim: (text) => setInterim(text),
      onFinal: async (text) => {
        setIsListening(false);
        await processText(text);
      },
      onError: (err) => {
        setIsListening(false);
        if (err.message?.includes("not supported") || err === "not-allowed") {
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
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const isDemo = storage.getDemoMode();
      const apiKey = storage.getApiKey();
      const signs = await sentenceToSignGloss(text, apiKey, isDemo);
      onCaptureResult(text, signs);
    } catch (e) {
       setError("Failed to translate to signs.");
    } finally {
      setIsProcessing(false);
      setInterim("");
      setFallbackText("");
    }
  };

  return (
    <div className="w-full flex flex-col gap-4">
      {error && error.includes("type below") ? (
        <div className="flex flex-col gap-3">
          <textarea
            data-testid="input-fallback-text"
            className="w-full bg-white/50 dark:bg-black/20 border border-black/10 rounded-2xl p-4 min-h-[120px] focus:outline-none focus:ring-2 focus:ring-amber-500 text-foreground"
            placeholder="Type your sentence here..."
            value={fallbackText}
            onChange={e => setFallbackText(e.target.value)}
          />
          <motion.button 
            data-testid="button-translate-text"
            whileTap={{ scale: 0.97 }}
            onClick={() => processText(fallbackText)}
            disabled={isProcessing || !fallbackText.trim()}
            className="w-full bg-amber-500 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 hover:bg-amber-600 disabled:opacity-50"
          >
            {isProcessing ? "Translating..." : "Translate to Signs"} <Send className="w-5 h-5" />
          </motion.button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-6 py-6">
          <div className="h-20 flex items-center justify-center w-full px-6">
            {interim ? (
              <p className="text-xl font-medium text-center text-amber-800 dark:text-amber-200 animate-pulse">"{interim}"</p>
            ) : error ? (
              <p className="text-sm font-medium text-red-500 text-center">{error}</p>
            ) : (
              <p className="text-muted-foreground text-center">Tap and start speaking</p>
            )}
          </div>

          <div className="relative">
            {isListening && (
              <>
                <motion.div 
                  className="absolute inset-0 rounded-full bg-amber-400/30"
                  animate={{ scale: [1, 1.5, 2], opacity: [0.8, 0.3, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
                <motion.div 
                  className="absolute inset-0 rounded-full bg-amber-400/30"
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
              className={`relative z-10 w-24 h-24 rounded-full flex items-center justify-center shadow-xl transition-colors ${
                isListening ? "bg-amber-500 text-white" : "bg-white text-amber-600 border border-amber-100"
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
      )}
    </div>
  );
}