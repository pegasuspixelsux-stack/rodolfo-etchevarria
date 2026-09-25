"use client";

import { motion } from "framer-motion";
import type { Car } from "@/data/cars";
import { CarCard } from "@/components/car-card";
import { staggerContainer } from "@/lib/motion";

export function SimilarCarsSlider({ cars }: { cars: Car[] }) {
  if (cars.length === 0) return null;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="py-14"
    >
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <h2 className="font-heading text-2xl font-normal tracking-tight text-foreground">
          Vehículos similares
        </h2>
      </div>
      <div className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 px-6 sm:px-8">
        {cars.map((car) => (
          <div key={car.id} className="w-52 flex-shrink-0 snap-start sm:w-60">
            <CarCard car={car} layout="portrait" />
          </div>
        ))}
      </div>
    </motion.div>
  );
}
