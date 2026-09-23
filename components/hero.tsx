"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
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
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10 opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-background/40 opacity-60" />

      {!isVideoMode && (
        <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-8">
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
        </div>
      )}

      <button
        type="button"
        aria-label="Desplazarse al inventario"
        onClick={() =>
          document
            .getElementById("inventory")
            ?.scrollIntoView({ behavior: "smooth", block: "start" })
        }
        className="absolute bottom-6 right-6 z-10 sm:bottom-8 sm:right-8"
      >
        <motion.span
          animate={{ opacity: [1, 0.25, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: "easeInOut" }}
          className="flex h-10 w-10 items-center justify-center rounded-none bg-white text-black"
        >
          <ChevronDown size={18} />
        </motion.span>
      </button>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-4 px-3 pb-16 pt-14 sm:gap-6 sm:px-6 sm:pb-36 sm:pt-24 lg:px-8"
      >
        <motion.p
          variants={fadeUp}
          className="text-[0.9rem] font-medium text-muted"
        >
          Inventario certificado · Entrega a nivel nacional
        </motion.p>

        <motion.h1
          variants={fadeUp}
          className="text-balance max-w-3xl font-heading text-3xl font-normal leading-[1.02] tracking-tight text-foreground sm:text-6xl sm:leading-[0.98] lg:text-[5.25rem]"
        >
          Encuentra tu Próxima Máquina de Precisión
        </motion.h1>

        <motion.p
          variants={fadeUp}
          className="hidden max-w-xl text-lg leading-relaxed text-muted sm:block"
        >
          Una colección curada de sedanes, SUVs y vehículos de alto
          rendimiento — inspeccionados, certificados y entregados en tu puerta.
        </motion.p>
      </motion.div>
    </section>
  );
}
