"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gauge, Calendar, Zap, Fuel } from "lucide-react";
import type { Car } from "@/data/cars";
import {
  CARD_PAYMENT_DISCLAIMER,
  DEFAULT_BOTTOM_GRADIENT_PERCENT,
  DEFAULT_GRADIENT_COLOR,
  DEFAULT_LOGO_SRC,
  DEFAULT_MODEL_SIZE_REM,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TOP_GRADIENT_PERCENT,
  DEFAULT_YEAR_MAKE_SIZE_REM,
  GRADIENT_INTENSITY_DEFAULT,
  hexToRgb,
  type LogoPosition,
} from "@/lib/share/instagram-graphic";
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
  previewSplitLayout = false,
  previewSafeTopPercent = 0,
  previewTitleAlign = "center",
  previewTextColor = DEFAULT_TEXT_COLOR,
  previewYearMakeSizeRem = DEFAULT_YEAR_MAKE_SIZE_REM,
  previewModelSizeRem = DEFAULT_MODEL_SIZE_REM,
  previewGradientColor = DEFAULT_GRADIENT_COLOR,
  previewGradientIntensity = GRADIENT_INTENSITY_DEFAULT,
  previewTopGradientPercent = DEFAULT_TOP_GRADIENT_PERCENT,
  previewBottomGradientPercent = DEFAULT_BOTTOM_GRADIENT_PERCENT,
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
  /** Splits the text into two independent blocks — a top block (dealer logo + "Year Make
   * Model") and a bottom block (price, payment, disclaimer) — instead of the single
   * left-aligned block used everywhere else. Only meant for the dashboard's IG Reels preview. */
  previewSplitLayout?: boolean;
  /** Pins the top block this many percent down from the card's own top — Instagram re-crops
   * a 9:16 feed image to ~4:5 centered, so anything above this clips. Only meant for the
   * dashboard's IG Reels preview — leave at 0 everywhere else. */
  previewSafeTopPercent?: number;
  /** Font size (rem) for the top block's "Year Make" row. Only meant for the dashboard's
   * IG Reels preview — leave at the default everywhere else. */
  previewYearMakeSizeRem?: number;
  /** Font size (rem) for the top block's "Model" row. Only meant for the dashboard's IG
   * Reels preview — leave at the default everywhere else. */
  previewModelSizeRem?: number;
  /** Hex color for the top/bottom gradient bands. Only meant for the dashboard's IG Reels
   * preview — leave at the default everywhere else. */
  previewGradientColor?: string;
  /** Opacity (0-100) of the top/bottom gradient bands at their solid edge. Only meant for
   * the dashboard's IG Reels preview — leave at the default everywhere else. */
  previewGradientIntensity?: number;
  /** Height (percent of card height) of the top gradient band. Only meant for the
   * dashboard's IG Reels preview — leave at the default everywhere else. */
  previewTopGradientPercent?: number;
  /** Height (percent of card height) of the bottom gradient band. Only meant for the
   * dashboard's IG Reels preview — leave at the default everywhere else. */
  previewBottomGradientPercent?: number;
  /** Horizontal alignment of the top block's "Year Make" / "Model" rows. Only meant for the
   * dashboard's IG Reels preview — leave at the default everywhere else. */
  previewTitleAlign?: LogoPosition;
  /** Base color for all of the IG Reels preset's text (opacity-derived per row). Only meant
   * for the dashboard's IG Reels preview — leave at the default everywhere else. */
  previewTextColor?: string;
}) {
  const FuelIcon = car.fuelType === "Electric" ? Zap : Fuel;

  const [tcR, tcG, tcB] = hexToRgb(previewTextColor);
  const textRgba = (alpha: number) => `rgba(${tcR}, ${tcG}, ${tcB}, ${alpha})`;
  const titleAlignClass =
    previewTitleAlign === "left" ? "items-start" : previewTitleAlign === "right" ? "items-end" : "items-center";
  const titleTextAlignClass =
    previewTitleAlign === "left" ? "text-left" : previewTitleAlign === "right" ? "text-right" : "text-center";

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
          previewSplitLayout
            ? {
                backgroundImage: (() => {
                  const [pr, pg, pb] = hexToRgb(previewGradientColor);
                  const alpha = previewGradientIntensity / 100;
                  return `linear-gradient(to bottom, rgba(${pr},${pg},${pb},${alpha}) 0%, rgba(${pr},${pg},${pb},0) ${previewTopGradientPercent}%, rgba(${pr},${pg},${pb},0) ${100 - previewBottomGradientPercent}%, rgba(${pr},${pg},${pb},${alpha}) 100%)`;
                })(),
              }
            : previewGradientBoostPercent
              ? {
                  backgroundImage: `linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.92) ${
                    33 + previewGradientBoostPercent
                  }%, rgba(0,0,0,0) ${58 + previewGradientBoostPercent}%)`,
                }
              : undefined
        }
      />

      {previewSplitLayout ? (
        <div
          className="pointer-events-none absolute inset-x-0 z-10 flex flex-col items-center gap-3"
          style={{ top: `${previewSafeTopPercent}%`, paddingLeft: "25px", paddingRight: "25px" }}
        >
          <img src={DEFAULT_LOGO_SRC} alt="Logo" className="h-8 w-auto max-w-[55%] object-contain" />
          <div className={`flex flex-col gap-0 ${titleAlignClass}`}>
            <p
              className={`font-light leading-none ${titleTextAlignClass}`}
              style={{ fontSize: `${previewYearMakeSizeRem}rem`, color: textRgba(1) }}
            >
              {car.year} {car.make}
            </p>
            <p
              className={`font-normal leading-none ${titleTextAlignClass}`}
              style={{ fontSize: `${previewModelSizeRem}rem`, marginTop: "-6px", color: textRgba(1) }}
            >
              {car.model}
            </p>
          </div>
        </div>
      ) : (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-10 flex flex-col items-center gap-1 px-3 @[220px]:top-3 @[220px]:gap-1.5">
          <img
            src={DEFAULT_LOGO_SRC}
            alt="Logo"
            className="h-5 w-auto max-w-[45%] object-contain @[220px]:h-7"
          />
          <div className="flex flex-col items-center gap-0 text-center" style={{ textShadow: "0 1px 6px rgba(0,0,0,0.6)" }}>
            <p className="text-[0.6rem] font-light leading-none text-white @[220px]:text-[0.85rem]">
              {car.year} {car.make}
            </p>
            <p
              className="text-[1.1rem] font-normal leading-none text-white @[220px]:text-[1.8rem]"
              style={{ marginTop: "-2px" }}
            >
              {car.model}
            </p>
          </div>
        </div>
      )}

      <Link
        href={`/inventory/${car.id}`}
        aria-label={`Ver detalles de ${car.make} ${car.model}`}
        className="absolute inset-0 z-20"
      />

      {previewSplitLayout ? (
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col gap-1"
          style={{
            bottom: `${previewLiftPercent}%`,
            paddingLeft: "calc(16px + 4%)",
            paddingRight: "calc(16px + 4%)",
            gap: "4px",
          }}
        >
          <div className="border-t border-white/15 pt-2" />
          <div className="flex items-end justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <p className="text-[0.75rem]" style={{ color: textRgba(0.6) }}>Precio</p>
              <p className="text-[0.85rem] font-normal" style={{ color: textRgba(1) }}>
                US{currency.format(car.price)}
              </p>
            </div>
            <p className="text-right text-[2rem] font-normal leading-none" style={{ color: textRgba(1) }}>
              <span className="text-[0.75rem] font-normal" style={{ color: textRgba(0.7) }}>US$</span>
              {currency.format(estimateMonthlyPayment(car.price)).replace("$", "")}
              <span className="text-[0.75rem] font-normal" style={{ color: textRgba(0.7) }}>/mes</span>
            </p>
          </div>
          <p className="text-[0.62rem]" style={{ lineHeight: 1.1, color: textRgba(0.4) }}>
            {CARD_PAYMENT_DISCLAIMER}
          </p>
        </div>
      ) : (
        <div
          className="absolute inset-x-0 bottom-0 flex flex-col gap-1 p-3 @[220px]:gap-2 @[220px]:p-4 @[380px]:p-5"
          style={previewLiftPercent ? { bottom: `${previewLiftPercent}%` } : undefined}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.65rem] text-white/70 @[220px]:text-[0.75rem]">
            <span
              className="h-3 w-3 flex-shrink-0 rounded-none border border-white/40"
              style={{ backgroundColor: car.colorHex }}
            />
            <span>{car.color}</span>
            <span className="text-white/40">·</span>
            <span>{BODY_TYPE_LABELS[car.bodyType] ?? car.bodyType}</span>
            <span className="text-white/40">·</span>
            <span className="flex items-center gap-1">
              <Gauge size={12} />
              {mileageFormat.format(car.mileage)} km
            </span>
            <span className="text-white/40">·</span>
            <span className="flex items-center gap-1">
              <FuelIcon size={12} />
              {FUEL_TYPE_LABELS[car.fuelType] ?? car.fuelType}
            </span>
          </div>

          <div className="flex items-end justify-between gap-3 border-t border-white/15 pt-1 @[220px]:pt-2">
            <p className="whitespace-nowrap text-[0.65rem] text-white/60 @[220px]:text-[0.75rem]">
              Precio {currency.format(car.price)}
            </p>
            <p className="text-[1.1rem] font-semibold leading-none text-blue-400 @[220px]:text-[1.8rem]">
              {currency.format(estimateMonthlyPayment(car.price))}
              <span className="text-[0.65rem] font-normal text-white/70 @[220px]:text-[0.75rem]">/mes</span>
            </p>
          </div>
          <p className="hidden text-[0.62rem] leading-snug text-white/40 @[220px]:block">
            {CARD_PAYMENT_DISCLAIMER}
          </p>
        </div>
      )}
    </motion.article>
  );
}
