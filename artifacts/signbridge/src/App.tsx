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

  const bgClass = mode === "deaf" 
    ? "from-teal-50/80 to-blue-50/80 dark:from-teal-950/30 dark:to-blue-950/30"
    : "from-amber-50/80 to-orange-50/80 dark:from-amber-950/30 dark:to-orange-950/30";

  return (
    <div className={`min-h-[100dvh] w-full overflow-hidden bg-gradient-to-br transition-colors duration-1000 ${bgClass}`}>
      <div className="absolute top-4 right-4 z-50">
        <button 
          data-testid="button-settings"
          onClick={() => setShowSettings(true)}
          className="p-3 bg-white/50 dark:bg-black/30 backdrop-blur-md rounded-full shadow-sm text-foreground hover:bg-white dark:hover:bg-black/50 transition-colors"
        >
          <SettingsIcon className="w-5 h-5" />
        </button>
      </div>

      <AnimatePresence mode="wait">
        {!isReady ? (
          <motion.div key="onboarding" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full flex items-center justify-center">
            <OnboardingFlow onComplete={() => setIsReady(true)} />
          </motion.div>
        ) : (
          <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full w-full">
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