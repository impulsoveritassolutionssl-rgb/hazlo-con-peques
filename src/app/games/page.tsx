"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { Beaker, Palette, Music, TreePine, BookOpen, FlaskConical, Gamepad2, Sparkles, Play, Target, Box, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

// Game categories with their games
const gameCategories = [
  {
    id: "creativity",
    name: "Creatividad",
    icon: Palette,
    color: "from-violet-500 to-purple-500",
    bgColor: "bg-violet-500/10",
    games: [
      {
        id: "voxel-toy-box",
        name: "Caja de Bloques 3D",
        description: "Construye como con bloques mágicos. Arrastra, gira y crea tus propias construcciones en 3D. ¡Tu imaginación es el límite!",
        href: "/games/voxel-toy-box",
        image: "https://images.unsplash.com/photo-1587654780291-39c9404d746b?w=800",
        ageRange: "6-10",
        difficulty: "Fácil",
        featured: true,
      },
    ],
  },
  {
    id: "science",
    name: "Ciencias",
    icon: Beaker,
    color: "from-blue-500 to-cyan-500",
    bgColor: "bg-blue-500/10",
    games: [
      {
        id: "periodic",
        name: "Tabla Periódica",
        description: "Explora los elementos químicos de forma interactiva. Aprende sobre átomos, números atómicos y propiedades de los elementos.",
        href: "/games/science/periodic",
        image: "https://i.postimg.cc/cgLhB5YB/tabla-periodica.png",
        ageRange: "8-14",
        difficulty: "Intermedio",
      },
    ],
  },
  {
    id: "strategy",
    name: "Estrategia",
    icon: Target,
    color: "from-red-500 to-orange-500",
    bgColor: "bg-red-500/10",
    games: [
      {
        id: "connect4",
        name: "4 en Raya",
        description: "El clásico juego de estrategia donde debes conectar 4 fichas del mismo color. Juega contra otro jugador y desarrolla tu pensamiento lógico.",
        href: "/games/connect4",
        image: "https://images.unsplash.com/photo-1606503825008-909a67e63c3d?w=800",
        ageRange: "6-12",
        difficulty: "Fácil",
      },
    ],
  },
  {
    id: "art",
    name: "Arte",
    icon: Palette,
    color: "from-pink-500 to-purple-500",
    bgColor: "bg-pink-500/10",
    games: [],
  },
  {
    id: "music",
    name: "Música",
    icon: Music,
    color: "from-orange-500 to-red-500",
    bgColor: "bg-orange-500/10",
    games: [],
  },
  {
    id: "nature",
    name: "Naturaleza",
    icon: TreePine,
    color: "from-green-500 to-emerald-500",
    bgColor: "bg-green-500/10",
    games: [],
  },
  {
    id: "reading",
    name: "Lectura",
    icon: BookOpen,
    color: "from-amber-500 to-yellow-500",
    bgColor: "bg-amber-500/10",
    games: [],
  },
  {
    id: "experiments",
    name: "Experimentos",
    icon: FlaskConical,
    color: "from-violet-500 to-indigo-500",
    bgColor: "bg-violet-500/10",
    games: [],
  },
];

export default function GamesHubPage() {
  // Get categories with games
  const categoriesWithGames = gameCategories.filter((cat) => cat.games.length > 0);
  const emptyCategories = gameCategories.filter((cat) => cat.games.length === 0);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Page Header Bar - Title only, navigation handled by AppShell */}
      <div className="bg-background/95 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-center gap-2">
          <Gamepad2 className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg">Juegos Peques</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Sparkles className="w-4 h-4" />
            <span>Aprende jugando</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Juegos Educativos
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Descubre juegos interactivos diseñados para que los niños aprendan
            mientras se divierten. Ciencias, arte, música y mucho más.
          </p>
        </motion.div>
      </section>

      {/* Featured CTA - Construye en 3D */}
      <section className="container mx-auto px-4 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Link href="/games/voxel-toy-box">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-600 via-purple-600 to-cyan-600 p-1 shadow-2xl hover:shadow-violet-500/25 transition-all duration-300 hover:-translate-y-1">
              <div className="relative bg-gradient-to-r from-violet-950/90 via-purple-950/90 to-cyan-950/90 rounded-[22px] p-6 md:p-8 flex flex-col md:flex-row items-center gap-6">
                {/* Icon */}
                <div className="shrink-0">
                  <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
                    <Box className="w-10 h-10 md:w-12 md:h-12 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 text-center md:text-left">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/20 text-violet-300 text-xs font-medium mb-3">
                    <Sparkles className="w-3 h-3" />
                    <span>Nuevo Juego</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">
                    ¡Caja de Bloques 3D!
                  </h2>
                  <p className="text-violet-200 text-sm md:text-base mb-4">
                    Construye como con bloques mágicos. Arrastra, gira y crea tus propias construcciones en 3D.
                  </p>
                  <Button
                    size="lg"
                    className="gap-2 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white rounded-xl shadow-lg"
                  >
                    Construye en 3D
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-cyan-500/20 to-transparent rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-violet-500/20 to-transparent rounded-full blur-3xl" />
              </div>
            </div>
          </Link>
        </motion.div>
      </section>

      {/* Games by Category */}
      <section className="container mx-auto px-4 pb-12">
        {categoriesWithGames.map((category, catIndex) => {
          const CategoryIcon = category.icon;
          return (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: catIndex * 0.1 }}
              className="mb-12"
            >
              {/* Category Header */}
              <div className="flex items-center gap-3 mb-6">
                <div
                  className={`w-10 h-10 rounded-xl ${category.bgColor} flex items-center justify-center`}
                >
                  <CategoryIcon className="w-5 h-5 text-foreground" />
                </div>
                <h2 className="text-2xl font-bold text-foreground">
                  {category.name}
                </h2>
                <span className="text-sm text-muted-foreground">
                  ({category.games.length} {category.games.length === 1 ? "juego" : "juegos"})
                </span>
              </div>

              {/* Games Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.games.map((game, gameIndex) => (
                  <motion.div
                    key={game.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: gameIndex * 0.1 + 0.2 }}
                  >
                    <Link href={game.href}>
                      <div className="group relative bg-card rounded-2xl border shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-2 transition-all duration-300">
                        {/* Game Preview with Image */}
                        <div className="relative h-48 overflow-hidden">
                          {game.image ? (
                            <>
                              <Image
                                src={game.image}
                                alt={game.name}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                              />
                              {/* Overlay gradient */}
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            </>
                          ) : (
                            <div
                              className={`w-full h-full bg-gradient-to-br ${category.color} flex items-center justify-center`}
                            >
                              <Beaker className="w-16 h-16 text-white/80" />
                            </div>
                          )}

                          {/* Play button overlay */}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                            <div className="w-16 h-16 rounded-full bg-white/95 shadow-xl flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform duration-300">
                              <Play className="w-7 h-7 text-primary ml-1" fill="currentColor" />
                            </div>
                          </div>

                          {/* Category badge */}
                          <div className="absolute top-3 left-3">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-foreground shadow-sm`}>
                              <CategoryIcon className="w-3.5 h-3.5" />
                              {category.name}
                            </span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="p-5">
                          <h3 className="font-bold text-lg text-foreground mb-2 group-hover:text-primary transition-colors">
                            {game.name}
                          </h3>
                          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                            {game.description}
                          </p>

                          {/* Meta */}
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="px-2.5 py-1.5 rounded-full bg-primary/10 text-primary font-medium">
                              {game.ageRange} años
                            </span>
                            <span className="px-2.5 py-1.5 rounded-full bg-muted font-medium">
                              {game.difficulty}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          );
        })}

        {/* Coming Soon Categories */}
        {emptyCategories.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-16"
          >
            <h2 className="text-xl font-bold text-foreground mb-6 text-center">
              Próximamente
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              {emptyCategories.map((category) => {
                const CategoryIcon = category.icon;
                return (
                  <div
                    key={category.id}
                    className="flex flex-col items-center p-4 rounded-xl bg-muted/50 border border-dashed opacity-60"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl ${category.bgColor} flex items-center justify-center mb-2`}
                    >
                      <CategoryIcon className="w-6 h-6 text-foreground/60" />
                    </div>
                    <span className="text-sm font-medium text-muted-foreground">
                      {category.name}
                    </span>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </section>

      {/* Footer CTA */}
      <section className="container mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-secondary/10 rounded-3xl p-8 text-center">
          <h3 className="text-2xl font-bold text-foreground mb-3">
            ¿Tienes ideas para nuevos juegos?
          </h3>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Estamos constantemente añadiendo nuevos juegos educativos.
            ¡Tu feedback nos ayuda a mejorar!
          </p>
          <Button asChild>
            <Link href="/contacto">Contáctanos</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
