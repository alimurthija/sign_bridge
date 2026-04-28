import { afterEach, describe, expect, it, vi } from "vitest";
import { sentenceToSignGloss, toLocalSignGloss, TranslationError } from "../translation";

afterEach(() => {
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("toLocalSignGloss", () => {
  it("drops filler words and normalizes casing", () => {
    expect(toLocalSignGloss("I need water and help")).toEqual([
      "I",
      "NEED",
      "WATER",
      "AND",
      "HELP",
    ]);
  });
});

describe("sentenceToSignGloss", () => {
  it("returns local gloss in demo mode", async () => {
    vi.useFakeTimers();
    const result = sentenceToSignGloss("please give me water", "", true);
    await vi.advanceTimersByTimeAsync(250);

    await expect(result).resolves.toEqual(["PLEASE", "GIVE", "ME", "WATER"]);
  });

  it("throws for empty input", async () => {
    await expect(sentenceToSignGloss("   ", "", true)).rejects.toBeInstanceOf(TranslationError);
    await expect(sentenceToSignGloss("   ", "", true)).rejects.toMatchObject({
      message: "Type or speak a sentence first.",
      code: "EMPTY_INPUT",
    });
  });

  it("throws when the Gemini request fails", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: vi.fn(),
      }),
    );

    await expect(sentenceToSignGloss("I need water", "abc123", false)).rejects.toMatchObject({
      message: "Gemini translation failed with status 403.",
      code: "NETWORK_ERROR",
    });
  });

  it("throws when Gemini returns invalid JSON", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({
          candidates: [
            {
              content: {
                parts: [{ text: "{\"bad\":true}" }],
              },
            },
          ],
        }),
      }),
    );

    await expect(sentenceToSignGloss("I need water", "abc123", false)).rejects.toMatchObject({
      message: "Gemini returned an invalid response format.",
      code: "INVALID_RESPONSE",
    });
  });
});
