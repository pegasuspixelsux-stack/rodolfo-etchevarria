"use client";

import { motion } from "framer-motion";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { FinanceCalculator } from "@/components/finance-calculator";
import { TradeInForm } from "@/components/trade-in-form";

export function FinanceTabs() {
  return (
    <section id="financing" className="bg-background px-3 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mb-10 flex flex-col items-center gap-3 text-center"
        >
          <p className="text-[0.9rem] font-medium text-muted">Planifica tu Compra</p>
          <h2 className="text-balance font-heading text-2xl font-normal tracking-tight text-foreground sm:text-4xl">
            Estima tus Cuotas o Tasa tu Vehículo Actual
          </h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-8 md:grid-cols-2"
        >
          <motion.div
            variants={fadeUp}
            className="glass relative overflow-hidden rounded-none p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] sm:p-10"
          >
            <div className="relative">
              <h3 className="mb-6 font-heading text-[1.05rem] font-normal text-foreground">
                Calculadora Financiera
              </h3>
              <FinanceCalculator />
            </div>
          </motion.div>

          <motion.div
            variants={fadeUp}
            className="glass relative overflow-hidden rounded-none p-6 shadow-[0_40px_90px_-30px_rgba(0,0,0,0.7)] sm:p-10"
          >
            <div className="relative">
              <h3 className="mb-3 font-heading text-[1.05rem] font-normal text-foreground">
                Tasa tu Vehículo Actual
              </h3>
              <p className="mb-6 text-[0.95rem] leading-relaxed text-foreground/80">
                ¿Y si tu auto actual se convierte en la llave para el vehículo
                que soñás manejar? Envianos tus datos y tasamos tu vehículo
                para tomarlo como parte de pago en tu próxima compra.
              </p>
              <TradeInForm />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
