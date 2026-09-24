import type { Car } from "@/data/cars";
import {
  DEFAULT_GRADIENT_COLOR,
  DEFAULT_INSTAGRAM_HANDLE,
  DEFAULT_LOGO_SRC,
  DEFAULT_PRESET,
  defaultPriceText,
  defaultTitle,
  generateInstagramGraphic,
  GRADIENT_INTENSITY_DEFAULT,
  slugify,
} from "@/lib/share/instagram-graphic";

export type ShareCarOutcome = "shared" | "downloaded" | "cancelled";

function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

// There's no official web API to reach into a visitor's Instagram app and drop an
// image straight into a Story/post draft — that capability is only exposed to
// native iOS/Android apps. The closest honest equivalent on the open web:
//   - Phone: the OS-native Share sheet (Web Share API) when it's available, so the
//     visitor picks Instagram from their own installed apps and lands in its
//     normal share flow (Instagram will prompt for login there if the visitor
//     isn't already signed into the app). If the share sheet isn't available (or
//     the browser doesn't support sharing files), we fall back to opening the
//     Instagram app directly via its `instagram://app` URL scheme.
//   - Desktop: no native share target and no app to deep-link into, so we
//     download the image and open instagram.com in a new tab for a manual upload.
export async function shareImageOrOpenInstagram(
  blob: Blob,
  filename: string,
  shareTitle: string,
  shareText: string,
): Promise<ShareCarOutcome> {
  const file = new File([blob], filename, { type: "image/png" });

  const canUseShareSheet =
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare({ files: [file] });

  if (canUseShareSheet) {
    try {
      await navigator.share({ files: [file], title: shareTitle, text: shareText });
      return "shared";
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return "cancelled";
      }
      // Any other share-sheet failure falls through to the download fallback below.
    }
  }

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(url), 2000);

  if (isMobileDevice()) {
    window.location.href = "instagram://app";
  } else {
    window.open("https://www.instagram.com/", "_blank", "noopener,noreferrer");
  }
  return "downloaded";
}

// One-click "Share to Instagram" for a listing card: composite a story-format graphic
// that reproduces the homepage/showroom card itself (the "card" preset — see
// generateInstagramGraphic), then hand it off via shareImageOrOpenInstagram so the
// visitor finishes and posts it themselves in their own Instagram account.
export async function shareCarToInstagram(item: Car): Promise<ShareCarOutcome> {
  const blob = await generateInstagramGraphic({
    imageSrc: item.image,
    logoSrc: DEFAULT_LOGO_SRC,
    title: defaultTitle(item),
    priceText: defaultPriceText(item),
    logoPosition: "right",
    format: "story",
    gradientColor: DEFAULT_GRADIENT_COLOR,
    gradientIntensity: GRADIENT_INTENSITY_DEFAULT,
    instagramHandle: DEFAULT_INSTAGRAM_HANDLE,
    item,
    preset: DEFAULT_PRESET,
  });

  const filename = `${slugify(`${item.year}-${item.make}-${item.model}`)}-drivetime.png`;
  return shareImageOrOpenInstagram(
    blob,
    filename,
    `${item.make} ${item.model}`,
    `${item.make} ${item.model} — ${defaultPriceText(item)} en DriveTime`,
  );
}
