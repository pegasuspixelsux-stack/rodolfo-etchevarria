"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Rows, Square, Grid2x2, Search } from "lucide-react";
import { useInventory } from "@/lib/firebase/inventory";
import { useSiteSettings, type SiteSettings } from "@/lib/firebase/site-settings";
import { CarCard } from "@/components/car-card";
import { CarGridSkeleton } from "@/components/car-grid-skeleton";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { InventoryItem } from "@/lib/dashboard-data";

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
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileView, setMobileView] = useState<MobileView>("list");
  const visibleCars = cars.filter((car) =>
    `${car.year} ${car.make} ${car.model}`
      .toLowerCase()
      .includes(searchQuery.toLowerCase())
  );

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

        <div className="mb-8 flex flex-row items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search make, model, or year..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-none border border-border-strong bg-surface px-10 py-2.5 text-[0.9rem] text-foreground placeholder:text-muted focus-visible:border-foreground/50 focus-visible:outline-none"
            />
          </div>

          <div className="flex flex-shrink-0 items-center gap-1 border border-border-strong p-1">
            <button
              type="button"
              onClick={() => setMobileView("single")}
              aria-label="Single column view"
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
              aria-label="List view"
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
              aria-label="Grid view"
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
