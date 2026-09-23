# Car Detail Page — Design

Date: 2026-09-16

## Purpose

Add a public, editorial-style vehicle detail page to DriveTime, reached from
the homepage inventory grid's "View Details" button (currently a dead
button with no destination). No backend exists in this project — this page
follows the established pattern of the rest of the app: real base vehicle
data from the existing `data/cars.ts`, enriched with new per-car mock
content (photos, article copy, feature lists), and a fully client-side mock
inquiry form (no real email/WhatsApp send — WhatsApp opens a real `wa.me`
deep link in a new tab, which is a genuine browser action, not mocked; the
email path is a client-side mock submit matching the existing Trade-In
form's pattern).

## Route

`app/inventory/[id]/page.tsx` — an async Server Component. Resolves
`params.id`, looks up the car in `cars` (from `@/data/cars`) and its detail
record in `carDetails` (from `@/data/car-details`); calls Next's `notFound()`
if either lookup fails. Renders a single client component,
`CarDetailView`, passing the resolved `car`, `detail`, and a pre-computed
`similarCars` list as props.

The page keeps the site's global `Navbar` and `Footer` around the detail
content (unlike the admin dashboard, which fully replaces site chrome) —
this is a public marketing page, not an internal tool, so normal site
navigation stays available.

## Visual system

Like the admin dashboard, this page is a **self-contained light theme**,
independent of the homepage's dark/light `ThemeProvider` toggle: literal
grayscale Tailwind classes (`zinc-*`/`neutral-*`), never the homepage's
`var(--background)`-style tokens. `Navbar`/`Footer` still use the global
theme tokens as normal — only the content between them (`CarDetailView`
and its children) opts out. Typography: `font-serif` for the editorial
section's headline and drop cap, matching the existing Geist sans stack
for everything else. Motion: Framer Motion throughout, reusing `lib/motion`
variants where they fit, plus a dedicated drag-based carousel.

## Data

### `data/car-details.ts` (new file)

```ts
export interface CarDetailImage {
  src: string;
  alt: string;
}

export type FeatureIconKey = "engine" | "comfort" | "tech";

export interface CarFeatureGroup {
  category: string;
  icon: FeatureIconKey;
  items: string[];
}

export interface CarDetail {
  images: CarDetailImage[]; // 4-6 per car, exterior + interior
  editorial: {
    headline: string;
    dek: string; // standfirst / subheading
    paragraphs: string[]; // 3-4 paragraphs of article body copy
  };
  features: CarFeatureGroup[]; // exactly 3: engine, comfort, tech
}

export const carDetails: Record<string, CarDetail> = { ... };
```

Keyed by the same `id` values already used in `data/cars.ts`. One genuine,
unique entry per existing car (9 total) — not templated filler; each car
gets its own editorial voice, its own image set, its own feature bullets
appropriate to that specific vehicle (e.g. the Tesla Roadster's "Technology
& Safety" column differs meaningfully from the Range Rover Sport's).

`FeatureIconKey` maps to an actual `lucide-react` icon inside the
`FeatureColumns` component (data stays pure — no JSX/components imported
into a data file, matching `lib/dashboard-data.ts`'s convention).

### Similar cars

Computed in the page (`app/inventory/[id]/page.tsx`), not a data file:
other cars sharing the current car's `bodyType`, excluding itself, capped
at 6; if fewer than 3 share the body type, fill the remainder from any
other cars (excluding already-picked ones and the current car) up to 6.

### Payment calculation

A dedicated calculation local to `CarHeaderInfo` (not shared with the
homepage cards' estimator, which uses different assumptions): 30% down,
6.9% APR, 60-month term — matching the disclaimer text verbatim:
*"Payment calculated with a 30% down payment, 6.9% interest rate, and a
60-month term. Subject to credit approval."*

## Components (`components/car-detail/`)

- `car-slideshow.tsx` — `CarSlideshow({ images })`. Boxed
  `max-w-[1000px] mx-auto rounded-3xl overflow-hidden shadow-lg`. A
  drag-to-swipe carousel (Framer Motion `drag="x"`, `dragElastic`,
  `onDragEnd` offset/velocity threshold to advance/retreat) plus
  click-through prev/next arrow buttons and dot indicators. Slides use a
  percentage-based `x` transform (`animate={{ x: `${-index * 100}%` }}`),
  not a crossfade — this is a slide carousel, distinct from the homepage
  hero's crossfade.
- `car-header-info.tsx` — `CarHeaderInfo({ car })`. Two-column row: left =
  year/make/model + trim; right = monthly payment (large) + total price
  (small, muted) + the verbatim disclaimer text beneath. Contains the
  dedicated payment calculation described above.
- `editorial-description.tsx` — `EditorialDescription({ editorial })`.
  Magazine-style article: serif headline, standfirst, a drop-cap first
  paragraph, generous line-height body copy.
- `feature-columns.tsx` — `FeatureColumns({ features })`. 3-column grid
  (stacks to 1 column on mobile), each column a bordered card with a
  category icon + heading, then a bulleted list (small check-style icon
  per bullet).
- `car-inquiry-form.tsx` — `CarInquiryForm({ car })`. Name/Email/Phone/
  Message fields (reusing the existing `FormField`/`FormInput` components
  from `components/form-controls.tsx` where they fit the visual style, or
  local equivalents styled for this page's grayscale theme — implementer's
  call, consistency with this page's own palette wins if the two clash).
  Two submit actions side by side: "Submit by Email" (type="submit",
  client-side mock — validates required fields, shows a success state,
  matches `components/trade-in-form.tsx`'s pattern) and "Submit by
  WhatsApp" (type="button", builds a `https://wa.me/14155550148?text=...`
  URL from the current field values plus the car's name, opens it in a new
  tab). The WhatsApp number reuses the fictional business number already
  used elsewhere in this app (`(415) 555-0148`, see `components/footer.tsx`).
- `similar-cars-slider.tsx` — `SimilarCarsSlider({ cars })`. Horizontal
  `overflow-x-auto` row with `scroll-snap` (`snap-x snap-mandatory` /
  `snap-start` on each card), compact cards (thumbnail, make/model,
  mileage, price) each linking to `/inventory/[car.id]`.

## Homepage integration

`components/car-card.tsx`'s "View Details" button (currently a plain
`<button>` with no destination, `aria-label="View details"`) becomes a
`next/link` `Link` to `/inventory/${car.id}`, keeping its existing visual
styling (circular arrow, hover states) — swap the element, not the look.

## Error handling

- `notFound()` for an unknown `id` (Next's built-in 404 page — no custom
  not-found UI required beyond what Next provides by default, unless one
  already exists in this repo, in which case it applies automatically).
- Inquiry form: client-side required-field validation (name, email,
  message required; phone optional) before either submit path proceeds,
  inline error text under each field, matching the pattern in
  `app/login/page.tsx` and `components/trade-in-form.tsx`.

## Testing

No test framework exists in this repo and none is being added. Manual
verification: the dev server + `curl` for route existence, and a documented
browser checklist covering — the slideshow's swipe AND click controls, the
payment/disclaimer numbers matching the stated 30%/6.9%/60mo assumptions,
the feature grid rendering all 3 categories, the inquiry form's validation
and both submit paths (including that the WhatsApp link opens with a
sensible pre-filled message), the similar-cars slider's scroll and links,
and the homepage's "View Details" button actually navigating to the new
page for at least 2-3 different cars.

## Out of scope

- Any real backend, database, or actual email/SMS sending.
- Image upload or a way to add new cars from the UI (this page is read-only
  presentation + a contact form, not a management tool).
- Reusing this page's grayscale theme anywhere else in the app.
