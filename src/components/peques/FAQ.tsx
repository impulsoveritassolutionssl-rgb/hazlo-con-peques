"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ShieldCheck, HelpCircle, Sparkles } from "lucide-react";

const faqs = [
  {
    question: "¿Cómo garantizáis la seguridad de las actividades?",
    answer: "Todas las actividades y organizadores pasan por un proceso de verificación. Revisamos credenciales, antecedentes y evaluamos cada actividad antes de publicarla. Además, contamos con un sistema de valoraciones y comentarios de familias reales.",
    icon: "🛡️",
  },
  {
    question: "¿Cómo puedo reservar una actividad?",
    answer: "Es muy sencillo: busca la actividad que te interese, selecciona la fecha y horario disponible, y completa el proceso de reserva. Recibirás una confirmación por email con todos los detalles.",
    icon: "📅",
  },
  {
    question: "¿Para qué edades están pensadas las actividades?",
    answer: "Tenemos actividades para niños de 2 a 10 años, organizadas en rangos de edad: 2-3, 4-5, 6-7 y 8-10 años. Cada actividad está diseñada específicamente para las capacidades y desarrollo de cada grupo.",
    icon: "👶",
  },
  {
    question: "¿Hay actividades online disponibles?",
    answer: "Sí, ofrecemos actividades en tres modalidades: presenciales (en ubicaciones físicas), online (clases en vivo por videollamada) y en casa (materiales y guías para realizar la actividad en tu hogar).",
    icon: "💻",
  },
  {
    question: "¿Qué pasa si tengo que cancelar una reserva?",
    answer: "Entendemos que los planes pueden cambiar. Puedes cancelar sin coste hasta 48 horas antes de la actividad. Para cancelaciones tardías, cada organizador tiene su propia política que puedes consultar en la descripción de la actividad.",
    icon: "🔄",
  },
  {
    question: "¿Cómo funciona el seguimiento del progreso?",
    answer: "Después de cada actividad, podrás ver en tu perfil los logros desbloqueados, habilidades desarrolladas y recomendaciones personalizadas. Es una forma divertida de motivar a tu peque y ver su evolución.",
    icon: "📊",
  },
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-16 md:py-24 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="rainbow-pill-soft inline-flex items-center gap-2 mb-4">
            <HelpCircle className="w-4 h-4" />
            <span className="text-sm font-medium">Preguntas frecuentes</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Tienes{" "}
            <span className="rainbow-text-animated">
              dudas
            </span>
            ?
          </h2>

          <p className="text-lg text-muted-foreground">
            Aquí respondemos las preguntas más comunes de nuestras familias
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className={`rainbow-card-accent rounded-2xl shadow-sm overflow-hidden transition-all duration-300 ${
                openIndex === index ? "rainbow-glow" : "hover:shadow-md"
              }`}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-5 flex items-center justify-between text-left hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <span className="text-2xl">{faq.icon}</span>
                  <span className={`font-semibold pr-4 transition-all ${openIndex === index ? "rainbow-text" : "text-foreground"}`}>
                    {faq.question}
                  </span>
                </div>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0"
                >
                  <ChevronDown className={`w-5 h-5 transition-colors ${openIndex === index ? "text-primary" : "text-muted-foreground"}`} />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <div className="px-6 pb-5 pt-2">
                      <div className="rainbow-line-animated mb-3" />
                      <p className="text-muted-foreground leading-relaxed pl-12">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* Security note with rainbow theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 rainbow-hero rounded-2xl rainbow-border p-6 md:p-8 rainbow-glow"
        >
          <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
            <div className="w-16 h-16 rainbow-border-animated rounded-2xl flex items-center justify-center flex-shrink-0 bg-white">
              <ShieldCheck className="w-8 h-8 text-accent" />
            </div>
            <div>
              <h3 className="text-lg font-bold rainbow-text mb-2 flex items-center justify-center md:justify-start gap-2">
                Tu tranquilidad es nuestra prioridad
                <Sparkles className="w-4 h-4 text-yellow-500" />
              </h3>
              <p className="text-muted-foreground text-sm">
                Todas las actividades están supervisadas y verificadas. Nuestro equipo revisa
                constantemente la calidad y seguridad de cada experiencia que ofrecemos.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
