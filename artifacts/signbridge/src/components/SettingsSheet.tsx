import { Settings, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AppSettings, storage } from "@/lib/storage";
import { useState } from "react";
import { Switch } from "@/components/ui/switch";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  onReOnboard: () => void;
}

export function SettingsSheet({ isOpen, onClose, settings, onUpdateSettings, onReOnboard }: Props) {
  const [apiKey, setApiKey] = useState(storage.getApiKey());
  const handleSaveApiKey = () => {
    storage.setApiKey(apiKey.trim());
  };
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-50"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 w-80 bg-background border-l shadow-2xl z-50 flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg flex items-center gap-2">
                <Settings className="w-5 h-5 text-primary" />
                Settings
              </h2>
              <button onClick={onClose} className="p-2 -mr-2 rounded-full hover:bg-muted text-muted-foreground">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-6">
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Accessibility</h3>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm">Larger Text</div>
                    <div className="text-xs text-muted-foreground">Scale up font size</div>
                  </div>
                  <Switch 
                    checked={settings.largerText}
                    onCheckedChange={(v) => onUpdateSettings({ ...settings, largerText: v })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm">High Contrast</div>
                    <div className="text-xs text-muted-foreground">Increase visual contrast</div>
                  </div>
                  <Switch 
                    checked={settings.highContrast}
                    onCheckedChange={(v) => onUpdateSettings({ ...settings, highContrast: v })}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <div className="font-medium text-sm">Reduce Motion</div>
                    <div className="text-xs text-muted-foreground">Minimize animations</div>
                  </div>
                  <Switch 
                    checked={settings.reduceMotion}
                    onCheckedChange={(v) => onUpdateSettings({ ...settings, reduceMotion: v })}
                  />
                </div>
              </div>
              
              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">API Key</h3>
                <div className="space-y-2">
                  <div className="text-xs text-muted-foreground">Gemini API Key</div>
                  <input
                    type="password"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="Paste your Gemini API key"
                    className="w-full px-3 py-2 text-sm rounded-md border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                  <button
                    onClick={handleSaveApiKey}
                    className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
                  >
                    Save API Key
                  </button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">App</h3>
                
                <button 
                  onClick={() => {
                    onClose();
                    onReOnboard();
                  }}
                  className="w-full text-left px-3 py-2 -mx-3 rounded-md hover:bg-muted text-sm font-medium transition-colors"
                >
                  Restart Setup
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
