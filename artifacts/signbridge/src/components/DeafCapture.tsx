import { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Camera as CameraIcon, AlertCircle, RefreshCw, Volume2, Dot, RotateCcw } from "lucide-react";
import { startCamera, stopCamera, captureFrame, type CameraFacingMode } from "@/lib/camera";
import { recognizeSignFromImage } from "@/lib/gemini";
import { speak } from "@/lib/speech";
import { ConfidenceBar } from "./ConfidenceBar";
import { storage } from "@/lib/storage";

const LIVE_SCAN_COOLDOWN_MS = 220;
const STABLE_SIGN_THRESHOLD = 2;
const MIN_COMMIT_CONFIDENCE = 62;
const FAST_COMMIT_CONFIDENCE = 88;
const MAX_UNCLEAR_STREAK_BEFORE_RESET = 2;

interface Props {
  onLiveUpdate: (sign: string, meaning: string, confidence: number) => void;
  onCaptureResult: (sign: string, meaning: string, confidence: number) => void;
}

export function DeafCapture({ onLiveUpdate, onCaptureResult }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timeoutRef = useRef<number | null>(null);
  const isCapturingRef = useRef(false);
  const isLiveModeRef = useRef(false);
  const isMountedRef = useRef(true);
  const lastObservedSignRef = useRef("");
  const stableCountRef = useRef(0);
  const lastCommittedSignRef = useRef("");
  const unclearStreakRef = useRef(0);
  const [error, setError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [facingMode, setFacingMode] = useState<CameraFacingMode>("environment");
  const [lastResult, setLastResult] = useState<{sign: string, meaning: string, confidence: number} | null>(null);
  const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
  setIsMobile(/Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
}, []);

  const clearLiveTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const scheduleNextScan = useCallback(() => {
    if (!isMountedRef.current || !isLiveModeRef.current) {
      return;
    }

    clearLiveTimeout();
    timeoutRef.current = window.setTimeout(() => {
      void analyzeFrameRef.current();
    }, LIVE_SCAN_COOLDOWN_MS);
  }, [clearLiveTimeout]);

  const resetRecognitionState = useCallback(() => {
    lastObservedSignRef.current = "";
    stableCountRef.current = 0;
    lastCommittedSignRef.current = "";
    unclearStreakRef.current = 0;
  }, []);

  const stopLiveCapture = useCallback(() => {
    clearLiveTimeout();
    isLiveModeRef.current = false;
    isCapturingRef.current = false;
    setIsCapturing(false);
    setIsLiveMode(false);
    resetRecognitionState();
    onLiveUpdate("", "", 0);
  }, [clearLiveTimeout, onLiveUpdate, resetRecognitionState]);

  const analyzeFrameRef = useRef<() => Promise<void>>(async () => {});

  const connectCamera = useCallback(
    async (nextFacingMode: CameraFacingMode) => {
      if (!videoRef.current) {
        return;
      }

      if (streamRef.current) {
        stopCamera(streamRef.current);
        streamRef.current = null;
      }

      const stream = await startCamera(videoRef.current, nextFacingMode);
      streamRef.current = stream;
      setError("");
    },
    [],
  );

  useEffect(() => {
    isMountedRef.current = true;
    const initCam = async () => {
      try {
        await connectCamera(facingMode);
      } catch {
        setError("Camera not available. Please check permissions.");
      }
    }
    initCam();
    return () => {
      isMountedRef.current = false;
      clearLiveTimeout();
      if (streamRef.current) {
        stopCamera(streamRef.current);
        streamRef.current = null;
      }
    };
  }, [clearLiveTimeout, connectCamera]); // 👈 removed facingMode

  const analyzeFrame = useCallback(async () => {
    if (!videoRef.current || isCapturingRef.current) {
      return;
    }

    isCapturingRef.current = true;
    if (isMountedRef.current) {
      setIsCapturing(true);
    }

    try {
      const base64 = captureFrame(videoRef.current);

      if (!base64) {
        return;
      }

      const isDemo = storage.getDemoMode();
      const apiKey = storage.getApiKey();
      const res = await recognizeSignFromImage(base64, apiKey, isDemo);

      if (!isMountedRef.current || !isLiveModeRef.current) {
        return;
      }

      const normalizedSign = res.sign.trim().toUpperCase();
      const hasReadableSign = normalizedSign !== "" && normalizedSign !== "UNCLEAR";

      if (hasReadableSign) {
        unclearStreakRef.current = 0;
        if (isMountedRef.current) {
          setLastResult(res);
        }
        onLiveUpdate(res.sign, res.meaning, res.confidence);

        if (normalizedSign === lastObservedSignRef.current) {
          stableCountRef.current += 1;
        } else {
          lastObservedSignRef.current = normalizedSign;
          stableCountRef.current = 1;
        }

        if (
          res.confidence >= MIN_COMMIT_CONFIDENCE &&
          (stableCountRef.current >= STABLE_SIGN_THRESHOLD ||
            res.confidence >= FAST_COMMIT_CONFIDENCE) &&
          normalizedSign !== lastCommittedSignRef.current
        ) {
          lastCommittedSignRef.current = normalizedSign;
          onCaptureResult(res.sign, res.meaning, res.confidence);
          speak(res.meaning);
        }
      } else {
        unclearStreakRef.current += 1;
        if (unclearStreakRef.current >= MAX_UNCLEAR_STREAK_BEFORE_RESET) {
          lastObservedSignRef.current = "";
          stableCountRef.current = 0;
        }
      }

      if (isMountedRef.current) {
        setError("");
      }
    } catch (error) {
      if (isMountedRef.current) {
        setError(error instanceof Error ? error.message : "Live sign recognition failed.");
      }
    } finally {
      isCapturingRef.current = false;
      if (isMountedRef.current) {
        setIsCapturing(false);
      }

      scheduleNextScan();
    }
  }, [onCaptureResult, onLiveUpdate, scheduleNextScan]);

  useEffect(() => {
    analyzeFrameRef.current = analyzeFrame;
  }, [analyzeFrame]);

  const handleLiveToggle = () => {
    if (isLiveMode) {
      stopLiveCapture();
      return;
    }

    setError("");
    setLastResult(null);
    clearLiveTimeout();
    resetRecognitionState();
    isLiveModeRef.current = true;
    setIsLiveMode(true);
    void analyzeFrame();
  };

  const handleReSpeak = () => {
    if (lastResult) speak(lastResult.meaning);
  };

  const handleRotateCamera = async () => {
    const nextFacingMode = facingMode === "environment" ? "user" : "environment";

    try {
      stopLiveCapture();
      await connectCamera(nextFacingMode);
      setFacingMode(nextFacingMode);
    } catch {
      setError("Couldn't switch cameras on this device.");
    }
  };

  return (
    <div className="grid gap-3 w-full px-4">
      <div className="relative w-full aspect-[3/4] overflow-hidden rounded-[1.8rem] border border-white/65 bg-slate-950 shadow-[0_24px_64px_rgba(15,23,42,0.18)] dark:border-white/10">
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950/92 p-6 text-center text-white">
            <AlertCircle className="mb-3 h-8 w-8 text-red-400" />
            <p className="max-w-sm text-sm font-medium text-red-100">{error}</p>
            <button onClick={() => setError("")} className="mt-4 rounded-full border border-white/15 bg-white/8 px-4 py-2 text-sm font-medium text-white backdrop-blur-xl">
              Retry
            </button>
          </div>
        ) : (
          <>
            <video ref={videoRef} playsInline muted className="absolute inset-0 h-full w-full object-contain object-center" />
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/24 via-transparent to-slate-950/34" />
            {isCapturing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.22 }}
                className="absolute inset-0 pointer-events-none"
              >
                <div className="absolute inset-0 bg-white/[0.03] backdrop-blur-[1.5px]" />
                <motion.div
                  className="absolute -left-6 top-10 h-24 w-24 rounded-full bg-white/10 blur-3xl"
                  animate={{ opacity: [0.14, 0.22, 0.14] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                />
                <motion.div
                  className="absolute bottom-8 right-6 h-20 w-20 rounded-full bg-sky-200/12 blur-3xl"
                  animate={{ opacity: [0.1, 0.18, 0.1] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut", delay: 0.18 }}
                />
              </motion.div>
            )}
            <div className="absolute inset-4 rounded-[1.35rem] border border-white/12" />
            <div className="absolute left-4 top-4 z-10 flex items-center justify-start">
              <div className="rounded-full border border-white/18 bg-slate-950/32 px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-white uppercase backdrop-blur-xl">
                <Dot className={`h-4 w-4 ${isLiveMode ? "text-cyan-300" : "text-white/55"}`} />
                {isLiveMode ? "Live" : "Standby"}
              </div>
            </div>
            {isMobile && (
              <button
                type="button"
                onClick={handleRotateCamera}
                className="absolute right-4 top-4 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/18 bg-slate-950/32 text-white backdrop-blur-xl transition hover:bg-slate-950/42"
              >
                <RotateCcw className="h-4 w-4" />
              </button>
            )}
          </>
        )}
      </div>

      <div className="flex flex-col gap-3 rounded-[1.6rem] border border-white/60 bg-white/50 p-3 shadow-[0_14px_36px_rgba(15,23,42,0.08)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6">
        <motion.button
          data-testid="button-capture-sign"
          whileTap={{ scale: 0.985 }}
          disabled={!!error && !isLiveMode}
          onClick={handleLiveToggle}
          className={`glass-button-primary w-full gap-2 ${isLiveMode ? "!bg-[linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04)),linear-gradient(135deg,rgba(76,92,128,0.82),rgba(44,55,82,0.84))] !shadow-[0_16px_36px_rgba(15,23,42,0.16)]" : ""}`}
        >
          {isLiveMode ? <RefreshCw className={`h-5 w-5 ${isCapturing ? "animate-spin" : ""}`} /> : <CameraIcon className="h-5 w-5" />}
          {isLiveMode ? "Stop live camera" : "Start live camera"}
        </motion.button>

        {lastResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[1.4rem] border border-cyan-200/65 bg-white/68 p-3.5 shadow-[0_12px_30px_rgba(15,23,42,0.06)] backdrop-blur-xl dark:border-cyan-400/20 dark:bg-cyan-400/8"
          >
            <div className="mb-1 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-base font-semibold tracking-[-0.03em] text-slate-900 dark:text-white">{lastResult.sign}</h4>
                <p className="text-sm text-muted-foreground">{lastResult.meaning}</p>
              </div>
              <button data-testid="button-respeak" onClick={handleReSpeak} className="frost-button h-9 w-9 text-cyan-700 dark:text-cyan-300">
                <Volume2 className="h-4 w-4" />
              </button>
            </div>
            <ConfidenceBar confidence={lastResult.confidence} />
          </motion.div>
        )}
      </div>
    </div>
  );
}
