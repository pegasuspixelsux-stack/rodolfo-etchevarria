"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { easeOut, fadeUp } from "@/lib/motion";
import { FormField, FormSelect } from "@/components/form-controls";

const MAKES = [
  "Any Make",
  "Land Rover",
  "BMW",
  "Porsche",
  "Tesla",
  "Honda",
  "Nissan",
  "Ford",
  "Mercedes-AMG",
  "Lamborghini",
];

const PRICE_RANGES = [
  "Any Price",
  "Under $70,000",
  "$70,000 – $100,000",
  "$100,000 – $150,000",
  "$150,000+",
];

const BODY_TYPES = ["Any Body Type", "Sedan", "SUV", "Coupe"];

export function SearchFilter() {
  const [isOpen, setIsOpen] = useState(false);
  const [make, setMake] = useState(MAKES[0]);
  const [price, setPrice] = useState(PRICE_RANGES[0]);
  const [bodyType, setBodyType] = useState(BODY_TYPES[0]);

  const summary = [make, price, bodyType].join(" · ");

  const handleSearch = () => {
    document
      .getElementById("inventory")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-80px" }}
      className="glass rounded-[28px] p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] sm:p-8"
    >
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-expanded={isOpen}
        className="flex w-full items-center justify-between gap-3 text-left lg:hidden"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border-strong text-foreground">
            <SlidersHorizontal size={16} />
          </span>
          <span className="flex flex-col">
            <span className="text-[0.95rem] font-medium text-foreground">
              Search Inventory
            </span>
            <span className="text-[0.78rem] text-muted-2">{summary}</span>
          </span>
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.25, ease: easeOut }}
          className="shrink-0 text-muted"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <motion.div
        initial={false}
        animate={{ height: isOpen ? "auto" : 0, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3, ease: easeOut }}
        className="overflow-hidden lg:!h-auto lg:!opacity-100 lg:overflow-visible"
      >
        <div className="grid grid-cols-1 gap-5 pt-6 sm:grid-cols-2 lg:grid-cols-[1.2fr_1fr_1fr_auto] lg:items-end lg:gap-4 lg:pt-0">
          <FormField label="Make / Model">
            <FormSelect options={MAKES} value={make} onChange={setMake} />
          </FormField>

          <FormField label="Price Range">
            <FormSelect
              options={PRICE_RANGES}
              value={price}
              onChange={setPrice}
            />
          </FormField>

          <FormField label="Body Type">
            <FormSelect
              options={BODY_TYPES}
              value={bodyType}
              onChange={setBodyType}
            />
          </FormField>

          <motion.button
            type="button"
            onClick={handleSearch}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="flex h-12 items-center justify-center gap-2 rounded-xl bg-foreground px-6 text-[0.9rem] font-medium text-accent-foreground"
          >
            <Search size={16} />
            Search Inventory
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}
