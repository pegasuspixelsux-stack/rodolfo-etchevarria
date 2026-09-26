"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { useSiteSettings, type SiteSettings } from "@/lib/firebase/site-settings";

const SLIDE_INTERVAL = 6000;

export function Hero({ initialSettings }: { initialSettings?: SiteSettings }) {
  const [slide, setSlide] = useState(0);
  const { settings } = useSiteSettings(initialSettings);
  const isVideoMode = settings.heroMode === "video" && Boolean(settings.heroVideoUrl);
  const slides = settings.heroSlideshowImages.map((src, index) => ({
    src,
    alt: `Foto ${index + 1} del carrusel principal`,
  }));
  const hasSlides = slides.length > 0;
  const activeSlide = hasSlides ? slide % slides.length : 0;

  useEffect(() => {
    if (isVideoMode || !hasSlides) return;
    const id = setInterval(() => {
      setSlide((current) => (current + 1) % slides.length);
    }, SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, [isVideoMode, hasSlides, slides.length]);

  return (
    <section
      id="top"
      className="relative flex aspect-square w-full items-end overflow-hidden bg-background sm:aspect-auto sm:h-[90vh] sm:min-h-[640px]"
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
        hasSlides && (
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
        )
      )}

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut", delay: 0.3 }}
        className="absolute inset-x-0 bottom-0 z-10 px-4 pb-20 sm:px-8 sm:pb-24"
      >
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 text-left">
          <h1 className="font-heading text-3xl font-normal leading-tight text-white sm:text-5xl">
            Premium Vehicles
          </h1>
          <p className="max-w-2xl text-[0.95rem] leading-relaxed text-white/90">
            Handpicked inventory of certified vehicles, meticulously inspected and ready to drive home.
          </p>
        </div>
      </motion.div>

      {!isVideoMode && hasSlides && (
        <motion.div
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-row gap-2 rotate-90 sm:right-8"
        >
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
    </section>
  );
}
