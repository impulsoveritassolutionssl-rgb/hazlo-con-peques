"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";
import Link from "next/link";
import { EventFilters, EventFiltersState } from "@/components/peques/EventFilters";
import { EventCard, EventCardCompact, NearbyEvent } from "@/components/peques/EventCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SEOContent } from "@/components/seo/SEOContent";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  MapPin,
  List,
  Map as MapIcon,
  Loader2,
  AlertCircle,
  Navigation,
  ArrowRight,
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

interface CityData {
  slug: string;
  name: string;
  region: string;
  description: string;
  metaDescription: string;
  neighborhoods: string[];
  lat: number;
  lng: number;
}

interface CategoryData {
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

interface CityPageClientProps {
  city: CityData;
  categories: CategoryData[];
  faqs: FAQItem[];
}

export function CityPageClient({ city, categories, faqs }: CityPageClientProps) {
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"split" | "map" | "list">("split");
  const [hasSearched, setHasSearched] = useState(false);

  const [filters, setFilters] = useState<EventFiltersState>({
    lat: city.lat,
    lng: city.lng,
    locationText: city.name,
    radiusKm: 25,
    dateFrom: null,
    dateTo: null,
    category: null,
    ageMin: null,
    ageMax: null,
  });

  // Fetch events on mount
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const params = new URLSearchParams({
        lat: filters.lat?.toString() || city.lat.toString(),
        lng: filters.lng?.toString() || city.lng.toString(),
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
      } else {
        throw new Error(data.error || "Error al buscar eventos");
      }
    } catch (err) {
      console.error("[CityPage] Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Error al buscar eventos");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [filters, city.lat, city.lng]);

  // Auto-fetch on mount
  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventSelect = (event: NearbyEvent) => {
    setSelectedEventId(event._id === selectedEventId ? null : event._id);
  };

  const mapCenter = { lat: filters.lat || city.lat, lng: filters.lng || city.lng };
  const userLocation = filters.lat && filters.lng ? { lat: filters.lat, lng: filters.lng } : null;

  // Extended description for SEO
  const seoDescription = `${city.description} En Hazlo con Peques encontrarás las mejores actividades educativas y recreativas para niños de todas las edades en ${city.name} y ${city.region}. Desde talleres de ciencia y arte hasta cuentacuentos y actividades al aire libre, hay opciones para todos los gustos. Nuestras actividades están verificadas y organizadas por profesionales, garantizando experiencias seguras y enriquecedoras para tus peques.`;

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
            {/* Breadcrumbs */}
            <Breadcrumbs
              items={[
                { label: "Eventos", href: "/eventos" },
                { label: city.name },
              ]}
              className="mb-6"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <div className="inline-flex items-center gap-2 rainbow-pill-soft px-4 py-2 rounded-full mb-4">
                <MapPin className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">{city.region}</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                Actividades para niños en{" "}
                <span className="rainbow-text-animated">{city.name}</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {city.metaDescription}
              </p>
            </motion.div>

            {/* Category quick links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-wrap justify-center gap-2 mb-8"
            >
              {categories.slice(0, 6).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/eventos/${city.slug}/${cat.slug}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-card border rounded-full hover:border-primary hover:shadow-md transition-all text-sm"
                >
                  <span>{cat.icon}</span>
                  <span>{cat.shortName}</span>
                </Link>
              ))}
              <Link
                href={`/categorias`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full hover:bg-primary/20 transition-all text-sm font-medium"
              >
                Ver todas
                <ArrowRight className="w-4 h-4" />
              </Link>
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
                      ? `${events.length} evento${events.length !== 1 ? "s" : ""} en ${city.name}`
                      : `No hay eventos en ${city.name}`
                    : `Buscando eventos en ${city.name}...`}
                </h2>
                {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
              </div>

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
                    zoom={12}
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
                  {events.length === 0 && !isLoading ? (
                    <div className="text-center py-12 bg-card rounded-xl border">
                      <div className="text-6xl mb-4">🔍</div>
                      <h3 className="text-xl font-semibold text-foreground mb-2">
                        No encontramos eventos en {city.name}
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto mb-4">
                        Prueba a ampliar el radio de búsqueda o explorar otras categorías.
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setFilters((prev) => ({ ...prev, radiusKm: Math.min(prev.radiusKm + 25, 100) }))}
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
                        Array.from({ length: 4 }).map((_, i) => (
                          <div key={i} className="bg-card rounded-xl border p-4 animate-pulse">
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

        {/* SEO Content Section */}
        <SEOContent
          title={`Todo sobre actividades infantiles en ${city.name}`}
          description={seoDescription}
          faqs={faqs}
          neighborhoods={city.neighborhoods}
          cityName={city.name}
        />

        {/* Internal linking to other cities */}
        <section className="py-12 bg-card border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
              Explora otras ciudades
            </h3>
            <div className="flex flex-wrap justify-center gap-3">
              {["madrid", "barcelona", "valencia", "sevilla", "bilbao", "malaga", "zaragoza"]
                .filter((c) => c !== city.slug)
                .map((citySlug) => (
                  <Link
                    key={citySlug}
                    href={`/eventos/${citySlug}`}
                    className="px-4 py-2 bg-muted rounded-full hover:bg-primary/10 hover:text-primary transition-all text-sm capitalize"
                  >
                    {citySlug === "malaga" ? "Málaga" : citySlug.charAt(0).toUpperCase() + citySlug.slice(1)}
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>

      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
        crossOrigin=""
      />

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
