"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MapPin, Loader2, Navigation, ZoomIn, ZoomOut, Locate } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { NearbyEvent } from "./EventCard";

interface EventMapProps {
  events: NearbyEvent[];
  center: { lat: number; lng: number };
  zoom?: number;
  selectedEventId?: string;
  onEventSelect?: (event: NearbyEvent) => void;
  onCenterChange?: (center: { lat: number; lng: number }) => void;
  userLocation?: { lat: number; lng: number } | null;
  className?: string;
}

// Category colors for markers
const categoryMarkerColors: Record<string, string> = {
  ciencia: "#3B82F6",
  arte: "#EC4899",
  musica: "#8B5CF6",
  naturaleza: "#22C55E",
  lectura: "#F59E0B",
  experimentos: "#F97316",
  deportes: "#EF4444",
  cocina: "#EAB308",
};

export function EventMap({
  events,
  center,
  zoom = 12,
  selectedEventId,
  onEventSelect,
  onCenterChange,
  userLocation,
  className = "",
}: EventMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);
  const [L, setL] = useState<typeof import("leaflet") | null>(null);

  // Load Leaflet dynamically
  useEffect(() => {
    const loadLeaflet = async () => {
      try {
        const leaflet = await import("leaflet");
        setL(leaflet.default);
        setIsLoading(false);
      } catch (err) {
        console.error("[EventMap] Failed to load Leaflet:", err);
        setMapError("Error al cargar el mapa");
        setIsLoading(false);
      }
    };
    loadLeaflet();
  }, []);

  // Initialize map
  useEffect(() => {
    if (!L || !mapContainerRef.current || mapRef.current) return;

    try {
      // Create map
      const map = L.map(mapContainerRef.current, {
        center: [center.lat, center.lng],
        zoom,
        zoomControl: false,
      });

      // Add OpenStreetMap tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Listen for move events
      map.on("moveend", () => {
        const newCenter = map.getCenter();
        onCenterChange?.({ lat: newCenter.lat, lng: newCenter.lng });
      });

      mapRef.current = map;
    } catch (err) {
      console.error("[EventMap] Failed to initialize map:", err);
      setMapError("Error al inicializar el mapa");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [L, center.lat, center.lng, zoom, onCenterChange]);

  // Update center when it changes
  useEffect(() => {
    if (!mapRef.current || !L) return;
    mapRef.current.setView([center.lat, center.lng], mapRef.current.getZoom());
  }, [center.lat, center.lng, L]);

  // Update markers when events change
  useEffect(() => {
    if (!mapRef.current || !L) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add event markers
    events.forEach((event) => {
      const color = categoryMarkerColors[event.category || ""] || "#6366F1";
      const isSelected = event._id === selectedEventId;

      // Create custom icon
      const icon = L.divIcon({
        className: "custom-marker",
        html: `
          <div class="relative ${isSelected ? "animate-bounce" : ""}">
            <div
              class="w-8 h-8 rounded-full flex items-center justify-center shadow-lg transition-transform ${isSelected ? "scale-125" : ""}"
              style="background-color: ${color}; border: 3px solid white;"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            ${isSelected ? '<div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow"></div>' : ''}
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([event.lat, event.lng], { icon }).addTo(mapRef.current!);

      // Add popup
      const popupContent = `
        <div class="p-2 min-w-[200px]">
          <h4 class="font-semibold text-sm mb-1">${event.title}</h4>
          <p class="text-xs text-gray-500 mb-2">${event.location_name || event.city || ""}</p>
          <div class="flex items-center justify-between">
            <span class="text-xs bg-gray-100 px-2 py-0.5 rounded">${event.distanceKm.toFixed(1)} km</span>
            <span class="text-xs font-medium text-primary">${event.price_cents ? (event.price_cents / 100).toFixed(2) + "€" : "Gratis"}</span>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        closeButton: false,
        className: "custom-popup",
      });

      marker.on("click", () => {
        onEventSelect?.(event);
      });

      markersRef.current.push(marker);
    });
  }, [events, selectedEventId, L, onEventSelect]);

  // Add user location marker
  useEffect(() => {
    if (!mapRef.current || !L || !userLocation) return;

    // Remove existing user marker
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
    }

    // Create user location icon
    const userIcon = L.divIcon({
      className: "user-location-marker",
      html: `
        <div class="relative">
          <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
          <div class="absolute inset-0 w-4 h-4 bg-blue-500 rounded-full animate-ping opacity-50"></div>
        </div>
      `,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
    });

    userMarkerRef.current = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup("Tu ubicación", { closeButton: false });
  }, [userLocation, L]);

  // Handle selected event change
  useEffect(() => {
    if (!mapRef.current || !L || !selectedEventId) return;

    const selectedEvent = events.find((e) => e._id === selectedEventId);
    if (selectedEvent) {
      mapRef.current.setView([selectedEvent.lat, selectedEvent.lng], 14, {
        animate: true,
        duration: 0.5,
      });
    }
  }, [selectedEventId, events, L]);

  // Zoom controls
  const handleZoomIn = () => {
    if (mapRef.current) {
      mapRef.current.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (mapRef.current) {
      mapRef.current.zoomOut();
    }
  };

  const handleLocateUser = () => {
    if (mapRef.current && userLocation) {
      mapRef.current.setView([userLocation.lat, userLocation.lng], 14, {
        animate: true,
      });
    }
  };

  if (mapError) {
    return (
      <div className={`flex items-center justify-center bg-muted rounded-xl ${className}`}>
        <div className="text-center p-8">
          <MapPin className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">{mapError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative rounded-xl overflow-hidden ${className}`}>
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-muted">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Cargando mapa...</p>
          </div>
        </div>
      )}

      {/* Map container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[300px]"
        style={{ background: "#E5E7EB" }}
      />

      {/* Custom controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomIn}
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          onClick={handleZoomOut}
          className="bg-white shadow-lg hover:bg-gray-50"
        >
          <ZoomOut className="w-4 h-4" />
        </Button>
        {userLocation && (
          <Button
            variant="secondary"
            size="icon"
            onClick={handleLocateUser}
            className="bg-white shadow-lg hover:bg-gray-50"
          >
            <Locate className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Event count badge */}
      <div className="absolute bottom-4 left-4 z-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-full shadow-lg flex items-center gap-2"
        >
          <MapPin className="w-4 h-4 text-primary" />
          <span className="text-sm font-medium">
            {events.length} evento{events.length !== 1 ? "s" : ""} en el mapa
          </span>
        </motion.div>
      </div>
    </div>
  );
}
