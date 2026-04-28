import { useEffect} from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, CheckCircle, AlertCircle } from "lucide-react";
import { storage } from "@/lib/storage";
import { useState } from "react";
import { Key } from "lucide-react";

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState(storage.getApiKey());
  const [camStatus, setCamStatus] = useState<"pending"|"granted"|"denied">("pending");
  const [micStatus, setMicStatus] = useState<"pending"|"granted"|"denied">("pending");

  useEffect(() => {
    if (!storage.getApiKey().trim()) {
      storage.setDemoMode(true);
    }
  }, []);

  const requestCam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      stream.getTracks().forEach(t => t.stop());
      setCamStatus("granted");
      setTimeout(() => setStep(3), 600);
    } catch {
      setCamStatus("denied");
    }
  };

  const requestMic = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach(t => t.stop());
      setMicStatus("granted");
      setTimeout(() => setStep(4), 600);
    } catch {
      setMicStatus("denied");
    }
  };

  const finish = () => {
    storage.setOnboarded(true);
    onComplete();
  };

  const cardVariants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-6 w-full max-w-md mx-auto relative z-10">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div key="step1" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-card w-full p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-violet-500/20 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center mb-6">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Gemini API Key</h2>
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              Paste your Gemini API key to power sign recognition. You can get one free from Google AI Studio.
            </p>
            <div className="w-full space-y-3">
              <input
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste your Gemini API key"
                className="w-full px-4 py-3 text-sm rounded-xl border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={() => {
                  storage.setApiKey(apiKey.trim());
                  setStep(2);
                }}
                disabled={!apiKey.trim()}
                className="glass-button-primary w-full disabled:opacity-50"
              >
                Continue
              </button>
              <button onClick={() => setStep(2)} className="glass-button-secondary w-full text-sm dark:text-slate-100">
                Skip for now
              </button>
            </div>
          </motion.div>
        )}
        {step === 2 && (
          <motion.div key="step2" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-card w-full p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-teal-500/20 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mb-6">
              <Camera className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-3">See the signs</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              We need camera access to translate Indian Sign Language into text. Video never leaves your device.
            </p>
            <div className="w-full space-y-3">
              {camStatus === "pending" && (
                <button data-testid="button-allow-camera" onClick={requestCam} className="glass-button-primary w-full">
                  Allow camera
                </button>
              )}
              {camStatus === "granted" && (
                <div className="w-full bg-teal-50 text-teal-700 py-3 rounded-xl font-semibold flex justify-center items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Camera ready
                </div>
              )}
              {camStatus === "denied" && (
                <div className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-sm flex flex-col items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Couldn't access camera.
                </div>
              )}
              <button data-testid="button-skip-camera" onClick={() => setStep(3)} className="glass-button-secondary w-full text-sm dark:text-slate-100">
                Skip for now
              </button>
            </div>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div key="step3" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-card w-full p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-12 h-12 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-2xl flex items-center justify-center mb-6">
              <Mic className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Hear the words</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              We need microphone access so the hearing participant can speak into the app.
            </p>
            <div className="w-full space-y-3">
              {micStatus === "pending" && (
                <button data-testid="button-allow-mic" onClick={requestMic} className="glass-button-primary w-full">
                  Allow microphone
                </button>
              )}
              {micStatus === "granted" && (
                <div className="w-full bg-amber-50 text-amber-700 py-3 rounded-xl font-semibold flex justify-center items-center gap-2">
                  <CheckCircle className="w-5 h-5" /> Microphone ready
                </div>
              )}
              {micStatus === "denied" && (
                <div className="w-full bg-red-50 text-red-600 py-3 rounded-xl text-sm flex flex-col items-center gap-2">
                  <AlertCircle className="w-5 h-5" /> Couldn't access microphone.
                </div>
              )}
              <button data-testid="button-skip-mic" onClick={() => setStep(4)} className="glass-button-secondary w-full text-sm dark:text-slate-100">
                Skip for now
              </button>
            </div>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div key="step4" variants={cardVariants} initial="initial" animate="animate" exit="exit" className="glass-card w-full p-8 rounded-3xl flex flex-col items-center text-center">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-amber-400 text-white rounded-full flex items-center justify-center mb-6 shadow-lg">
              <CheckCircle className="w-8 h-8" />
            </div>
            <h2 className="text-3xl font-bold mb-2">You're ready!</h2>
            <p className="text-muted-foreground text-sm mb-8">
              SignBridge is set up. Let's start the conversation.
            </p>
            <button data-testid="button-finish-onboarding" onClick={finish} className="glass-button-primary w-full text-lg font-bold">
              Start conversation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
