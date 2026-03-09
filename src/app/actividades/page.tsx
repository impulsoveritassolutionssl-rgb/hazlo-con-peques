"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  Calendar,
  Users,
  Clock,
  Star,
  Filter,
  Loader2,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import type { Activity, ActivityCategory, ActivityModality } from "@/types/database";

const CATEGORIES: { value: ActivityCategory | "all"; label: string; emoji: string }[] = [
  { value: "all", label: "Todas", emoji: "🎯" },
  { value: "ciencia", label: "Ciencia", emoji: "🔬" },
  { value: "arte", label: "Arte", emoji: "🎨" },
  { value: "musica", label: "Música", emoji: "🎵" },
  { value: "naturaleza", label: "Naturaleza", emoji: "🌿" },
  { value: "lectura", label: "Lectura", emoji: "📚" },
  { value: "experimentos", label: "Experimentos", emoji: "🧪" },
];

const MODALITIES: { value: ActivityModality | "all"; label: string }[] = [
  { value: "all", label: "Todas las modalidades" },
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
  { value: "en-casa", label: "En casa" },
];

const AGE_RANGES = [
  { value: "all", label: "Todas las edades" },
  { value: "0-3", label: "0-3 años" },
  { value: "4-6", label: "4-6 años" },
  { value: "7-9", label: "7-9 años" },
  { value: "10-12", label: "10-12 años" },
  { value: "13+", label: "13+ años" },
];

export default function ActividadesPage() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ActivityCategory | "all">("all");
  const [selectedModality, setSelectedModality] = useState<ActivityModality | "all">("all");
  const [selectedAgeRange, setSelectedAgeRange] = useState<string>("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        params.set("status", "published");
        if (selectedCategory !== "all") params.set("category", selectedCategory);
        if (selectedModality !== "all") params.set("modality", selectedModality);

        const response = await fetch(`/api/activities?${params.toString()}`);
        const data = (await response.json()) as { ok: boolean; data?: Activity[] };
        if (data.ok && data.data) {
          setActivities(data.data);
        }
      } catch (err) {
        console.error("Error fetching activities:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, [selectedCategory, selectedModality]);

  // Filter activities based on search and age
  const filteredActivities = activities.filter((activity) => {
    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesTitle = activity.title.toLowerCase().includes(query);
      const matchesDescription = activity.short_description?.toLowerCase().includes(query);
      const matchesCity = activity.city?.toLowerCase().includes(query);
      if (!matchesTitle && !matchesDescription && !matchesCity) return false;
    }

    // Age range filter
    if (selectedAgeRange !== "all") {
      const [minStr, maxStr] = selectedAgeRange.split("-");
      const rangeMin = parseInt(minStr);
      const rangeMax = maxStr === "+" ? 99 : parseInt(maxStr);

      const activityMin = activity.age_min ?? 0;
      const activityMax = activity.age_max ?? 18;

      // Check if ranges overlap
      if (activityMax < rangeMin || activityMin > rangeMax) return false;
    }

    return true;
  });

  const formatPrice = (cents?: number) => {
    if (cents === undefined || cents === 0) return "Gratis";
    return `${(cents / 100).toFixed(2)}€`;
  };

  const getCategoryEmoji = (category?: ActivityCategory) => {
    const cat = CATEGORIES.find((c) => c.value === category);
    return cat?.emoji || "🎯";
  };

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-primary via-secondary to-accent text-white">
        <div className="container mx-auto px-4 py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="text-3xl md:text-5xl font-bold mb-4">
              Descubre actividades increíbles para tus peques
            </h1>
            <p className="text-lg md:text-xl text-white/80 mb-8">
              Ciencia, arte, música y mucho más. Encuentra la actividad perfecta para tu familia.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar por nombre, descripción o ciudad..."
                className="pl-12 h-14 rounded-2xl text-foreground bg-white border-0 shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>

      {/* Categories */}
      <div className="container mx-auto px-4 -mt-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide"
        >
          {CATEGORIES.map((cat) => (
            <Button
              key={cat.value}
              variant={selectedCategory === cat.value ? "default" : "outline"}
              onClick={() => setSelectedCategory(cat.value)}
              className={`shrink-0 rounded-full px-4 ${
                selectedCategory === cat.value
                  ? "bg-primary text-white"
                  : "bg-white hover:bg-muted"
              }`}
            >
              <span className="mr-2">{cat.emoji}</span>
              {cat.label}
            </Button>
          ))}
        </motion.div>
      </div>

      {/* Filters Section */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {loading ? "Buscando..." : `${filteredActivities.length} actividades encontradas`}
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`} />
          </Button>
        </div>

        {/* Collapsible Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="grid sm:grid-cols-2 gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm"
          >
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Modalidad</label>
              <select
                value={selectedModality}
                onChange={(e) => setSelectedModality(e.target.value as ActivityModality | "all")}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                {MODALITIES.map((mod) => (
                  <option key={mod.value} value={mod.value}>
                    {mod.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Rango de edad</label>
              <select
                value={selectedAgeRange}
                onChange={(e) => setSelectedAgeRange(e.target.value)}
                className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
              >
                {AGE_RANGES.map((age) => (
                  <option key={age.value} value={age.value}>
                    {age.label}
                  </option>
                ))}
              </select>
            </div>
          </motion.div>
        )}

        {/* Activities Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center">
              <Search className="w-10 h-10 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">No se encontraron actividades</h3>
            <p className="text-muted-foreground mb-6">
              Prueba con otros filtros o términos de búsqueda
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
                setSelectedModality("all");
                setSelectedAgeRange("all");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((activity, index) => (
              <motion.div
                key={activity._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/actividades/${activity.slug || activity._id}`}>
                  <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 h-full border-2 group">
                    {/* Image */}
                    <div className="relative aspect-[16/10] bg-gradient-to-br from-primary/20 to-secondary/20 overflow-hidden">
                      {activity.images?.[0]?.url ? (
                        <img
                          src={activity.images[0].url}
                          alt={activity.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-6xl">{getCategoryEmoji(activity.category)}</span>
                        </div>
                      )}

                      {/* Category Badge */}
                      {activity.category && (
                        <Badge className="absolute top-3 left-3 bg-white/90 text-foreground capitalize">
                          {getCategoryEmoji(activity.category)} {activity.category}
                        </Badge>
                      )}

                      {/* Modality Badge */}
                      <Badge
                        className={`absolute top-3 right-3 ${
                          activity.modality === "online"
                            ? "bg-blue-500"
                            : activity.modality === "en-casa"
                            ? "bg-green-500"
                            : "bg-secondary"
                        } text-white`}
                      >
                        {activity.modality === "presencial" && <MapPin className="w-3 h-3 mr-1" />}
                        {activity.modality}
                      </Badge>
                    </div>

                    <CardContent className="p-5">
                      {/* Title */}
                      <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {activity.title}
                      </h3>

                      {/* Short Description */}
                      {activity.short_description && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                          {activity.short_description}
                        </p>
                      )}

                      {/* Info Row */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        {activity.age_min !== undefined && (
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {activity.age_min}-{activity.age_max || 18} años
                          </span>
                        )}
                        {activity.city && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {activity.city}
                          </span>
                        )}
                      </div>

                      {/* Date & Price */}
                      <div className="flex items-center justify-between pt-4 border-t">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {activity.start_date_time
                            ? new Date(activity.start_date_time).toLocaleDateString("es-ES", {
                                day: "numeric",
                                month: "short",
                              })
                            : "Varias fechas"}
                        </div>
                        <span className="text-lg font-bold text-primary">
                          {formatPrice(activity.price_cents)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
