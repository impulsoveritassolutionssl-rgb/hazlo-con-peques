"use client";

import { motion } from "framer-motion";
import { Atom, Palette, Lightbulb, TrendingUp, Star, CheckCircle } from "lucide-react";

const learningBlocks = [
  {
    icon: Atom,
    emoji: "🔬",
    title: "Moléculas y ciencia visual",
    description: "Los peques descubren el mundo microscópico con animaciones 3D y experimentos interactivos que explican cómo funciona todo a su alrededor.",
    features: ["Animaciones 3D", "Experimentos guiados", "Quizzes divertidos"],
    color: "from-blue/20 to-primary/10",
    iconColor: "bg-blue text-white",
    borderColor: "border-blue/30",
  },
  {
    icon: Palette,
    emoji: "🎨",
    title: "Dibujo guiado paso a paso",
    description: "Tutoriales interactivos que enseñan a dibujar desde formas básicas hasta creaciones artísticas complejas, adaptados por edad.",
    features: ["Paso a paso visual", "Diferentes niveles", "Galería de creaciones"],
    color: "from-secondary/20 to-yellow/10",
    iconColor: "bg-secondary text-white",
    borderColor: "border-secondary/30",
  },
  {
    icon: Lightbulb,
    emoji: "💡",
    title: "Retos creativos semanales",
    description: "Cada semana un nuevo desafío que estimula la creatividad, el pensamiento crítico y la resolución de problemas.",
    features: ["Retos personalizados", "Sistema de puntos", "Certificados digitales"],
    color: "from-accent/20 to-blue/10",
    iconColor: "bg-accent text-white",
    borderColor: "border-accent/30",
  },
];

export function LearningInsideApp() {
  return (
    <section id="aprendizaje" className="py-16 md:py-24 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm font-medium">Aprendizaje inteligente</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tu peque aprende,{" "}
            <span className="bg-gradient-to-r from-secondary via-primary to-accent bg-clip-text text-transparent">
              tú ves su progreso
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Dentro de cada actividad, contenido educativo diseñado por expertos para que aprender sea una aventura
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {learningBlocks.map((block, index) => {
            const Icon = block.icon;
            return (
              <motion.div
                key={block.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                whileHover={{ y: -8 }}
                className={`bg-gradient-to-br ${block.color} rounded-2xl border ${block.borderColor} p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300`}
              >
                {/* Header with emoji and icon */}
                <div className="flex items-center gap-4 mb-6">
                  <motion.div
                    whileHover={{ rotate: 10, scale: 1.1 }}
                    className={`w-14 h-14 ${block.iconColor} rounded-xl flex items-center justify-center shadow-lg`}
                  >
                    <Icon className="w-7 h-7" />
                  </motion.div>
                  <span className="text-4xl">{block.emoji}</span>
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold text-foreground mb-3">
                  {block.title}
                </h3>

                {/* Description */}
                <p className="text-muted-foreground text-sm leading-relaxed mb-5">
                  {block.description}
                </p>

                {/* Features */}
                <ul className="space-y-2">
                  {block.features.map((feature, featureIndex) => (
                    <motion.li
                      key={feature}
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.3 + featureIndex * 0.1 }}
                      className="flex items-center gap-2 text-sm text-foreground"
                    >
                      <CheckCircle className="w-4 h-4 text-accent flex-shrink-0" />
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </motion.div>
            );
          })}
        </div>

        {/* Progress preview */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-16 bg-card rounded-2xl border shadow-xl overflow-hidden"
        >
          <div className="bg-gradient-to-r from-primary via-secondary to-accent p-1" />
          <div className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-center gap-8">
              {/* Left: Preview illustration */}
              <div className="flex-shrink-0">
                <div className="w-48 h-48 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center relative">
                  <motion.div
                    animate={{ rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                    className="text-6xl"
                  >
                    📊
                  </motion.div>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="absolute -top-2 -right-2 bg-accent text-white w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Star className="w-5 h-5" />
                  </motion.div>
                </div>
              </div>

              {/* Right: Content */}
              <div className="flex-1 text-center md:text-left">
                <h3 className="text-2xl font-bold text-foreground mb-3">
                  Panel de progreso para padres
                </h3>
                <p className="text-muted-foreground mb-6 max-w-lg">
                  Accede a estadísticas detalladas, logros desbloqueados y recomendaciones personalizadas
                  basadas en los intereses y avances de tu peque.
                </p>
                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                  <div className="bg-primary/10 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-primary">📈 Estadísticas semanales</span>
                  </div>
                  <div className="bg-secondary/10 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-secondary">🏆 Logros y medallas</span>
                  </div>
                  <div className="bg-accent/10 px-4 py-2 rounded-full">
                    <span className="text-sm font-medium text-accent">💡 Recomendaciones IA</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
