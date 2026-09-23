# Car Detail Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public, editorial-style vehicle detail page at `/inventory/[id]` to the DriveTime Next.js app, reached from the homepage's "View Details" button.

**Architecture:** `app/inventory/[id]/page.tsx` is an async Server Component that looks up the car in the existing `data/cars.ts` plus new per-car content in `data/car-details.ts`, computes a similar-cars list, and renders six client components in a fixed vertical order (slideshow → header → editorial → features → inquiry form → similar cars) inside the normal site `Navbar`/`Footer` chrome. The page is a self-contained grayscale ("zinc") light theme, independent of the homepage's dark/light toggle — same pattern the admin dashboard already established.

**Tech Stack:** Next.js App Router, TypeScript, Tailwind CSS v4, Framer Motion, lucide-react (all already installed — no new dependencies).

**Spec:** `docs/superpowers/specs/2026-09-16-car-detail-page-design.md`

## Global Constraints

- No backend — everything is either static mock data or a client-side mock form submit (matching every other form in this app, e.g. `components/trade-in-form.tsx`). The one real external action is the WhatsApp button, which opens a genuine `https://wa.me/...` deep link in a new tab.
- This page (and everything under `components/car-detail/`) uses literal grayscale Tailwind classes (`zinc-*`, `white`) — NOT the homepage's `var(--background)`-style CSS-variable tokens, and NOT the admin dashboard's `slate-*`/`indigo-*` palette. It is its own third visual system, independent of `ThemeProvider`.
- The site's `Navbar` and `Footer` (`components/navbar.tsx`, `components/footer.tsx`) DO still wrap this page — unlike the admin dashboard, which replaces site chrome entirely, this is a public marketing page and keeps normal navigation.
- No new npm packages. Icons from `lucide-react`, motion from `framer-motion`, both already dependencies.
- This project is on Next.js 16 (`package.json`: `"next": "16.3.5"`) — in an async Server Component page, `params` is a `Promise` and must be `await`ed: `const { id } = await params;`. Do not write the older synchronous-`params` pattern.
- The hero slideshow container must be `max-w-[1000px] mx-auto` with `rounded-3xl overflow-hidden shadow-lg` — this exact constraint is explicit in the user's original request, not a suggestion.
- The financing disclaimer text must appear verbatim: *"Payment calculated with a 30% down payment, 6.9% interest rate, and a 60-month term. Subject to credit approval."* — and the payment math backing it must actually use 30% down, 6.9% APR, 60 months (a dedicated calculation local to `CarHeaderInfo`, NOT the homepage cards' 10%/6.5% estimator).
- The WhatsApp number reuses this app's existing fictional business phone number, `(415) 555-0148` (see `components/footer.tsx`), in `wa.me` format: `14155550148`.
- Only use Unsplash image URLs already verified working elsewhere in this codebase (listed in Task 1) — never invent a new Unsplash photo ID, since an unverified one could 404 silently and there's no way to test that via `curl`.
- No test framework exists in this repo and none is being added. Verification per task is `npx tsc --noEmit` plus a `curl` check against the route (dev server should already be running — check the terminal for its actual port; do not assume 3000, and never start a second concurrent `npm run dev`), plus a manual browser checklist for interactive behavior (documented per task below).

---

### Task 1: `data/car-details.ts` — per-car mock content

**Files:**
- Create: `data/car-details.ts`

**Interfaces:**
- Consumes: nothing (pure data file, no imports beyond none needed — it does NOT import from `@/data/cars`, it's keyed by the same `id` strings independently).
- Produces: `CarDetailImage`, `FeatureIconKey`, `CarFeatureGroup`, `CarDetail` types; `carDetails: Record<string, CarDetail>` with exactly 9 entries, keyed by the 9 existing car ids from `data/cars.ts` (`range-rover-sport-2023`, `bmw-m5-2023`, `porsche-panamera-2024`, `tesla-roadster-2024`, `honda-crv-2022`, `nissan-gtr-2023`, `ford-expedition-2023`, `mercedes-amg-gtr-2023`, `lamborghini-aventador-2023`). Used by Task 8 (`app/inventory/[id]/page.tsx`), and transitively by Tasks 2–5's prop types.

- [ ] **Step 1: Create the file**

```typescript
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
  images: CarDetailImage[];
  editorial: {
    headline: string;
    dek: string;
    paragraphs: string[];
  };
  features: CarFeatureGroup[];
}

const SUPPLEMENT_POOL = [
  "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=1600&q=80",
  "https://images.unsplash.com/photo-1541447271487-09612b3f49f7?auto=format&fit=crop&w=1600&q=80",
];

function galleryFor(primary: string, offset: number): CarDetailImage[] {
  return [
    { src: primary, alt: "Front three-quarter view" },
    {
      src: SUPPLEMENT_POOL[offset % 4],
      alt: "Side profile in motion",
    },
    {
      src: SUPPLEMENT_POOL[(offset + 1) % 4],
      alt: "Cabin and interior detail",
    },
    {
      src: SUPPLEMENT_POOL[(offset + 2) % 4],
      alt: "Rear three-quarter view",
    },
  ];
}

export const carDetails: Record<string, CarDetail> = {
  "range-rover-sport-2023": {
    images: galleryFor(
      "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1600&q=80",
      0,
    ),
    editorial: {
      headline: "Command Every Terrain, Without Raising Your Pulse",
      dek: "The Range Rover Sport Autobiography pairs off-road serenity with true on-road urgency — a rare and deliberate balance.",
      paragraphs: [
        "There's a particular kind of quiet that only comes from engineering excess wrapped in restraint. Behind the wheel of the Range Rover Sport Autobiography, that quiet arrives instantly — cabin noise smothered by acoustic glass, road imperfections dissolved by adaptive air suspension that reads the surface a fraction of a second before your wheels do.",
        "Underneath the composure sits real capability. Terrain Response 2 shuffles power and damping automatically across mud, sand, and rock, while the twin-turbocharged inline-six delivers effortless overtaking torque without ever sounding strained. This is a vehicle built to be driven hard in a school pickup line and harder still down a fire road.",
        "Inside, Santorini Black paint gives way to a cabin trimmed in quilted leather and open-pore wood — details that reward a second look rather than announcing themselves. It is luxury measured in restraint, not volume.",
      ],
    },
    features: [
      {
        category: "Performance & Engine",
        icon: "engine",
        items: [
          "3.0L twin-turbo inline-six, 395 hp",
          "8-speed automatic transmission",
          "Terrain Response 2 all-terrain system",
          "Adaptive air suspension with dynamic response",
        ],
      },
      {
        category: "Luxury & Comfort",
        icon: "comfort",
        items: [
          "Quilted leather heated & ventilated seats",
          "Panoramic sliding glass roof",
          "Four-zone climate control",
          "Configurable ambient lighting, 30 colors",
        ],
      },
      {
        category: "Technology & Safety",
        icon: "tech",
        items: [
          "13.1-inch Pivi Pro touchscreen",
          "360-degree camera with ClearSight ground view",
          "Adaptive cruise control with lane keep assist",
          "Wade sensing for water crossings up to 900mm",
        ],
      },
    ],
  },
  "bmw-m5-2023": {
    images: galleryFor(
      "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&w=1600&q=80",
      1,
    ),
    editorial: {
      headline: "The Business Sedan That Lies About Its Day Job",
      dek: "Four doors, a back seat, and 617 horsepower conspiring to make every commute feel like a dare.",
      paragraphs: [
        "The M5 Competition has always played a trick on onlookers — a sedan silhouette hiding a chassis tuned by people who clearly wanted to build a supercar and settled for practicality as a compromise. Brooklyn Grey paint only sharpens the disguise.",
        "Twin-turbo V8 power routes through an eight-speed automatic and an all-wheel-drive system that can, at the press of a button, send everything to the rear wheels alone. It's an unusually honest performance envelope: composed at nine-tenths, genuinely wild at ten.",
        "Inside, the carbon-backed M seats hold you the way a proper sports car should, and the cabin's restraint — real metal, real stitching, no unnecessary flourish — makes it clear this is a driver's tool first, a luxury statement second.",
      ],
    },
    features: [
      {
        category: "Performance & Engine",
        icon: "engine",
        items: [
          "4.4L twin-turbo V8, 617 hp",
          "8-speed M Steptronic automatic",
          "M xDrive all-wheel drive with 2WD mode",
          "Adaptive M suspension",
        ],
      },
      {
        category: "Luxury & Comfort",
        icon: "comfort",
        items: [
          "Carbon-backed M sport seats, heated & ventilated",
          "Merino leather upholstery",
          "Bowers & Wilkins Diamond surround sound",
          "Configurable drive-mode memory presets",
        ],
      },
      {
        category: "Technology & Safety",
        icon: "tech",
        items: [
          "12.3-inch BMW Curved Display",
          "Head-up display",
          "M Drift Analyzer & Laptimer",
          "Active blind spot & lane departure warning",
        ],
      },
    ],
  },
  "porsche-panamera-2024": {
    images: galleryFor(
      "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80",
      2,
    ),
    editorial: {
      headline: "Precision Engineering, Dressed for Any Occasion",
      dek: "The Panamera 4S proves that a grand tourer and a sports car were never meant to be different vehicles.",
      paragraphs: [
        "Porsche built the Panamera to answer a question nobody quite believed had a good answer: could a four-door with real rear-seat space still feel like a 911 when the road turned interesting? The 4S answers with a twin-turbo V6 and air suspension calibrated with genuine sporting intent.",
        "Carrara White exterior paint keeps the design's tension visible — the long hood, the fastback roofline, the wide rear haunches — while Porsche Active Suspension Management quietly firms and softens the ride to match your mood rather than the road's.",
        "Step inside and the cabin reads like a cockpit: analog tachometer at center, surrounded by digital displays that never feel like a concession. Every surface is finished with the kind of consistency you only get from a manufacturer that has been building interiors this way for decades.",
      ],
    },
    features: [
      {
        category: "Performance & Engine",
        icon: "engine",
        items: [
          "2.9L twin-turbo V6, 440 hp",
          "8-speed PDK dual-clutch transmission",
          "Porsche Active Suspension Management",
          "All-wheel drive with rear-axle steering",
        ],
      },
      {
        category: "Luxury & Comfort",
        icon: "comfort",
        items: [
          "14-way power adaptive sport seats",
          "Four-zone climate control",
          "Bose Surround Sound System",
          "Panoramic fixed glass roof",
        ],
      },
      {
        category: "Technology & Safety",
        icon: "tech",
        items: [
          "12.3-inch Porsche Communication Management",
          "Porsche InnoDrive adaptive cruise",
          "Night Vision Assist",
          "Wireless Apple CarPlay integration",
        ],
      },
    ],
  },
  "tesla-roadster-2024": {
    images: galleryFor(
      "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1600&q=80",
      3,
    ),
    editorial: {
      headline: "The Future of Speed, Already Here",
      dek: "Zero emissions, zero compromise — the Roadster Founders Series redefines what a hypercar can be.",
      paragraphs: [
        "Numbers rarely tell the whole story, but the Roadster's do a lot of the talking: a sub-two-second sprint to 60 mph, a top speed north of 250 mph, and a 620-mile range that makes the idea of an electric hypercar feel less like a novelty and more like an inevitability.",
        "Red Multi-Coat paint over a carbon-fiber body keeps weight low and presence high. There's no engine note to announce the car's intentions — just a silent, immediate surge that reorders your sense of what acceleration feels like.",
        "The Founders Series cabin is deliberately minimal: four seats, a glass roof, and a removable panel for genuine open-air driving. It's a hypercar that asks you to stop thinking about what a hypercar is supposed to sound like, and start thinking about what one should feel like.",
      ],
    },
    features: [
      {
        category: "Performance & Engine",
        icon: "engine",
        items: [
          "Tri-motor all-wheel-drive electric powertrain",
          "0-60 mph in under 2 seconds",
          "620-mile est. range",
          "SpaceX-inspired removable glass roof panel",
        ],
      },
      {
        category: "Luxury & Comfort",
        icon: "comfort",
        items: [
          "4-passenger carbon-fiber cabin",
          "Heated & ventilated sport seats",
          "Premium audio with active noise cancellation",
          "Panoramic glass roof",
        ],
      },
      {
        category: "Technology & Safety",
        icon: "tech",
        items: [
          "17-inch center touchscreen",
          "Over-the-air software updates",
          "Autopilot advanced driver assistance",
          "Track Mode telemetry display",
        ],
      },
    ],
  },
  "honda-crv-2022": {
    images: galleryFor(
      "https://images.unsplash.com/photo-1519641471654-76ce0107ad1b?auto=format&fit=crop&w=1600&q=80",
      0,
    ),
    editorial: {
      headline: "The Quiet Confidence of Doing Everything Right",
      dek: "No drama, no compromise — the CR-V Touring Hybrid is engineered for the life you actually live.",
      paragraphs: [
        "Not every vehicle needs to announce itself. The CR-V Touring Hybrid earns its keep through consistency: a hybrid powertrain that returns exceptional efficiency without asking you to think about it, and a cabin built around genuine, unglamorous usefulness.",
        "Platinum White Pearl paint suits a design that values proportion over flash. Inside, Honda's two-motor hybrid system pairs a 2.0L engine with electric motors for smooth, quiet power delivery that rarely calls attention to the transition between gas and electric assist.",
        "This is a vehicle built by people who understand that most driving happens in ordinary moments — school runs, grocery trips, long highway stretches — and who decided those moments deserved real engineering effort too.",
      ],
    },
    features: [
      {
        category: "Performance & Engine",
        icon: "engine",
        items: [
          "2.0L 4-cylinder hybrid powertrain, 204 hp combined",
          "e-CVT automatic transmission",
          "Real-time all-wheel drive",
          "Up to 40 MPG combined",
        ],
      },
      {
        category: "Luxury & Comfort",
        icon: "comfort",
        items: [
          "Heated leather front & rear seats",
          "Power tailgate with hands-free access",
          "Dual-zone automatic climate control",
          "Panoramic moonroof",
        ],
      },
      {
        category: "Technology & Safety",
        icon: "tech",
        items: [
          "9-inch touchscreen with wireless Apple CarPlay",
          "Honda Sensing safety suite",
          "Wireless phone charger",
          "Head-up display",
        ],
      },
    ],
  },
  "nissan-gtr-2023": {
    images: galleryFor(
      "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=1600&q=80",
      1,
    ),
    editorial: {
      headline: "Godzilla, Still Undefeated",
      dek: "Two decades of relentless refinement have only sharpened the GT-R's singular purpose: speed without apology.",
      paragraphs: [
        "The GT-R has never chased trends. Its hand-built twin-turbo V6 and ATTESA E-TS all-wheel-drive system exist for one reason — to put every one of its 565 horsepower onto the road with a violence that feels almost mechanical in its precision.",
        "Pearl White paint over the familiar wide-body silhouette announces the car's intent honestly: this is a machine built around a Nürburgring lap time, not a boardroom mood board. The dual-clutch transmission snaps through gears with a physicality that automatic gearboxes rarely offer.",
        "The cabin has grown more refined over the years — nicer materials, a cleaner dashboard — but the driving position and the sound of that engine remain unmistakably, defiantly GT-R. Some cars evolve by softening. This one evolves by getting better at doing exactly what it always did.",
      ],
    },
    features: [
      {
        category: "Performance & Engine",
        icon: "engine",
        items: [
          "3.8L twin-turbo V6, 565 hp",
          "6-speed dual-clutch transmission",
          "ATTESA E-TS all-wheel drive",
          "Launch control with 2.9s 0-60 mph",
        ],
      },
      {
        category: "Luxury & Comfort",
        icon: "comfort",
        items: [
          "Semi-aniline leather sport seats",
          "Heated front seats",
          "Bose premium audio system",
          "Dual-zone automatic climate control",
        ],
      },
      {
        category: "Technology & Safety",
        icon: "tech",
        items: [
          "8-inch multifunction touchscreen",
          "Nissan Navigation with GT-R performance data logger",
          "Rearview camera with parking sensors",
          "Bluetooth hands-free with streaming audio",
        ],
      },
    ],
  },
  "ford-expedition-2023": {
    images: galleryFor(
      "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1600&q=80",
      2,
    ),
    editorial: {
      headline: "Room for Everyone, Without Giving Up an Inch of Capability",
      dek: "The Expedition Platinum is proof that full-size doesn't have to mean full compromise.",
      paragraphs: [
        "Three rows of genuinely usable space, a twin-turbo V6 that tows with authority, and a ride quality smoothed by adaptive suspension — the Expedition Platinum was built for families who also expect their vehicle to work for a living.",
        "Agate Black paint gives the Expedition's imposing proportions a sense of occasion, while the independent rear suspension — unusual for the segment — keeps the third row livable on long trips rather than merely present.",
        "Inside, Platinum trim brings quilted leather, real wood accents, and a 12-inch touchscreen that makes the cabin feel closer to a flagship sedan than a traditional body-on-frame SUV. It manages the rare trick of feeling both rugged and genuinely upscale.",
      ],
    },
    features: [
      {
        category: "Performance & Engine",
        icon: "engine",
        items: [
          "3.5L twin-turbo EcoBoost V6, 440 hp",
          "10-speed automatic transmission",
          "Independent rear suspension",
          "Up to 9,300 lbs towing capacity",
        ],
      },
      {
        category: "Luxury & Comfort",
        icon: "comfort",
        items: [
          "Quilted leather heated & ventilated seats",
          "Power-folding third row",
          "Panoramic vista roof",
          "Massaging front seats",
        ],
      },
      {
        category: "Technology & Safety",
        icon: "tech",
        items: [
          "12-inch SYNC 4 touchscreen",
          "Pro Trailer Backup Assist",
          "360-degree camera system",
          "Adaptive cruise control with stop-and-go",
        ],
      },
    ],
  },
  "mercedes-amg-gtr-2023": {
    images: galleryFor(
      "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1600&q=80",
      3,
    ),
    editorial: {
      headline: "Built on a Track, Refined for the Road",
      dek: "The GT R Pro was tuned at the Nürburgring before it was ever tuned for comfort — and it shows.",
      paragraphs: [
        "Green Hell Magno paint is not a color choice so much as a statement of origin: named for the Nürburgring's Green Hell nickname, it marks a car whose suspension geometry, aero package, and roll cage were all shaped by lap times, not showroom appeal.",
        "The handcrafted twin-turbo V8 sends power through a rear-mounted transaxle for near-perfect weight distribution, while an active rear-wheel steering system sharpens turn-in at speed and stabilizes the car at a standstill in ways that feel almost unfair.",
        "AMG didn't soften the Pro package to make it livable — they simply made sure the two things it does best, going fast and stopping fast, never had to compromise for anything else. This is track engineering with license plates.",
      ],
    },
    features: [
      {
        category: "Performance & Engine",
        icon: "engine",
        items: [
          "4.0L twin-turbo V8, 577 hp",
          "7-speed AMG SPEEDSHIFT DCT",
          "Active rear-wheel steering",
          "Adjustable coilover suspension",
        ],
      },
      {
        category: "Luxury & Comfort",
        icon: "comfort",
        items: [
          "AMG carbon-fiber performance seats",
          "Nappa leather & DINAMICA upholstery",
          "Burmester surround sound system",
          "Carbon-fiber trim package",
        ],
      },
      {
        category: "Technology & Safety",
        icon: "tech",
        items: [
          "AMG Track Pace telemetry",
          "12.3-inch digital instrument cluster",
          "AMG Dynamic Select drive programs",
          "Reversing camera with parking guidance",
        ],
      },
    ],
  },
  "lamborghini-aventador-2023": {
    images: galleryFor(
      "https://images.unsplash.com/photo-1571607388263-1044f9ea01dd?auto=format&fit=crop&w=1600&q=80",
      0,
    ),
    editorial: {
      headline: "The Last of an Era, Loud About It",
      dek: "The naturally aspirated V12 Aventador SVJ is a farewell letter written at 8,700 RPM.",
      paragraphs: [
        "There is nothing subtle about the Aventador SVJ, and it has no interest in becoming subtle. Arancio Xanto paint, a naturally aspirated V12 that revs to 8,700 RPM, and an active aerodynamics system that visibly reshapes itself under hard cornering — this is a car built entirely without compromise.",
        "ALA 2.0 active aero pulls air through the car's body to generate downforce exactly where and when it's needed, a system so effective the SVJ once held the production-car lap record at the Nürburgring. It is motorsport technology wearing license plates.",
        "Inside, the cabin is unapologetically driver-focused — a start button under a fighter-jet-style red cover, a carbon-fiber-forward dashboard, and almost nothing to distract from the engine note filling the cabin behind you. Some cars are transportation. This one is an event.",
      ],
    },
    features: [
      {
        category: "Performance & Engine",
        icon: "engine",
        items: [
          "6.5L naturally aspirated V12, 759 hp",
          "7-speed ISR automated manual transmission",
          "ALA 2.0 active aerodynamics",
          "0-60 mph in 2.8 seconds",
        ],
      },
      {
        category: "Luxury & Comfort",
        icon: "comfort",
        items: [
          "Carbon-fiber racing seats",
          "Alcantara & leather upholstery",
          "Dual-zone climate control",
          "Lifting system for high-clearance situations",
        ],
      },
      {
        category: "Technology & Safety",
        icon: "tech",
        items: [
          "8.4-inch touchscreen infotainment",
          "Reversing camera with parking sensors",
          "Lamborghini Telemetry system",
          "Drive mode selector (Strada, Sport, Corsa, Ego)",
        ],
      },
    ],
  },
};
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `data/car-details.ts`.

- [ ] **Step 3: Verify all 9 keys match `data/cars.ts` ids**

Read `data/cars.ts` and confirm every `id` there has a matching key in `carDetails`, and vice versa (no extra, no missing, no typo). This matters: Task 8's page will `notFound()` silently for any car whose id doesn't have a matching `carDetails` entry, and a typo here would only surface as a broken detail page for one specific car — easy to miss.

- [ ] **Step 4: Commit**

```bash
git add data/car-details.ts
git commit -m "feat: add car detail page mock content (images, editorial, features)"
```

---

### Task 2: `components/car-detail/car-slideshow.tsx`

**Files:**
- Create: `components/car-detail/car-slideshow.tsx`

**Interfaces:**
- Consumes: `CarDetailImage` type from `@/data/car-details` (Task 1).
- Produces: `CarSlideshow({ images: CarDetailImage[] })`. Used by Task 8.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, type PanInfo } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { CarDetailImage } from "@/data/car-details";

const SWIPE_THRESHOLD = 60;
const VELOCITY_THRESHOLD = 400;

export function CarSlideshow({ images }: { images: CarDetailImage[] }) {
  const [index, setIndex] = useState(0);

  const goTo = (next: number) => {
    setIndex((next + images.length) % images.length);
  };

  const handleDragEnd = (
    _event: MouseEvent | TouchEvent | PointerEvent,
    info: PanInfo,
  ) => {
    if (info.offset.x < -SWIPE_THRESHOLD || info.velocity.x < -VELOCITY_THRESHOLD) {
      goTo(index + 1);
    } else if (info.offset.x > SWIPE_THRESHOLD || info.velocity.x > VELOCITY_THRESHOLD) {
      goTo(index - 1);
    }
  };

  return (
    <div className="mx-auto max-w-[1000px] px-6 pt-8 sm:px-8">
      <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-zinc-100 shadow-lg">
        <motion.div
          className="flex h-full w-full cursor-grab active:cursor-grabbing"
          drag="x"
          dragElastic={0.15}
          dragConstraints={{ left: 0, right: 0 }}
          onDragEnd={handleDragEnd}
          animate={{ x: `${-index * 100}%` }}
          transition={{ type: "spring", stiffness: 300, damping: 32 }}
        >
          {images.map((image, i) => (
            <div key={image.src + i} className="relative h-full w-full flex-shrink-0">
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="(min-width: 1024px) 1000px, 100vw"
                className="pointer-events-none object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </motion.div>

        {images.length > 1 && (
          <>
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => goTo(index - 1)}
              className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-md transition-transform duration-200 hover:scale-105"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => goTo(index + 1)}
              className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-zinc-900 shadow-md transition-transform duration-200 hover:scale-105"
            >
              <ChevronRight size={18} />
            </button>

            <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
              {images.map((image, i) => (
                <button
                  key={image.src + i}
                  type="button"
                  aria-label={`Show photo ${i + 1}`}
                  onClick={() => goTo(i)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === index ? "w-6 bg-white" : "w-1.5 bg-white/50 hover:bg-white/80"
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
```

Note: `dragConstraints={{ left: 0, right: 0 }}` combined with the `animate={{ x: ... }}` prop is deliberate — the constraint keeps free-dragging elastic and centered near the current slide, while `onDragEnd` changes `index`, which retargets the `animate` prop to the new slide position with a spring transition. This is the whole mechanism for both the swipe gesture and the snap-back/slide-in motion; don't "simplify" it by removing either piece.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/car-detail/car-slideshow.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/car-detail/car-slideshow.tsx
git commit -m "feat: add car detail hero slideshow with drag-to-swipe"
```

---

### Task 3: `components/car-detail/car-header-info.tsx`

**Files:**
- Create: `components/car-detail/car-header-info.tsx`

**Interfaces:**
- Consumes: `Car` type from `@/data/cars` (existing).
- Produces: `CarHeaderInfo({ car: Car })`. Used by Task 8.

- [ ] **Step 1: Create the file**

```tsx
import type { Car } from "@/data/cars";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const currencyPrecise = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const DETAIL_APR = 6.9;
const DETAIL_TERM_MONTHS = 60;
const DETAIL_DOWN_RATE = 0.3;

function estimateDetailMonthlyPayment(price: number) {
  const principal = price * (1 - DETAIL_DOWN_RATE);
  const monthlyRate = DETAIL_APR / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, DETAIL_TERM_MONTHS);
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

export function CarHeaderInfo({ car }: { car: Car }) {
  const monthly = estimateDetailMonthlyPayment(car.price);

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-8 sm:px-8">
      <div className="flex flex-col items-start justify-between gap-6 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 sm:text-4xl">
            {car.year} {car.make} {car.model}
          </h1>
          <p className="mt-1 text-[0.95rem] text-zinc-500">{car.trim}</p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-3xl font-semibold tracking-tight text-zinc-900">
            {currencyPrecise.format(monthly)}
            <span className="text-base font-normal text-zinc-500">/mo</span>
          </p>
          <p className="mt-1 text-[0.9rem] text-zinc-500">
            {currency.format(car.price)} total price
          </p>
        </div>
      </div>

      <p className="mt-4 border-t border-zinc-200 pt-4 text-[0.78rem] leading-relaxed text-zinc-400">
        Payment calculated with a 30% down payment, 6.9% interest rate, and a
        60-month term. Subject to credit approval.
      </p>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/car-detail/car-header-info.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/car-detail/car-header-info.tsx
git commit -m "feat: add car detail header with financing summary"
```

---

### Task 4: `components/car-detail/editorial-description.tsx`

**Files:**
- Create: `components/car-detail/editorial-description.tsx`

**Interfaces:**
- Consumes: `CarDetail["editorial"]` shape from `@/data/car-details` (Task 1).
- Produces: `EditorialDescription({ editorial: CarDetail["editorial"] })`. Used by Task 8.

- [ ] **Step 1: Create the file**

```tsx
import type { CarDetail } from "@/data/car-details";

export function EditorialDescription({
  editorial,
}: {
  editorial: CarDetail["editorial"];
}) {
  const [firstParagraph, ...restParagraphs] = editorial.paragraphs;
  const dropCap = firstParagraph.charAt(0);
  const restOfFirstParagraph = firstParagraph.slice(1);

  return (
    <div className="mx-auto max-w-[1000px] px-6 py-14 sm:px-8">
      <div className="mx-auto max-w-2xl">
        <h2 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-zinc-900 sm:text-4xl">
          {editorial.headline}
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-zinc-500">
          {editorial.dek}
        </p>

        <div className="mt-8 flex flex-col gap-6 text-[1.05rem] leading-[1.9] text-zinc-700">
          <p>
            <span className="float-left mr-2 font-serif text-6xl font-semibold leading-[0.8] text-zinc-900">
              {dropCap}
            </span>
            {restOfFirstParagraph}
          </p>
          {restParagraphs.map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/car-detail/editorial-description.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/car-detail/editorial-description.tsx
git commit -m "feat: add editorial description section with drop cap"
```

---

### Task 5: `components/car-detail/feature-columns.tsx`

**Files:**
- Create: `components/car-detail/feature-columns.tsx`

**Interfaces:**
- Consumes: `CarFeatureGroup`, `FeatureIconKey` types from `@/data/car-details` (Task 1); `fadeUp`, `staggerContainer` from `@/lib/motion` (existing).
- Produces: `FeatureColumns({ features: CarFeatureGroup[] })`. Used by Task 8.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Gauge, ShieldCheck, Sparkles } from "lucide-react";
import type { CarFeatureGroup, FeatureIconKey } from "@/data/car-details";
import { fadeUp, staggerContainer } from "@/lib/motion";

const ICONS: Record<FeatureIconKey, typeof Gauge> = {
  engine: Gauge,
  comfort: Sparkles,
  tech: ShieldCheck,
};

export function FeatureColumns({ features }: { features: CarFeatureGroup[] }) {
  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto grid max-w-[1000px] grid-cols-1 gap-4 px-6 py-8 sm:grid-cols-3 sm:px-8"
    >
      {features.map((group) => {
        const Icon = ICONS[group.icon];
        return (
          <motion.div
            key={group.category}
            variants={fadeUp}
            className="rounded-2xl border border-zinc-200 bg-white p-6"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-100 text-zinc-900">
              <Icon size={18} />
            </span>
            <h3 className="mt-4 text-[1.05rem] font-semibold text-zinc-900">
              {group.category}
            </h3>
            <ul className="mt-4 flex flex-col gap-2.5">
              {group.items.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-[0.9rem] text-zinc-600"
                >
                  <CheckCircle2
                    size={15}
                    className="mt-0.5 flex-shrink-0 text-zinc-400"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/car-detail/feature-columns.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/car-detail/feature-columns.tsx
git commit -m "feat: add three-column vehicle features grid"
```

---

### Task 6: `components/car-detail/car-inquiry-form.tsx`

**Files:**
- Create: `components/car-detail/car-inquiry-form.tsx`

**Interfaces:**
- Consumes: `Car` type from `@/data/cars` (existing); `fadeUp` from `@/lib/motion` (existing).
- Produces: `CarInquiryForm({ car: Car })`. Used by Task 8.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, MessageCircle, Send } from "lucide-react";
import type { Car } from "@/data/cars";
import { fadeUp } from "@/lib/motion";

const WHATSAPP_NUMBER = "14155550148";

const fieldClass =
  "h-12 w-full rounded-xl border border-zinc-200 bg-white px-4 text-[0.9rem] text-zinc-900 placeholder:text-zinc-400 transition-colors duration-200 focus-visible:border-zinc-900 focus-visible:outline-none";

interface InquiryDraft {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY_DRAFT: InquiryDraft = { name: "", email: "", phone: "", message: "" };

function buildWhatsAppUrl(car: Car, draft: InquiryDraft) {
  const carLabel = `${car.year} ${car.make} ${car.model}`;
  const lines = [
    `Hi, I'm interested in the ${carLabel}.`,
    draft.name && `My name is ${draft.name}.`,
    draft.email && `Email: ${draft.email}`,
    draft.message,
  ].filter(Boolean);
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(lines.join(" "))}`;
}

export function CarInquiryForm({ car }: { car: Car }) {
  const [draft, setDraft] = useState<InquiryDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Partial<Record<keyof InquiryDraft, string>>>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const nextErrors: Partial<Record<keyof InquiryDraft, string>> = {};
    if (!draft.name.trim()) nextErrors.name = "Name is required";
    if (!draft.email.trim()) nextErrors.email = "Email is required";
    if (!draft.message.trim()) nextErrors.message = "Message is required";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleEmailSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitted(true);
  };

  const handleWhatsAppSubmit = () => {
    if (!validate()) return;
    window.open(buildWhatsAppUrl(car, draft), "_blank", "noreferrer");
  };

  if (submitted) {
    return (
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-80px" }}
        className="mx-auto max-w-[1000px] px-6 py-14 sm:px-8"
      >
        <div className="mx-auto flex max-w-md flex-col items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-10 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-100 text-zinc-900">
            <CheckCircle2 size={22} />
          </span>
          <h3 className="text-[1.05rem] font-semibold text-zinc-900">
            Inquiry received
          </h3>
          <p className="text-[0.9rem] text-zinc-500">
            An advisor will follow up about the {car.year} {car.make} {car.model}{" "}
            shortly.
          </p>
          <button
            type="button"
            onClick={() => {
              setDraft(EMPTY_DRAFT);
              setSubmitted(false);
            }}
            className="mt-2 text-[0.85rem] font-medium text-zinc-900 underline decoration-zinc-300 underline-offset-4"
          >
            Send another inquiry
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto max-w-[1000px] px-6 py-14 sm:px-8"
    >
      <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-200 bg-white p-8">
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Interested in this vehicle?
        </h2>
        <p className="mt-2 text-[0.9rem] text-zinc-500">
          Send an inquiry and an advisor will get back to you.
        </p>

        <form onSubmit={handleEmailSubmit} className="mt-6 flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-[0.8rem] font-medium text-zinc-600">Name</label>
              <input
                value={draft.name}
                onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                placeholder="Jordan Avery"
                className={fieldClass}
              />
              {errors.name && <p className="text-[0.78rem] text-red-500">{errors.name}</p>}
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[0.8rem] font-medium text-zinc-600">Email</label>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                placeholder="you@email.com"
                className={fieldClass}
              />
              {errors.email && <p className="text-[0.78rem] text-red-500">{errors.email}</p>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.8rem] font-medium text-zinc-600">Phone</label>
            <input
              type="tel"
              value={draft.phone}
              onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
              placeholder="(415) 555-0148"
              className={fieldClass}
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-[0.8rem] font-medium text-zinc-600">Message</label>
            <textarea
              value={draft.message}
              onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
              placeholder={`I'd like to know more about the ${car.year} ${car.make} ${car.model}...`}
              rows={4}
              className={`${fieldClass} h-auto resize-none py-3`}
            />
            {errors.message && (
              <p className="text-[0.78rem] text-red-500">{errors.message}</p>
            )}
          </div>

          <div className="mt-2 grid grid-cols-1 gap-3 sm:grid-cols-2">
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-zinc-900 text-[0.9rem] font-medium text-white transition-colors hover:bg-zinc-800"
            >
              <Send size={16} />
              Submit by Email
            </motion.button>
            <motion.button
              type="button"
              onClick={handleWhatsAppSubmit}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              transition={{ duration: 0.15, ease: "easeOut" }}
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-[0.9rem] font-medium text-white transition-colors hover:bg-emerald-700"
            >
              <MessageCircle size={16} />
              Submit by WhatsApp
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
```

Note: both submit paths share the same `validate()` — the WhatsApp button is `type="button"` (never triggers native form submission) but still runs the same required-field check before opening the deep link, so an empty form can't produce a near-empty WhatsApp message.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/car-detail/car-inquiry-form.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/car-detail/car-inquiry-form.tsx
git commit -m "feat: add car inquiry form with email and WhatsApp submit"
```

---

### Task 7: `components/car-detail/similar-cars-slider.tsx`

**Files:**
- Create: `components/car-detail/similar-cars-slider.tsx`

**Interfaces:**
- Consumes: `Car` type from `@/data/cars` (existing); `fadeUp`, `staggerContainer` from `@/lib/motion` (existing).
- Produces: `SimilarCarsSlider({ cars: Car[] })`. Used by Task 8.

- [ ] **Step 1: Create the file**

```tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import type { Car } from "@/data/cars";
import { fadeUp, staggerContainer } from "@/lib/motion";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const mileageFormat = new Intl.NumberFormat("en-US");

export function SimilarCarsSlider({ cars }: { cars: Car[] }) {
  if (cars.length === 0) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto max-w-[1000px] px-6 py-14 sm:px-8"
    >
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">
        Similar Vehicles
      </h2>
      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4">
        {cars.map((car) => (
          <motion.div key={car.id} variants={fadeUp} className="snap-start">
            <Link
              href={`/inventory/${car.id}`}
              className="group block w-64 flex-shrink-0 overflow-hidden rounded-2xl border border-zinc-200 bg-white transition-colors hover:border-zinc-300"
            >
              <div className="relative h-40 w-full overflow-hidden bg-zinc-100">
                <Image
                  src={car.image}
                  alt={`${car.year} ${car.make} ${car.model}`}
                  fill
                  sizes="256px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="font-semibold text-zinc-900">
                  {car.make} {car.model}
                </p>
                <p className="mt-1 text-[0.82rem] text-zinc-500">
                  {mileageFormat.format(car.mileage)} km
                </p>
                <p className="mt-2 text-[0.95rem] font-semibold text-zinc-900">
                  {currency.format(car.price)}
                </p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/car-detail/similar-cars-slider.tsx`.

- [ ] **Step 3: Commit**

```bash
git add components/car-detail/similar-cars-slider.tsx
git commit -m "feat: add similar cars horizontal slider"
```

---

### Task 8: `app/inventory/[id]/page.tsx` — page assembly

**Files:**
- Create: `app/inventory/[id]/page.tsx`

**Interfaces:**
- Consumes: `cars`, `Car` from `@/data/cars` (existing); `carDetails` from `@/data/car-details` (Task 1); `Navbar` from `@/components/navbar` (existing); `Footer` from `@/components/footer` (existing); `CarSlideshow` (Task 2); `CarHeaderInfo` (Task 3); `EditorialDescription` (Task 4); `FeatureColumns` (Task 5); `CarInquiryForm` (Task 6); `SimilarCarsSlider` (Task 7).
- Produces: the `/inventory/[id]` route.

- [ ] **Step 1: Create the file**

```tsx
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { cars, type Car } from "@/data/cars";
import { carDetails } from "@/data/car-details";
import { CarSlideshow } from "@/components/car-detail/car-slideshow";
import { CarHeaderInfo } from "@/components/car-detail/car-header-info";
import { EditorialDescription } from "@/components/car-detail/editorial-description";
import { FeatureColumns } from "@/components/car-detail/feature-columns";
import { CarInquiryForm } from "@/components/car-detail/car-inquiry-form";
import { SimilarCarsSlider } from "@/components/car-detail/similar-cars-slider";

function getSimilarCars(currentId: string, bodyType: Car["bodyType"]): Car[] {
  const sameBodyType = cars.filter(
    (car) => car.id !== currentId && car.bodyType === bodyType,
  );
  if (sameBodyType.length >= 3) return sameBodyType.slice(0, 6);

  const sameBodyTypeIds = new Set(sameBodyType.map((car) => car.id));
  const others = cars.filter(
    (car) => car.id !== currentId && !sameBodyTypeIds.has(car.id),
  );
  return [...sameBodyType, ...others].slice(0, 6);
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const car = cars.find((item) => item.id === id);
  const detail = car ? carDetails[car.id] : undefined;

  if (!car || !detail) {
    notFound();
  }

  const similarCars = getSimilarCars(car.id, car.bodyType);

  return (
    <>
      <Navbar />
      <main className="flex-1 bg-zinc-50 pt-24 sm:pt-28">
        <CarSlideshow images={detail.images} />
        <CarHeaderInfo car={car} />
        <EditorialDescription editorial={detail.editorial} />
        <FeatureColumns features={detail.features} />
        <CarInquiryForm car={car} />
        <SimilarCarsSlider cars={similarCars} />
      </main>
      <Footer />
    </>
  );
}
```

Note: `notFound()` throws internally (it's typed `never`), so TypeScript will correctly narrow `car`/`detail` as non-nullish after that `if` block without an explicit `return`.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Verify in the dev server**

Run: `curl -s http://localhost:PORT/inventory/bmw-m5-2023 -o /dev/null -w "%{http_code}\n"` (use the actual running port, check the terminal — do not assume 3000)
Expected: `200`

Run: `curl -s http://localhost:PORT/inventory/not-a-real-car -o /dev/null -w "%{http_code}\n"`
Expected: `404`

Manual check in a browser for at least 2-3 different cars (e.g. `bmw-m5-2023`, `honda-crv-2022`, `lamborghini-aventador-2023`):
- All 6 sections render in the documented order.
- Slideshow: click both arrows, click a dot, and try a drag/swipe gesture — all should change the visible slide.
- Header: the monthly payment number is consistent with 30% down / 6.9% APR / 60mo on that car's price (spot check the math), and the disclaimer text matches verbatim.
- Editorial section has a visible drop cap on the first paragraph.
- Feature grid shows exactly 3 columns (stacks to 1 on a narrow viewport) with a distinct icon per category.
- Inquiry form: submitting with empty fields shows inline errors and does not proceed on either button; filling required fields and clicking "Submit by Email" shows the success state; clicking "Submit by WhatsApp" (with required fields filled) opens a new tab to a `wa.me` link with a sensible pre-filled message.
- Similar Vehicles: scrolls horizontally, cards link to their own `/inventory/[id]` pages and those pages load correctly too.

- [ ] **Step 4: Commit**

```bash
git add "app/inventory/[id]/page.tsx"
git commit -m "feat: add car detail page route"
```

---

### Task 9: Wire up the homepage's "View Details" button

**Files:**
- Modify: `components/car-card.tsx`

**Interfaces:**
- Consumes: the `/inventory/[id]` route (Task 8) — only needs to know the URL pattern, not any of that route's internals.
- Produces: nothing new — this task only changes how an existing element navigates.

- [ ] **Step 1: Replace the button with a Link**

In `components/car-card.tsx`, add the import:

```tsx
import Link from "next/link";
```

Then replace this block:

```tsx
      <button
        type="button"
        aria-label="View details"
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground transition-colors duration-200 ease-out group-hover:border-foreground/40 group-hover:bg-foreground group-hover:text-accent-foreground"
      >
        <ArrowUpRight
          size={16}
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </button>
```

with:

```tsx
      <Link
        href={`/inventory/${car.id}`}
        aria-label="View details"
        className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border border-border-strong bg-surface text-foreground transition-colors duration-200 ease-out group-hover:border-foreground/40 group-hover:bg-foreground group-hover:text-accent-foreground"
      >
        <ArrowUpRight
          size={16}
          className="transition-transform duration-200 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
```

Do not change anything else in this file — same classes, same icon, same hover behavior, just a different element and a real destination.

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: no errors referencing `components/car-card.tsx`.

- [ ] **Step 3: Verify in the dev server**

Run: `curl -s http://localhost:PORT/ -o /dev/null -w "%{http_code}\n"`
Expected: `200` (confirms the homepage itself still renders fine with the swapped element)

Manual check: on the homepage, hover a car card and click its circular arrow button — it should navigate to that car's `/inventory/[id]` page.

- [ ] **Step 4: Commit**

```bash
git add components/car-card.tsx
git commit -m "feat: link homepage View Details button to car detail page"
```

---

## Final check (after Task 9)

- [ ] Run `npx tsc --noEmit` once more against the whole project — expect zero errors.
- [ ] Run through the manual checklist end-to-end once more: homepage → click "View Details" on 2-3 different cards → confirm each detail page renders all 6 sections correctly → confirm the Similar Vehicles slider's links lead to other working detail pages → confirm a non-existent car id (e.g. `/inventory/does-not-exist`) shows Next's 404 page.
