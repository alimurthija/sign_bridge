export interface AppSettings {
  largerText: boolean;
  highContrast: boolean;
  reduceMotion: boolean;
}

export interface ConversationMessage {
  id: string;
  role: "deaf" | "hearing";
  text: string; // the sentence or the sign meaning
  signs?: string[]; // for hearing -> deaf (the glossed signs)
  signConfidence?: number; // for deaf -> hearing
  timestamp: number;
}

const STORAGE_KEYS = {
  API_KEY: "signbridge.apiKey",
  HISTORY: "signbridge.history",
  SETTINGS: "signbridge.settings",
  ONBOARDED: "signbridge.onboarded",
  DEMO_MODE: "signbridge.demoMode",
};

export const storage = {
  getApiKey: () => localStorage.getItem(STORAGE_KEYS.API_KEY) || "",
  setApiKey: (key: string) => localStorage.setItem(STORAGE_KEYS.API_KEY, key),
  
  getHistory: (): ConversationMessage[] => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.HISTORY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },
  setHistory: (history: ConversationMessage[]) => {
    localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(history));
  },
  
  getSettings: (): AppSettings => {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return data ? JSON.parse(data) : { largerText: false, highContrast: false, reduceMotion: false };
    } catch {
      return { largerText: false, highContrast: false, reduceMotion: false };
    }
  },
  setSettings: (settings: AppSettings) => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  },
  
  getOnboarded: () => localStorage.getItem(STORAGE_KEYS.ONBOARDED) === "true",
  setOnboarded: (value: boolean) => localStorage.setItem(STORAGE_KEYS.ONBOARDED, value ? "true" : "false"),
  
  getDemoMode: () => localStorage.getItem(STORAGE_KEYS.DEMO_MODE) === "true",
  setDemoMode: (value: boolean) => localStorage.setItem(STORAGE_KEYS.DEMO_MODE, value ? "true" : "false"),
  
  clearAll: () => {
    Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
  }
};
