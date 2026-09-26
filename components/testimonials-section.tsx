"use client";

import { Star } from "lucide-react";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";

const TESTIMONIALS = [
  {
    name: "María González",
    role: "Cliente verificado",
    rating: 5,
    text: "La experiencia fue excepcional. El equipo fue profesional, transparente y muy atento. Compré el vehículo que soñaba sin presión. ¡Altamente recomendado!",
  },
  {
    name: "Juan Rodríguez",
    role: "Cliente verificado",
    rating: 5,
    text: "Proceso ágil y sin complicaciones. El financiamiento fue flexible y adaptado a mis posibilidades. El auto llegó en perfecto estado, tal como se describía.",
  },
  {
    name: "Carlos Martínez",
    role: "Cliente verificado",
    rating: 5,
    text: "Servicio impecable de principio a fin. El equipo respondió todas mis preguntas y me ayudó a encontrar exactamente lo que buscaba. Muy satisfecho con mi compra.",
  },
  {
    name: "Ana Hernández",
    role: "Cliente verificado",
    rating: 5,
    text: "Excelente atención y vehículos de calidad. El proceso de financiamiento fue rápido y transparente. Recomiendo ampliamente Rodolfo Etchevarria a todos mis amigos.",
  },
];

export function TestimonialsSection() {
  return (
    <section className="bg-background px-3 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-12 text-center"
        >
          <h2 className="font-heading text-2xl font-normal tracking-tight text-foreground sm:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex gap-6 overflow-x-auto pb-4 sm:grid sm:grid-cols-2 md:grid-cols-4"
        >
          {TESTIMONIALS.map((testimonial) => (
            <motion.div
              key={testimonial.name}
              variants={fadeUp}
              className="flex w-[75vw] flex-shrink-0 flex-col gap-4 rounded-none border border-border bg-surface-2 p-6 sm:w-full sm:flex-shrink sm:p-8 md:w-full"
            >
              <div className="flex items-center gap-1">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-primary text-primary" />
                ))}
              </div>
              <p className="text-[0.95rem] leading-relaxed text-foreground">{testimonial.text}</p>
              <div className="flex flex-col gap-1 border-t border-border pt-4">
                <p className="font-medium text-foreground">{testimonial.name}</p>
                <p className="text-[0.8rem] text-muted">{testimonial.role}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
