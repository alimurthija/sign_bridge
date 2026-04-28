import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings as SettingsIcon } from "lucide-react";
import { OnboardingFlow } from "@/components/OnboardingFlow";
import { ConversationView } from "@/components/ConversationView";
import { SettingsSheet } from "@/components/SettingsSheet";
import { storage, AppSettings } from "@/lib/storage";

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [mode, setMode] = useState<"deaf" | "hearing">("deaf");
  const [settings, setSettings] = useState<AppSettings>(storage.getSettings());

  useEffect(() => {
    setIsReady(storage.getOnboarded());
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (settings.largerText) root.classList.add("text-large");
    else root.classList.remove("text-large");
    
    if (settings.highContrast) root.classList.add("high-contrast");
    else root.classList.remove("high-contrast");
    
    if (settings.reduceMotion) root.classList.add("reduce-motion");
    else root.classList.remove("reduce-motion");
    
    storage.setSettings(settings);
  }, [settings]);

  const handleReOnboard = () => {
    storage.setOnboarded(false);
    setIsReady(false);
  };

  const accentClass = "from-sky-300/34 via-blue-300/18 to-cyan-200/22 dark:from-sky-400/16 dark:via-blue-500/12 dark:to-cyan-400/10";

  return (
    <div className="relative min-h-[100dvh] w-full overflow-hidden transition-colors duration-1000">
      <div className={`absolute inset-x-[-18%] top-[-14%] h-[34rem] rounded-full bg-gradient-to-r blur-3xl transition-all duration-1000 ${accentClass}`} />
      <div className="absolute left-[-12%] top-[24%] h-72 w-72 rounded-full bg-white/55 blur-3xl dark:bg-sky-400/8" />
      <div className="absolute right-[-8%] bottom-[10%] h-80 w-80 rounded-full bg-sky-200/45 blur-3xl dark:bg-blue-400/10" />

      <div className="absolute right-4 top-4 z-50">
        <button 
          data-testid="button-settings"
          onClick={() => setShowSettings(true)}
          className="frost-button h-11 w-11"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isReady ? (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full w-full flex items-center justify-center px-4 pb-6 pt-20">
            <OnboardingFlow onComplete={() => setIsReady(true)} />
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative h-full w-full">
            <ConversationView mode={mode} setMode={setMode} />
          </motion.div>
        )}
      </AnimatePresence>

      <SettingsSheet 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        onReOnboard={handleReOnboard}
      />
    </div>
  );
}
