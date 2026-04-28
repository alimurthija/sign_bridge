const GEMINI_MODEL = "gemini-2.5-flash";

function formatGeminiError(status: number, payload: unknown) {
  const message =
    typeof payload === "object" &&
    payload !== null &&
    "error" in payload &&
    typeof (payload as { error?: { message?: unknown } }).error?.message === "string"
      ? (payload as { error: { message: string } }).error.message
      : "";

  if (status === 400) {
    return `Gemini rejected the image request (400)${message ? `: ${message}` : "."}`;
  }

  if (status === 403) {
    return `Gemini rejected the API key (403)${message ? `: ${message}` : "."}`;
  }

  if (status === 429) {
    return `Gemini rate limit reached (429)${message ? `: ${message}` : "."}`;
  }

  return `Gemini sign recognition failed with status ${status}${message ? `: ${message}` : "."}`;
}

export async function recognizeSignFromImage(base64: string, apiKey: string, isDemo: boolean = false) {
  if (isDemo || !apiKey) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 700));
    const mocks = [
      { sign: "HELLO", meaning: "Hello, nice to meet you", confidence: 92 },
      { sign: "THANK YOU", meaning: "Thank you so much", confidence: 88 },
      { sign: "WATER", meaning: "I would like some water", confidence: 75 },
      { sign: "HELP", meaning: "Can you help me?", confidence: 85 },
      { sign: "YES", meaning: "Yes, I agree", confidence: 95 },
      { sign: "NO", meaning: "No, thank you", confidence: 90 },
    ];
    return mocks[Math.floor(Math.random() * mocks.length)];
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: "You are an Indian Sign Language (ISL) recognition assistant. Look at the photo and identify the most likely single ISL sign or short phrase being shown. Respond ONLY with a compact JSON object: {\"sign\": \"<UPPERCASE_WORD>\", \"meaning\": \"<short friendly translation>\", \"confidence\": <0-100 integer>}. If you can't tell, return {\"sign\": \"UNCLEAR\", \"meaning\": \"I couldn't read that sign clearly\", \"confidence\": 0}." },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64
              }
            }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
      }
    })
  });

  if (!response.ok) {
    let payload: unknown = null;

    try {
      payload = await response.json();
    } catch {
      payload = null;
    }

    throw new Error(formatGeminiError(response.status, payload));
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  
  try {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return {
      sign: parsed.sign || "UNCLEAR",
      meaning: parsed.meaning || "I couldn't read that sign clearly",
      confidence: parsed.confidence || 0,
    };
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    return { sign: "UNCLEAR", meaning: "I couldn't understand the response.", confidence: 0 };
  }
}

export { sentenceToSignGloss } from "@/lib/translation";
