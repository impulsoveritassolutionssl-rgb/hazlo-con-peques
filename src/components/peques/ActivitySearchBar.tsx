"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Search, Atom, Palette, Music, Leaf, BookOpen, FlaskConical, MapPin, Monitor, Home } from "lucide-react";

const ageRanges = [
  { id: "2-3", label: "2-3 años", emoji: "👶" },
  { id: "4-5", label: "4-5 años", emoji: "🧒" },
  { id: "6-7", label: "6-7 años", emoji: "👦" },
  { id: "8-10", label: "8-10 años", emoji: "🧑" },
];

const topics = [
  { id: "ciencia", label: "Ciencia", icon: Atom, color: "bg-blue/20 text-blue border-blue/30" },
  { id: "arte", label: "Arte", icon: Palette, color: "bg-secondary/20 text-secondary border-secondary/30" },
  { id: "musica", label: "Música", icon: Music, color: "bg-primary/20 text-primary border-primary/30" },
  { id: "naturaleza", label: "Naturaleza", icon: Leaf, color: "bg-accent/20 text-accent border-accent/30" },
  { id: "lectura", label: "Lectura", icon: BookOpen, color: "bg-yellow/20 text-yellow border-yellow/30" },
  { id: "experimentos", label: "Experimentos", icon: FlaskConical, color: "bg-primary/20 text-primary border-primary/30" },
];

const modalities = [
  { id: "presencial", label: "Presencial", icon: MapPin },
  { id: "online", label: "Online", icon: Monitor },
  { id: "en-casa", label: "En casa", icon: Home },
];

interface ActivitySearchBarProps {
  onSearch?: (filters: { age: string | null; topic: string | null; modality: string | null }) => void;
}

export function ActivitySearchBar({ onSearch }: ActivitySearchBarProps) {
  const [selectedAge, setSelectedAge] = useState<string | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [selectedModality, setSelectedModality] = useState<string | null>(null);

  const handleSearch = () => {
    console.log("Search filters:", { age: selectedAge, topic: selectedTopic, modality: selectedModality });
    onSearch?.({ age: selectedAge, topic: selectedTopic, modality: selectedModality });
  };

  return (
    <section id="buscar" className="py-12 bg-gradient-to-b from-transparent to-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="bg-card rounded-3xl shadow-xl border p-6 md:p-8"
        >
          {/* Age filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <span className="text-lg">👶</span> Edad del peque
            </h3>
            <div className="flex flex-wrap gap-2">
              {ageRanges.map((age) => (
                <motion.button
                  key={age.id}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedAge(selectedAge === age.id ? null : age.id)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 border-2 ${
                    selectedAge === age.id
                      ? "bg-primary text-primary-foreground border-primary shadow-md"
                      : "bg-card hover:bg-muted border-border hover:border-primary/50"
                  }`}
                >
                  <span className="mr-1">{age.emoji}</span> {age.label}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Topic filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <span className="text-lg">🎯</span> Temática
            </h3>
            <div className="flex flex-wrap gap-2">
              {topics.map((topic) => {
                const Icon = topic.icon;
                return (
                  <motion.button
                    key={topic.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedTopic(selectedTopic === topic.id ? null : topic.id)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 border-2 flex items-center gap-2 ${
                      selectedTopic === topic.id
                        ? "bg-primary text-primary-foreground border-primary shadow-md"
                        : `${topic.color} hover:opacity-80`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {topic.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Modality filter */}
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
              <span className="text-lg">📍</span> Modalidad
            </h3>
            <div className="flex flex-wrap gap-2">
              {modalities.map((modality) => {
                const Icon = modality.icon;
                return (
                  <motion.button
                    key={modality.id}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedModality(selectedModality === modality.id ? null : modality.id)}
                    className={`px-4 py-2 rounded-full font-medium text-sm transition-all duration-300 border-2 flex items-center gap-2 ${
                      selectedModality === modality.id
                        ? "bg-secondary text-secondary-foreground border-secondary shadow-md"
                        : "bg-card hover:bg-muted border-border hover:border-secondary/50"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {modality.label}
                  </motion.button>
                );
              })}
            </div>
          </div>

          {/* Search button */}
          <div className="flex justify-center pt-2">
            <Button
              size="lg"
              onClick={handleSearch}
              className="rounded-xl px-10 py-6 text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300"
            >
              <Search className="w-5 h-5 mr-2" />
              Buscar actividades
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
