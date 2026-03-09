"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ExternalLink,
  Sparkles,
  Box,
  Hand,
  RotateCcw,
  Palette,
  Gamepad2,
  Star,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

interface VoxelToyBoxEmbedProps {
  srcUrl: string;
  title: string;
  backUrl?: string;
}

/**
 * Specialized launcher component for Voxel Toy Box game
 * - Child-friendly UX with playful copy
 * - Opens game in new tab (required due to Google auth requirements)
 * - Event logging for analytics
 */
export function VoxelToyBoxEmbed({
  srcUrl,
  title,
  backUrl = "/games"
}: VoxelToyBoxEmbedProps) {
  const router = useRouter();
  const [hasLaunched, setHasLaunched] = useState(false);

  // Log event when entering the section
  useEffect(() => {
    console.log("[VoxelToyBox] User entered section - Caja de Bloques 3D");
  }, []);

  // Open game in new tab
  const launchGame = () => {
    console.log("[VoxelToyBox] User clicked 'Jugar Ahora' - launching game in new tab");
    setHasLaunched(true);
    window.open(srcUrl, "_blank", "noopener,noreferrer");
  };

  // Go back
  const handleBack = () => {
    console.log("[VoxelToyBox] User clicked 'Volver al Laboratorio'");
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const floatAnimation = {
    y: [0, -10, 0],
    rotate: [0, 5, -5, 0],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: "easeInOut" as const
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-violet-100 via-purple-50 to-cyan-100 dark:from-violet-950 dark:via-purple-950/50 dark:to-cyan-950">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-violet-200 dark:border-violet-800">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="gap-2 text-violet-600 hover:text-violet-800 dark:text-violet-400 hover:bg-violet-100 dark:hover:bg-violet-900/50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Volver al Laboratorio</span>
              <span className="sm:hidden">Volver</span>
            </Button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20">
              <Box className="w-4 h-4 text-violet-600 dark:text-violet-400" />
              <span className="text-sm font-bold text-violet-700 dark:text-violet-300">HAZLO CON PEQUES</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 md:py-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-4xl mx-auto"
        >
          {/* Floating 3D Blocks Animation */}
          <motion.div
            className="flex justify-center mb-6"
            animate={floatAnimation}
          >
            <div className="relative">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-3xl bg-gradient-to-br from-violet-500 via-purple-500 to-pink-500 shadow-2xl shadow-violet-500/30 flex items-center justify-center transform rotate-12">
                <Box className="w-16 h-16 md:w-20 md:h-20 text-white" />
              </div>
              <div className="absolute -top-4 -right-4 w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg flex items-center justify-center transform -rotate-12">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div className="absolute -bottom-2 -left-6 w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 shadow-lg flex items-center justify-center transform rotate-6">
                <Star className="w-6 h-6 text-white" />
              </div>
            </div>
          </motion.div>

          {/* Title Section */}
          <motion.div variants={itemVariants} className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-violet-500/20 to-cyan-500/20 text-violet-700 dark:text-violet-300 text-sm font-semibold mb-4">
              <Gamepad2 className="w-4 h-4" />
              <span>Juego Creativo 3D</span>
            </div>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-4">
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                {title}
              </span>
            </h1>

            <p className="text-xl md:text-2xl text-muted-foreground mb-2">
              ¡Construye mundos increíbles con bloques mágicos!
            </p>

            <p className="text-base text-muted-foreground/80">
              Powered by Google AI Studio
            </p>
          </motion.div>

          {/* Features Cards */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-violet-100 dark:border-violet-900 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
                <Palette className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Colores Infinitos</h3>
              <p className="text-sm text-muted-foreground">Elige entre millones de colores para tus bloques</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-cyan-100 dark:border-cyan-900 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">
                <Hand className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Fácil de Usar</h3>
              <p className="text-sm text-muted-foreground">Arrastra, suelta y crea - ¡así de simple!</p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-pink-100 dark:border-pink-900 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
                <RotateCcw className="w-7 h-7 text-white" />
              </div>
              <h3 className="font-bold text-lg text-foreground mb-2">Vista 3D</h3>
              <p className="text-sm text-muted-foreground">Gira y explora tu creación desde todos los ángulos</p>
            </div>
          </motion.div>

          {/* Main CTA */}
          <motion.div
            variants={itemVariants}
            className="bg-gradient-to-r from-violet-600 via-purple-600 to-pink-600 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-violet-500/20"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 mb-6"
            >
              <Rocket className="w-10 h-10 text-white" />
            </motion.div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">
              ¿Listo para construir?
            </h2>

            <p className="text-white/90 text-lg mb-8 max-w-lg mx-auto">
              El juego se abrirá en una nueva ventana donde podrás crear construcciones 3D increíbles
            </p>

            <Button
              onClick={launchGame}
              size="lg"
              className="bg-white hover:bg-gray-100 text-violet-700 font-bold text-lg px-10 py-7 rounded-2xl shadow-xl hover:shadow-2xl transition-all transform hover:scale-105 gap-3"
            >
              <Gamepad2 className="w-6 h-6" />
              ¡Jugar Ahora!
              <ExternalLink className="w-5 h-5" />
            </Button>

            {hasLaunched && (
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 text-white/80 text-sm flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                ¡El juego se ha abierto en una nueva ventana!
              </motion.p>
            )}
          </motion.div>

          {/* Info Section */}
          <motion.div
            variants={itemVariants}
            className="mt-8 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 border border-violet-100 dark:border-violet-800"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                <Star className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">¿Por qué se abre en otra ventana?</h3>
                <p className="text-sm text-muted-foreground">
                  Este juego es de Google AI Studio y necesita abrirse en su propia ventana para funcionar correctamente.
                  ¡No te preocupes, es completamente seguro y gratis!
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Tips */}
          <motion.div
            variants={itemVariants}
            className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl p-3 text-center">
              <Hand className="w-5 h-5 mx-auto mb-1 text-violet-600 dark:text-violet-400" />
              <p className="text-xs font-medium text-violet-700 dark:text-violet-300">Arrastra bloques</p>
            </div>
            <div className="bg-cyan-50 dark:bg-cyan-900/20 rounded-xl p-3 text-center">
              <RotateCcw className="w-5 h-5 mx-auto mb-1 text-cyan-600 dark:text-cyan-400" />
              <p className="text-xs font-medium text-cyan-700 dark:text-cyan-300">Gira la vista</p>
            </div>
            <div className="bg-pink-50 dark:bg-pink-900/20 rounded-xl p-3 text-center">
              <Palette className="w-5 h-5 mx-auto mb-1 text-pink-600 dark:text-pink-400" />
              <p className="text-xs font-medium text-pink-700 dark:text-pink-300">Cambia colores</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-center">
              <Sparkles className="w-5 h-5 mx-auto mb-1 text-amber-600 dark:text-amber-400" />
              <p className="text-xs font-medium text-amber-700 dark:text-amber-300">¡Crea magia!</p>
            </div>
          </motion.div>

          {/* Back Button */}
          <motion.div
            variants={itemVariants}
            className="mt-8 text-center"
          >
            <Button
              variant="ghost"
              onClick={handleBack}
              className="gap-2 text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver al Laboratorio de Juegos
            </Button>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

export default VoxelToyBoxEmbed;
