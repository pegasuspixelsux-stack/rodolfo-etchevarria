"use client";

import { motion } from "framer-motion";
import { HandCoins, LifeBuoy, ShieldCheck, Tag } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";

const PILLARS = [
  {
    icon: ShieldCheck,
    title: "Verified History",
    description:
      "Complete vehicle history reports and transparent accident records for every vehicle in our inventory.",
  },
  {
    icon: HandCoins,
    title: "Flexible Financing",
    description:
      "Multiple financing options tailored to your budget, with competitive rates and transparent terms.",
  },
  {
    icon: Tag,
    title: "Inspected Quality",
    description:
      "Every vehicle passes rigorous multi-point inspections ensuring you drive home with confidence.",
  },
  {
    icon: LifeBuoy,
    title: "Instant Trade-Ins",
    description:
      "Get an immediate valuation for your current vehicle and apply it directly to your purchase.",
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
            Nosotros
          </motion.p>
          <motion.h2
            variants={fadeUp}
            className="text-balance font-heading text-2xl font-normal leading-tight tracking-tight text-foreground sm:text-4xl"
          >
            Why Choose Eximar Motors
          </motion.h2>
          <motion.p variants={fadeUp} className="max-w-lg text-[0.98rem] leading-relaxed text-muted">
            At Eximar Motors, we believe buying a vehicle should be an exciting, transparent experience — not a stressful negotiation. Every car in our inventory undergoes rigorous inspection, and we price fairly with zero hidden costs.
          </motion.p>
          <motion.p variants={fadeUp} className="max-w-lg text-[0.98rem] leading-relaxed text-muted">
            Whether you're financing your purchase or trading in your current vehicle, our team is here to guide you every step of the way. We're committed to finding the perfect car at terms that work for you.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col gap-4"
        >
          {PILLARS.map(({ icon: Icon, title, description }) => (
            <motion.div
              key={title}
              variants={fadeUp}
              className="group relative flex flex-col gap-3 overflow-hidden rounded-none border border-border bg-surface/60 p-5 transition-all duration-300 ease-out hover:-translate-y-1 hover:border-border-strong hover:bg-surface"
            >
              <div className="flex items-start gap-3.5">
                <span className="glass relative flex h-10 w-10 shrink-0 items-center justify-center rounded-none text-primary">
                  <Icon size={18} />
                </span>
                <div className="relative flex flex-col gap-1">
                  <h3 className="font-heading text-[0.95rem] font-normal text-foreground">
                    {title}
                  </h3>
                  <p className="text-[0.8rem] leading-relaxed text-muted">
                    {description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
