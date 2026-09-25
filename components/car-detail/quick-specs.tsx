"use client";

import { motion } from "framer-motion";
import { Gauge, Zap, Droplets, Gauge as Mileage, Cog } from "lucide-react";
import type { Car } from "@/data/cars";
import type { CarDetail } from "@/data/car-details";
import { fadeUp, staggerContainer } from "@/lib/motion";

interface QuickSpec {
  label: string;
  value: string;
  icon: typeof Gauge;
}

export function QuickSpecs({
  car,
  detail,
}: {
  car: Car;
  detail: CarDetail;
}) {
  const specs: QuickSpec[] = [];

  // Extract engine and power from features if available
  let engineSpec = "N/A";
  let powerSpec = "N/A";

  if (detail.features.length > 0) {
    const engineFeature = detail.features[0];
    if (engineFeature.items.length > 0) {
      const firstItem = engineFeature.items[0];
      // Try to extract engine and power from the first feature item
      const match = firstItem.match(/([^,]+),\s*(\d+)\s*hp/i);
      if (match) {
        engineSpec = match[1].trim();
        powerSpec = match[2] + " HP";
      }
    }
  }

  specs.push(
    { label: "Motor", value: engineSpec, icon: Gauge },
    { label: "Potencia", value: powerSpec, icon: Zap },
    { label: "Combustible", value: car.fuelType, icon: Droplets },
    {
      label: "Mileaje",
      value: car.mileage === 0 ? "Nuevo" : `${car.mileage.toLocaleString()} km`,
      icon: Mileage,
    },
    { label: "Transmisión", value: car.transmission, icon: Cog }
  );

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="mx-auto max-w-[1000px] px-6 py-8 sm:px-8"
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-5 sm:gap-3">
        {specs.map((spec) => {
          const Icon = spec.icon;
          return (
            <motion.div
              key={spec.label}
              variants={fadeUp}
              className="flex flex-col items-center gap-2 rounded-none border border-border bg-surface/50 p-3 text-center sm:p-4"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-none bg-surface-2 text-foreground">
                <Icon size={16} />
              </span>
              <p className="text-[0.75rem] font-medium text-muted">{spec.label}</p>
              <p className="text-[0.85rem] font-semibold text-foreground leading-tight">
                {spec.value}
              </p>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
