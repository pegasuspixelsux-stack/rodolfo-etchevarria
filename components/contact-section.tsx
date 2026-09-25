"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, Mail, MapPin, MessageCircle, Phone, Send } from "lucide-react";
import { fadeUp, staggerContainer } from "@/lib/motion";
import { createLead } from "@/lib/firebase/leads";
import { useSiteSettings, type SiteSettings } from "@/lib/firebase/site-settings";

const fieldClass =
  "h-12 w-full rounded-none border border-border-strong bg-surface px-4 text-[0.9rem] text-foreground placeholder:text-muted-2 transition-colors duration-200 focus-visible:border-foreground/50 focus-visible:outline-none";

interface ContactDraft {
  name: string;
  email: string;
  phone: string;
  message: string;
}

const EMPTY_DRAFT: ContactDraft = { name: "", email: "", phone: "", message: "" };

export function ContactSection({ initialSettings }: { initialSettings?: SiteSettings }) {
  const { settings } = useSiteSettings(initialSettings);
  const [draft, setDraft] = useState<ContactDraft>(EMPTY_DRAFT);
  const [errors, setErrors] = useState<Partial<Record<keyof ContactDraft, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const whatsappDigits = settings.dealerWhatsapp.replace(/\D/g, "");
  const contactDetails = [
    { label: "Dirección", value: settings.dealerAddress, icon: MapPin },
    {
      label: "Correo electrónico",
      value: settings.dealerEmail,
      icon: Mail,
      href: `mailto:${settings.dealerEmail}`,
    },
    {
      label: "Teléfono",
      value: settings.dealerPhone,
      icon: Phone,
      href: `tel:${settings.dealerPhone.replace(/[^\d+]/g, "")}`,
    },
    {
      label: "WhatsApp",
      value: settings.dealerWhatsapp,
      icon: MessageCircle,
      href: `https://wa.me/${whatsappDigits}`,
    },
  ];

  const validate = () => {
    const nextErrors: Partial<Record<keyof ContactDraft, string>> = {};
    if (!draft.name.trim()) nextErrors.name = "El nombre es obligatorio";
    if (!draft.email.trim()) nextErrors.email = "El correo electrónico es obligatorio";
    if (!draft.message.trim()) nextErrors.message = "El mensaje es obligatorio";
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await createLead({
        name: draft.name.trim(),
        email: draft.email.trim(),
        phone: draft.phone.trim(),
        interestedIn: draft.message.trim(),
        source: "Formulario de contacto",
      });
      setSubmitted(true);
    } catch (error) {
      console.warn("No se pudo enviar la consulta:", error);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="contact" className="bg-background px-3 py-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 gap-12 md:grid-cols-2 md:gap-16"
        >
          <motion.div variants={fadeUp} className="flex flex-col justify-center gap-4">
            <h2 className="font-heading text-2xl font-normal tracking-tight text-foreground sm:text-4xl">
              Contáctanos
            </h2>
            <p className="max-w-md text-[0.95rem] leading-relaxed text-muted">
              Estamos aquí para ti 24/7. Contáctanos, llena el formulario con
              cualquier pregunta o utiliza nuestro asesor 24/7 para ayudarte a
              contestar tus preguntas. Visítanos en cualquiera de nuestras
              locations (la lista está acá abajo).
            </p>

            <ul className="mt-4 flex max-w-md flex-col gap-5 border-t border-border pt-8">
              {contactDetails.map(({ label, value, icon: Icon, href }) => (
                <li key={label} className="flex items-center gap-3.5">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-none border border-border-strong text-amber-500">
                    <Icon size={18} />
                  </span>
                  <div className="flex min-w-0 flex-col gap-0.5">
                    <p className="text-[0.75rem] font-medium text-muted">{label}</p>
                    {href ? (
                      <a
                        href={href}
                        className="truncate text-[0.9rem] text-foreground transition-colors hover:text-amber-500"
                      >
                        {value}
                      </a>
                    ) : (
                      <p className="text-[0.9rem] text-foreground">{value}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeUp}>
            {submitted ? (
              <div className="flex flex-col items-center gap-3 rounded-none border border-border bg-surface p-10 text-center">
                <span className="flex h-12 w-12 items-center justify-center rounded-none bg-surface-2 text-foreground">
                  <CheckCircle2 size={22} />
                </span>
                <h3 className="font-heading text-[1.05rem] font-normal text-foreground">
                  Consulta recibida
                </h3>
                <p className="text-[0.9rem] text-muted">
                  Un asesor se pondrá en contacto contigo en breve.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setDraft(EMPTY_DRAFT);
                    setSubmitted(false);
                  }}
                  className="mt-2 text-[0.85rem] font-medium text-foreground underline decoration-border-strong underline-offset-4"
                >
                  Enviar otra consulta
                </button>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4 rounded-none border border-border bg-surface p-6 sm:p-8"
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.8rem] font-medium text-muted">Nombre</label>
                    <input
                      value={draft.name}
                      onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                      placeholder="Jordan Avery"
                      className={fieldClass}
                    />
                    {errors.name && <p className="text-[0.78rem] text-red-500">{errors.name}</p>}
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-[0.8rem] font-medium text-muted">Correo electrónico</label>
                    <input
                      type="email"
                      value={draft.email}
                      onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                      placeholder="you@email.com"
                      className={fieldClass}
                    />
                    {errors.email && <p className="text-[0.78rem] text-red-500">{errors.email}</p>}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[0.8rem] font-medium text-muted">Teléfono</label>
                  <input
                    type="tel"
                    value={draft.phone}
                    onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                    placeholder="(415) 555-0148"
                    className={fieldClass}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[0.8rem] font-medium text-muted">Mensaje</label>
                  <textarea
                    value={draft.message}
                    onChange={(e) => setDraft((d) => ({ ...d, message: e.target.value }))}
                    placeholder="Contanos en qué podemos ayudarte..."
                    rows={4}
                    className={`${fieldClass} h-auto resize-none py-3`}
                  />
                  {errors.message && (
                    <p className="text-[0.78rem] text-red-500">{errors.message}</p>
                  )}
                </div>

                <motion.button
                  type="submit"
                  disabled={submitting}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  className="mt-2 flex h-12 items-center justify-center gap-2 rounded-none bg-primary text-[0.9rem] font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Send size={16} />
                  {submitting ? "Enviando…" : "Enviar Mensaje"}
                </motion.button>
              </form>
            )}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
