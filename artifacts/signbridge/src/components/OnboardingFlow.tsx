import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Mic, Key, CheckCircle, ChevronRight, Play, AlertCircle } from "lucide-react";
import { storage } from "@/lib/storage";

export function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(1);
  const [apiKey, setApiKey] = useState(storage.getApiKey());
  const [camStatus, setCamStatus] = useState<"pending"|"granted"|"denied">("pending");
  const [micStatus, setMicStatus] = useState<"pending"|"granted"|"denied">("pending");

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      storage.setApiKey(apiKey.trim());
      storage.setDemoMode(false);
      setStep(2);
    }
  };

  const handleDemoMode = () => {
    storage.setDemoMode(true);
    storage.setApiKey("");
    setStep(2);
  };

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
            <div className="w-12 h-12 bg-primary/20 text-primary rounded-2xl flex items-center justify-center mb-6">
              <Key className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold mb-3">Welcome to SignBridge</h2>
            <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
              To understand your signs and speech, we need a Google Gemini API key. 
              <br/><a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-primary underline mt-1 block">Get one free here</a>
            </p>
            <div className="w-full space-y-3">
              <input
                data-testid="input-apikey"
                type="password"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="Paste API key..."
                className="w-full bg-black/5 dark:bg-white/5 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary outline-none"
              />
              <button data-testid="button-save-key" onClick={handleSaveKey} disabled={!apiKey.trim()} className="w-full bg-primary text-primary-foreground py-3 rounded-xl font-semibold flex justify-center items-center gap-2 hover:opacity-90 disabled:opacity-50">
                Save & continue <ChevronRight className="w-4 h-4" />
              </button>
              <button data-testid="button-demo-mode" onClick={handleDemoMode} className="w-full bg-secondary/10 text-secondary-foreground dark:text-secondary py-3 rounded-xl font-semibold flex justify-center items-center gap-2 hover:bg-secondary/20">
                <Play className="w-4 h-4" /> Try Demo Mode (No Key)
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
                <button data-testid="button-allow-camera" onClick={requestCam} className="w-full bg-teal-600 text-white py-3 rounded-xl font-semibold hover:bg-teal-700">
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
              <button data-testid="button-skip-camera" onClick={() => setStep(3)} className="w-full py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-black/5">
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
                <button data-testid="button-allow-mic" onClick={requestMic} className="w-full bg-amber-500 text-white py-3 rounded-xl font-semibold hover:bg-amber-600">
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
              <button data-testid="button-skip-mic" onClick={() => setStep(4)} className="w-full py-3 rounded-xl text-sm font-medium text-muted-foreground hover:bg-black/5">
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
            <button data-testid="button-finish-onboarding" onClick={finish} className="w-full bg-foreground text-background py-4 rounded-2xl font-bold text-lg shadow-xl hover:scale-[0.98] transition-transform">
              Start conversation
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}