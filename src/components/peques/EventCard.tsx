"use client";

import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Clock, Users, Sparkles, Navigation } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface NearbyEvent {
  _id: string;
  title: string;
  description?: string;
  short_description?: string;
  category?: string;
  start_date_time?: string;
  end_date_time?: string;
  location_name?: string;
  location_address?: string;
  city?: string;
  postal_code?: string;
  country?: string;
  lat: number;
  lng: number;
  age_min?: number;
  age_max?: number;
  price_cents?: number;
  capacity_available?: number;
  images?: Array<{ name: string }>;
  slug?: string;
  distanceKm: number;
}

interface EventCardProps {
  event: NearbyEvent;
  index?: number;
  isSelected?: boolean;
  onSelect?: (event: NearbyEvent) => void;
}

// Category color mapping with rainbow-inspired colors
const categoryColors: Record<string, string> = {
  ciencia: "bg-blue-100/50 text-blue-700 border-blue-200",
  arte: "bg-pink-100/50 text-pink-700 border-pink-200",
  musica: "bg-purple-100/50 text-purple-700 border-purple-200",
  naturaleza: "bg-green-100/50 text-green-700 border-green-200",
  lectura: "bg-amber-100/50 text-amber-700 border-amber-200",
  experimentos: "bg-orange-100/50 text-orange-700 border-orange-200",
  deportes: "bg-red-100/50 text-red-700 border-red-200",
  cocina: "bg-yellow-100/50 text-yellow-700 border-yellow-200",
};

// Category labels
const categoryLabels: Record<string, string> = {
  ciencia: "Ciencia",
  arte: "Arte",
  musica: "Música",
  naturaleza: "Naturaleza",
  lectura: "Lectura",
  experimentos: "Experimentos",
  deportes: "Deportes",
  cocina: "Cocina",
};

export function EventCard({ event, index = 0, isSelected, onSelect }: EventCardProps) {
  // Format date
  const formattedDate = event.start_date_time
    ? format(new Date(event.start_date_time), "EEE d MMM, HH:mm", { locale: es })
    : "Fecha por confirmar";

  // Format price
  const priceText = event.price_cents
    ? `${(event.price_cents / 100).toFixed(2)}€`
    : "Gratis";

  // Format age range
  const ageRange = event.age_min && event.age_max
    ? `${event.age_min}-${event.age_max} años`
    : event.age_min
    ? `Desde ${event.age_min} años`
    : event.age_max
    ? `Hasta ${event.age_max} años`
    : "Todas las edades";

  // Format distance
  const distanceText = event.distanceKm < 1
    ? `${Math.round(event.distanceKm * 1000)}m`
    : `${event.distanceKm.toFixed(1)} km`;

  // Get image URL
  const imageUrl = event.images?.[0]?.name
    ? `https://totalum-files.s3.eu-south-2.amazonaws.com/${event.images[0].name}`
    : getCategoryPlaceholder(event.category);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
      onClick={() => onSelect?.(event)}
      className={`
        group cursor-pointer rainbow-card-accent rounded-xl overflow-hidden
        transition-all duration-300 hover:shadow-lg
        ${isSelected ? "ring-2 ring-primary rainbow-glow" : "hover:rainbow-glow"}
      `}
    >
      <div className="flex gap-4 p-4">
        {/* Image thumbnail with rainbow border on hover */}
        <div className="relative w-24 h-24 flex-shrink-0 rounded-lg overflow-hidden bg-muted group-hover:rainbow-border-thin">
          <img
            src={imageUrl}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            onError={(e) => {
              (e.target as HTMLImageElement).src = getCategoryPlaceholder(event.category);
            }}
          />
          {/* Distance badge with rainbow style */}
          <div className="absolute bottom-1 left-1 bg-gradient-to-r from-primary to-secondary text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1 shadow-md">
            <Navigation className="w-3 h-3" />
            {distanceText}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Category badge */}
          {event.category && (
            <Badge
              className={`${categoryColors[event.category] || "bg-gray-100/50 text-gray-700 border-gray-200"} text-xs mb-2`}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              {categoryLabels[event.category] || event.category}
            </Badge>
          )}

          {/* Title with rainbow hover effect */}
          <h3 className="font-semibold text-foreground line-clamp-1 group-hover:rainbow-text transition-all">
            {event.title}
          </h3>

          {/* Description */}
          {event.short_description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {event.short_description}
            </p>
          )}

          {/* Meta info */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">
                {event.location_name || event.city || "Por confirmar"}
              </span>
            </div>
          </div>

          {/* Bottom row with rainbow-styled elements */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="rainbow-pill-soft text-xs px-2 py-0.5">{ageRange}</span>
              <span className="font-semibold rainbow-text">{priceText}</span>
            </div>
            {event.capacity_available !== undefined && event.capacity_available > 0 && (
              <div className="flex items-center gap-1 text-xs text-accent">
                <Users className="w-3 h-3" />
                <span>{event.capacity_available} plazas</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// Compact version for list view with rainbow styling
export function EventCardCompact({ event, index = 0, isSelected, onSelect }: EventCardProps) {
  const formattedDate = event.start_date_time
    ? format(new Date(event.start_date_time), "d MMM HH:mm", { locale: es })
    : "TBD";

  const distanceText = event.distanceKm < 1
    ? `${Math.round(event.distanceKm * 1000)}m`
    : `${event.distanceKm.toFixed(1)}km`;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.03 }}
      onClick={() => onSelect?.(event)}
      className={`
        group cursor-pointer p-3 rounded-lg rainbow-card-accent
        transition-all duration-200 hover:shadow-md
        ${isSelected ? "ring-2 ring-primary rainbow-glow" : "hover:rainbow-border-thin"}
      `}
    >
      <div className="flex items-center gap-3">
        <div className="flex-1 min-w-0">
          <h4 className="font-medium text-sm line-clamp-1 group-hover:rainbow-text transition-colors">
            {event.title}
          </h4>
          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{event.city || event.location_name || "—"}</span>
          </div>
        </div>
        <div className="flex items-center gap-1 text-xs font-medium rainbow-button text-white px-2 py-1 rounded-full">
          <Navigation className="w-3 h-3" />
          {distanceText}
        </div>
      </div>
    </motion.div>
  );
}

// Helper to get category placeholder
function getCategoryPlaceholder(category?: string): string {
  const placeholders: Record<string, string> = {
    ciencia: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=200&h=200&fit=crop",
    arte: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=200&h=200&fit=crop",
    musica: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=200&h=200&fit=crop",
    naturaleza: "https://images.unsplash.com/photo-1472162072942-cd5147eb3902?w=200&h=200&fit=crop",
    lectura: "https://images.unsplash.com/photo-1544776193-352d25ca82cd?w=200&h=200&fit=crop",
    experimentos: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=200&h=200&fit=crop",
    deportes: "https://images.unsplash.com/photo-1461896836934- voices?w=200&h=200&fit=crop",
    cocina: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=200&h=200&fit=crop",
  };
  return placeholders[category || ""] || "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=200&h=200&fit=crop";
}
