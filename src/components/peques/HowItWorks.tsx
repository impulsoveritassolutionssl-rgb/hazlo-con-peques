"use client";

import { motion } from "framer-motion";
import { Search, CalendarCheck, Trophy, ArrowRight, Sparkles } from "lucide-react";

const steps = [
  {
    number: "01",
    icon: Search,
    title: "Encuentra una actividad",
    description: "Busca por edad, temática o modalidad. Tenemos cientos de opciones para cada peque.",
  },
  {
    number: "02",
    icon: CalendarCheck,
    title: "Reserva o participa",
    description: "Inscríbete fácilmente online o sigue las instrucciones para actividades en casa.",
  },
  {
    number: "03",
    icon: Trophy,
    title: "Mira el progreso",
    description: "Sigue los logros y aprendizajes de tu peque. Cada actividad suma experiencia.",
  },
];

export function HowItWorks() {
  return (
    <section id="como-funciona" className="py-16 md:py-24 bg-gradient-to-b from-muted/30 to-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="rainbow-pill-soft inline-flex items-center gap-2 mb-4">
            <span className="text-lg">🚀</span>
            <span className="text-sm font-medium">Super fácil</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            ¿Cómo funciona{" "}
            <span className="rainbow-text-animated">
              Peques
            </span>
            ?
          </h2>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            En solo 3 pasos tu peque empezará a aprender y divertirse
          </p>
        </motion.div>

        <div className="relative">
          {/* Rainbow connection line - desktop */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary via-secondary to-accent opacity-30 rounded-full" />

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <motion.div
                  key={step.number}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.2 }}
                  className="relative"
                >
                  <div className="rainbow-card-accent rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-xl hover:rainbow-glow transition-all duration-300 text-center relative z-10 group">
                    {/* Step number with rainbow border */}
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 rainbow-border-animated bg-white font-bold text-sm w-8 h-8 rounded-full flex items-center justify-center shadow-md">
                      <span className="rainbow-text">{step.number}</span>
                    </div>

                    {/* Icon with rainbow gradient background */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-16 h-16 rainbow-button rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                    >
                      <Icon className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Title with rainbow hover effect */}
                    <h3 className="text-xl font-bold text-foreground mb-3 group-hover:rainbow-text transition-all">
                      {step.title}
                    </h3>

                    {/* Description */}
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Arrow - mobile/tablet */}
                  {index < steps.length - 1 && (
                    <motion.div
                      animate={{ y: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="flex justify-center py-4 md:hidden"
                    >
                      <ArrowRight className="w-6 h-6 text-primary rotate-90" />
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Fun decorative elements with rainbow theme */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-16 text-center"
        >
          <div className="inline-flex items-center gap-4 rainbow-hero rainbow-border px-8 py-4 rounded-2xl rainbow-glow">
            <span className="text-3xl">🎉</span>
            <p className="text-foreground font-medium flex items-center gap-2">
              Más de <span className="rainbow-text-animated font-bold">5,000 familias</span> ya confían en nosotros
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </p>
            <span className="text-3xl">🎉</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
