"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Mail, MapPin, Phone } from "lucide-react";
import {
  FacebookIcon,
  InstagramIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/social-icons";
import { ThemeToggle } from "@/components/theme-toggle";

const QUICK_LINKS = [
  { label: "Inventario", href: "/#inventory" },
  { label: "Financiamiento", href: "/#financing" },
  { label: "Permuta", href: "/#financing" },
  { label: "Ofertas Especiales", href: "/#financing" },
];

const SOCIALS = [
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { label: "X", href: "https://x.com", icon: XIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YoutubeIcon },
];

export function Footer() {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail("");
  };

  return (
    <footer id="contact" className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
          <div className="flex flex-col gap-4">
            <span className="text-[1.2rem] font-semibold tracking-tight text-foreground">
              DriveTime
            </span>
            <p className="max-w-xs text-[0.9rem] leading-relaxed text-muted">
              Una concesionaria curada de sedanes, SUVs y vehículos de alto
              rendimiento diseñados con precisión — todos inspeccionados y
              certificados.
            </p>
            <div className="mt-2 flex items-center gap-3">
              {SOCIALS.map(({ label, href, icon: Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  aria-label={label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors duration-200 hover:border-border-strong hover:text-foreground"
                >
                  <Icon width={16} height={16} />
                </a>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[0.9rem] font-medium text-foreground">
              Enlaces Rápidos
            </h3>
            <ul className="flex flex-col gap-3">
              {QUICK_LINKS.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-[0.9rem] text-muted transition-colors duration-200 hover:text-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[0.9rem] font-medium text-foreground">
              Visitanos
            </h3>
            <ul className="flex flex-col gap-3 text-[0.9rem] text-muted">
              <li className="flex items-start gap-2.5">
                <MapPin size={16} className="mt-0.5 shrink-0" />
                <span>482 Meridian Avenue, San Francisco, CA 94107</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone size={16} className="shrink-0" />
                <span>(415) 555-0148</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail size={16} className="shrink-0" />
                <span>Lun – Sáb, 9 a 19 hs</span>
              </li>
            </ul>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-[0.9rem] font-medium text-foreground">
              Mantente Informado
            </h3>
            <p className="text-[0.9rem] text-muted">
              Novedades y ofertas, como máximo una vez por semana.
            </p>
            <form onSubmit={handleSubscribe} className="flex flex-col gap-3">
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="you@email.com"
                  className="h-11 flex-1 rounded-xl border border-border-strong bg-surface px-4 text-[0.88rem] text-foreground placeholder:text-muted-2 focus-visible:border-foreground/50 focus-visible:outline-none"
                />
                <button
                  type="submit"
                  className="flex h-11 items-center justify-center rounded-xl bg-foreground px-4 text-[0.85rem] font-medium text-accent-foreground transition-transform duration-150 ease-out hover:scale-[1.03] active:scale-[0.97]"
                >
                  Sumarme
                </button>
              </div>
              <AnimatePresence>
                {subscribed && (
                  <motion.p
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25, ease: "easeOut" }}
                    className="text-[0.82rem] text-muted"
                  >
                    Ya estás en la lista — te damos la bienvenida a DriveTime.
                  </motion.p>
                )}
              </AnimatePresence>
            </form>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 text-[0.82rem] text-muted-2 sm:flex-row">
          <p>© {new Date().getFullYear()} DriveTime Motors. Todos los derechos reservados.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="transition-colors hover:text-foreground">
              Política de Privacidad
            </Link>
            <Link href="#" className="transition-colors hover:text-foreground">
              Términos de Servicio
            </Link>
            <Link href="/login" className="transition-colors hover:text-foreground">
              Iniciar Sesión
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </footer>
  );
}
