export async function startCamera(videoEl: HTMLVideoElement): Promise<MediaStream | null> {
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    throw new Error("Camera not supported by this browser");
  }
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "environment" },
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
  const maxWidth = 512;
  const scale = videoEl.videoWidth > maxWidth ? maxWidth / videoEl.videoWidth : 1;
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(videoEl.videoWidth * scale));
  canvas.height = Math.max(1, Math.round(videoEl.videoHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  // Downscale frames before upload to reduce payload size and API churn.
  return canvas.toDataURL("image/jpeg", 0.62).split(",")[1];
}
