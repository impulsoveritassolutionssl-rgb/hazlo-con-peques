"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, MapPin, Monitor, Home, Sparkles, ImageOff } from "lucide-react";
import Link from "next/link";

export interface Activity {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  ageRange: string;
  duration: string;
  modality: "presencial" | "online" | "en-casa";
  topic: string;
  topicColor: string;
  location?: string;
  capacity?: number;
}

interface ActivityCardProps {
  activity: Activity;
  index?: number;
}

const modalityIcons = {
  presencial: MapPin,
  online: Monitor,
  "en-casa": Home,
};

const modalityLabels = {
  presencial: "Presencial",
  online: "Online",
  "en-casa": "En casa",
};

// Fallback image for broken images
const fallbackImage = "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop";

export function ActivityCard({ activity, index = 0 }: ActivityCardProps) {
  const ModalityIcon = modalityIcons[activity.modality];
  const [imageError, setImageError] = useState(false);
  const [imageSrc, setImageSrc] = useState(activity.imageUrl);

  const handleImageError = () => {
    console.log("[ActivityCard] Image failed to load:", activity.imageUrl);
    setImageError(true);
    setImageSrc(fallbackImage);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -8, transition: { duration: 0.3 } }}
      className="group rainbow-card-accent bg-card rounded-2xl shadow-lg overflow-hidden border hover:shadow-2xl transition-all duration-300"
    >
      {/* Image */}
      <div className="relative h-48 overflow-hidden bg-muted">
        {imageError && imageSrc === fallbackImage && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted z-10">
            <ImageOff className="w-8 h-8 text-muted-foreground/50" />
          </div>
        )}
        <img
          src={imageSrc}
          alt={activity.name}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          onError={handleImageError}
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

        {/* Topic badge */}
        <Badge
          className={`absolute top-3 left-3 ${activity.topicColor} border font-semibold`}
        >
          <Sparkles className="w-3 h-3 mr-1" />
          {activity.topic}
        </Badge>

        {/* Age badge */}
        <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-foreground px-3 py-1 rounded-full text-xs font-semibold shadow">
          {activity.ageRange} años
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="font-bold text-lg text-foreground mb-2 line-clamp-1 group-hover:text-primary transition-colors">
          {activity.name}
        </h3>

        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
          {activity.description}
        </p>

        {/* Meta info */}
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            <span>{activity.duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <ModalityIcon className="w-3.5 h-3.5" />
            <span>{modalityLabels[activity.modality]}</span>
          </div>
          {activity.capacity && (
            <div className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              <span>{activity.capacity} plazas</span>
            </div>
          )}
        </div>

        {/* CTA */}
        <Button
          className="rainbow-button w-full rounded-xl font-semibold"
          asChild
        >
          <Link href={`#actividad-${activity.id}`}>
            Ver detalle
          </Link>
        </Button>
      </div>
    </motion.div>
  );
}
