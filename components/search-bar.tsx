"use client";

import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp } from "@/lib/motion";

export function SearchBar() {
  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-50px" }}
      className="mx-auto w-full max-w-7xl px-6 sm:px-6 lg:px-8"
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search make, model, or keyword..."
          className="w-full rounded-none border border-border-strong bg-surface px-12 py-4 text-[0.95rem] text-foreground placeholder:text-muted focus-visible:border-foreground/50 focus-visible:outline-none"
        />
      </div>
    </motion.div>
  );
}
