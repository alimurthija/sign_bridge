import { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { HearingCapture } from "../HearingCapture";
import { MessageBubble } from "../MessageBubble";

const { sentenceToSignGlossMock } = vi.hoisted(() => ({
  sentenceToSignGlossMock: vi.fn(),
}));

const { startListeningMock, stopListeningMock } = vi.hoisted(() => ({
  startListeningMock: vi.fn(({ onError }) => {
    onError(new Error("Speech recognition not supported in this browser."));
  }),
  stopListeningMock: vi.fn(),
}));

vi.mock("@/lib/translation", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/translation")>();

  return {
    ...actual,
    sentenceToSignGloss: sentenceToSignGlossMock,
  };
});

vi.mock("@/lib/speech", () => ({
  startListening: startListeningMock,
  stopListening: stopListeningMock,
}));

vi.mock("@/lib/storage", () => ({
  storage: {
    getDemoMode: () => true,
    getApiKey: () => "",
  },
}));

function Harness() {
  const [message, setMessage] = useState<{
    id: string;
    role: "hearing";
    text: string;
    signs: string[];
    timestamp: number;
  } | null>(null);

  return (
    <div>
      <HearingCapture
        onLiveUpdate={vi.fn()}
        onCaptureResult={(sentence, signs) => {
          setMessage({
            id: "1",
            role: "hearing",
            text: sentence,
            signs,
            timestamp: Date.now(),
          });
        }}
      />
      {message && <MessageBubble message={message} />}
    </div>
  );
}

beforeEach(() => {
  sentenceToSignGlossMock.mockReset();
});

describe("HearingCapture", () => {
  it("renders sign chips after translation", async () => {
    sentenceToSignGlossMock.mockResolvedValue(["I", "NEED", "WATER"]);
    const user = userEvent.setup();

    render(<Harness />);

    await user.click(screen.getByTestId("button-mic-toggle"));
    await user.type(screen.getByPlaceholderText("Type your sentence here..."), "I need water");
    await user.click(screen.getByTestId("button-translate-text"));

    expect(sentenceToSignGlossMock).toHaveBeenCalledWith("I need water", "", true);
    expect(await screen.findByText("WATER")).toBeInTheDocument();
    expect(screen.getByText("NEED")).toBeInTheDocument();
  });

  it("shows the translation error", async () => {
    sentenceToSignGlossMock.mockRejectedValue(new Error("Gemini translation failed with status 403."));
    const user = userEvent.setup();

    render(<HearingCapture onLiveUpdate={vi.fn()} onCaptureResult={vi.fn()} />);

    await user.click(screen.getByTestId("button-mic-toggle"));
    await user.type(screen.getByPlaceholderText("Type your sentence here..."), "I need water");
    await user.click(screen.getByTestId("button-translate-text"));

    expect(await screen.findByText("Gemini translation failed with status 403.")).toBeInTheDocument();
  });
});
