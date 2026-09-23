# Instagram Post Generator — Design

Date: 2026-09-17

## Purpose

Add a staff-only tool to the admin dashboard's Inventory page that generates
a ready-to-post 1080×1080 Instagram marketing graphic for a vehicle,
customizable in a modal and exported client-side as a downloadable PNG. No
backend exists in this project — image generation happens entirely in the
browser via the Canvas API.

## Trigger

A new `Sparkles` icon button in `app/dashboard/inventory/page.tsx`'s table
row actions (alongside the existing Editar/Eliminar buttons), opening
`InstagramPostModal` for that row's `InventoryItem`. Staff-only by
construction — the dashboard is already auth-gated
(`app/dashboard/layout.tsx`).

## File

Everything lives in one new file, per the explicit requirement:
`components/dashboard/instagram-post-modal.tsx` — the modal shell, the
split-screen preview/controls UI, and the canvas export engine (an internal
async function) all live together. No new shared/lib files.

`InstagramPostModal({ open, onClose, item }: { open: boolean; onClose: () =>
void; item: InventoryItem })`.

## Visual system

Matches the dashboard's existing self-contained light theme: literal
`slate-*`/`indigo-*` Tailwind classes (NOT the public car-detail page's
`zinc-*` theme, NOT the homepage's CSS-variable tokens). All UI text is in
the same standard (non-voseo) Spanish the rest of the dashboard was just
translated to — this is new dashboard copy, so it must match, even though
the original feature request described the labels in English.

## Data sourcing

- Title default: `` `${item.year} ${item.make} ${item.model}` ``.
- Price/payment default: a dedicated monthly-payment calculation local to
  this file (30% down, 6.9% APR, 60-month term — the same assumptions
  already used on the public car detail page's `CarHeaderInfo`, kept as a
  separate local calculation here rather than imported, matching that
  file's own precedent of not sharing the constants across features),
  formatted as e.g. `"$1,539.04/mes"`.
- Image gallery: look up `carDetails[item.id]?.images` from the existing
  `data/car-details.ts`. If no entry exists (e.g. a vehicle added fresh
  through the dashboard's own "Agregar Vehículo" form has no editorial
  record), fall back to a single-image array built from `item.image`.

## Modal structure

A bespoke overlay (not the existing shared `components/dashboard/modal.tsx`,
which is a narrow single-column dialog — this needs a wide two-column
layout the shared component isn't built for): `fixed inset-0` backdrop with
`backdrop-blur-sm` and a dark scrim, Framer Motion fade+scale entry/exit via
`AnimatePresence`, a wide (`max-w-4xl` md, full-width mobile) white panel
that stacks to one column below `md` and splits into two columns at `md`
and up.

### Left column — live preview

- `aspect-square` container, capped at a reasonable on-screen size (e.g.
  `max-w-[420px]`), `rounded-2xl overflow-hidden`.
- A plain `<img>` (not `next/image` — this tool needs direct, uncomplicated
  access to the raw image element/URL for later canvas export, and
  `next/image`'s optimizer proxying would complicate that) showing the
  currently-selected gallery image, `object-cover`.
- A bottom gradient overlay div (`bg-gradient-to-t from-black/80
  via-black/40 to-transparent`) for text legibility.
- A "DRIVETIME" watermark pill, top-right, small rounded-full badge,
  semi-transparent light background over dark text (or vice versa —
  implementer's call on exact contrast, matching the brand pill style used
  elsewhere in this app, e.g. the homepage car card's body-type badge).
- The live title and price/payment text, positioned over the gradient near
  the bottom, updating in real time as the user edits the fields on the
  right — this is a CSS/DOM preview, a separate concern from the canvas
  export (which redraws the same design at full 1080×1080 resolution on
  download).

### Right column — controls

- "Título" text input, pre-filled with the computed default, fully
  editable.
- "Precio / Cuota" text input, pre-filled with the computed default, fully
  editable (free text — staff can type anything, e.g. switch it to a total
  price instead of a monthly payment).
- **Preset selector** (added after initial design, see "Layout presets"
  below): three small card-style selector buttons, one per preset, each
  with a tiny CSS-only schematic (a miniature aspect-square with 2–3
  positioned blocks hinting at where the logo/text land) plus a label —
  not plain text-only pills, so staff get visual feedback before picking.
  Selecting one updates `preset` state, which redrives both the live DOM
  preview and the canvas export's coordinates.
- Image selector: a horizontal scrollable strip of small thumbnails (one
  per gallery image), the selected one visually highlighted (e.g. a ring/
  border), clicking a thumbnail swaps the preview's background image.
- "Descargar Imagen Final" button (`Download` icon) — triggers the canvas
  export and browser download.
- Close (`X` icon) button, top-right of the modal panel.

## Layout presets

A `preset` state, typed `"bottom-left-logo" | "bottom-top-logo" |
"all-bottom"`, defaulting to `"bottom-top-logo"` (the original design).
Across all three presets the **bottom gradient stays fixed** — only the
watermark's position (and, for one preset, whether it joins the text block)
changes:

1. **`"bottom-left-logo"`** ("Logo Izquierda") — title+price stay at the
   bottom as normal; the watermark pill moves from the top-right to the
   top-left corner (same vertical position, mirrored horizontally).
2. **`"bottom-top-logo"`** ("Logo Arriba", the default/standard) — the
   design already specified above: watermark top-right, title+price at the
   bottom.
3. **`"all-bottom"`** ("Todo Abajo") — the watermark pill moves down to sit
   directly above the title/price text block at the bottom (stacked:
   watermark, then title, then price, bottom-aligned as a group), and the
   top of the image has no overlay/watermark at all — completely clean.

This applies symmetrically to both the live DOM preview (reposition the
watermark `div` and the text block via conditional classes/inline styles
keyed on `preset`) and the canvas export (a small per-preset coordinate
table the draw function reads from — exact pixel values are an
implementation detail as long as elements don't overlap and preset 3's
top region stays genuinely empty; reasonable padding/spacing, no need for
pixel-perfect specification here).

## Preset selector UI

Three card-style buttons in the right column, each showing a tiny
CSS-built mini-preview (a small square with 1–2 absolutely-positioned
blocks approximating logo/text placement for that preset) and a short
Spanish label. The active preset is visually highlighted (e.g. an indigo
ring/border, matching the dashboard's accent color).

## Canvas export engine

An internal async function, e.g. `generateInstagramGraphic({ imageSrc,
title, priceText, preset }): Promise<Blob>`, called on download-button
click — `preset` selects which coordinate table (see "Layout presets"
above) the watermark/text draw calls use:

1. Create an off-screen `<canvas>` (`document.createElement("canvas")`,
   never inserted into the DOM), `width = height = 1080`.
2. Load the selected image into a fresh `Image()` object with
   `img.crossOrigin = "anonymous"` set before `img.src`, wrapped in a
   Promise resolving on `onload` (Unsplash's CDN sends CORS headers
   permitting this — canvas export will fail with a "tainted canvas"
   security error without `crossOrigin` set correctly, so this must not be
   skipped).
3. Draw the image with cover-fit math: scale = `max(1080/img.width,
   1080/img.height)`, center-crop the overflow, `ctx.drawImage` with the
   computed source/dest rectangle.
4. Draw the bottom gradient via `ctx.createLinearGradient` + `fillRect`,
   matching the on-screen preview's proportions.
5. Draw the watermark pill: a rounded rectangle (canvas doesn't have a
   native rounded-rect primitive pre-`roundRect`, so use
   `ctx.roundRect(...)` if available — it's supported in all evergreen
   browsers this app targets — filled with a semi-transparent color) plus
   the "DRIVETIME" label text, top-right with padding matching the preview.
6. Draw the title text: bold, large (e.g. 56–64px), white, with a small
   word-wrap helper (split on spaces, measure with `ctx.measureText`,
   break to a new line when a line would exceed the canvas width minus
   margins) since staff-edited titles could be long.
7. Draw the price/payment text below/above the title, slightly smaller or
   differently weighted for visual hierarchy.
8. `canvas.toBlob(callback, "image/png")`, create an object URL from the
   blob, trigger a download via a temporary `<a download="...">` element's
   synthetic click, then `URL.revokeObjectURL` shortly after (to avoid
   leaking memory — but not immediately synchronously, since some browsers
   need the URL to remain valid through the download trigger; a `setTimeout`
   of a second or two, or revoking in a `requestIdleCallback`/after a short
   delay, is the standard safe pattern).
9. Filename: a slugified version of the vehicle name, e.g.
   `` `${item.year}-${item.make}-${item.model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-") `` plus `-instagram-post.png`.

## Error handling

- If the image fails to load (network error, or a future non-Unsplash host
  without CORS support — relevant if a user later swaps to a manually-added
  vehicle's custom image URL from `data/dashboard-data.ts`'s existing
  `ALLOWED_IMAGE_HOSTS` allowlist, which already only permits
  `images.unsplash.com`, so this should be rare but must not crash the
  page), catch the error and show an inline message near the download
  button (e.g. "No se pudo generar la imagen. Probá de nuevo." — no,
  standard tú-form: "No se pudo generar la imagen. Inténtalo de nuevo."),
  re-enabling the button rather than leaving it stuck.
- The download button should show a brief loading/disabled state while the
  canvas export is in flight (image loading + drawing is asynchronous, not
  instant).

## Testing

No test framework exists in this repo and none is being added. Manual
verification: `npx tsc --noEmit`, a curl check that `/dashboard/inventory`
still returns 200 after the integration change, and a documented browser
checklist covering — opening the modal for at least 2 different vehicles,
editing the title and price fields and confirming the live preview updates,
switching the selected thumbnail and confirming the preview image changes,
clicking download and confirming a `.png` file is produced (file existence/
non-zero size is the practical check available without a real browser
automation tool in this environment — this must be called out as a genuine
verification gap for whoever does final QA, same as the car detail page's
un-testable drag gesture was).

## Out of scope

- Any real backend, image storage, or actual posting to Instagram — this
  only produces a local file download.
- Multiple aspect ratios (Stories 9:16, etc.) — 1080×1080 only, per the
  spec.
- Font customization, color themes, or template variety — one fixed
  design.
