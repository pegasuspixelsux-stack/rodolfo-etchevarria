"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { FinanceCalculator } from "@/components/finance-calculator";
import { TradeInForm } from "@/components/trade-in-form";

const FINANCING_PARTNERS = [
  { name: "Banco Itaú", logo: "ITAÚ" },
  { name: "Santander", logo: "SANTANDER" },
  { name: "BBVA", logo: "BBVA" },
  { name: "Scotiabank", logo: "SCOTIABANK" },
];

const CALCULATOR_IMAGE =
  "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=800&q=80";
const TRADEIN_IMAGE =
  "https://images.unsplash.com/photo-1619405399517-d4b794f2ceef?auto=format&fit=crop&w=800&q=80";

export function FinanceTabs() {
  return (
    <>
      {/* Financing Partners Section */}
      <section id="financing" className="bg-background px-3 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="mb-16 flex flex-col items-center gap-8 text-center"
          >
            <div className="flex flex-col gap-3">
              <p className="text-[0.9rem] font-medium text-muted">Financing Partners</p>
              <h2 className="text-balance font-heading text-2xl font-normal tracking-tight text-foreground sm:text-4xl">
                Estimate Your Payment
              </h2>
            </div>

            <motion.div
              variants={staggerContainer}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-50px" }}
              className="flex w-full flex-wrap items-center justify-center gap-6 sm:gap-8"
            >
              {FINANCING_PARTNERS.map(({ name, logo }) => (
                <motion.div
                  key={name}
                  variants={fadeUp}
                  className="flex items-center justify-center rounded-none border border-border bg-surface/40 px-4 py-2.5"
                >
                  <span className="text-[0.75rem] font-semibold text-muted sm:text-[0.85rem]">{logo}</span>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Calculator Section with Image */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center"
          >
            <motion.div
              variants={fadeUp}
              className="glass relative overflow-hidden rounded-none p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] sm:p-10"
            >
              <h3 className="mb-6 font-heading text-[1.05rem] font-normal text-foreground">
                Calculadora Financiera
              </h3>
              <FinanceCalculator />
            </motion.div>

            <motion.div variants={fadeUp} className="relative aspect-square overflow-hidden">
              <Image
                src={CALCULATOR_IMAGE}
                alt="Financial Calculator"
                fill
                sizes="(min-width: 768px) 400px, 100vw"
                quality={85}
                className="object-cover object-center"
              />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Trade-In Section */}
      <section className="bg-surface px-3 py-24 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 gap-8 md:grid-cols-2 md:items-center"
          >
            <motion.div variants={fadeUp} className="relative aspect-square overflow-hidden md:order-2">
              <Image
                src={TRADEIN_IMAGE}
                alt="Trade-In Your Vehicle"
                fill
                sizes="(min-width: 768px) 400px, 100vw"
                quality={85}
                className="object-cover object-center"
              />
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="glass relative overflow-hidden rounded-none p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] sm:p-10 md:order-1"
            >
              <h3 className="mb-3 font-heading text-[1.05rem] font-normal text-foreground">
                Trade-In Your Vehicle
              </h3>
              <p className="mb-6 text-[0.95rem] leading-relaxed text-foreground/80">
                Turn your current vehicle into the key to your dream car. Submit your information and we'll
                provide an instant valuation to apply toward your next purchase.
              </p>
              <TradeInForm />
            </motion.div>
          </motion.div>
        </div>
      </section>
    </>
  );
}
