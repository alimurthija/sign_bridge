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

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
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
    throw new Error("Failed to reach Gemini API");
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

export async function sentenceToSignGloss(sentence: string, apiKey: string, isDemo: boolean = false): Promise<string[]> {
  if (isDemo || !apiKey) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    const dropWords = ["the", "a", "an", "is", "are", "am", "to"];
    const words = sentence.split(/\s+/);
    return words
      .map(w => w.replace(/[^a-zA-Z]/g, "").toUpperCase())
      .filter(w => w && !dropWords.includes(w.toLowerCase()));
  }

  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            { text: `Convert this English sentence to Indian Sign Language (ISL) gloss as an ordered sequence of UPPERCASE single-word signs. ISL grammar drops articles and uses topic-comment order. Return ONLY a JSON array of strings, e.g. ["WATER","NEED"]. Sentence: "${sentence}"` }
          ]
        }
      ],
      generationConfig: {
        temperature: 0.1,
      }
    })
  });

  if (!response.ok) {
    throw new Error("Failed to reach Gemini API");
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

  try {
    const cleaned = text.replace(/```json/g, "").replace(/```/g, "").trim();
    const parsed = JSON.parse(cleaned);
    if (Array.isArray(parsed)) return parsed;
    return [];
  } catch (e) {
    console.error("Failed to parse Gemini response:", text);
    return [sentence.toUpperCase()]; // fallback
  }
}