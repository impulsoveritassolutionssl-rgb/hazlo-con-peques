"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sparkles, Rocket, Palette, Star, Atom } from "lucide-react";
import { BRAND_ASSETS, HERO_IMAGES } from "@/assets/files";

export function HeroFun() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden rainbow-hero rainbow-hero-intense rainbow-blobs">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-[10%] w-16 h-16 rounded-full bg-secondary/20"
          animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-[15%] w-12 h-12 rounded-full bg-accent/20"
          animate={{ y: [0, 15, 0], rotate: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-32 left-[20%] w-10 h-10 rounded-full bg-primary/20"
          animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-48 right-[25%] w-14 h-14 rounded-full bg-yellow/30"
          animate={{ y: [0, 20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Floating icons */}
        <motion.div
          className="absolute top-32 left-[5%] text-secondary"
          animate={{ y: [0, -10, 0], rotate: [0, 15, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        >
          <Rocket className="w-8 h-8 opacity-40" />
        </motion.div>
        <motion.div
          className="absolute top-20 right-[8%] text-primary"
          animate={{ y: [0, 12, 0], rotate: [0, -20, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star className="w-10 h-10 opacity-40" />
        </motion.div>
        <motion.div
          className="absolute bottom-40 right-[12%] text-accent"
          animate={{ y: [0, -18, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        >
          <Atom className="w-12 h-12 opacity-30" />
        </motion.div>
        <motion.div
          className="absolute bottom-28 left-[8%] text-primary"
          animate={{ y: [0, 15, 0], rotate: [0, 360] }}
          transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-8 h-8 opacity-40" />
        </motion.div>
        <motion.div
          className="absolute top-[45%] left-[3%] text-secondary"
          animate={{ x: [0, 10, 0], y: [0, -8, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Palette className="w-10 h-10 opacity-30" />
        </motion.div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center lg:text-left"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="inline-flex items-center gap-2 rainbow-pill-soft px-4 py-2 rounded-full mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">La aventura del aprendizaje comienza aqui</span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6"
            >
              Aprender jugando es{" "}
              <span className="rainbow-text-animated">
                magia
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="text-lg sm:text-xl text-muted-foreground mb-8 max-w-xl mx-auto lg:mx-0"
            >
              Actividades increibles para peques por edad, cerca de ti o en casa.
              Descubre un mundo de diversión educativa.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.7 }}
              className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8"
            >
              <Button
                size="lg"
                className="rainbow-button rounded-xl px-8 py-6 text-lg font-semibold"
                asChild
              >
                <Link href="#actividades">
                  <Sparkles className="w-5 h-5 mr-2" />
                  Ver actividades
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rainbow-border-thin rounded-xl px-8 py-6 text-lg font-semibold border-2 border-transparent bg-white/80 backdrop-blur-sm text-foreground hover:bg-white transition-all duration-300"
                asChild
              >
                <Link href="/registro">
                  Publica tu evento ahora
                </Link>
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="flex flex-wrap gap-4 justify-center lg:justify-start text-sm text-muted-foreground"
            >
              <div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-accent rounded-full" />
                <span>Actividades revisadas</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-secondary rounded-full" />
                <span>Por edades</span>
              </div>
              <div className="flex items-center gap-2 bg-card/50 px-3 py-2 rounded-full">
                <div className="w-2 h-2 bg-primary rounded-full" />
                <span>Progreso visible para familias</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right content - Fun illustration grid */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative w-full aspect-square max-w-lg mx-auto">
              {/* Main central image - Logo Hazlo con Peques */}
              <motion.div
                className="rainbow-border rainbow-border-animated absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-3xl overflow-hidden shadow-2xl z-20 bg-white/95 backdrop-blur-sm flex items-center justify-center p-6"
                animate={{ rotate: [0, 2, 0, -2, 0], scale: [1, 1.02, 1] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={BRAND_ASSETS.logo}
                  alt={BRAND_ASSETS.logoAlt}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </motion.div>

              {/* Corner images around the logo - User's custom images */}
              {/* Top-left corner image */}
              <motion.div
                className="absolute top-0 left-4 w-32 h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-white z-10 rainbow-glow"
                animate={{ y: [0, -10, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={HERO_IMAGES.topLeft}
                  alt="Aprende jugando ciencia"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
              </motion.div>

              {/* Top-right corner image */}
              <motion.div
                className="absolute top-4 right-0 w-32 h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-white z-10 rainbow-glow"
                animate={{ y: [0, 12, 0], rotate: [0, -3, 0] }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={HERO_IMAGES.topRight}
                  alt="Ninos aprendiendo"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-secondary/30 to-transparent" />
              </motion.div>

              {/* Bottom-left corner image */}
              <motion.div
                className="absolute bottom-4 left-0 w-32 h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-white z-10 rainbow-glow"
                animate={{ y: [0, -8, 0], x: [0, 5, 0], rotate: [0, -2, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={HERO_IMAGES.bottomLeft}
                  alt="Ninos jugando"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-accent/30 to-transparent" />
              </motion.div>

              {/* Bottom-right corner image */}
              <motion.div
                className="absolute bottom-0 right-4 w-32 h-32 rounded-2xl overflow-hidden shadow-xl border-4 border-white z-10 rainbow-glow"
                animate={{ y: [0, 10, 0], rotate: [0, 2, 0] }}
                transition={{ duration: 3.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={HERO_IMAGES.bottomRight}
                  alt="Actividades para ninos"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-yellow/30 to-transparent" />
              </motion.div>

              {/* Decorative badges */}
              <motion.div
                className="absolute -top-4 right-20 rainbow-pill px-4 py-2 rounded-full shadow-lg font-semibold text-sm z-30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              >
                +500 actividades
              </motion.div>

              <motion.div
                className="absolute -bottom-2 left-16 rainbow-pill px-4 py-2 rounded-full shadow-lg font-semibold text-sm z-30"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              >
                Edades 2-10
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
