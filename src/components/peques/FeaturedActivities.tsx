"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ActivityCard, Activity } from "./ActivityCard";
import { Sparkles, Loader2 } from "lucide-react";
import type { Activity as DBActivity } from "@/types/database";
import { getActivityImageUrl } from "@/components/ui/activity-thumbnail";

// Category color mapping
const categoryColors: Record<string, string> = {
  ciencia: "bg-blue-100/50 text-blue-700 border-blue-200",
  arte: "bg-pink-100/50 text-pink-700 border-pink-200",
  musica: "bg-purple-100/50 text-purple-700 border-purple-200",
  naturaleza: "bg-green-100/50 text-green-700 border-green-200",
  lectura: "bg-amber-100/50 text-amber-700 border-amber-200",
  experimentos: "bg-orange-100/50 text-orange-700 border-orange-200",
};

// Category labels
const categoryLabels: Record<string, string> = {
  ciencia: "Ciencia",
  arte: "Arte",
  musica: "Música",
  naturaleza: "Naturaleza",
  lectura: "Lectura",
  experimentos: "Experimentos",
};

// Default placeholder images per category
const categoryPlaceholders: Record<string, string> = {
  ciencia: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop",
  arte: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop",
  musica: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
  naturaleza: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=400&h=300&fit=crop",
  lectura: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=400&h=300&fit=crop",
  experimentos: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=400&h=300&fit=crop",
};

// Default placeholder for missing images
const defaultPlaceholder = "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop";

// Fallback mock data when no published activities exist
const fallbackActivities: Activity[] = [
  {
    id: "mock-1",
    name: "Pequeños Científicos: El Mundo de las Moléculas",
    description: "Descubre el fascinante mundo de los átomos y moléculas con experimentos divertidos y seguros para los más pequeños.",
    imageUrl: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop",
    ageRange: "6-7",
    duration: "1h 30min",
    modality: "presencial",
    topic: "Ciencia",
    topicColor: "bg-blue-100/50 text-blue-700 border-blue-200",
    capacity: 12,
  },
  {
    id: "mock-2",
    name: "Arte Creativo: Pintando con las Manos",
    description: "Una experiencia artística donde los niños explorarán texturas, colores y técnicas de pintura libre.",
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=300&fit=crop",
    ageRange: "2-3",
    duration: "45min",
    modality: "presencial",
    topic: "Arte",
    topicColor: "bg-pink-100/50 text-pink-700 border-pink-200",
    capacity: 8,
  },
  {
    id: "mock-3",
    name: "Música y Movimiento: Ritmos del Mundo",
    description: "Aprende ritmos de diferentes culturas mientras bailas y tocas instrumentos de percusión.",
    imageUrl: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=300&fit=crop",
    ageRange: "4-5",
    duration: "1h",
    modality: "online",
    topic: "Música",
    topicColor: "bg-purple-100/50 text-purple-700 border-purple-200",
    capacity: 15,
  },
  {
    id: "mock-4",
    name: "Exploradores de la Naturaleza",
    description: "Aventura al aire libre donde aprenderemos sobre plantas, insectos y el ecosistema local.",
    imageUrl: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=400&h=300&fit=crop",
    ageRange: "6-7",
    duration: "2h",
    modality: "presencial",
    topic: "Naturaleza",
    topicColor: "bg-green-100/50 text-green-700 border-green-200",
    capacity: 10,
  },
];

// Convert database activity to card format
function convertDBActivityToCard(dbActivity: DBActivity): Activity {
  // Get image URL - prioritize cover_image_url, then file uploads, then category placeholder
  let imageUrl = dbActivity.cover_image_url || getActivityImageUrl(dbActivity.images);

  // Log for debugging
  if (imageUrl) {
    console.log("[FeaturedActivities] Activity", dbActivity.title, "has image:", imageUrl.substring(0, 60) + "...");
  } else {
    console.log("[FeaturedActivities] Activity", dbActivity.title, "has no image, using placeholder");
  }

  // Fallback to category placeholder if no valid image
  if (!imageUrl) {
    imageUrl = categoryPlaceholders[dbActivity.category || "ciencia"] || defaultPlaceholder;
  }

  // Calculate duration if we have start/end times
  let duration = "Variable";
  if (dbActivity.start_date_time && dbActivity.end_date_time) {
    const start = new Date(dbActivity.start_date_time);
    const end = new Date(dbActivity.end_date_time);
    const diffMs = end.getTime() - start.getTime();
    const diffMins = Math.round(diffMs / 60000);
    if (diffMins >= 60) {
      const hours = Math.floor(diffMins / 60);
      const mins = diffMins % 60;
      duration = mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
    } else {
      duration = `${diffMins}min`;
    }
  }

  return {
    id: dbActivity._id,
    name: dbActivity.title,
    description: dbActivity.short_description || dbActivity.description || "Actividad educativa para niños",
    imageUrl,
    ageRange: `${dbActivity.age_min || 3}-${dbActivity.age_max || 12}`,
    duration,
    modality: dbActivity.modality || "presencial",
    topic: categoryLabels[dbActivity.category || "ciencia"] || "General",
    topicColor: categoryColors[dbActivity.category || "ciencia"] || "bg-gray-100/50 text-gray-700 border-gray-200",
    capacity: dbActivity.capacity_total,
    location: dbActivity.location_name,
  };
}

interface FeaturedActivitiesProps {
  filters?: {
    age: string | null;
    topic: string | null;
    modality: string | null;
  };
}

export function FeaturedActivities({ filters }: FeaturedActivitiesProps) {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch published activities from database
  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/activities?public=true&limit=12");
        const data = (await response.json()) as { ok: boolean; data?: DBActivity[]; error?: string };

        if (data.ok && data.data && data.data.length > 0) {
          // Convert database activities to card format
          const cardActivities = data.data.map(convertDBActivityToCard);
          setActivities(cardActivities);
          console.log("[FeaturedActivities] Loaded", cardActivities.length, "activities from database");
        } else {
          // Use fallback mock data if no published activities
          console.log("[FeaturedActivities] No published activities, using fallback data");
          setActivities(fallbackActivities);
        }
      } catch (err) {
        console.error("[FeaturedActivities] Error fetching activities:", err);
        setError("Error al cargar actividades");
        // Use fallback on error
        setActivities(fallbackActivities);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  // Filter activities based on search filters
  const filteredActivities = activities.filter((activity) => {
    if (filters?.age && !activity.ageRange.includes(filters.age.split("-")[0])) {
      return false;
    }
    if (filters?.topic && activity.topic.toLowerCase() !== filters.topic.toLowerCase()) {
      return false;
    }
    if (filters?.modality && activity.modality !== filters.modality) {
      return false;
    }
    return true;
  });

  const displayActivities = filters ? filteredActivities : activities;

  return (
    <section id="actividades" className="py-16 md:py-24 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 rainbow-pill-soft px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium">Actividades destacadas</span>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Descubre actividades{" "}
            <span className="rainbow-text-animated">
              increíbles
            </span>
          </h2>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Seleccionadas especialmente para que tus peques aprendan mientras se divierten
          </p>
        </motion.div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-muted-foreground">Cargando actividades...</span>
          </div>
        ) : displayActivities.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayActivities.map((activity, index) => (
              <ActivityCard key={activity.id} activity={activity} index={index} />
            ))}
          </div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16 bg-card rounded-2xl border"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-foreground mb-2">
              No encontramos actividades
            </h3>
            <p className="text-muted-foreground">
              Intenta cambiar los filtros de búsqueda para ver más opciones
            </p>
          </motion.div>
        )}
      </div>
    </section>
  );
}
