import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageBubble } from "./MessageBubble";
import { DeafCapture } from "./DeafCapture";
import { HearingCapture } from "./HearingCapture";
import { ModeToggle } from "./ModeToggle";
import { Trash2 } from "lucide-react";
import { storage, ConversationMessage } from "@/lib/storage";

interface Props {
  mode: "deaf" | "hearing";
  setMode: (m: "deaf" | "hearing") => void;
}

export function ConversationView({ mode, setMode }: Props) {
  const [history, setHistory] = useState<ConversationMessage[]>([]);
  const [liveMessage, setLiveMessage] = useState<ConversationMessage | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const appendMessage = (message: ConversationMessage) => {
    setHistory((prev) => [...prev.slice(-23), message]);
  };

  useEffect(() => {
    setHistory(storage.getHistory());
  }, []);

  useEffect(() => {
    storage.setHistory(history);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [history, liveMessage]);

  useEffect(() => {
    setLiveMessage(null);
  }, [mode]);

  const handleDeafCapture = (_sign: string, meaning: string, confidence: number) => {
    setLiveMessage((current) => (current?.role === "deaf" ? null : current));
    const msg: ConversationMessage = {
      id: Date.now().toString(),
      role: "deaf",
      text: meaning,
      signConfidence: confidence,
      timestamp: Date.now()
    };
    appendMessage(msg);
  };

  const handleLiveDeafCapture = (_sign: string, meaning: string, confidence: number) => {
    if (!meaning.trim()) {
      setLiveMessage((current) => (current?.role === "deaf" ? null : current));
      return;
    }

    setLiveMessage({
      id: "live-deaf",
      role: "deaf",
      text: meaning,
      signConfidence: confidence,
      timestamp: Date.now(),
      isLive: true,
    });
  };

  const handleHearingCapture = (sentence: string, signs: string[]) => {
    setLiveMessage((current) => (current?.role === "hearing" ? null : current));
    const msg: ConversationMessage = {
      id: Date.now().toString(),
      role: "hearing",
      text: sentence,
      signs,
      timestamp: Date.now()
    };
    appendMessage(msg);
  };

  const handleLiveHearingCapture = (sentence: string, signs: string[]) => {
    if (!sentence.trim()) {
      setLiveMessage((current) => (current?.role === "hearing" ? null : current));
      return;
    }

    setLiveMessage({
      id: "live-hearing",
      role: "hearing",
      text: sentence,
      signs,
      timestamp: Date.now(),
      isLive: true,
    });
  };

  const clearHistory = () => {
    if (window.confirm("Clear this conversation?")) {
      setHistory([]);
      setLiveMessage(null);
    }
  };

  return (
    <div className="relative z-10 mx-auto flex min-h-[100dvh] w-full max-w-[26rem] flex-col px-3 pb-4 pt-18 sm:pt-20">
      <div className="phone-shell flex min-h-[calc(100dvh-1.5rem)] flex-col overflow-hidden p-3 sm:min-h-[calc(100dvh-2rem)]">
      <section className="rounded-[2rem] border border-white/55 bg-white/34 p-3 shadow-[0_20px_56px_rgba(15,23,42,0.08)] backdrop-blur-3xl dark:border-white/10 dark:bg-white/5">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-center pb-1">
            <ModeToggle mode={mode} setMode={setMode} />
          </div>

          <div className="rounded-[1.7rem] border border-white/60 bg-white/44 p-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] backdrop-blur-2xl dark:border-white/10 dark:bg-white/6">
            <AnimatePresence mode="wait">
              {mode === "deaf" ? (
                <motion.div key="deaf" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }}>
                  <DeafCapture
                    onLiveUpdate={handleLiveDeafCapture}
                    onCaptureResult={handleDeafCapture}
                  />
                </motion.div>
              ) : (
                <motion.div key="hearing" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.28 }}>
                  <HearingCapture
                    onLiveUpdate={handleLiveHearingCapture}
                    onCaptureResult={handleHearingCapture}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="mt-3 flex min-h-0 flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/55 bg-white/40 backdrop-blur-3xl dark:border-white/10 dark:bg-white/5">
        <div className="flex items-center justify-end px-3 pt-3">
          <button
            data-testid="button-clear-history"
            onClick={clearHistory}
            className="frost-button h-9 w-9 text-muted-foreground hover:text-red-500"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>

        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-4 pb-4 pt-3 scroll-smooth"
        >
          {history.length === 0 && !liveMessage ? (
            <div className="flex h-full min-h-[16rem] items-center justify-center text-center">
              <p className="text-sm font-medium text-slate-500 dark:text-slate-300">Start the conversation</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <AnimatePresence initial={false}>
                {history.map((msg) => (
                  <MessageBubble key={msg.id} message={msg} />
                ))}
                {liveMessage && <MessageBubble key={liveMessage.id} message={liveMessage} />}
              </AnimatePresence>
            </div>
          )}
        </div>
      </section>
      </div>
    </div>
  );
}
