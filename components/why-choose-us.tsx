"use client";

import { motion } from "framer-motion";
import { HandCoins, LifeBuoy, ShieldCheck, Tag } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Inspecciones Certificadas",
    description:
      "Cada vehículo pasa por una inspección multisistema de 150 puntos antes de llegar a nuestro predio.",
  },
  {
    icon: Tag,
    title: "Precios Transparentes",
    description:
      "Sin costos ocultos, sin recargos de último momento — el precio que ves es el precio que pagas.",
  },
  {
    icon: HandCoins,
    title: "Financiamiento Sin Presión",
    description:
      "Explora las opciones de financiamiento a tu propio ritmo, con condiciones adaptadas a tu presupuesto.",
  },
  {
    icon: LifeBuoy,
    title: "Soporte de por Vida",
    description:
      "Revisiones gratuitas y turnos prioritarios durante todo el tiempo que tengas tu vehículo DriveTime.",
  },
];

export function WhyChooseUs() {
  return (
    <section id="about" className="bg-background px-3 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-14 lg:grid-cols-2 lg:gap-20">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col justify-center gap-6"
        >
          <motion.p variants={fadeUp} className="text-[0.9rem] font-medium text-muted">
            Por Qué Elegir DriveTime
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-balance text-2xl font-semibold leading-tight tracking-tight text-foreground sm:text-4xl"
          >
            Impulsados por la Calidad, Definidos por la Confianza
          </motion.h2>
          <motion.p variants={fadeUp} className="max-w-lg text-[0.98rem] leading-relaxed text-muted">
            Cada vehículo de nuestra colección pasa por una rigurosa
            inspección multipunto mucho antes de ser publicado — porque la
            confianza se gana en los detalles en los que nunca tienes que
            pensar. Fijamos precios de forma transparente, explicamos cada
            opción en un lenguaje claro y armamos el financiamiento en torno
            a tu vida, no a nuestra cuota.
          </motion.p>
          <motion.p variants={fadeUp} className="max-w-lg text-[0.98rem] leading-relaxed text-muted">
            Desde tu primera prueba de manejo hasta años después, nuestro
            equipo sigue disponible — para que comprar un auto se sienta
            menos como una negociación y más como una decisión que puedes
            tomar con confianza.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        >
          {PILLARS.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="group relative flex flex-col gap-4 overflow-hidden rounded-2xl border border-border bg-surface/60 p-6 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-border-strong hover:bg-surface"
            >
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(8,16,60,0.65),transparent_60%)]" />

              <span className="glass relative flex h-11 w-11 items-center justify-center rounded-xl text-foreground">
                <Icon size={20} />
              </span>
              <div className="relative flex flex-col gap-1.5">
                <h3 className="text-[0.98rem] font-semibold text-foreground">
                  {title}
                </h3>
                <p className="text-[0.85rem] leading-relaxed text-muted">
                  {description}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
