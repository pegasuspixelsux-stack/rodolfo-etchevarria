"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useSiteSettings, type SiteSettings } from "@/lib/firebase/site-settings";

const SLIDES = [
  {
    src: "https://images.unsplash.com/photo-1698251015050-a79d0220f539?auto=format&fit=crop&w=2400&q=80",
    alt: "A white BMW M2 drifting on a race track, tires smoking against a mountain backdrop",
  },
  {
    src: "https://images.unsplash.com/photo-1625684188247-c49bb3d509a1?auto=format&fit=crop&w=2400&q=80",
    alt: "A blue BMW M2 driving head-on down a winding mountain road with headlights on",
  },
  {
    src: "https://images.unsplash.com/photo-1724626616961-ee7b3896b273?auto=format&fit=crop&w=2400&q=80",
    alt: "Close-up of a BMW interior — steering wheel with the BMW badge and digital instrument cluster",
  },
  {
    src: "https://images.unsplash.com/photo-1618458927573-af46c86f84bf?auto=format&fit=crop&w=2400&q=80",
    alt: "Close-up studio shot of a red BMW's front end, badge and headlight, under clean showroom lighting",
  },
];

const SLIDE_INTERVAL = 6000;

export function Hero({ initialSettings }: { initialSettings?: SiteSettings }) {
  const [slide, setSlide] = useState(0);
  const { settings } = useSiteSettings(initialSettings);
  const isVideoMode = settings.heroMode === "video" && Boolean(settings.heroVideoUrl);

  useEffect(() => {
    if (isVideoMode) return;
    const id = setInterval(() => {
      setSlide((current) => (current + 1) % SLIDES.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [isVideoMode]);

  return (
    <section
      id="top"
      className="relative flex h-[50vh] min-h-[420px] w-full items-end overflow-hidden bg-background sm:h-[90vh] sm:min-h-[640px]"
    >
      {isVideoMode ? (
        <video
          key={settings.heroVideoUrl}
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 h-full w-full object-cover"
        >
          <source src={settings.heroVideoUrl ?? undefined} />
        </video>
      ) : (
        <AnimatePresence initial={false}>
          <motion.div
            key={slide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={SLIDES[slide].src}
              alt={SLIDES[slide].alt}
              fill
              priority={slide === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-end justify-between gap-6 px-3 pb-6 sm:flex-row sm:px-6 sm:pb-10 lg:px-8"
      >
        <div className="flex flex-col gap-4 sm:gap-6">
          <motion.p
            variants={fadeUp}
            className="text-[0.9rem] font-medium text-white"
          >
            Inventario certificado · Entrega a nivel nacional
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="text-balance max-w-3xl font-heading text-3xl font-normal leading-[1.02] tracking-tight text-foreground sm:text-6xl sm:leading-[0.98] lg:text-[5.25rem]"
          >
            Encuentra tu Próxima Máquina
          </motion.h1>
        </div>

        <motion.p
          variants={fadeUp}
          className="hidden max-w-xs text-lg leading-relaxed text-black sm:block"
        >
          Una colección curada de sedanes, SUVs y vehículos de alto
          rendimiento — inspeccionados, certificados y entregados en tu puerta.
        </motion.p>

        {!isVideoMode && (
          <motion.div variants={fadeUp} className="flex gap-2">
            {SLIDES.map((item, index) => (
              <button
                key={item.src}
                type="button"
                aria-label={`Mostrar diapositiva ${index + 1}`}
                onClick={() => setSlide(index)}
                className={`h-1.5 rounded-none transition-all duration-300 ${
                  index === slide
                    ? "w-6 bg-foreground"
                    : "w-1.5 bg-foreground/40 hover:bg-foreground/70"
                }`}
              />
            ))}
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
