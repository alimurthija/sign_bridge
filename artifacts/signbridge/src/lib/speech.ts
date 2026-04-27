export interface SpeechOptions {
  onInterim: (text: string) => void;
  onFinal: (text: string) => void;
  onError: (error: any) => void;
}

let recognition: any = null;

export function startListening({ onInterim, onFinal, onError }: SpeechOptions) {
  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
  if (!SpeechRecognition) {
    onError(new Error("Speech recognition not supported in this browser."));
    return;
  }

  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.interimResults = true;
  
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
    
    if (finalTranscript && !interimTranscript) {
        onFinal(finalTranscript);
        finalTranscript = "";
    } else if (interimTranscript) {
        onInterim(interimTranscript);
    }
  };

  recognition.onerror = (event: any) => {
    console.error("Speech recognition error", event.error);
    onError(event.error);
  };

  recognition.start();
}

export function stopListening() {
  if (recognition) {
    recognition.stop();
  }
}

export function speak(text: string) {
  if (!window.speechSynthesis) return;
  const utterance = new SpeechSynthesisUtterance(text);
  // Try to find a friendly English voice
  const voices = window.speechSynthesis.getVoices();
  const preferredVoice = voices.find(v => v.lang.includes("en") && (v.name.includes("Google") || v.name.includes("Samantha") || v.name.includes("Natural")));
  if (preferredVoice) {
      utterance.voice = preferredVoice;
  }
  utterance.rate = 0.9; // slightly calmer
  window.speechSynthesis.speak(utterance);
}
