export type CameraFacingMode = "environment" | "user";

export async function startCamera(
  videoEl: HTMLVideoElement,
  facingMode: CameraFacingMode = "environment",
): Promise<MediaStream | null> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Camera not supported by this browser");
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode,
        aspectRatio: { ideal: 3 / 4 },
        width: { ideal: 720 },
        height: { ideal: 960 },
      },
    });
    videoEl.srcObject = stream;
    await new Promise<void>((resolve) => {
      videoEl.onloadedmetadata = () => {
        videoEl.play();
        resolve();
      };
    });
    return stream;
  } catch (error) {
    console.error("Camera start error:", error);
    throw error;
  }
}

export function stopCamera(stream: MediaStream | null) {
  if (stream) {
    stream.getTracks().forEach((track) => track.stop());
  }
}

export function captureFrame(videoEl: HTMLVideoElement): string {
  const maxWidth = 480;
  const scale = videoEl.videoWidth > maxWidth ? maxWidth / videoEl.videoWidth : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(videoEl.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(videoEl.videoHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.55).split(",")[1];
}