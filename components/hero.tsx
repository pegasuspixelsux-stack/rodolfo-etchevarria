"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useSiteSettings, type SiteSettings } from "@/lib/firebase/site-settings";

const DEFAULT_SLIDES = [
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
  const slides =
    settings.heroSlideshowImages.length > 0
      ? settings.heroSlideshowImages.map((src, index) => ({
          src,
          alt: `Foto ${index + 1} del carrusel principal`,
        }))
      : DEFAULT_SLIDES;
  const activeSlide = slide % slides.length;

  useEffect(() => {
    if (isVideoMode) return;
    const id = setInterval(() => {
      setSlide((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [isVideoMode, slides.length]);

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
            key={activeSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <Image
              src={slides[activeSlide].src}
              alt={slides[activeSlide].alt}
              fill
              priority={activeSlide === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          </motion.div>
        </AnimatePresence>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 h-[10%] bg-gradient-to-b from-background/60 to-transparent" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-background to-transparent" />

      <motion.div
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
        className="relative z-10 mx-auto flex w-full max-w-7xl flex-col items-center justify-center text-center"
      >
        {!isVideoMode && (
          <motion.div variants={fadeUp} className="flex gap-2">
            {slides.map((item, index) => (
              <button
                key={item.src}
                type="button"
                aria-label={`Mostrar diapositiva ${index + 1}`}
                onClick={() => setSlide(index)}
                className={`h-1.5 rounded-none transition-all duration-300 ${
                  index === activeSlide
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
