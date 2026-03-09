"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import { EventFilters, EventFiltersState } from "@/components/peques/EventFilters";
import { EventCard, EventCardCompact, NearbyEvent } from "@/components/peques/EventCard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  List,
  Map as MapIcon,
  Loader2,
  Sparkles,
  AlertCircle,
  Navigation,
} from "lucide-react";

// Dynamic import for EventMap to avoid SSR issues with Leaflet
const EventMap = dynamic(
  () => import("@/components/peques/EventMap").then((mod) => mod.EventMap),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full min-h-[400px] bg-muted rounded-xl flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Cargando mapa...</p>
        </div>
      </div>
    ),
  }
);

// Default center (Madrid, Spain)
const DEFAULT_CENTER = { lat: 40.4168, lng: -3.7038 };

export default function EventosPage() {
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "map" | "list">("split");
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState<EventFiltersState>({
    lat: null,
    lng: null,
    locationText: "",
    radiusKm: 25,
    dateFrom: null,
    dateTo: null,
    category: null,
    ageMin: null,
    ageMax: null,
  });

  // Try to get user's location on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setFilters((prev) => ({
            ...prev,
            lat: position.coords.latitude,
            lng: position.coords.longitude,
            locationText: "Mi ubicación actual",
          }));
        },
        (error) => {
          console.log("[EventosPage] Geolocation not available:", error.message);
        },
        { timeout: 5000 }
      );
    }
  }, []);

  // Fetch events
  const fetchEvents = useCallback(async () => {
    if (!filters.lat || !filters.lng) {
      setError("Por favor, introduce una ubicación para buscar eventos cercanos");
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        lat: filters.lat.toString(),
        lng: filters.lng.toString(),
        radiusKm: filters.radiusKm.toString(),
      });

      if (filters.dateFrom) {
        params.append("dateFrom", filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        params.append("dateTo", filters.dateTo.toISOString());
      }
      if (filters.category) {
        params.append("category", filters.category);
      }
      if (filters.ageMin !== null) {
        params.append("ageMin", filters.ageMin.toString());
      }
      if (filters.ageMax !== null) {
        params.append("ageMax", filters.ageMax.toString());
      }

      const response = await fetch(`/api/events/nearby?${params.toString()}`);
      const data = (await response.json()) as { ok: boolean; data?: NearbyEvent[]; error?: string };

      if (data.ok) {
        setEvents(data.data || []);
        console.log("[EventosPage] Fetched", data.data?.length || 0, "events");
      } else {
        throw new Error(data.error || "Error al buscar eventos");
      }
    } catch (err) {
      console.error("[EventosPage] Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Error al buscar eventos");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Handle event selection
  const handleEventSelect = (event: NearbyEvent) => {
    setSelectedEventId(event._id === selectedEventId ? null : event._id);
  };

  // Map center based on filters or default
  const mapCenter = filters.lat && filters.lng
    ? { lat: filters.lat, lng: filters.lng }
    : DEFAULT_CENTER;

  // User location for map marker
  const userLocation = filters.lat && filters.lng
    ? { lat: filters.lat, lng: filters.lng }
    : null;

  return (
    <div className="flex-1">
      <main>
        {/* Hero section */}
        <section className="rainbow-hero py-12 relative overflow-hidden">
          {/* Decorative elements */}
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-[5%] w-20 h-20 bg-secondary/10 rounded-full blur-xl"
          />
          <motion.div
            animate={{ y: [0, 10, 0], x: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 right-[5%] w-24 h-24 bg-primary/10 rounded-full blur-xl"
          />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 rainbow-pill-soft px-4 py-2 rounded-full mb-4">
                <Navigation className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Eventos cerca de ti</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Encuentra actividades{" "}
                <span className="rainbow-text-animated">increíbles</span>{" "}
                para tus peques
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Descubre eventos, talleres y actividades educativas cerca de tu ubicación.
                ¡La aventura está a la vuelta de la esquina!
              </p>
            </motion.div>

            {/* Filters */}
            <EventFilters
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={fetchEvents}
              isLoading={isLoading}
            />
          </div>
        </section>

        {/* Results section */}
        <section className="py-8">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            {/* View mode toggle and results count */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <h2 className="text-xl font-semibold text-foreground">
                  {hasSearched
                    ? events.length > 0
                      ? `${events.length} evento${events.length !== 1 ? "s" : ""} encontrado${events.length !== 1 ? "s" : ""}`
                      : "No se encontraron eventos"
                    : "Busca eventos cerca de ti"}
                </h2>
                {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>

              {/* View mode tabs - visible on all screens */}
              <Tabs
                value={viewMode}
                onValueChange={(v) => setViewMode(v as typeof viewMode)}
                className="bg-muted rounded-lg p-1"
              >
                <TabsList className="bg-transparent">
                  <TabsTrigger
                    value="split"
                    className="gap-2 data-[state=active]:bg-card hidden md:flex"
                  >
                    <MapIcon className="w-4 h-4" />
                    <List className="w-4 h-4" />
                    <span className="sr-only md:not-sr-only">Ambos</span>
                  </TabsTrigger>
                  <TabsTrigger value="map" className="gap-2 data-[state=active]:bg-card">
                    <MapIcon className="w-4 h-4" />
                    <span className="sr-only sm:not-sr-only">Mapa</span>
                  </TabsTrigger>
                  <TabsTrigger value="list" className="gap-2 data-[state=active]:bg-card">
                    <List className="w-4 h-4" />
                    <span className="sr-only sm:not-sr-only">Lista</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 mb-6 flex items-center gap-3"
              >
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </motion.div>
            )}

            {/* Content based on view mode */}
            <div
              className={`
                ${viewMode === "split" ? "grid md:grid-cols-2 gap-6" : ""}
                ${viewMode === "map" ? "h-[600px]" : ""}
                ${viewMode === "list" ? "" : ""}
              `}
            >
              {/* Map view */}
              {(viewMode === "split" || viewMode === "map") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`
                    ${viewMode === "split" ? "h-[500px] md:h-[600px] order-2 md:order-1" : "h-full"}
                    rounded-xl overflow-hidden border shadow-lg
                  `}
                >
                  <EventMap
                    events={events}
                    center={mapCenter}
                    zoom={filters.lat && filters.lng ? 12 : 6}
                    selectedEventId={selectedEventId || undefined}
                    onEventSelect={handleEventSelect}
                    userLocation={userLocation}
                    className="w-full h-full"
                  />
                </motion.div>
              )}

              {/* List view */}
              {(viewMode === "split" || viewMode === "list") && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className={`
                    ${viewMode === "split" ? "order-1 md:order-2" : ""}
                    ${viewMode === "list" ? "max-w-4xl mx-auto" : ""}
                  `}
                >
                  {!hasSearched ? (
                    <div className="text-center py-12 bg-card rounded-xl border">
                      <motion.div
                        animate={{ y: [0, -10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="text-6xl mb-4"
                      >
                        📍
                      </motion.div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        ¡Encuentra eventos cerca de ti!
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Introduce tu ubicación o código postal y pulsa buscar para descubrir
                        actividades increíbles para tus peques.
                      </p>
                    </div>
                  ) : events.length === 0 && !isLoading ? (
                    <div className="text-center py-12 bg-card rounded-xl border">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No encontramos eventos
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-4">
                        No hay eventos publicados en esta zona. Prueba a ampliar el radio de
                        búsqueda o cambiar los filtros.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() =>
                          setFilters((prev) => ({ ...prev, radiusKm: Math.min(prev.radiusKm + 25, 100) }))
                        }
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Ampliar radio a {Math.min(filters.radiusKm + 25, 100)} km
                      </Button>
                    </div>
                  ) : (
                    <div
                      className={`
                        space-y-4
                        ${viewMode === "split" ? "max-h-[560px] overflow-y-auto pr-2" : ""}
                      `}
                    >
                      {isLoading ? (
                        // Loading skeletons
                        Array.from({ length: 4 }).map((_, i) => (
                          <div
                            key={i}
                            className="bg-card rounded-xl border p-4 animate-pulse"
                          >
                            <div className="flex gap-4">
                              <div className="w-24 h-24 bg-muted rounded-lg" />
                              <div className="flex-1 space-y-3">
                                <div className="h-4 bg-muted rounded w-1/4" />
                                <div className="h-5 bg-muted rounded w-3/4" />
                                <div className="h-3 bg-muted rounded w-1/2" />
                              </div>
                            </div>
                          </div>
                        ))
                      ) : viewMode === "split" ? (
                        // Compact cards for split view
                        events.map((event, index) => (
                          <EventCardCompact
                            key={event._id}
                            event={event}
                            index={index}
                            isSelected={event._id === selectedEventId}
                            onSelect={handleEventSelect}
                          />
                        ))
                      ) : (
                        // Full cards for list view
                        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                          {events.map((event, index) => (
                            <EventCard
                              key={event._id}
                              event={event}
                              index={index}
                              isSelected={event._id === selectedEventId}
                              onSelect={handleEventSelect}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Add Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

      {/* Custom marker styles */}
      <style jsx global>{`
        .custom-marker {
          background: transparent;
          border: none;
        }
        .custom-popup .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        }
        .custom-popup .leaflet-popup-tip {
          display: none;
        }
        .user-location-marker {
          background: transparent;
          border: none;
        }
      `}</style>
    </div>
  );
}
