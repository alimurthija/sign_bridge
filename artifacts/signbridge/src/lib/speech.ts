export interface SpeechOptions {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: any) => void;
}

let recognition: any = null;

export function startListening({ onInterim, onFinal, onError }: SpeechOptions) {
  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

  if (!SpeechRecognition) {
    onError(new Error("Speech recognition not supported in this browser."));
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = false;
  recognition.interimResults = true;
  recognition.lang = "en-IN";

  let finalTranscript = "";

  recognition.onresult = (event: any) => {
    let interimTranscript = "";

    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      } else {
        interimTranscript += event.results[i][0].transcript;
      }
    }

    if (interimTranscript) {
      onInterim(interimTranscript);
    }

    // ✅ FIX: Call onFinal immediately when a final result arrives,
    // don't wait for onend — onend may fire before this result is processed
    if (finalTranscript.trim()) {
      onFinal(finalTranscript.trim());
    }
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error", event.error);
    onError(new Error(event.error || "Speech recognition failed."));
  };

  recognition.onend = () => {
    // onFinal is already called above; just clean up
    recognition = null;
  };

  recognition.start();
}

export function stopListening() {
  if (recognition) {
    recognition.stop();
    recognition = null;
  }
}

// ✅ FIX: Wait for voices to load before trying to pick one
export function speak(text: string) {
  if (!window.speechSynthesis) return;

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = 0.9;

  const pickVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(
      (v) =>
        v.lang.includes("en") &&
        (v.name.includes("Google") ||
          v.name.includes("Samantha") ||
          v.name.includes("Natural"))
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  };

  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    pickVoice();
  } else {
    // Voices not loaded yet — wait for the event
    window.speechSynthesis.addEventListener("voiceschanged", pickVoice, { once: true });
  }
}