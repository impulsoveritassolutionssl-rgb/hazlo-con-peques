"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Atom,
  Palette,
  BookOpen,
  Globe2,
  Star,
  Trophy,
  Sparkles,
  Play,
  Lock,
  ChevronRight,
  Volume2,
  VolumeX,
} from "lucide-react";

// Mock data for kid categories and modules
const categories = [
  {
    id: "aprendizaje",
    name: "Aprendizaje",
    icon: Atom,
    color: "from-blue-500 to-cyan-400",
    bgColor: "bg-blue-500/10",
    emoji: "🔬",
    modulesCount: 12,
    completedCount: 5,
  },
  {
    id: "dibujo",
    name: "Dibujo",
    icon: Palette,
    color: "from-pink-500 to-rose-400",
    bgColor: "bg-pink-500/10",
    emoji: "🎨",
    modulesCount: 8,
    completedCount: 3,
  },
  {
    id: "escritura",
    name: "Escritura",
    icon: BookOpen,
    color: "from-amber-500 to-yellow-400",
    bgColor: "bg-amber-500/10",
    emoji: "✏️",
    modulesCount: 10,
    completedCount: 2,
  },
  {
    id: "idiomas",
    name: "Idiomas",
    icon: Globe2,
    color: "from-green-500 to-emerald-400",
    bgColor: "bg-green-500/10",
    emoji: "🌍",
    modulesCount: 6,
    completedCount: 1,
  },
];

const featuredModules = [
  {
    id: "1",
    title: "Las estrellas del cielo",
    category: "aprendizaje",
    thumbnail: "🌟",
    duration: "5 min",
    difficulty: "easy",
    locked: false,
  },
  {
    id: "2",
    title: "Dibuja un dinosaurio",
    category: "dibujo",
    thumbnail: "🦕",
    duration: "10 min",
    difficulty: "medium",
    locked: false,
  },
  {
    id: "3",
    title: "Mi primer cuento",
    category: "escritura",
    thumbnail: "📖",
    duration: "8 min",
    difficulty: "easy",
    locked: true,
  },
  {
    id: "4",
    title: "Colores en inglés",
    category: "idiomas",
    thumbnail: "🎨",
    duration: "5 min",
    difficulty: "easy",
    locked: false,
  },
];

const achievements = [
  { id: "1", name: "Primera estrella", emoji: "⭐", unlocked: true },
  { id: "2", name: "Artista", emoji: "🎨", unlocked: true },
  { id: "3", name: "Explorador", emoji: "🔭", unlocked: true },
  { id: "4", name: "Científico", emoji: "🧪", unlocked: false },
  { id: "5", name: "Escritor", emoji: "✍️", unlocked: false },
  { id: "6", name: "Políglota", emoji: "🗣️", unlocked: false },
];

export default function PequeDashboard() {
  const { data: session, isPending } = useSession();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showWelcome, setShowWelcome] = useState(true);

  // Auto-hide welcome after a few seconds
  useEffect(() => {
    const timer = setTimeout(() => setShowWelcome(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (isPending) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="text-6xl"
        >
          🌟
        </motion.div>
      </div>
    );
  }

  const userName = session?.user?.name || "Peque";
  const totalStars = achievements.filter((a) => a.unlocked).length * 10;

  return (
    <div className="min-h-screen rainbow-hero rainbow-blobs-intense overflow-hidden peque-mode">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <motion.div
          animate={{ y: [0, -20, 0], x: [0, 10, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-20 left-[10%] text-6xl opacity-20"
        >
          ⭐
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], x: [0, -15, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-40 right-[15%] text-5xl opacity-20"
        >
          🌈
        </motion.div>
        <motion.div
          animate={{ y: [0, -10, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-32 left-[20%] text-4xl opacity-20"
        >
          🚀
        </motion.div>
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-20 right-[25%] text-5xl opacity-20"
        >
          🎈
        </motion.div>
      </div>

      {/* Welcome Overlay */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 rainbow-button z-50 flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center text-white"
            >
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: 3 }}
                className="text-8xl mb-6"
              >
                👋
              </motion.div>
              <h1 className="text-4xl md:text-5xl font-bold mb-2">¡Hola {userName}!</h1>
              <p className="text-xl text-white/80">¡Vamos a aprender!</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Header Bar - Compact info bar, not a nav */}
      <div className="bg-white/90 backdrop-blur-lg border-b relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] rainbow-line-animated" />
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ scale: 1.1, rotate: 10 }}
              className="w-12 h-12 rainbow-button rounded-2xl flex items-center justify-center text-2xl shadow-lg"
            >
              🎮
            </motion.div>
            <div>
              <h1 className="font-bold text-xl text-foreground">¡Hola {userName}!</h1>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                <span className="text-sm font-medium text-muted-foreground">
                  {totalStars} estrellas
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="rounded-xl"
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </Button>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-6 max-w-6xl relative z-10">
        {/* Categories Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-yellow-500" />
            <span className="rainbow-text">¿Qué quieres aprender?</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category, index) => {
              const Icon = category.icon;
              const progress = Math.round(
                (category.completedCount / category.modulesCount) * 100
              );
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedCategory(category.id)}
                  className="cursor-pointer"
                >
                  <Card className={`rainbow-card-accent border-2 overflow-hidden ${category.bgColor} hover:shadow-xl transition-all`}>
                    <CardContent className="p-4 md:p-6 text-center">
                      <motion.div
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.5 }}
                        className="text-5xl md:text-6xl mb-3"
                      >
                        {category.emoji}
                      </motion.div>
                      <h3 className="font-bold text-lg text-foreground mb-2">{category.name}</h3>

                      {/* Progress bar */}
                      <div className="h-2 bg-white/50 rounded-full overflow-hidden mb-1">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
                          className={`h-full bg-gradient-to-r ${category.color} rounded-full`}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {category.completedCount}/{category.modulesCount} completados
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Featured Activities */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Play className="w-6 h-6 text-primary" />
            <span className="rainbow-text">¡Sigue jugando!</span>
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {featuredModules.map((module, index) => (
              <motion.div
                key={module.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 + index * 0.1 }}
                whileHover={{ scale: module.locked ? 1 : 1.05 }}
                whileTap={{ scale: module.locked ? 1 : 0.95 }}
                className={`cursor-pointer relative ${module.locked ? "opacity-70" : ""}`}
              >
                <Card className="rainbow-corner border-2 overflow-hidden hover:shadow-lg transition-all h-full rainbow-glow">
                  <CardContent className="p-4">
                    <div className="relative mb-3">
                      <div className="w-full aspect-square rainbow-pill-soft rounded-xl flex items-center justify-center text-5xl">
                        {module.thumbnail}
                      </div>
                      {module.locked && (
                        <div className="absolute inset-0 bg-black/30 rounded-xl flex items-center justify-center">
                          <Lock className="w-8 h-8 text-white" />
                        </div>
                      )}
                      {!module.locked && (
                        <motion.div
                          whileHover={{ scale: 1.2 }}
                          className="absolute bottom-2 right-2 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center"
                        >
                          <Play className="w-5 h-5 text-primary fill-primary" />
                        </motion.div>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-foreground line-clamp-2">
                      {module.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1">{module.duration}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Achievements Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-500" />
            <span className="rainbow-text">Mis logros</span>
          </h2>
          <Card className="rainbow-card-accent border-2 bg-gradient-to-br from-yellow-50 to-amber-50">
            <CardContent className="p-6">
              <div className="flex flex-wrap gap-4 justify-center">
                {achievements.map((achievement, index) => (
                  <motion.div
                    key={achievement.id}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: achievement.unlocked ? 1.1 : 1 }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl ${
                      achievement.unlocked
                        ? "bg-white shadow-lg"
                        : "bg-gray-200/50 opacity-50"
                    }`}
                  >
                    <div
                      className={`text-4xl ${
                        achievement.unlocked ? "" : "grayscale"
                      }`}
                    >
                      {achievement.emoji}
                    </div>
                    <span className="text-xs font-medium text-foreground text-center">
                      {achievement.name}
                    </span>
                    {achievement.unlocked && (
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 text-center">
                <p className="text-muted-foreground mb-2">
                  Has desbloqueado{" "}
                  <span className="font-bold text-foreground">
                    {achievements.filter((a) => a.unlocked).length}
                  </span>{" "}
                  de {achievements.length} logros
                </p>
                <Button className="rainbow-button">
                  <Trophy className="w-4 h-4 mr-2" />
                  Ver todos los logros
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.section>
      </main>
    </div>
  );
}
