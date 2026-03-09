"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { EventCard, NearbyEvent } from "@/components/peques/EventCard";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";
import { SEOContent } from "@/components/seo/SEOContent";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Loader2,
  AlertCircle,
  ArrowRight,
  Search,
} from "lucide-react";

interface CityData {
  slug: string;
  name: string;
  region: string;
  lat: number;
  lng: number;
}

interface CategoryData {
  slug: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  description: string;
  metaDescription: string;
  keywords: string[];
  faqs: { question: string; answer: string }[];
}

interface CategoryPageClientProps {
  category: CategoryData;
  cities: CityData[];
  allCategories: CategoryData[];
}

export function CategoryPageClient({
  category,
  cities,
  allCategories,
}: CategoryPageClientProps) {
  const [events, setEvents] = useState<NearbyEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch events for this category (nationwide)
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch activities by category from the public API
      const response = await fetch(`/api/activities?public=true&limit=12&category=${category.slug}`);
      const data = (await response.json()) as { ok?: boolean; data?: Record<string, unknown>[]; error?: string } | Record<string, unknown>[];

      const isSuccess = Array.isArray(data) || (data && typeof data === "object" && "ok" in data && data.ok);
      if (isSuccess) {
        const activities = Array.isArray(data) ? data : (data as { data?: Record<string, unknown>[] }).data || [];
        // Transform activities to NearbyEvent format
        const transformed: NearbyEvent[] = activities.map((act) => ({
          _id: act._id as string,
          title: act.title as string,
          description: (act.short_description as string) || (act.description as string) || "",
          short_description: act.short_description as string,
          start_date_time: act.start_date_time as string,
          end_date_time: act.end_date_time as string,
          location_name: act.location_name as string,
          location_address: act.location_address as string,
          city: act.city as string,
          price_cents: (act.price_cents as number) || 0,
          category: act.category as string,
          images: act.images as Array<{ name: string }>,
          lat: (act.lat as number) || 0,
          lng: (act.lng as number) || 0,
          slug: act.slug as string,
          distanceKm: 0,
        }));
        setEvents(transformed);
      } else {
        const errorData = data as { error?: string };
        throw new Error(errorData.error || "Error al cargar actividades");
      }
    } catch (err) {
      console.error("[CategoryPage] Error fetching events:", err);
      setError(err instanceof Error ? err.message : "Error al cargar actividades");
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  }, [category.slug]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const seoDescription = `${category.description} Encuentra los mejores talleres y actividades de ${category.shortName.toLowerCase()} para niños en toda España. En Hazlo con Peques reunimos las mejores experiencias educativas y divertidas para peques de todas las edades. Todos nuestros organizadores están verificados y ofrecen actividades de calidad adaptadas al desarrollo infantil.`;

  return (
    <div className="flex-1">
      <main>
        {/* Hero section */}
        <section className="rainbow-hero py-12 md:py-16 relative overflow-hidden">
          <motion.div
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-10 left-[5%] w-20 h-20 rounded-full blur-xl"
            style={{ backgroundColor: `${category.color}20` }}
          />
          <motion.div
            animate={{ y: [0, 10, 0], x: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bottom-10 right-[5%] w-24 h-24 bg-primary/10 rounded-full blur-xl"
          />

          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl relative z-10">
            {/* Breadcrumbs */}
            <Breadcrumbs
              items={[
                { label: "Categorías", href: "/categorias" },
                { label: category.name },
              ]}
              className="mb-6"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-10"
            >
              <motion.div
                className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-6"
                style={{ backgroundColor: `${category.color}15` }}
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                <span className="text-5xl">{category.icon}</span>
              </motion.div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                <span className="rainbow-text-animated">{category.name}</span>
              </h1>

              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                {category.metaDescription}
              </p>
            </motion.div>

            {/* City quick links */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-center"
            >
              <p className="text-sm text-muted-foreground mb-4">
                Encuentra talleres de {category.shortName.toLowerCase()} en:
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {cities.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/eventos/${city.slug}/${category.slug}`}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-card border rounded-full hover:border-primary hover:shadow-md transition-all text-sm"
                  >
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{city.name}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* Featured activities section */}
        <section className="py-12 md:py-16">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">
                Actividades de {category.shortName.toLowerCase()} destacadas
              </h2>
              {isLoading && <Loader2 className="w-5 h-5 animate-spin text-primary" />}
            </div>

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

            {isLoading ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-card rounded-xl border p-4 animate-pulse">
                    <div className="aspect-video bg-muted rounded-lg mb-4" />
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-1/4" />
                      <div className="h-5 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : events.length === 0 ? (
              <div className="text-center py-12 bg-card rounded-xl border">
                <div className="text-6xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  Próximamente más actividades
                </h3>
                <p className="text-muted-foreground max-w-md mx-auto mb-6">
                  Estamos trabajando para traerte los mejores talleres de {category.shortName.toLowerCase()}.
                  Mientras tanto, explora otras categorías.
                </p>
                <Link href="/eventos">
                  <Button>
                    <Search className="w-4 h-4 mr-2" />
                    Explorar todas las actividades
                  </Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {events.map((event, index) => (
                    <EventCard
                      key={event._id}
                      event={event}
                      index={index}
                      isSelected={false}
                      onSelect={() => {}}
                    />
                  ))}
                </div>

                <div className="text-center mt-8">
                  <Link href="/eventos">
                    <Button variant="outline" size="lg">
                      Ver más actividades de {category.shortName.toLowerCase()}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>

        {/* SEO Content */}
        <SEOContent
          title={`Todo sobre ${category.name}`}
          description={seoDescription}
          faqs={category.faqs}
        />

        {/* Other categories */}
        <section className="py-12 bg-card border-t">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <h3 className="text-xl font-semibold text-foreground mb-6 text-center">
              Explora otras categorías
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {allCategories
                .filter((c) => c.slug !== category.slug)
                .map((cat) => (
                  <Link
                    key={cat.slug}
                    href={`/categorias/${cat.slug}`}
                    className="flex flex-col items-center gap-3 p-4 bg-background rounded-xl border hover:border-primary hover:shadow-md transition-all group"
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      {cat.icon}
                    </div>
                    <span className="text-sm font-medium text-center group-hover:text-primary transition-colors">
                      {cat.shortName}
                    </span>
                  </Link>
                ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
