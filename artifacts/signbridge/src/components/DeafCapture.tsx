import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera as CameraIcon, AlertCircle, RefreshCw, Volume2 } from "lucide-react";
import { startCamera, stopCamera, captureFrame } from "@/lib/camera";
import { recognizeSignFromImage } from "@/lib/gemini";
import { speak } from "@/lib/speech";
import { AnimatedHints } from "./AnimatedHints";
import { ConfidenceBar } from "./ConfidenceBar";
import { storage } from "@/lib/storage";

interface Props {
  onCaptureResult: (sign: string, meaning: string, confidence: number) => void;
}

export function DeafCapture({ onCaptureResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [lastResult, setLastResult] = useState<{sign: string, meaning: string, confidence: number} | null>(null);

  useEffect(() => {
    let activeStream: MediaStream | null = null;
    const initCam = async () => {
      if (videoRef.current) {
        try {
          activeStream = await startCamera(videoRef.current);
          setStream(activeStream);
          setError("");
        } catch (e: any) {
          setError("Camera not available. Please check permissions.");
        }
      }
    };
    initCam();
    return () => {
      if (activeStream) stopCamera(activeStream);
    };
  }, []);

  const handleCapture = async () => {
    if (!videoRef.current) return;
    setIsCapturing(true);
    setLastResult(null);
    try {
      const base64 = captureFrame(videoRef.current);
      const isDemo = storage.getDemoMode();
      const apiKey = storage.getApiKey();
      const res = await recognizeSignFromImage(base64, apiKey, isDemo);
      setLastResult(res);
      onCaptureResult(res.sign, res.meaning, res.confidence);
      speak(res.meaning);
    } catch (e: any) {
      setError("I couldn't understand that, try again");
    } finally {
      setIsCapturing(false);
    }
  };

  const handleReSpeak = () => {
    if (lastResult) speak(lastResult.meaning);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden bg-black/10 dark:bg-white/5 border border-black/5 dark:border-white/10 shadow-inner">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="w-8 h-8 text-red-500 mb-2" />
            <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
            <button onClick={() => setError("")} className="mt-4 px-4 py-2 bg-black/5 rounded-lg text-sm font-medium">Retry</button>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted className="absolute inset-0 w-full h-full object-cover" />
            <div className="absolute inset-4 border-2 border-white/20 rounded-2xl pointer-events-none" />
            <AnimatedHints />
            
            <AnimatePresence>
              {isCapturing && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-teal-500/20 backdrop-blur-sm flex items-center justify-center"
                >
                  <div className="flex gap-2">
                    {[0,1,2].map(i => (
                      <motion.div 
                        key={i} 
                        className="w-3 h-3 bg-white rounded-full"
                        animate={{ y: [-10, 0, -10] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                      />
                    ))}
                  </div>
                  <motion.div 
                    className="absolute left-0 right-0 h-1 bg-teal-300/80 shadow-[0_0_15px_rgba(45,212,191,0.8)]"
                    animate={{ top: ["0%", "100%", "0%"] }}
                    transition={{ duration: 2, ease: "linear", repeat: Infinity }}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <motion.button 
          data-testid="button-capture-sign"
          whileTap={{ scale: 0.97 }}
          disabled={isCapturing || !!error}
          onClick={handleCapture}
          className="w-full bg-teal-600 text-white py-4 rounded-2xl font-bold text-lg shadow-lg flex justify-center items-center gap-2 hover:bg-teal-700 disabled:opacity-50"
        >
          <CameraIcon className="w-6 h-6" /> Capture sign
        </motion.button>
        
        {lastResult && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 dark:bg-black/50 backdrop-blur-md p-4 rounded-2xl border border-black/5 shadow-sm"
          >
            <div className="flex justify-between items-start mb-1">
              <h4 className="font-bold text-lg">{lastResult.sign}</h4>
              <button data-testid="button-respeak" onClick={handleReSpeak} className="p-2 bg-teal-50 dark:bg-teal-900/30 text-teal-700 dark:text-teal-400 rounded-full hover:bg-teal-100">
                <Volume2 className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">{lastResult.meaning}</p>
            <ConfidenceBar confidence={lastResult.confidence} />
          </motion.div>
        )}
      </div>
    </div>
  );
}