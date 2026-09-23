# Instagram Post Generator Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a staff-only Instagram post generator modal to the admin dashboard's Inventory page, with 3 selectable layout presets, that exports a 1080×1080 PNG client-side via Canvas.

**Architecture:** One new self-contained component, `components/dashboard/instagram-post-modal.tsx`, holding the modal UI, live DOM preview, preset selector, and an internal canvas export function. A new `Sparkles` icon button in `app/dashboard/inventory/page.tsx`'s row actions opens it for that row's vehicle.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, Framer Motion, lucide-react, HTML5 Canvas API (all already available — no new dependencies).

**Spec:** `docs/superpowers/specs/2026-09-17-instagram-post-generator-design.md`

## Global Constraints

- Everything lives in one file: `components/dashboard/instagram-post-modal.tsx`. Do not split it into additional new files.
- Dashboard's own literal `slate-*`/`indigo-*` Tailwind classes — not the public car-detail page's `zinc-*` theme, not the homepage's CSS-variable tokens.
- All UI text in standard, non-voseo Spanish (tú-form), matching the rest of the already-translated dashboard.
- No backend, no new npm packages. Uses `lucide-react` (`Download`, `Edit3`, `Sparkles`, `X`), `framer-motion`, and the browser's native Canvas API.
- Three layout presets (`"bottom-left-logo" | "bottom-top-logo" | "all-bottom"`), default `"bottom-top-logo"` — the bottom gradient and the title/price text block position stay fixed across all three; only the watermark's position (and, for `"all-bottom"`, whether it sits at the bottom instead of the top) changes. `"all-bottom"`'s top region must have zero overlay/watermark.
- The exported `.png` must be exactly 1080×1080, filename a slugified `{year}-{make}-{model}-instagram-post.png`.
- The image gallery source is `carDetails[item.id]?.images` from the existing `data/car-details.ts`, falling back to a single-image array from `item.image` when no entry exists.
- The default price/payment text uses a dedicated local calculation (30% down, 6.9% APR, 60-month term) — the same assumptions as the public car detail page's `CarHeaderInfo`, but NOT imported from it (kept local, matching that file's own precedent of not sharing constants across features).
- No test framework — verification is `npx tsc --noEmit` plus a `curl` check and a manual browser checklist (documented per task; the actual PNG-download and canvas-rendering behavior cannot be verified by `curl`/`tsc` alone — this is a known, called-out verification gap, same as prior un-testable interactive behavior in this codebase).

---

### Task 1: `components/dashboard/instagram-post-modal.tsx`

**Files:**
- Create: `components/dashboard/instagram-post-modal.tsx`

**Interfaces:**
- Consumes: `InventoryItem` type from `@/lib/dashboard-data` (existing); `carDetails`, `CarDetailImage` type from `@/data/car-details` (existing).
- Produces: `InstagramPostModal({ open: boolean; onClose: () => void; item: InventoryItem | null })`. Used by Task 2 (`app/dashboard/inventory/page.tsx`).

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Edit3, X } from "lucide-react";
import type { InventoryItem } from "@/lib/dashboard-data";
import { carDetails, type CarDetailImage } from "@/data/car-details";

type PostPreset = "bottom-left-logo" | "bottom-top-logo" | "all-bottom";

const PRESET_OPTIONS: { id: PostPreset; label: string }[] = [
  { id: "bottom-left-logo", label: "Logo Izquierda" },
  { id: "bottom-top-logo", label: "Logo Arriba" },
  { id: "all-bottom", label: "Todo Abajo" },
];

const currencyPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const PAYMENT_APR = 6.9;
const PAYMENT_TERM_MONTHS = 60;
const PAYMENT_DOWN_RATE = 0.3;

function estimateMonthlyPayment(price: number) {
  const principal = price * (1 - PAYMENT_DOWN_RATE);
  const monthlyRate = PAYMENT_APR / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, PAYMENT_TERM_MONTHS);
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function defaultTitle(item: InventoryItem) {
  return `${item.year} ${item.make} ${item.model}`;
}

function defaultPriceText(item: InventoryItem) {
  return `${currencyPrecise.format(estimateMonthlyPayment(item.price))}/mes`;
}

const CANVAS_SIZE = 1080;
const PADDING = 56;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("No se pudo cargar la imagen"));
    img.src = src;
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

interface PresetLayout {
  watermark: { x: number; y: number; align: "left" | "right" };
  textBlock: { titleY: number; priceY: number };
}

const PRESET_LAYOUTS: Record<PostPreset, PresetLayout> = {
  "bottom-top-logo": {
    watermark: { x: CANVAS_SIZE - PADDING, y: PADDING, align: "right" },
    textBlock: { titleY: CANVAS_SIZE - 170, priceY: CANVAS_SIZE - 100 },
  },
  "bottom-left-logo": {
    watermark: { x: PADDING, y: PADDING, align: "left" },
    textBlock: { titleY: CANVAS_SIZE - 170, priceY: CANVAS_SIZE - 100 },
  },
  "all-bottom": {
    watermark: { x: PADDING, y: CANVAS_SIZE - 280, align: "left" },
    textBlock: { titleY: CANVAS_SIZE - 170, priceY: CANVAS_SIZE - 100 },
  },
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius);
  ctx.lineTo(x + radius, y + height);
  ctx.arcTo(x, y + height, x, y + height - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
}

function drawWatermark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  align: "left" | "right",
) {
  const label = "DRIVETIME";
  ctx.font = "600 22px system-ui, sans-serif";
  const textWidth = ctx.measureText(label).width;
  const paddingX = 20;
  const paddingY = 12;
  const pillWidth = textWidth + paddingX * 2;
  const pillHeight = 22 + paddingY * 2;
  const pillX = align === "right" ? x - pillWidth : x;
  const pillY = y;

  ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
  drawRoundedRect(ctx, pillX, pillY, pillWidth, pillHeight, pillHeight / 2);
  ctx.fill();

  ctx.fillStyle = "#0f172a";
  ctx.textBaseline = "middle";
  ctx.textAlign = "left";
  ctx.fillText(label, pillX + paddingX, pillY + pillHeight / 2 + 1);
}

async function generateInstagramGraphic({
  imageSrc,
  title,
  priceText,
  preset,
}: {
  imageSrc: string;
  title: string;
  priceText: string;
  preset: PostPreset;
}): Promise<Blob> {
  const canvas = document.createElement("canvas");
  canvas.width = CANVAS_SIZE;
  canvas.height = CANVAS_SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se pudo crear el lienzo");

  const img = await loadImage(imageSrc);

  const scale = Math.max(CANVAS_SIZE / img.width, CANVAS_SIZE / img.height);
  const drawWidth = img.width * scale;
  const drawHeight = img.height * scale;
  const offsetX = (CANVAS_SIZE - drawWidth) / 2;
  const offsetY = (CANVAS_SIZE - drawHeight) / 2;
  ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);

  const gradient = ctx.createLinearGradient(0, CANVAS_SIZE * 0.45, 0, CANVAS_SIZE);
  gradient.addColorStop(0, "rgba(0, 0, 0, 0)");
  gradient.addColorStop(1, "rgba(0, 0, 0, 0.85)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, CANVAS_SIZE * 0.45, CANVAS_SIZE, CANVAS_SIZE * 0.55);

  const layout = PRESET_LAYOUTS[preset];
  drawWatermark(ctx, layout.watermark.x, layout.watermark.y, layout.watermark.align);

  const maxTextWidth = CANVAS_SIZE - PADDING * 2;

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.font = "700 58px system-ui, sans-serif";
  const titleLines = wrapText(ctx, title, maxTextWidth).slice(0, 2);
  const titleLineHeight = 64;
  const titleStartY = layout.textBlock.titleY - (titleLines.length - 1) * titleLineHeight;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, PADDING, titleStartY + i * titleLineHeight);
  });

  ctx.font = "600 44px system-ui, sans-serif";
  ctx.fillStyle = "#e2e8f0";
  ctx.fillText(
    priceText,
    PADDING,
    layout.textBlock.priceY + (titleLines.length - 1) * titleLineHeight,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("No se pudo generar la imagen"));
    }, "image/png");
  });
}

const WATERMARK_POSITION_CLASS: Record<PostPreset, string> = {
  "bottom-top-logo": "top-3 right-3",
  "bottom-left-logo": "top-3 left-3",
  "all-bottom": "bottom-24 left-3",
};

const PRESET_DOT_CLASS: Record<PostPreset, string> = {
  "bottom-top-logo": "right-1 top-1",
  "bottom-left-logo": "left-1 top-1",
  "all-bottom": "bottom-2 left-1",
};

export function InstagramPostModal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}) {
  const gallery = useMemo<CarDetailImage[]>(() => {
    if (!item) return [];
    const detail = carDetails[item.id];
    if (detail && detail.images.length > 0) return detail.images;
    return [{ src: item.image, alt: `${item.make} ${item.model}` }];
  }, [item]);

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [priceText, setPriceText] = useState("");
  const [preset, setPreset] = useState<PostPreset>("bottom-top-logo");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !item) return;
    setSelectedImageIndex(0);
    setTitle(defaultTitle(item));
    setPriceText(defaultPriceText(item));
    setPreset("bottom-top-logo");
    setError(null);
  }, [open, item]);

  if (!item) return null;

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const blob = await generateInstagramGraphic({
        imageSrc: gallery[selectedImageIndex]?.src ?? item.image,
        title,
        priceText,
        preset,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slugify(`${item.year}-${item.make}-${item.model}`)}-instagram-post.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      setError("No se pudo generar la imagen. Inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const activeImage = gallery[selectedImageIndex] ?? { src: item.image, alt: item.model };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Generador de Publicación para Instagram
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              <div className="mx-auto w-full max-w-[420px]">
                <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-slate-100">
                  <img
                    src={activeImage.src}
                    alt={activeImage.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                  <span
                    className={`absolute flex items-center rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold tracking-wide text-slate-900 ${WATERMARK_POSITION_CLASS[preset]}`}
                  >
                    DRIVETIME
                  </span>

                  <div className="absolute inset-x-4 bottom-4">
                    <p className="line-clamp-2 text-xl font-bold leading-tight text-white">
                      {title}
                    </p>
                    <p className="mt-1 text-base font-semibold text-slate-200">{priceText}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                    <Edit3 size={13} />
                    Título
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600">Precio / Cuota</label>
                  <input
                    value={priceText}
                    onChange={(e) => setPriceText(e.target.value)}
                    className="h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-900 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600">Diseño</label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPreset(option.id)}
                        className={`flex flex-col items-center gap-2 rounded-xl border p-2 transition-colors ${
                          preset === option.id
                            ? "border-indigo-500 ring-2 ring-indigo-100"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-200">
                          <span className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-400/60" />
                          <span
                            className={`absolute h-2 w-4 rounded-sm bg-white ${PRESET_DOT_CLASS[option.id]}`}
                          />
                          <span className="absolute bottom-1 left-1 h-1 w-6 rounded-sm bg-white/90" />
                        </span>
                        <span className="text-[0.7rem] font-medium text-slate-600">
                          {option.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600">Fotos del vehículo</label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {gallery.map((image, index) => (
                      <button
                        key={image.src + index}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors ${
                          index === selectedImageIndex
                            ? "border-indigo-500"
                            : "border-transparent hover:border-slate-300"
                        }`}
                      >
                        <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="mt-2 flex h-11 items-center justify-center gap-2 rounded-xl bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download size={16} />
                  {isGenerating ? "Generando..." : "Descargar Imagen Final"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
```

Note on the `item: InventoryItem | null` + `if (!item) return null;` pattern: Task 2's caller must NEVER reset `item` back to `null` on close (only flip `open` to `false`) — otherwise the exit animation would have no data to render. The early-return guard only ever matters on the very first render, before any vehicle has been selected. This is spelled out again in Task 2 below.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/dashboard/instagram-post-modal.tsx`. (An error about `app/dashboard/inventory/page.tsx` not yet importing/using this component is not expected — this file doesn't require any change to that page to typecheck standalone.)

- [ ] **Step 3: Commit**

```bash
git add components/dashboard/instagram-post-modal.tsx
git commit -m "feat: add Instagram post generator modal with layout presets"
```

---

### Task 2: Wire up the trigger in the Inventory page

**Files:**
- Modify: `app/dashboard/inventory/page.tsx`

**Interfaces:**
- Consumes: `InstagramPostModal` from `@/components/dashboard/instagram-post-modal` (Task 1).
- Produces: nothing new — adds a trigger button and modal render to the existing page.

- [ ] **Step 1: Add the import**

Add to the existing `lucide-react` import line (currently `import { Pencil, Plus, Search, Trash2 } from "lucide-react";`):

```tsx
import { Pencil, Plus, Search, Sparkles, Trash2 } from "lucide-react";
```

Add a new import below the existing component imports:

```tsx
import { InstagramPostModal } from "@/components/dashboard/instagram-post-modal";
```

- [ ] **Step 2: Add state for the selected vehicle and open flag**

Inside `InventoryPage`, alongside the existing `useState` calls (after `confirmDeleteId`), add:

```tsx
const [instagramItem, setInstagramItem] = useState<InventoryItem | null>(null);
const [instagramOpen, setInstagramOpen] = useState(false);
```

- [ ] **Step 3: Add the trigger button in the row actions cell**

In the table row's actions `<div className="flex items-center justify-end gap-2">`, add a new button — place it before the existing "Editar" pencil button:

```tsx
<button
  type="button"
  aria-label="Generar publicación para Instagram"
  onClick={() => {
    setInstagramItem(item);
    setInstagramOpen(true);
  }}
  className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
>
  <Sparkles size={15} />
</button>
```

- [ ] **Step 4: Render the modal**

After the existing `<Modal ...>...</Modal>` block (the add/edit vehicle modal), before the closing `</motion.div>` of the page, add:

```tsx
<InstagramPostModal
  open={instagramOpen}
  onClose={() => setInstagramOpen(false)}
  item={instagramItem}
/>
```

Critical: the `onClose` handler here only sets `instagramOpen` to `false` — it must NOT also clear `instagramItem` back to `null`. Clearing the item immediately on close would remove the data the modal's exit animation needs to render while fading out. `instagramItem` naturally gets replaced with a new value the next time a different row's Sparkles button is clicked; it never needs to be reset to `null` after the first open.

- [ ] **Step 5: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 6: Verify in the dev server**

Run: `curl -s http://localhost:PORT/dashboard/inventory -o /dev/null -w "%{http_code}\n"` (substitute the actual running port — check the terminal, do not assume 3000, an unrelated process typically occupies it in this environment)
Expected: `200`

Manual check in a browser, logged into the dashboard, on `/dashboard/inventory`:
- Each row now shows a sparkle icon button alongside the pencil/trash icons.
- Clicking it opens the Instagram post modal for that specific vehicle, pre-filled with its year/make/model title and a computed `.../mes` payment string.
- Editing the título and precio/cuota fields updates the live preview text in real time.
- Clicking each of the 3 "Diseño" preset cards moves the DRIVETIME watermark pill in the live preview: top-right (Logo Arriba), top-left (Logo Izquierda), and down near the bottom text block with nothing at the top (Todo Abajo).
- Clicking a thumbnail in "Fotos del vehículo" swaps the preview's background photo.
- Clicking "Descargar Imagen Final" produces a downloaded `.png` file (check the browser's downloads) named like `2023-bmw-m5-instagram-post.png`; open it and confirm it's a 1080×1080 image with the photo, gradient, watermark, and text baked in, in the position matching whichever preset was selected. This is the one behavior that cannot be verified via `curl`/`tsc` — flag explicitly if a real browser check wasn't possible in the environment doing this verification.
- Closing the modal (X button or backdrop click) and reopening it for a DIFFERENT vehicle shows that vehicle's own data, not the previous one's.

- [ ] **Step 7: Commit**

```bash
git add app/dashboard/inventory/page.tsx
git commit -m "feat: add Instagram post generator trigger to inventory table"
```

---

## Final check (after Task 2)

- [ ] Run `npx tsc --noEmit` once more against the whole project — expect zero errors.
- [ ] Run through the manual checklist end-to-end once more, on at least 2 different vehicles, confirming all 3 presets produce visually distinct, non-overlapping exported PNGs.
