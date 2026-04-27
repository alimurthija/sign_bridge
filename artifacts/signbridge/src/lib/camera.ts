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
  const canvas = document.createElement("canvas");
  canvas.width = videoEl.videoWidth;
  canvas.height = videoEl.videoHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
  // Return Base64 JPEG
  return canvas.toDataURL("image/jpeg", 0.8).split(",")[1];
}
