const MAX_DIMENSION = 1920;
const MAX_BYTES = 3 * 1024 * 1024;
const HEIC_TYPES = ["image/heic", "image/heif", "image/heic-sequence", "image/heif-sequence"];

function isHeic(file: File): boolean {
  if (HEIC_TYPES.includes(file.type.toLowerCase())) return true;
  // iOS/some browsers report HEIC photos with an empty or generic MIME type —
  // fall back to checking the extension.
  return /\.hei[cf]$/i.test(file.name);
}

// Converts a HEIC/HEIF photo (iPhone default camera format, not decodable by
// most browsers' canvas APIs) to a JPEG blob the rest of the pipeline can
// read normally. Loaded on demand so non-HEIC uploads never pay for it.
async function convertHeicToJpeg(file: File): Promise<File> {
  const heic2any = (await import("heic2any")).default;
  const result = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.92 });
  const blob = Array.isArray(result) ? result[0] : result;
  const newName = file.name.replace(/\.\w+$/, "") + ".jpg";
  return new File([blob], newName, { type: "image/jpeg" });
}

let webpSupported: boolean | null = null;
function supportsWebP(): boolean {
  if (webpSupported !== null) return webpSupported;
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;
  webpSupported = canvas.toDataURL("image/webp").startsWith("data:image/webp");
  return webpSupported;
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

// Downscales and re-encodes an image client-side so uploads stay under Firebase
// Storage/Firestore-friendly size limits — large phone-camera photos (10-20MB)
// were failing to upload outright. Also normalizes any input format (HEIC,
// PNG, JPEG, etc.) to WebP for the best size/quality ratio, falling back to
// JPEG on browsers without WebP encoding support.
export async function resizeImageFile(file: File): Promise<File> {
  if (file.type === "image/svg+xml") {
    return file;
  }

  // Never let a decode/encode failure (corrupted file, a browser without
  // canvas support) block the upload — fall back to the original file so the
  // user's upload still goes through.
  try {
    const source = isHeic(file) ? await convertHeicToJpeg(file) : file;
    const bitmap = await createImageBitmap(source);
    let { width, height } = bitmap;

    if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
      const scale = MAX_DIMENSION / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return source;
    ctx.drawImage(bitmap, 0, 0, width, height);
    bitmap.close();

    const useWebP = supportsWebP();
    const mimeType = useWebP ? "image/webp" : "image/jpeg";
    const extension = useWebP ? ".webp" : ".jpg";

    let quality = 0.92;
    let blob = await canvasToBlob(canvas, mimeType, quality);

    while (blob && blob.size > MAX_BYTES && quality > 0.4) {
      quality -= 0.1;
      blob = await canvasToBlob(canvas, mimeType, quality);
    }

    if (!blob) {
      return source;
    }

    const newName = source.name.replace(/\.\w+$/, "") + extension;
    return new File([blob], newName, { type: mimeType });
  } catch (err) {
    console.error("resizeImageFile failed, uploading original file:", err);
    return file;
  }
}
