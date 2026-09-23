"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { easeOut } from "@/lib/motion";
import { ThemeToggle } from "@/components/theme-toggle";

const NAV_LINKS = [
  { label: "Inventario", href: "/#inventory" },
  { label: "Sala de Exhibición", href: "/#showroom" },
  { label: "Financiamiento", href: "/#financing" },
  { label: "Nosotros", href: "/#about" },
  { label: "Contacto", href: "/#contact" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled
          ? "backdrop-blur-md bg-background/80 border-b border-border"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-18 bg-gradient-to-b from-background/50 via-background/15 to-transparent backdrop-blur-sm transition-opacity duration-300 ${
          scrolled ? "opacity-0" : "opacity-100"
        }`}
      />

      <nav className="mx-auto flex h-18 max-w-7xl items-center justify-between px-6 lg:px-8">
        <Link
          href="/"
          className="text-[2.85rem] leading-none tracking-tight text-foreground [font-family:var(--font-script)]"
        >
          Rodolfo Etchevarria
        </Link>

        <ul className="hidden items-center gap-9 lg:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="group relative text-[0.9rem] text-white/80 transition-colors duration-200 hover:text-white"
              >
                {link.label}
                <span className="absolute -bottom-1.5 left-0 h-px w-0 bg-foreground transition-all duration-300 ease-out group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="hidden items-center gap-4 lg:flex">
          <ThemeToggle />
          <a
            href="/#contact"
            className="inline-flex h-10 items-center rounded-full bg-foreground px-5 text-[0.85rem] font-medium text-accent-foreground transition-transform duration-200 ease-out hover:scale-[1.03] active:scale-[0.97]"
          >
            Agenda una Prueba de Manejo
          </a>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label={menuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-full text-foreground"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            transition={{ duration: 0.25, ease: easeOut }}
            className="glass absolute inset-x-0 top-full lg:hidden"
          >
            <ul className="flex flex-col px-6 py-4">
              {NAV_LINKS.map((link) => (
                <li key={link.href} className="border-b border-border last:border-none">
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3.5 text-[0.95rem] text-foreground/90"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
              <li className="pt-4">
                <a
                  href="/#contact"
                  onClick={() => setMenuOpen(false)}
                  className="flex h-11 w-full items-center justify-center rounded-full bg-foreground text-[0.9rem] font-medium text-accent-foreground"
                >
                  Agenda una Prueba de Manejo
                </a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
