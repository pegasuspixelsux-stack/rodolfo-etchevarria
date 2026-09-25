"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Rows, Square, Grid2x2 } from "lucide-react";
import { useInventory } from "@/lib/firebase/inventory";
import { useSiteSettings, type SiteSettings } from "@/lib/firebase/site-settings";
import { CarCard } from "@/components/car-card";
import { CarGridSkeleton } from "@/components/car-grid-skeleton";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { InventoryItem } from "@/lib/dashboard-data";

const BODY_TYPE_PILLS = ["All", "Sedan", "SUV", "Coupe", "Truck"] as const;

const BODY_TYPE_LABELS: Record<(typeof BODY_TYPE_PILLS)[number], string> = {
  All: "Todos",
  Sedan: "Sedán",
  SUV: "SUV",
  Coupe: "Cupé",
  Truck: "Camionetas",
};

type MobileView = "list" | "single" | "grid";

export function CarGrid({
  initialCars,
  initialSettings,
}: {
  initialCars?: InventoryItem[];
  initialSettings?: SiteSettings;
}) {
  const { items: cars, loading, error } = useInventory(initialCars);
  const { settings } = useSiteSettings(initialSettings);
  const [bodyType, setBodyType] =
    useState<(typeof BODY_TYPE_PILLS)[number]>("All");
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const visibleCars =
    bodyType === "All" ? cars : cars.filter((car) => car.bodyType === bodyType);

  return (
    <section id="inventory" className="bg-background px-3 pb-28 pt-[5%] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-8 flex flex-col items-start gap-2 md:mb-12 md:flex-row md:items-end md:justify-between md:gap-6"
        >
          <h2 className="font-heading text-2xl font-normal tracking-tight text-foreground sm:text-4xl">
            {settings.gridHeading}
          </h2>
          <p className="max-w-md text-left text-[0.95rem] text-muted md:text-right">
            {settings.gridSupportText}
          </p>
        </motion.div>

        <div className="mb-8 flex flex-row items-center justify-between gap-2 md:flex-wrap">
          <div className="flex min-w-0 flex-1 flex-nowrap gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] md:flex-wrap md:overflow-visible md:pb-0 [&::-webkit-scrollbar]:hidden">
            {BODY_TYPE_PILLS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setBodyType(type)}
                className={`flex-shrink-0 rounded-none border px-4 py-2 text-[0.85rem] font-medium transition-colors duration-200 ${
                  bodyType === type
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border-strong text-muted hover:text-foreground"
                }`}
              >
                {BODY_TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          <div className="flex flex-shrink-0 items-center gap-1 border border-border-strong p-1 md:hidden">
            <button
              type="button"
              onClick={() => setMobileView("single")}
              aria-label="Ver en columna única"
              aria-pressed={mobileView === "single"}
              className={`flex h-8 w-8 items-center justify-center transition-colors duration-200 ${
                mobileView === "single"
                  ? "bg-foreground text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Square size={15} />
            </button>
            <button
              type="button"
              onClick={() => setMobileView("list")}
              aria-label="Ver en lista"
              aria-pressed={mobileView === "list"}
              className={`flex h-8 w-8 items-center justify-center transition-colors duration-200 ${
                mobileView === "list"
                  ? "bg-foreground text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Rows size={15} />
            </button>
            <button
              type="button"
              onClick={() => setMobileView("grid")}
              aria-label="Ver en dos columnas"
              aria-pressed={mobileView === "grid"}
              className={`flex h-8 w-8 items-center justify-center transition-colors duration-200 ${
                mobileView === "grid"
                  ? "bg-foreground text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Grid2x2 size={15} />
            </button>
          </div>
        </div>

        {error && (
          <p className="text-center text-sm text-muted">No se pudo cargar el inventario — intenta de nuevo.</p>
        )}

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-80px" }}
          className={`grid gap-3 sm:gap-6 md:grid-cols-4 ${
            mobileView === "grid" ? "grid-cols-2" : "grid-cols-1"
          }`}
        >
          {loading && cars.length === 0 ? (
            <CarGridSkeleton />
          ) : (
            visibleCars.map((car) => (
              <CarCard key={car.id} car={car} layout="portrait" mobileList={mobileView === "list"} />
            ))
          )}
        </motion.div>

        <a
          href="#inventory"
          className="mt-8 block text-center text-[0.9rem] font-medium text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-foreground"
        >
          Ver todo el inventario
        </a>
      </div>
    </section>
  );
}
