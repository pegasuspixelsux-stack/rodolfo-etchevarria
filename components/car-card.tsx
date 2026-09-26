"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Gauge, Calendar, Zap, Fuel, Phone, ArrowUpRight } from "lucide-react";
import type { Car } from "@/data/cars";
import { resolveCarSwatchColor } from "@/lib/car-color";
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
  Truck: "Camioneta",
};

const FUEL_TYPE_LABELS: Record<string, string> = {
  Gasoline: "Nafta",
  Hybrid: "Híbrido",
  Electric: "Eléctrico",
};

const DEALER_NAME = "Rodolfo Etchevarria";
const DEALER_PHONE = "(415) 555-0148";

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
  mobileList = false,
  previewLiftPercent = 0,
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
  /** Row layout (square image on the left, text on the right) below the `md` breakpoint;
   * reverts to the normal vertical card at `md` and above regardless of this flag. Meant
   * for the inventory grid's mobile one-column view. */
  mobileList?: boolean;
  /** Shifts the bottom text block up by this many percent of the card's height.
   * Only meant for the dashboard's "Estilo Card" IG preview — leave at 0 everywhere else. */
  previewLiftPercent?: number;
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
                style={{ backgroundColor: resolveCarSwatchColor(car.color, car.colorHex) }}
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
              <p className="text-[1.3rem] font-semibold leading-none text-foreground">
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

  if (previewSplitLayout) {
    return (
      <motion.article
        variants={fadeUp}
        className="@container group relative aspect-[4/5] overflow-hidden rounded-none bg-surface-2"
      >
        <Image
          src={car.image}
          alt={`${car.year} ${car.make} ${car.model} ${car.trim}`}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover object-center transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.08]"
          style={
            previewImageShiftPercent
              ? { objectPosition: `center ${33 + previewImageShiftPercent}%` }
              : undefined
          }
        />

        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage: (() => {
              const [pr, pg, pb] = hexToRgb(previewGradientColor);
              const alpha = previewGradientIntensity / 100;
              return `linear-gradient(to bottom, rgba(${pr},${pg},${pb},${alpha}) 0%, rgba(${pr},${pg},${pb},0) ${previewTopGradientPercent}%, rgba(${pr},${pg},${pb},0) ${100 - previewBottomGradientPercent}%, rgba(${pr},${pg},${pb},${alpha}) 100%)`;
            })(),
          }}
        />

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

        <Link
          href={`/inventory/${car.id}`}
          aria-label={`Ver detalles de ${car.make} ${car.model}`}
          className="absolute inset-0 z-20"
        />

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
      </motion.article>
    );
  }

  return (
    <motion.article
      variants={fadeUp}
      className={`@container group relative flex cursor-pointer overflow-hidden rounded-lg bg-white shadow-sm transition-all duration-300 hover:shadow-md ${
        mobileList ? "flex-row md:flex-col" : "flex-col"
      }`}
    >
      <Link
        href={`/inventory/${car.id}`}
        aria-label={`View ${car.make} ${car.model} details`}
        className="absolute inset-0 z-20"
      />

      {/* Image Container with Dealer Branding Stripe */}
      <div
        className={`relative overflow-hidden bg-surface-2 ${
          mobileList ? "aspect-square w-1/2 flex-shrink-0 md:w-full" : "aspect-square w-full"
        }`}
      >
        <Image
          src={car.image}
          alt={`${car.year} ${car.make} ${car.model} ${car.trim}`}
          fill
          sizes="(min-width: 1024px) 22vw, (min-width: 640px) 45vw, 90vw"
          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-105"
        />

        {/* Top-right corner arrow badge */}
        <div className="pointer-events-none absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <ArrowUpRight size={18} />
        </div>

        {/* Dealer branding & phone stripe at bottom */}
        <div className="absolute inset-x-0 bottom-0 z-10 flex items-center justify-between gap-2 bg-black/85 px-3 py-2">
          <span className="truncate text-[0.65rem] leading-none text-white [font-family:var(--font-script)]">{DEALER_NAME}</span>
          <span className="flex shrink-0 items-center gap-1 text-[0.55rem] font-medium text-white">
            <Phone className="h-3 w-3" />
            {DEALER_PHONE}
          </span>
        </div>
      </div>

      {/* Card Content (5-row hierarchy) */}
      <div
        className={`flex flex-1 flex-col gap-3 bg-surface-2 p-4 text-foreground ${
          mobileList ? "justify-center md:justify-start" : "justify-start"
        }`}
      >
        {/* Row 1: Year (left) + Arrow indicator (right) */}
        <div className="flex items-center justify-between">
          <span className="text-[0.7rem] font-bold uppercase tracking-wide text-muted">
            {car.year}
          </span>
        </div>

        {/* Row 2: Make & Model (large, bold heading) */}
        <h2 className="text-lg font-bold leading-tight text-foreground text-left">
          {car.make} {car.model}
        </h2>

        {/* Row 3: Feature strip (color • km • fuel) */}
        <div className="flex flex-wrap items-center gap-1.5 text-[0.8rem] font-medium text-muted justify-start">
          <span className="flex items-center gap-1">
            <span
              className="h-2.5 w-2.5 rounded-full border border-muted-2 flex-shrink-0"
              style={{ backgroundColor: resolveCarSwatchColor(car.color, car.colorHex) }}
            />
            {car.color}
          </span>
          <span className="text-muted/50">•</span>
          <span>{mileageFormat.format(car.mileage)} km</span>
          <span className="text-muted/50">•</span>
          <span>{FUEL_TYPE_LABELS[car.fuelType] ?? car.fuelType}</span>
        </div>

        {/* Row 4: Pricing block (cash price left, monthly payment right) */}
        <div className="flex items-end justify-between gap-3 pt-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-[0.7rem] font-medium text-muted">Precio</p>
            <p className="text-[0.95rem] font-semibold text-foreground">
              {currency.format(car.price)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[0.7rem] font-medium text-muted">Cuota Est.</p>
            <p className="text-2xl font-bold leading-none text-foreground">
              {currency.format(estimateMonthlyPayment(car.price))}
              <span className="text-[0.65rem] font-medium text-muted">/mes</span>
            </p>
          </div>
        </div>

        {/* Row 5: Fine print disclaimer */}
        <p className="text-[0.65rem] leading-tight text-muted/60">
          {CARD_PAYMENT_DISCLAIMER}
        </p>
      </div>
    </motion.article>
  );
}
