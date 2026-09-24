"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Rows, Grid2x2 } from "lucide-react";
import { useInventory } from "@/lib/firebase/inventory";
import { CarCard } from "@/components/car-card";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { InventoryItem } from "@/lib/dashboard-data";

const BODY_TYPE_PILLS = ["All", "Sedan", "SUV", "Coupe"] as const;

const BODY_TYPE_LABELS: Record<(typeof BODY_TYPE_PILLS)[number], string> = {
  All: "Todos",
  Sedan: "Sedán",
  SUV: "SUV",
  Coupe: "Cupé",
};

export function CarGrid({ initialCars }: { initialCars?: InventoryItem[] }) {
  const { items: cars, loading, error } = useInventory(initialCars);
  const [bodyType, setBodyType] =
    useState<(typeof BODY_TYPE_PILLS)[number]>("All");
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(2);

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
          className="mb-12 hidden items-end justify-between gap-6 md:flex"
        >
          <h2 className="font-heading text-2xl font-normal tracking-tight text-foreground sm:text-4xl">
            Selección Premium
          </h2>
          <p className="max-w-md text-right text-[0.95rem] text-muted">
            Vehículos seleccionados a mano, cada uno inspeccionado y
            certificado antes de llegar a ti.
          </p>
        </motion.div>

        <div className="mb-8 flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap gap-2">
            {BODY_TYPE_PILLS.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setBodyType(type)}
                className={`rounded-none border px-4 py-2 text-[0.85rem] font-medium transition-colors duration-200 ${
                  bodyType === type
                    ? "border-foreground bg-foreground text-accent-foreground"
                    : "border-border-strong text-muted hover:text-foreground"
                }`}
              >
                {BODY_TYPE_LABELS[type]}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 border border-border-strong p-1 md:hidden">
            <button
              type="button"
              onClick={() => setMobileColumns(1)}
              aria-label="Ver en una columna"
              aria-pressed={mobileColumns === 1}
              className={`flex h-8 w-8 items-center justify-center transition-colors duration-200 ${
                mobileColumns === 1
                  ? "bg-foreground text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Rows size={15} />
            </button>
            <button
              type="button"
              onClick={() => setMobileColumns(2)}
              aria-label="Ver en dos columnas"
              aria-pressed={mobileColumns === 2}
              className={`flex h-8 w-8 items-center justify-center transition-colors duration-200 ${
                mobileColumns === 2
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
            mobileColumns === 1 ? "grid-cols-1" : "grid-cols-2"
          }`}
        >
          {!loading && visibleCars.map((car) => (
            <CarCard key={car.id} car={car} layout="portrait" />
          ))}
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
