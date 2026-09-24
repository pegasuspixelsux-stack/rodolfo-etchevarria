import type { Car } from "@/data/cars";
import { isAllowedImageUrl } from "@/lib/image-hosts";
import { carDetails, buildFallbackDetail } from "@/data/car-details";

export type LogoPosition = "left" | "center" | "right";
export type PostFormat = "square" | "feed" | "story";
// "card" reproduces the homepage listing card 1:1 (script watermark, bottom
// gradient, title, options, price) and always renders at the card's own 9:16
// aspect — the format picker is ignored for it. "classic" is the original
// dealer-branded template (logo, disclaimer, footer stripe) at any format.
export type PostPreset = "card" | "classic";

export const DEFAULT_PRESET: PostPreset = "card";

// Matches the watermark text hardcoded onto the homepage/showroom CarCard —
// kept as a single constant so the two stay in sync.
export const DEFAULT_BRAND_NAME = "Rodolfo Etchevarria";

const BODY_TYPE_LABELS: Record<string, string> = {
  Sedan: "Sedán",
  SUV: "SUV",
  Coupe: "Cupé",
};

export const FORMAT_OPTIONS: {
  id: PostFormat;
  label: string;
  width: number;
  height: number;
  aspectClass: string;
}[] = [
  { id: "square", label: "Cuadrado", width: 1080, height: 1080, aspectClass: "aspect-square" },
  { id: "feed", label: "Feed 4:5", width: 1080, height: 1350, aspectClass: "aspect-[4/5]" },
  { id: "story", label: "Historia 9:16", width: 1080, height: 1920, aspectClass: "aspect-[9/16]" },
];

// Dealers pick their own brand color for the gradient instead of a fixed dark/light choice.
// Text and stripe contrast then follow automatically from that color's luminance.
export const DEFAULT_GRADIENT_COLOR = "#000000";

export const GRADIENT_INTENSITY_MIN = 40;
export const GRADIENT_INTENSITY_MAX = 100;
export const GRADIENT_INTENSITY_STEP = 10;
export const GRADIENT_INTENSITY_DEFAULT = 100;

export const FUEL_TYPE_LABELS: Record<string, string> = {
  Gasoline: "Nafta",
  Hybrid: "Híbrido",
  Electric: "Eléctrico",
};

export const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export const mileageFormat = new Intl.NumberFormat("en-US");

export const PAYMENT_APR = 6.9;
export const PAYMENT_TERM_MONTHS = 60;
export const PAYMENT_DOWN_RATE = 0.3;

export function estimateMonthlyPayment(price: number) {
  const principal = price * (1 - PAYMENT_DOWN_RATE);
  const monthlyRate = PAYMENT_APR / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, PAYMENT_TERM_MONTHS);
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function defaultTitle(item: Car) {
  return `${item.make} ${item.model}`;
}

export function defaultPriceText(item: Car) {
  return `${currency.format(estimateMonthlyPayment(item.price))}/mes`;
}

// The "card" preset must show the exact figure the homepage/showroom CarCard displays for
// this same car, which is computed with different loan terms than the "classic" preset's
// estimateMonthlyPayment above (6.5% APR / 30% down vs. 6.9% / 30%) — duplicated here rather
// than shared so a future change to either estimate doesn't silently change the other.
const CARD_ESTIMATE_APR = 6.5;
const CARD_ESTIMATE_TERM_MONTHS = 60;
const CARD_ESTIMATE_DOWN_RATE = 0.3;

// Fine-print shown wherever the card's estimated monthly payment appears — the homepage/
// showroom CarCard and the "card" IG preset both import this so the wording (and the terms
// it describes) can never drift apart between the two places it's shown.
export const CARD_PAYMENT_DISCLAIMER =
  "Pago estimado con 30% de seña, 6.5% APR a 60 meses. Sujeto a aprobación de crédito.";

function estimateCardMonthlyPayment(price: number) {
  const principal = price * (1 - CARD_ESTIMATE_DOWN_RATE);
  const monthlyRate = CARD_ESTIMATE_APR / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, CARD_ESTIMATE_TERM_MONTHS);
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const value = parseInt(clean.length === 3 ? clean.replace(/(.)/g, "$1$1") : clean, 16);
  return [(value >> 16) & 255, (value >> 8) & 255, value & 255];
}

// Whether a color reads as "dark" (needs light text/overlay on top of it), using the
// standard perceptual-luminance weighting rather than a plain RGB average.
export function isColorDark([r, g, b]: [number, number, number]): boolean {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.5;
}

export const PADDING = 56;

// The dealership's brand mark, pulled from the global system configuration. Staff can
// override it per-graphic (see "Identidad de Marca") without touching this default.
export const DEFAULT_LOGO_SRC = "/drivetime-logo.svg";
export const LOGO_MAX_WIDTH = 220;
export const LOGO_MAX_HEIGHT = 64;

export const FOOTER_STRIPE_HEIGHT = 64;

// The dealership's Instagram handle for the stripe's "Visítenos" line. Staff can override it
// per-graphic (see "Instagram" in the edit pane) the same way they can override the logo.
export const DEFAULT_INSTAGRAM_HANDLE = "@rodolfoetchevarria";

export const DISCLAIMER_TEXT =
  "Pago calculado con 30% de seña, 6.9% de interés en 60 cuotas sujeto a aprobación de crédito.";

// The single vertical stride that governs every gap AND every multi-line block in the
// bottom text stack (title / specs+pricing / disclaimer), for all three presets. Title
// lines use a 2x multiple of it; every other stride -- the gap between rows and the gap
// between a stacked pricing line and its total-price line -- is exactly 1x. This is what
// keeps the grid mathematically consistent instead of each row inventing its own spacing.
export const LINE_HEIGHT = 16;
export const TITLE_LINE_HEIGHT = LINE_HEIGHT * 2;
export const ASCENT_FALLBACK = 24;
export const DESCENT_FALLBACK = 14;

export const TITLE_FONT = "800 58px system-ui, sans-serif";
export const SPECS_FONT = "600 32px system-ui, sans-serif";
export const PAYMENT_FONT = "700 46px system-ui, sans-serif";
export const TOTAL_PRICE_FONT = "500 26px system-ui, sans-serif";
export const DISCLAIMER_FONT = "400 16px system-ui, sans-serif";

// Firebase Storage (and most remote image hosts) don't send
// Access-Control-Allow-Origin, so loading a listing photo straight into the canvas
// would taint it and canvas.toBlob() would throw. Route allow-listed remote images
// through our same-origin proxy; local paths and data: URLs (an uploaded logo) are
// already safe and pass through untouched.
export function resolveShareableImageSrc(src: string): string {
  if (src.startsWith("data:") || src.startsWith("/")) return src;
  if (isAllowedImageUrl(src)) {
    return `/api/share-image?src=${encodeURIComponent(src)}`;
  }
  return src;
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = resolveShareableImageSrc(src);
  });
}

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) lines.push(currentLine);
  return lines;
}

// The homepage/showroom watermark title is set in the site's script font, loaded via
// next/font as the CSS variable --font-script on <html>. Canvas text can't reference a CSS
// variable directly, so we read the generated font-family name back out of computed style —
// the value next/font actually assigned — and use that in ctx.font.
function getScriptFontFamily(): string {
  if (typeof document === "undefined") return "cursive";
  const value = getComputedStyle(document.documentElement).getPropertyValue("--font-script").trim();
  return value || "cursive";
}

/**
 * Reproduces the homepage/showroom CarCard (portrait layout) as a 1080x1920 canvas:
 * full-bleed photo, bottom-third gradient, script watermark, title + specs + options +
 * price stacked bottom-left. No logo, no disclaimer, no footer stripe — this preset IS
 * the card, not a separate dealer-branded template.
 */
// The live CarCard is measured at a 320px-wide rendered box (the dashboard preview's own
// container width) — every size below is a CSS px value taken straight from car-card.tsx's
// classes at that width's active container-query tier (@[220px], not @[380px]), multiplied
// by this scale to land at the correct spot on the 1080-wide export canvas. Using one scale
// derived from real DOM measurements (not hand-picked canvas px) is what keeps this in sync.
const CARD_PREVIEW_WIDTH = 320;
const CARD_BODY_FONT = "Geist, system-ui, sans-serif";
const CARD_HEADING_FONT = "Inter, system-ui, sans-serif";

// Baseline = (top of the line-height box) + measured ascent — this is exact regardless of
// font metrics, matching how drawBottomBlock already anchors the "classic" preset's text.
function ascentOf(ctx: CanvasRenderingContext2D, text: string, fontSizePx: number): number {
  return ctx.measureText(text).actualBoundingBoxAscent || fontSizePx * 0.75;
}

// For a flex row aligned with `items-end`, every child's box BOTTOM lines up at `rowBottom`
// regardless of its own line-height — so its baseline sits rowBottom minus its own descent.
function bottomAlignedBaseline(
  ctx: CanvasRenderingContext2D,
  text: string,
  fontSizePx: number,
  lineHeightMultiplier: number,
  rowBottom: number,
): number {
  const lineHeight = fontSizePx * lineHeightMultiplier;
  const descent = lineHeight - ascentOf(ctx, text, fontSizePx);
  return rowBottom - descent;
}

// Instagram re-crops a 9:16 image posted to the FEED (as opposed to an actual Story/Reel)
// down to roughly 4:5, centered, silently cutting off the top and bottom. Everything that
// matters — the watermark, the whole text block — has to live inside that centered 4:5
// "safe area", not just inside the full 9:16 canvas, or Instagram's own feed crop clips it.
const SAFE_CROP_HEIGHT_TO_WIDTH = 5 / 4;

function drawCardPresetContent(
  ctx: CanvasRenderingContext2D,
  { width, height, item }: { width: number; height: number; item: Car },
) {
  const scale = width / CARD_PREVIEW_WIDTH;
  const rem = (value: number) => value * 16 * scale;
  const PAD = rem(1); // p-4 = 16px = 1rem

  const safeHeight = width * SAFE_CROP_HEIGHT_TO_WIDTH;
  const safeTop = (height - safeHeight) / 2;
  const safeBottom = safeTop + safeHeight;

  // Gradient: rgba(0,0,0,0.92) solid from the bottom up to 43% of the height, fading to
  // transparent by 68% — the CarCard stops boosted +10%, matching the "Estilo Card"/
  // "IG Portrait" preview's previewGradientBoostPercent.
  const gradient = ctx.createLinearGradient(0, height * 0.32, 0, height);
  gradient.addColorStop(0, "rgba(0,0,0,0)");
  gradient.addColorStop((0.57 - 0.32) / (1 - 0.32), "rgba(0,0,0,0.92)");
  gradient.addColorStop(1, "rgba(0,0,0,0.92)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, height * 0.32, width, height - height * 0.32);

  // Watermark: pinned near the safe area's top edge (not the canvas's own top-3) so
  // Instagram's feed crop doesn't clip it — nudged 5% of the canvas height above that edge.
  const scriptFont = getScriptFontFamily();
  const watermarkSize = rem(2.4);
  const watermarkTop = safeTop - height * 0.05;
  ctx.textBaseline = "alphabetic";
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 10 * scale;
  ctx.font = `${watermarkSize}px ${scriptFont}`;
  ctx.fillText(DEFAULT_BRAND_NAME, width / 2, watermarkTop + PAD + ascentOf(ctx, DEFAULT_BRAND_NAME, watermarkSize));
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;

  const detail = carDetails[item.id] ?? buildFallbackDetail(item);
  const shortDescription = detail.editorial.dek;
  const options = detail.features.flatMap((group) => group.items).slice(0, 3);

  // The bottom text block: absolute inset-x-0 bottom-0, content-sized (no fixed top), anchored
  // by `bottom` — same as the live CarCard now that the flex-1 stretch spacer is gone. Every
  // gap in the block (including divider-to-price) is the SAME uniform gap-2, so the block's
  // total height is just measured once and the whole thing anchored from `contentBottom`.
  // contentBottom sits 5% of the canvas height below the safe area's own bottom edge (the
  // live preview's previewLiftPercent was reduced by that same 5%), and PAD (16px) all around.
  const GAP = rem(0.5); // gap-2 = 8px = 0.5rem
  const maxTextWidth = width - PAD * 2;
  const contentBottom = safeBottom + height * 0.05 - PAD;

  const titleSize = rem(1.575); // font-heading @[220px]:text-[1.575rem], font-normal
  const titleLineHeight = titleSize * 1.15; // leading-tight, compressed
  const colorSize = rem(0.8); // @[220px]:text-[0.8rem]
  const colorLineHeight = colorSize * 1.3; // leading-normal, compressed
  const specsSize = rem(0.75); // @[220px]:text-[0.75rem]
  const specsLineHeight = specsSize * 1.3;
  const descSize = rem(0.78); // text-[0.78rem], no @ variant
  const descLineHeight = descSize * 1.2; // leading-snug, compressed
  const chipSize = rem(0.68); // text-[0.68rem]
  const chipPaddingX = rem(0.5); // px-2
  const chipPaddingY = rem(0.125); // py-0.5
  const chipBorder = 1 * scale;
  const chipGap = rem(0.375); // gap-1.5, both axes
  const chipLineHeight = chipSize * 1.3;
  const chipHeight = chipLineHeight + chipPaddingY * 2 + chipBorder * 2;

  const bodyLabel = BODY_TYPE_LABELS[item.bodyType] ?? item.bodyType;
  const colorText = `${item.color}  ·  ${bodyLabel}`;
  const fuelLabel = FUEL_TYPE_LABELS[item.fuelType] ?? item.fuelType;
  const specsText = `${item.year}    ${mileageFormat.format(item.mileage)} km    ${fuelLabel}`;

  ctx.font = `400 ${titleSize}px ${CARD_HEADING_FONT}`;
  const titleLines = wrapText(ctx, `${item.make} ${item.model}`, maxTextWidth).slice(0, 2);
  ctx.font = `400 ${descSize}px ${CARD_BODY_FONT}`;
  const descriptionLines = shortDescription ? wrapText(ctx, shortDescription, maxTextWidth).slice(0, 2) : [];

  type ChipRow = { text: string; width: number }[];
  const chipRows: ChipRow[] = [[]];
  if (options.length > 0) {
    ctx.font = `400 ${chipSize}px ${CARD_BODY_FONT}`;
    let rowWidth = 0;
    for (const option of options) {
      const chipWidth = ctx.measureText(option).width + chipPaddingX * 2 + chipBorder * 2;
      if (rowWidth + chipWidth > maxTextWidth && chipRows[chipRows.length - 1].length > 0) {
        chipRows.push([]);
        rowWidth = 0;
      }
      chipRows[chipRows.length - 1].push({ text: option, width: chipWidth });
      rowWidth += chipWidth + chipGap;
    }
  }

  // --- Measure the leading group's total height first (title through the divider), then
  // anchor the whole block so its LAST row (disclaimer) lands exactly on contentBottom —
  // mirrors a content-sized flex column anchored by `bottom`, not a fixed top guess. ---
  let leadingHeight = 11 * scale; // marginTop on the title wrapper, generator-only
  leadingHeight += titleLineHeight * titleLines.length;
  leadingHeight += 12 * scale; // mt-0.5 (2px) + an extra 10px under the title, generator-only
  leadingHeight += colorLineHeight + GAP;
  if (descriptionLines.length > 0) {
    leadingHeight += descLineHeight * descriptionLines.length + GAP;
  }
  if (options.length > 0) {
    leadingHeight += chipRows.length * chipHeight + (chipRows.length - 1) * chipGap + GAP;
  }
  leadingHeight += specsLineHeight + GAP; // specs row
  // divider itself is a hairline with no height of its own beyond the GAP on either side

  const disclaimerSize = rem(0.62);
  const disclaimerLineHeight = disclaimerSize * 1.2; // leading-snug, compressed
  ctx.font = `400 ${disclaimerSize}px ${CARD_BODY_FONT}`;
  const disclaimerLines = wrapText(ctx, CARD_PAYMENT_DISCLAIMER, maxTextWidth).slice(0, 2);
  const priceRowHeight = rem(1.8); // price row's own leading-none height dominates

  const trailingHeight = priceRowHeight + GAP + disclaimerLineHeight * disclaimerLines.length;
  const blockHeight = leadingHeight + GAP + trailingHeight;
  const contentTop = contentBottom - blockHeight;

  // --- Leading group: title, description, options, specs, divider — drawn top-down from
  // contentTop using the heights just measured. ---
  let topY = contentTop + 11 * scale; // marginTop on the title wrapper, generator-only

  ctx.font = `400 ${titleSize}px ${CARD_HEADING_FONT}`;
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  titleLines.forEach((line) => {
    ctx.fillText(line, PAD, topY + ascentOf(ctx, line, titleSize));
    topY += titleLineHeight;
  });

  topY += 12 * scale; // mt-0.5 (2px) + an extra 10px under the title, generator-only
  ctx.font = `400 ${colorSize}px ${CARD_BODY_FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(colorText, PAD, topY + ascentOf(ctx, colorText, colorSize));
  topY += colorLineHeight + GAP;

  if (descriptionLines.length > 0) {
    ctx.font = `400 ${descSize}px ${CARD_BODY_FONT}`;
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    descriptionLines.forEach((line) => {
      ctx.fillText(line, PAD, topY + ascentOf(ctx, line, descSize));
      topY += descLineHeight;
    });
    topY += GAP;
  }

  if (options.length > 0) {
    ctx.font = `400 ${chipSize}px ${CARD_BODY_FONT}`;
    for (const row of chipRows) {
      let chipX = PAD;
      for (const chip of row) {
        ctx.fillStyle = "rgba(255,255,255,0.1)";
        ctx.fillRect(chipX, topY, chip.width, chipHeight);
        ctx.strokeStyle = "rgba(255,255,255,0.2)";
        ctx.lineWidth = chipBorder;
        ctx.strokeRect(chipX, topY, chip.width, chipHeight);
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.textAlign = "left";
        ctx.fillText(chip.text, chipX + chipPaddingX, topY + chipPaddingY + ascentOf(ctx, chip.text, chipSize));
        chipX += chip.width + chipGap;
      }
      topY += chipHeight + chipGap;
    }
    topY += GAP - chipGap;
  }

  ctx.font = `400 ${specsSize}px ${CARD_BODY_FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.textAlign = "left";
  ctx.fillText(specsText, PAD, topY + ascentOf(ctx, specsText, specsSize));
  topY += specsLineHeight + GAP;

  // Divider: border-t (1px) — its own row in the flex column.
  ctx.strokeStyle = "rgba(255,255,255,0.15)";
  ctx.lineWidth = 1 * scale;
  ctx.beginPath();
  ctx.moveTo(PAD, topY);
  ctx.lineTo(width - PAD, topY);
  ctx.stroke();

  // --- Trailing group: price row, disclaimer — same uniform GAP below the divider as every
  // other row pair (no more elastic stretch), ending exactly at contentBottom. ---
  ctx.font = `400 ${disclaimerSize}px ${CARD_BODY_FONT}`;
  const disclaimerBlockTop = contentBottom - disclaimerLineHeight * disclaimerLines.length;
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.textAlign = "left";
  disclaimerLines.forEach((line, i) => {
    const lineTop = disclaimerBlockTop + i * disclaimerLineHeight;
    ctx.fillText(line, PAD, lineTop + ascentOf(ctx, line, disclaimerSize));
  });

  const priceRowBottom = disclaimerBlockTop - GAP;
  const priceLeftSize = rem(0.75); // @[220px]:text-[0.75rem], leading-normal
  const priceRightSize = rem(1.8); // @[220px]:text-[1.8rem], font-semibold, leading-none
  const priceSuffixSize = rem(0.75); // @[220px]:text-[0.75rem], font-normal

  const priceLeftText = `Precio ${currency.format(item.price)}`;
  ctx.font = `400 ${priceLeftSize}px ${CARD_BODY_FONT}`;
  const priceLeftBaseline = bottomAlignedBaseline(ctx, priceLeftText, priceLeftSize, 1.5, priceRowBottom);
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.textAlign = "left";
  ctx.fillText(priceLeftText, PAD, priceLeftBaseline);

  const monthlyText = currency.format(estimateCardMonthlyPayment(item.price));
  const mesText = "/mes";
  ctx.font = `400 ${priceSuffixSize}px ${CARD_BODY_FONT}`;
  const mesWidth = ctx.measureText(mesText).width;
  ctx.font = `600 ${priceRightSize}px ${CARD_BODY_FONT}`;
  const monthlyWidth = ctx.measureText(monthlyText).width;
  const priceRightBaseline = bottomAlignedBaseline(ctx, monthlyText, priceRightSize, 1, priceRowBottom);
  const monthlyX = width - PAD - mesWidth - monthlyWidth;

  ctx.fillStyle = "#60a5fa";
  ctx.textAlign = "left";
  ctx.fillText(monthlyText, monthlyX, priceRightBaseline);

  ctx.font = `400 ${priceSuffixSize}px ${CARD_BODY_FONT}`;
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.fillText(mesText, width - PAD - mesWidth, priceRightBaseline);
}

// Fits an image within a box, preserving aspect ratio (equivalent to object-fit: contain).
function fitContain(naturalWidth: number, naturalHeight: number, maxWidth: number, maxHeight: number) {
  const ratio = Math.min(maxWidth / naturalWidth, maxHeight / naturalHeight);
  return { width: naturalWidth * ratio, height: naturalHeight * ratio };
}

// Draws the brand logo fit-contain within LOGO_MAX_WIDTH x LOGO_MAX_HEIGHT, anchored at
// (x, y) — y is the box's TOP edge, x is the left/right/center anchor per `align`.
function drawLogo(
  ctx: CanvasRenderingContext2D,
  logoImg: HTMLImageElement,
  x: number,
  y: number,
  align: LogoPosition,
): { width: number; height: number } {
  const box = fitContain(logoImg.width, logoImg.height, LOGO_MAX_WIDTH, LOGO_MAX_HEIGHT);
  const drawX = align === "right" ? x - box.width : align === "center" ? x - box.width / 2 : x;
  ctx.drawImage(logoImg, drawX, y, box.width, box.height);
  return box;
}

// A solid opaque band pinned to the true canvas bottom, drawn dead last so it always sits
// on top of the image/gradient/content. Every bottom-anchored element positions itself
// against `contentBottom` (canvasHeight - FOOTER_STRIPE_HEIGHT), not the raw canvas height,
// so nothing is ever drawn underneath this stripe in the first place. Filled with the
// dealer's own picked brand color (not a fixed black/white) so the stripe reads as part of
// the same brand gradient as the overlay above it. Carries both the dealer tagline (built
// from the editable Instagram handle) and "Link in Bio" -- plain reference text, not a
// clickable link, since this is a flattened PNG -- centered together as one line.
function drawFooterStripe(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stripeColor: string,
  isDark: boolean,
  instagramHandle: string,
) {
  ctx.fillStyle = stripeColor;
  ctx.fillRect(0, height - FOOTER_STRIPE_HEIGHT, width, FOOTER_STRIPE_HEIGHT);

  const textColor = isDark ? "#ffffff" : "#0f172a";
  const stripeCenterY = height - FOOTER_STRIPE_HEIGHT / 2 + 1;
  ctx.font = "600 30px system-ui, sans-serif";
  ctx.fillStyle = textColor;
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.fillText(`Visítenos ${instagramHandle}   •   Link in Bio`, width / 2, stripeCenterY);
}

/**
 * The bottom text block, built bottom-up (disclaimer → specs/total price → title → monthly
 * payment) so every row's position is derived from the ACTUAL measured edge of the row below
 * it — never from a static Y value that a sibling separately "compensates" for — so wrapping
 * text can never silently desync two unrelated rows. Every gap is exactly one LINE_HEIGHT;
 * the title's wrapped-line stride is exactly two. The brand logo is always drawn independently
 * at the top of the canvas (see the caller's logoPosition handling), entirely decoupled from
 * this block's height.
 */
function drawBottomBlock(
  ctx: CanvasRenderingContext2D,
  {
    width,
    contentBottom,
    title,
    item,
    priceText,
    primaryColor,
    secondaryColor,
    disclaimerColor,
  }: {
    width: number;
    contentBottom: number;
    title: string;
    item: Car;
    priceText: string;
    primaryColor: string;
    secondaryColor: string;
    disclaimerColor: string;
  },
) {
  const maxTextWidth = width - PADDING * 2;
  ctx.textBaseline = "alphabetic";

  // Row D (bottom-most): the disclaimer, centered, sitting LINE_HEIGHT above the stripe.
  ctx.font = DISCLAIMER_FONT;
  const disclaimerLines = wrapText(ctx, DISCLAIMER_TEXT, maxTextWidth).slice(0, 2);
  const disclaimerLastBaselineY = contentBottom - LINE_HEIGHT;
  const disclaimerStartY = disclaimerLastBaselineY - (disclaimerLines.length - 1) * LINE_HEIGHT;
  const disclaimerAscent =
    ctx.measureText(disclaimerLines[0] ?? "").actualBoundingBoxAscent || ASCENT_FALLBACK;
  const disclaimerTopY = disclaimerStartY - disclaimerAscent;

  // Row C: specs (left) + total cash price (right), sitting LINE_HEIGHT above the
  // disclaimer's top edge. Both share one baseline, so the row's vertical footprint is
  // governed by whichever of the two fonts actually has the bigger ascent/descent --
  // measured, not assumed.
  const totalPriceText = currency.format(item.price);
  ctx.font = TOTAL_PRICE_FONT;
  const totalPriceMetrics = ctx.measureText(totalPriceText);
  const fuelLabel = FUEL_TYPE_LABELS[item.fuelType] ?? item.fuelType;
  const leftSegments = [String(item.year), `${mileageFormat.format(item.mileage)} km`, fuelLabel];
  ctx.font = SPECS_FONT;
  const specsMetrics = ctx.measureText(leftSegments[0]);

  const row3Descent =
    Math.max(specsMetrics.actualBoundingBoxDescent || 0, totalPriceMetrics.actualBoundingBoxDescent || 0) ||
    DESCENT_FALLBACK;
  const row3Ascent =
    Math.max(specsMetrics.actualBoundingBoxAscent || 0, totalPriceMetrics.actualBoundingBoxAscent || 0) ||
    ASCENT_FALLBACK;
  const row3BaselineY = disclaimerTopY - LINE_HEIGHT - row3Descent;
  const row3TopY = row3BaselineY - row3Ascent;

  // Row B: title, sitting LINE_HEIGHT above row C's top edge, wrapping up to 2 lines at
  // TITLE_LINE_HEIGHT (2x) stride.
  ctx.font = TITLE_FONT;
  const titleLines = wrapText(ctx, title, maxTextWidth).slice(0, 2);
  const titleLastLineDescent =
    ctx.measureText(titleLines[titleLines.length - 1] ?? "").actualBoundingBoxDescent || DESCENT_FALLBACK;
  const titleLastBaselineY = row3TopY - LINE_HEIGHT - titleLastLineDescent;
  const titleStartY = titleLastBaselineY - (titleLines.length - 1) * TITLE_LINE_HEIGHT;
  const titleTopY =
    titleStartY - (ctx.measureText(titleLines[0] ?? "").actualBoundingBoxAscent || ASCENT_FALLBACK);

  // Row A (topmost): the monthly payment, called out above the heading, sitting LINE_HEIGHT
  // above the title's top edge.
  ctx.font = PAYMENT_FONT;
  const paymentDescent = ctx.measureText(priceText).actualBoundingBoxDescent || DESCENT_FALLBACK;
  const paymentBaselineY = titleTopY - LINE_HEIGHT - paymentDescent;

  // --- draw row A: payment ---
  ctx.font = PAYMENT_FONT;
  ctx.fillStyle = primaryColor;
  ctx.textAlign = "right";
  ctx.fillText(priceText, width - PADDING, paymentBaselineY);

  // --- draw row B: title ---
  ctx.font = TITLE_FONT;
  ctx.fillStyle = primaryColor;
  ctx.textAlign = "left";
  titleLines.forEach((line, i) => {
    ctx.fillText(line, PADDING, titleStartY + i * TITLE_LINE_HEIGHT);
  });

  // --- draw row C: specs (left) + total cash price (right) ---
  ctx.font = SPECS_FONT;
  ctx.fillStyle = secondaryColor;
  ctx.textAlign = "left";
  let cursorX = PADDING;
  leftSegments.forEach((segment, index) => {
    const text = index < leftSegments.length - 1 ? `${segment}  |  ` : segment;
    ctx.fillText(text, cursorX, row3BaselineY);
    cursorX += ctx.measureText(text).width;
  });

  ctx.font = TOTAL_PRICE_FONT;
  ctx.fillStyle = secondaryColor;
  ctx.textAlign = "right";
  ctx.fillText(totalPriceText, width - PADDING, row3BaselineY);

  // --- draw row D: disclaimer, centered ---
  ctx.font = DISCLAIMER_FONT;
  ctx.fillStyle = disclaimerColor;
  ctx.textAlign = "center";
  disclaimerLines.forEach((line, i) => {
    ctx.fillText(line, width / 2, disclaimerStartY + i * LINE_HEIGHT);
  });
}

export async function generateInstagramGraphic({
  imageSrc,
  logoSrc,
  title,
  priceText,
  logoPosition,
  format,
  gradientColor,
  gradientIntensity,
  instagramHandle,
  item,
  preset = DEFAULT_PRESET,
}: {
  imageSrc: string;
  logoSrc: string;
  title: string;
  priceText: string;
  logoPosition: LogoPosition;
  format: PostFormat;
  gradientColor: string;
  gradientIntensity: number;
  instagramHandle: string;
  item: Car;
  preset?: PostPreset;
}): Promise<Blob> {
  // "card" always renders at the CarCard's own 9:16 aspect, matching the homepage exactly —
  // the chosen format is only meaningful for the "classic" preset.
  const { width, height } =
    preset === "card"
      ? FORMAT_OPTIONS.find((f) => f.id === "story")!
      : FORMAT_OPTIONS.find((f) => f.id === format) ?? FORMAT_OPTIONS[0];

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el lienzo");

  if (typeof document !== "undefined" && "fonts" in document) {
    await document.fonts.ready;
  }

  const [img, logoImg] = await Promise.all([
    loadImage(imageSrc),
    preset === "card" ? Promise.resolve(null) : loadImage(logoSrc),
  ]);

  const scale = Math.max(width / img.width, height / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  // The "card" preset mirrors CarCard's own object-position (center 43%, after the
  // preview's +10% shift) instead of dead-center, so the crop matches the live preview.
  const verticalPositionPercent = preset === "card" ? 43 : 50;
  const offsetX = (width - drawWidth) / 2;
  const offsetY = (height - drawHeight) * (verticalPositionPercent / 100);
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  if (preset === "card") {
    drawCardPresetContent(ctx, { width, height, item });
    return new Promise((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("No se pudo generar la imagen"));
      }, "image/png");
    });
  }

  const [r, g, b] = hexToRgb(gradientColor);
  const isDark = isColorDark([r, g, b]);
  const gradTop = height * 0.45;
  const gradientRgb = `${r}, ${g}, ${b}`;
  const gradientAlpha = gradientIntensity / 100;
  const gradient = ctx.createLinearGradient(0, gradTop, 0, height);
  gradient.addColorStop(0, `rgba(${gradientRgb}, 0)`);
  gradient.addColorStop(1, `rgba(${gradientRgb}, ${gradientAlpha})`);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, gradTop, width, height - gradTop);

  const primaryColor = isDark ? "#ffffff" : "#0f172a";
  const secondaryColor = isDark ? "#e2e8f0" : "#334155";
  const disclaimerColor = isDark ? "rgba(226, 232, 240, 0.65)" : "rgba(51, 65, 85, 0.65)";

  // Every bottom-anchored element positions itself against contentBottom, not the raw canvas
  // height, leaving a clear FOOTER_STRIPE_HEIGHT band for the stripe drawn at the very end --
  // nothing above ever needs to know the stripe exists.
  const contentBottom = height - FOOTER_STRIPE_HEIGHT;

  // The logo is drawn independently at the top of the canvas, decoupled from the bottom
  // block's height. Its horizontal position (left / center / right) is the only layout
  // choice the dealer makes -- everything else in the bottom block is fixed.
  const logoX =
    logoPosition === "left" ? PADDING : logoPosition === "right" ? width - PADDING : width / 2;
  // Only the "classic" preset reaches this point (the "card" branch returns above), so the
  // logo was always requested and loaded.
  drawLogo(ctx, logoImg!, logoX, PADDING, logoPosition);

  drawBottomBlock(ctx, {
    width,
    contentBottom,
    title,
    item,
    priceText,
    primaryColor,
    secondaryColor,
    disclaimerColor,
  });

  drawFooterStripe(ctx, width, height, gradientColor, isDark, instagramHandle);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo generar la imagen"));
    }, "image/png");
  });
}
