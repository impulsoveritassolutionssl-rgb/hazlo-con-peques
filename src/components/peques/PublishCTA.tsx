"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Calendar, TrendingUp, CheckCircle, ArrowRight, Sparkles } from "lucide-react";

const benefits = [
  {
    icon: Users,
    title: "Mayor visibilidad",
    description: "Miles de familias buscan actividades cada día",
  },
  {
    icon: Calendar,
    title: "Gestión de reservas",
    description: "Sistema automático de inscripciones y recordatorios",
  },
  {
    icon: TrendingUp,
    title: "Crece tu negocio",
    description: "Estadísticas y herramientas para optimizar",
  },
];

const requirements = [
  "Descripción clara de la actividad",
  "Rango de edad recomendado",
  "Aforo y disponibilidad",
  "Lugar o modalidad (presencial/online)",
  "Materiales necesarios (si aplica)",
];

export function PublishCTA() {
  return (
    <section id="publicar" className="py-16 md:py-24 rainbow-hero relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[5%] w-24 h-24 bg-secondary/10 rounded-full blur-xl"
        />
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-[5%] w-32 h-32 bg-primary/10 rounded-full blur-xl"
        />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 rainbow-pill-soft px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Para organizadores y centros</span>
            </div>

            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">
              ¿Organizas actividades para{" "}
              <span className="rainbow-text">
                niños
              </span>
              ?
            </h2>

            <p className="text-lg text-muted-foreground mb-8">
              Publica tus actividades en Peques y llega a miles de familias que buscan
              experiencias educativas y divertidas para sus hijos.
            </p>

            {/* Benefits */}
            <div className="space-y-4 mb-8">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <motion.div
                    key={benefit.title}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-start gap-4"
                  >
                    <div className="w-12 h-12 bg-secondary/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Icon className="w-6 h-6 text-secondary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground">{benefit.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <Button
              size="lg"
              className="rainbow-button rounded-xl px-8 py-6 text-lg font-semibold"
              asChild
            >
              <Link href="/registro">
                Publica tu evento ahora
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
            </Button>
          </motion.div>

          {/* Right content - Requirements card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="rainbow-card-accent bg-card rounded-2xl border shadow-xl overflow-hidden">
              <div className="rainbow-button p-4 text-white">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  ¿Qué necesitas para publicar?
                </h3>
              </div>

              <div className="p-6 md:p-8">
                <ul className="space-y-4">
                  {requirements.map((req, index) => (
                    <motion.li
                      key={req}
                      initial={{ opacity: 0, y: 10 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                      className="flex items-center gap-3"
                    >
                      <div className="w-6 h-6 bg-accent/20 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-accent" />
                      </div>
                      <span className="text-foreground">{req}</span>
                    </motion.li>
                  ))}
                </ul>

                <div className="mt-8 p-4 bg-muted/50 rounded-xl border border-dashed">
                  <p className="text-sm text-muted-foreground text-center">
                    <span className="font-medium text-foreground">¿Tienes dudas?</span>{" "}
                    Nuestro equipo te ayuda a crear tu perfil y publicar tu primera actividad.
                  </p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-6 grid grid-cols-3 gap-4"
            >
              <div className="bg-card/50 backdrop-blur rounded-xl border p-4 text-center">
                <div className="text-2xl font-bold text-primary">+200</div>
                <div className="text-xs text-muted-foreground">Organizadores</div>
              </div>
              <div className="bg-card/50 backdrop-blur rounded-xl border p-4 text-center">
                <div className="text-2xl font-bold text-secondary">+500</div>
                <div className="text-xs text-muted-foreground">Actividades</div>
              </div>
              <div className="bg-card/50 backdrop-blur rounded-xl border p-4 text-center">
                <div className="text-2xl font-bold text-accent">98%</div>
                <div className="text-xs text-muted-foreground">Satisfacción</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
