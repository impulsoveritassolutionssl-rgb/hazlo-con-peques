"use client";

import { motion } from "framer-motion";
import { Star, Quote, Sparkles } from "lucide-react";

const testimonials = [
  {
    id: 1,
    name: "María García",
    childName: "Lucas",
    childAge: 5,
    avatar: "👩",
    rating: 5,
    text: "Mi hijo no paraba de hablar de la clase de ciencia. Aprendió sobre moléculas jugando y ahora quiere ser científico. ¡Increíble experiencia!",
    highlight: "clase de ciencia",
  },
  {
    id: 2,
    name: "Carlos Rodríguez",
    childName: "Emma",
    childAge: 7,
    avatar: "👨",
    rating: 5,
    text: "Las actividades de arte han despertado la creatividad de Emma. El progreso que podemos ver en la app es muy motivador para ella.",
    highlight: "creatividad",
  },
  {
    id: 3,
    name: "Ana Martínez",
    childName: "Pablo",
    childAge: 4,
    avatar: "👩‍🦰",
    rating: 5,
    text: "Encontramos talleres perfectos para su edad. Los monitores son súper cariñosos y profesionales. Repetiremos seguro.",
    highlight: "perfectos para su edad",
  },
];

export function Testimonials() {
  return (
    <section id="testimonios" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="rainbow-pill-soft inline-flex items-center gap-2 mb-4">
            <span className="text-lg">💬</span>
            <span className="text-sm font-medium">Lo que dicen las familias</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Familias{" "}
            <span className="rainbow-text-animated">
              felices
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Miles de padres ya confían en Peques para el aprendizaje de sus hijos
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.15 }}
              whileHover={{ y: -5 }}
              className="rainbow-card-accent rounded-2xl shadow-lg p-6 md:p-8 relative group hover:rainbow-glow transition-all duration-300"
            >
              {/* Quote icon with rainbow gradient */}
              <div className="absolute top-6 right-6">
                <Quote className="w-12 h-12 text-primary/20 group-hover:text-primary/30 transition-colors" />
              </div>

              {/* Rating with animated stars */}
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.2, delay: 0.3 + i * 0.1 }}
                  >
                    <Star className="w-5 h-5 fill-yellow text-yellow" />
                  </motion.div>
                ))}
              </div>

              {/* Text with rainbow highlight on hover */}
              <p className="text-foreground leading-relaxed mb-6 relative z-10 group-hover:text-foreground/90 transition-colors">
                &ldquo;{testimonial.text}&rdquo;
              </p>

              {/* Author with rainbow styled avatar */}
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rainbow-border rounded-full flex items-center justify-center text-2xl bg-white">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground group-hover:rainbow-text transition-all">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">
                    Mamá de {testimonial.childName}, {testimonial.childAge} años
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Trust indicators with rainbow theme */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-12 flex flex-wrap justify-center gap-6 md:gap-12"
        >
          <div className="flex items-center gap-2 text-muted-foreground rainbow-card-accent px-4 py-2 rounded-full">
            <div className="flex -space-x-2">
              <div className="w-8 h-8 bg-primary/20 rounded-full border-2 border-white flex items-center justify-center text-sm">👩</div>
              <div className="w-8 h-8 bg-secondary/20 rounded-full border-2 border-white flex items-center justify-center text-sm">👨</div>
              <div className="w-8 h-8 bg-accent/20 rounded-full border-2 border-white flex items-center justify-center text-sm">👩‍🦰</div>
              <div className="w-8 h-8 bg-yellow/20 rounded-full border-2 border-white flex items-center justify-center text-sm">👨‍🦱</div>
            </div>
            <span className="text-sm font-medium rainbow-text">+5,000 familias</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground rainbow-card-accent px-4 py-2 rounded-full">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-yellow text-yellow" />
              ))}
            </div>
            <span className="text-sm font-medium rainbow-text">4.9 valoración media</span>
          </div>

          <div className="flex items-center gap-2 text-muted-foreground rainbow-card-accent px-4 py-2 rounded-full">
            <span className="text-xl">🏆</span>
            <span className="text-sm font-medium rainbow-text flex items-center gap-1">
              Top 10 apps educativas
              <Sparkles className="w-3 h-3 text-yellow-500" />
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
