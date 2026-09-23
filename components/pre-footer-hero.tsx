"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function PreFooterHero() {
  return (
    <section
      id="showroom"
      className="relative flex h-[68vh] min-h-[520px] w-full items-center justify-center overflow-hidden"
    >
      <Image
        src="https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=2400&q=80"
        alt="A performance coupe parked outside a showroom entrance in soft evening light"
        fill
        sizes="100vw"
        className="object-cover object-center"
      />
      <div className="absolute inset-0 bg-background/70 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/60 opacity-60" />

      <motion.div
        variants={staggerContainer}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="relative z-10 mx-auto flex max-w-2xl flex-col items-center gap-6 px-3 text-center sm:px-6"
      >
        <motion.h2
          variants={fadeUp}
          className="text-balance text-3xl font-semibold leading-tight tracking-tight text-foreground sm:text-5xl"
        >
          ¿Listo para Salir a la Ruta?
        </motion.h2>

        <motion.p variants={fadeUp} className="max-w-md text-[1rem] text-muted">
          Visita nuestro showroom para un recorrido privado, o habla con un
          asesor para encontrar el auto ideal para ti.
        </motion.p>

        <motion.div
          variants={fadeUp}
          className="mt-2 flex flex-col gap-3 sm:flex-row"
        >
          <a
            href="#contact"
            className="flex h-12 items-center justify-center rounded-full bg-foreground px-7 text-[0.9rem] font-medium text-accent-foreground transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]"
          >
            Visitar el Showroom
          </a>
          <a
            href="#contact"
            className="glass flex h-12 items-center justify-center rounded-full px-7 text-[0.9rem] font-medium text-foreground transition-colors duration-200 hover:bg-surface-2"
          >
            Hablar con un Asesor
          </a>
        </motion.div>
      </motion.div>
    </section>
  );
}
