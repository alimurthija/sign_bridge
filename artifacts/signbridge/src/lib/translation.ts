const DEMO_DELAY_MS = 200;
const DROP_WORDS = new Set(["the", "a", "an", "is", "are", "am", "to"]);
const GEMINI_MODEL = "gemini-2.5-flash";

export type TranslationErrorCode =
  | "EMPTY_INPUT"
  | "NETWORK_ERROR"
  | "INVALID_RESPONSE";

export class TranslationError extends Error {
  code: TranslationErrorCode;

  constructor(message: string, code: TranslationErrorCode) {
    super(message);
    this.name = "TranslationError";
    this.code = code;
  }
}

export function toLocalSignGloss(sentence: string): string[] {
  return sentence
    .trim()
    .split(/\s+/)
    .map((word) => word.replace(/[^a-zA-Z]/g, "").toUpperCase())
    .filter((word) => word && !DROP_WORDS.has(word.toLowerCase()));
}

function cleanGeminiText(text: string) {
  return text.replace(/```json/g, "").replace(/```/g, "").trim();
}

function parseGlossResponse(text: string): string[] {
  const cleaned = cleanGeminiText(text);
  let parsed: unknown;

  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new TranslationError("Gemini returned malformed JSON.", "INVALID_RESPONSE");
  }

  if (!Array.isArray(parsed)) {
    throw new TranslationError("Gemini returned an invalid response format.", "INVALID_RESPONSE");
  }

  const gloss = parsed
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  if (!gloss.length) {
    throw new TranslationError("Gemini returned an empty gloss list.", "INVALID_RESPONSE");
  }

  return gloss;
}

export async function sentenceToSignGloss(
  sentence: string,
  apiKey: string,
  isDemo: boolean = false,
): Promise<string[]> {
  const text = sentence.trim();

  if (!text) {
    throw new TranslationError("Type or speak a sentence first.", "EMPTY_INPUT");
  }

  if (isDemo || !apiKey.trim()) {
    await new Promise((resolve) => setTimeout(resolve, DEMO_DELAY_MS));
    return toLocalSignGloss(text);
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `Convert this English sentence to Indian Sign Language (ISL) gloss as an ordered sequence of UPPERCASE single-word signs. ISL grammar drops articles and uses topic-comment order. Return ONLY a JSON array of strings, e.g. ["WATER","NEED"]. Sentence: "${text}"`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
        },
      }),
    },
  );

  if (!response.ok) {
    throw new TranslationError(
      `Gemini translation failed with status ${response.status}.`,
      "NETWORK_ERROR",
    );
  }

  const data = await response.json();
  const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  if (!rawText.trim()) {
    throw new TranslationError("Gemini returned an empty response.", "INVALID_RESPONSE");
  }

  return parseGlossResponse(rawText);
}
