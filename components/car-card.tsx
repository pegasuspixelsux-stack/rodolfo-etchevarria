"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gauge, Calendar, Zap, Fuel, Loader2 } from "lucide-react";
import type { Car } from "@/data/cars";
import { carDetails, buildFallbackDetail } from "@/data/car-details";
import { InstagramGlyph } from "@/components/icons/instagram-glyph";
import { shareCarToInstagram } from "@/lib/share/share-to-instagram";
import { CARD_PAYMENT_DISCLAIMER } from "@/lib/share/instagram-graphic";
import { fadeUp } from "@/lib/motion";

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const mileageFormat = new Intl.NumberFormat("en-US");

const ESTIMATE_APR = 6.5;
const ESTIMATE_TERM_MONTHS = 60;
const ESTIMATE_DOWN_RATE = 0.3;

const BODY_TYPE_LABELS: Record<string, string> = {
  Sedan: "Sedán",
  SUV: "SUV",
  Coupe: "Cupé",
};

const FUEL_TYPE_LABELS: Record<string, string> = {
  Gasoline: "Nafta",
  Hybrid: "Híbrido",
  Electric: "Eléctrico",
};

function estimateMonthlyPayment(price: number) {
  const principal = price * (1 - ESTIMATE_DOWN_RATE);
  const monthlyRate = ESTIMATE_APR / 100 / 12;
  const factor = Math.pow(1 + monthlyRate, ESTIMATE_TERM_MONTHS);
  return (principal * (monthlyRate * factor)) / (factor - 1);
}

export type CardLayout = "split" | "portrait";

export function CarCard({
  car,
  layout = "portrait",
  previewLiftPercent = 0,
  previewGradientBoostPercent = 0,
  previewImageShiftPercent = 0,
  previewHideInstagramIcon = false,
  previewCenterWatermark = false,
  previewSplitLayout = false,
  previewSafeTopPercent = 0,
}: {
  car: Car;
  layout?: CardLayout;
  /** Shifts the bottom text block up by this many percent of the card's height.
   * Only meant for the dashboard's "Estilo Card" IG preview — leave at 0 everywhere else. */
  previewLiftPercent?: number;
  /** Extends the bottom gradient's solid + fade stops by this many percentage points.
   * Only meant for the dashboard's "Estilo Card" IG preview — leave at 0 everywhere else. */
  previewGradientBoostPercent?: number;
  /** Shifts the photo's object-position upward by this many percentage points.
   * Only meant for the dashboard's "Estilo Card" IG preview — leave at 0 everywhere else. */
  previewImageShiftPercent?: number;
  /** Hides the Instagram share button. Only meant for the dashboard's "Estilo Card" IG
   * preview, where the button would recursively trigger another share flow. */
  previewHideInstagramIcon?: boolean;
  /** Centers the script watermark instead of left-aligning it.
   * Only meant for the dashboard's "Estilo Card" IG preview — leave off everywhere else. */
  previewCenterWatermark?: boolean;
  /** Gives the bottom text block real height (instead of shrink-to-fit) and pushes the
   * price row down to the very bottom, leaving a gap above it — for the Instagram post
   * heading/caption area. Only meant for the dashboard's "Estilo Card" IG preview. */
  previewSplitLayout?: boolean;
  /** Pins the watermark's top edge this many percent down from the card's own top, instead
   * of the fixed top-3 — Instagram re-crops a 9:16 feed image to ~4:5 centered, so anything
   * inside its own top-3 gets clipped. Only meant for the dashboard's "Estilo Card" IG
   * preview — leave at 0 everywhere else. */
  previewSafeTopPercent?: number;
}) {
  const FuelIcon = car.fuelType === "Electric" ? Zap : Fuel;
  const detail = carDetails[car.id] ?? buildFallbackDetail(car);
  const shortDescription = detail.editorial.dek;
  const options = detail.features.flatMap((group) => group.items).slice(0, 3);

  const [sharing, setSharing] = useState(false);

  const handleShareToInstagram = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (sharing) return;
    setSharing(true);
    try {
      await shareCarToInstagram(car);
    } catch {
      // Composing/sharing the image failed silently from the visitor's point of
      // view (no toast system on the public site) — the button just resets.
    } finally {
      setSharing(false);
    }
  };

  if (layout === "split") {
    return (
      <motion.article
        variants={fadeUp}
        className="group relative flex min-h-[280px] flex-row overflow-hidden rounded-none bg-transparent"
      >
        <Link
          href={`/inventory/${car.id}`}
          aria-label={`Ver detalles de ${car.make} ${car.model}`}
          className="absolute inset-0 z-20"
        />

        <button
          type="button"
          onClick={handleShareToInstagram}
          disabled={sharing}
          aria-label="Compartir en Instagram"
          className="absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-none border border-border-strong bg-surface text-foreground transition-colors duration-200 ease-out hover:border-foreground/40 hover:bg-foreground hover:text-accent-foreground disabled:cursor-wait"
        >
          {sharing ? <Loader2 size={16} className="animate-spin" /> : <InstagramGlyph size={16} />}
        </button>

        <div className="relative aspect-square w-2/5 flex-shrink-0 self-start overflow-hidden bg-surface-2 sm:w-1/2">
          <Image
            src={car.image}
            alt={`${car.year} ${car.make} ${car.model} ${car.trim}`}
            fill
            sizes="(min-width: 640px) 25vw, 40vw"
            className="object-cover object-[center_33%] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.08]"
          />
          <span
            className="absolute left-3 top-2 whitespace-nowrap text-[1.8rem] tracking-tight text-white [font-family:var(--font-script)] sm:text-[2.16rem]"
            style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}
          >
            Rodolfo Etchevarria
          </span>
        </div>

        <div className="flex flex-1 flex-col gap-2 p-5 sm:gap-4">
          <div>
            <h3 className="font-heading text-[1.05rem] font-normal leading-tight text-foreground">
              {car.make} {car.model}
            </h3>
            <div className="mt-0.5 hidden items-center gap-1.5 text-[0.85rem] text-muted sm:flex">
              <span
                className="h-3 w-3 flex-shrink-0 rounded-none border border-border-strong"
                style={{ backgroundColor: car.colorHex }}
              />
              <span>{car.color}</span>
              <span className="text-muted/60">·</span>
              <span>{BODY_TYPE_LABELS[car.bodyType] ?? car.bodyType}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-[0.78rem] text-muted sm:grid-cols-3 sm:border-t sm:border-border sm:pt-4">
            <div className="flex items-center gap-1.5">
              <Calendar size={14} />
              <span>{car.year}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Gauge size={14} />
              <span>{mileageFormat.format(car.mileage)} km</span>
            </div>
            <div className="hidden items-center gap-1.5 sm:flex">
              <FuelIcon size={14} />
              <span>{FUEL_TYPE_LABELS[car.fuelType] ?? car.fuelType}</span>
            </div>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 pt-1 sm:border-t sm:border-border sm:pt-4">
            <p className="whitespace-nowrap text-[0.8rem] text-muted">
              Precio {currency.format(car.price)}
            </p>
            <div className="text-right sm:text-left">
              <p className="text-[1.3rem] font-semibold leading-none text-blue-500">
                {currency.format(estimateMonthlyPayment(car.price))}
                <span className="hidden sm:inline">/mes</span>
              </p>
              <p className="mt-0.5 text-[0.7rem] text-muted sm:hidden">/mes</p>
            </div>
          </div>
        </div>
      </motion.article>
    );
  }

  return (
    <motion.article
      variants={fadeUp}
      className="@container group relative aspect-[9/16] overflow-hidden rounded-none bg-surface-2"
    >
      <Image
        src={car.image}
        alt={`${car.year} ${car.make} ${car.model} ${car.trim}`}
        fill
        sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
        className="object-cover object-[center_33%] transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.08]"
        style={
          previewImageShiftPercent
            ? { objectPosition: `center ${33 + previewImageShiftPercent}%` }
            : undefined
        }
      />

      {/* Sized to the card's own rendered width (via @container), not the viewport — the
          same CarCard shows at very different widths across contexts (a 2-col mobile grid,
          a 1-col full-width mobile card, a 3-col showroom grid, a 4-col desktop grid), so a
          viewport breakpoint can't tell a narrow card from a wide one; a container query can. */}
      <div
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.92)_24%,rgba(0,0,0,0)_46%)] @[220px]:bg-[linear-gradient(to_top,rgba(0,0,0,0.92)_0%,rgba(0,0,0,0.92)_33%,rgba(0,0,0,0)_58%)]"
        style={
          previewGradientBoostPercent
            ? {
                backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.92) ${
                  33 + previewGradientBoostPercent
                }%, rgba(0,0,0,0) ${58 + previewGradientBoostPercent}%)`,
              }
            : undefined
        }
      />

      <span
        className={`absolute top-3 z-10 whitespace-nowrap text-[1.3rem] tracking-tight text-white [font-family:var(--font-script)] @[220px]:text-[2.4rem] ${
          previewCenterWatermark ? "left-1/2 -translate-x-1/2" : "left-3"
        }`}
        style={{
          textShadow: "0 1px 6px rgba(0,0,0,0.6)",
          ...(previewSafeTopPercent ? { top: `${previewSafeTopPercent}%` } : undefined),
          ...(previewSplitLayout ? { fontSize: "2.16rem" } : undefined), // -10% off @[220px]:text-[2.4rem]
        }}
      >
        Rodolfo Etchevarria
      </span>

      <Link
        href={`/inventory/${car.id}`}
        aria-label={`Ver detalles de ${car.make} ${car.model}`}
        className="absolute inset-0 z-20"
      />

      {!previewHideInstagramIcon && (
        <button
          type="button"
          onClick={handleShareToInstagram}
          disabled={sharing}
          aria-label="Compartir en Instagram"
          className="glass absolute right-3 top-3 z-30 flex h-9 w-9 items-center justify-center rounded-none text-white transition-colors duration-200 ease-out hover:bg-white hover:text-black disabled:cursor-wait"
        >
          {sharing ? <Loader2 size={16} className="animate-spin" /> : <InstagramGlyph size={16} />}
        </button>
      )}

      <div
        className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3 @[220px]:gap-2 @[220px]:p-4 @[380px]:p-5"
        style={{
          ...(previewLiftPercent ? { bottom: `${previewLiftPercent}%` } : undefined),
          ...(previewSplitLayout
            ? { paddingLeft: "calc(16px + 4%)", paddingRight: "calc(16px + 4%)", gap: "4px" }
            : undefined),
        }}
      >
        <div style={previewSplitLayout ? { marginTop: "11px" } : undefined}>
          <h3
            className="font-heading text-[1.05rem] font-normal leading-tight text-white @[220px]:text-[1.575rem]"
            style={previewSplitLayout ? { lineHeight: 1.05 } : undefined}
          >
            {car.make} {car.model}
          </h3>
          <div
            className="mt-0.5 flex items-center gap-1.5 text-[0.68rem] text-white/70 @[220px]:text-[0.8rem]"
            style={previewSplitLayout ? { marginTop: "12px", lineHeight: 1.15 } : undefined}
          >
            <span
              className="h-3 w-3 flex-shrink-0 rounded-none border border-white/40"
              style={{ backgroundColor: car.colorHex }}
            />
            <span>{car.color}</span>
            <span className="text-white/40">·</span>
            <span>{BODY_TYPE_LABELS[car.bodyType] ?? car.bodyType}</span>
          </div>
        </div>

        {shortDescription && (
          <p
            className="hidden line-clamp-2 text-[0.78rem] leading-snug text-white/70 @[220px]:block"
            style={previewSplitLayout ? { lineHeight: 1.1 } : undefined}
          >
            {shortDescription}
          </p>
        )}

        {options.length > 0 && (
          <div className="hidden flex-wrap gap-1.5 @[220px]:flex">
            {options.map((option) => (
              <span
                key={option}
                className="rounded-none border border-white/20 bg-white/10 px-2 py-0.5 text-[0.68rem] text-white/80"
              >
                {option}
              </span>
            ))}
          </div>
        )}

        <div
          className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.65rem] text-white/70 @[220px]:text-[0.75rem]"
          style={previewSplitLayout ? { lineHeight: 1.15 } : undefined}
        >
          <div className="flex items-center gap-1.5">
            <Calendar size={12} />
            <span>{car.year}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Gauge size={12} />
            <span>{mileageFormat.format(car.mileage)} km</span>
          </div>
          <div className="hidden items-center gap-1.5 @[220px]:flex">
            <FuelIcon size={14} />
            <span>{FUEL_TYPE_LABELS[car.fuelType] ?? car.fuelType}</span>
          </div>
        </div>

        {previewSplitLayout && <div className="border-t border-white/15 pt-2" />}

        <div
          className={`flex items-end justify-between gap-3 ${
            previewSplitLayout ? "" : "border-t border-white/15 pt-1 @[220px]:pt-2"
          }`}
        >
          <p className="whitespace-nowrap text-[0.65rem] text-white/60 @[220px]:text-[0.75rem]">
            Precio {currency.format(car.price)}
          </p>
          <p className="text-[1.1rem] font-semibold leading-none text-blue-400 @[220px]:text-[1.8rem]">
            {currency.format(estimateMonthlyPayment(car.price))}
            <span className="text-[0.65rem] font-normal text-white/70 @[220px]:text-[0.75rem]">/mes</span>
          </p>
        </div>
        <p
          className="hidden text-[0.62rem] leading-snug text-white/40 @[220px]:block"
          style={previewSplitLayout ? { lineHeight: 1.1 } : undefined}
        >
          {CARD_PAYMENT_DISCLAIMER}
        </p>
      </div>
    </motion.article>
  );
}
