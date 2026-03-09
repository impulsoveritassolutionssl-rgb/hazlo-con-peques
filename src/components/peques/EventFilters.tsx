"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Search,
  MapPin,
  Locate,
  Filter,
  X,
  Calendar as CalendarIcon,
  Sparkles,
  Loader2,
  ChevronDown,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface EventFiltersState {
  lat: number | null;
  lng: number | null;
  locationText: string;
  radiusKm: number;
  dateFrom: Date | null;
  dateTo: Date | null;
  category: string | null;
  ageMin: number | null;
  ageMax: number | null;
}

interface EventFiltersProps {
  filters: EventFiltersState;
  onFiltersChange: (filters: EventFiltersState) => void;
  onSearch: () => void;
  isLoading?: boolean;
  className?: string;
}

const categories = [
  { value: "ciencia", label: "Ciencia", emoji: "🔬" },
  { value: "arte", label: "Arte", emoji: "🎨" },
  { value: "musica", label: "Música", emoji: "🎵" },
  { value: "naturaleza", label: "Naturaleza", emoji: "🌿" },
  { value: "lectura", label: "Lectura", emoji: "📚" },
  { value: "experimentos", label: "Experimentos", emoji: "🧪" },
  { value: "deportes", label: "Deportes", emoji: "⚽" },
  { value: "cocina", label: "Cocina", emoji: "👩‍🍳" },
];

const ageRanges = [
  { min: 0, max: 2, label: "0-2 años (bebés)" },
  { min: 2, max: 4, label: "2-4 años" },
  { min: 4, max: 6, label: "4-6 años" },
  { min: 6, max: 8, label: "6-8 años" },
  { min: 8, max: 10, label: "8-10 años" },
  { min: 10, max: 12, label: "10-12 años" },
  { min: 12, max: 16, label: "12+ años" },
];

export function EventFilters({
  filters,
  onFiltersChange,
  onSearch,
  isLoading,
  className = "",
}: EventFiltersProps) {
  const [isLocating, setIsLocating] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Request geolocation
  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Tu navegador no soporta geolocalización");
      return;
    }

    setIsLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onFiltersChange({
          ...filters,
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          locationText: "Mi ubicación actual",
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("[EventFilters] Geolocation error:", error);
        setIsLocating(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError("Permiso de ubicación denegado. Introduce tu ciudad o código postal.");
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError("Ubicación no disponible. Introduce tu ciudad o código postal.");
            break;
          case error.TIMEOUT:
            setLocationError("Tiempo de espera agotado. Introduce tu ciudad o código postal.");
            break;
          default:
            setLocationError("Error al obtener ubicación. Introduce tu ciudad o código postal.");
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  };

  // Geocode address/postal code
  const handleGeocode = async (query: string) => {
    if (!query || query.length < 3) return;

    try {
      // Using Nominatim (OpenStreetMap) for free geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)},España&format=json&limit=1`
      );
      const data = (await response.json()) as Array<{ lat: string; lon: string }>;

      if (data && data.length > 0) {
        onFiltersChange({
          ...filters,
          lat: parseFloat(data[0].lat),
          lng: parseFloat(data[0].lon),
          locationText: query,
        });
        setLocationError(null);
      } else {
        setLocationError("No encontramos esa ubicación. Prueba con otra dirección.");
      }
    } catch (err) {
      console.error("[EventFilters] Geocoding error:", err);
      setLocationError("Error al buscar la ubicación");
    }
  };

  // Active filters count
  const activeFiltersCount = [
    filters.category,
    filters.dateFrom,
    filters.dateTo,
    filters.ageMin !== null || filters.ageMax !== null,
  ].filter(Boolean).length;

  // Clear all filters
  const handleClearFilters = () => {
    onFiltersChange({
      ...filters,
      category: null,
      dateFrom: null,
      dateTo: null,
      ageMin: null,
      ageMax: null,
    });
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Main search bar */}
      <div className="rainbow-card-accent bg-card rounded-xl border p-4 shadow-lg">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Location input */}
          <div className="flex-1">
            <Label className="text-sm font-medium mb-2 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary" />
              ¿Dónde buscas?
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  type="text"
                  placeholder="Ciudad o código postal..."
                  value={filters.locationText}
                  onChange={(e) =>
                    onFiltersChange({ ...filters, locationText: e.target.value })
                  }
                  onBlur={(e) => handleGeocode(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleGeocode(filters.locationText);
                    }
                  }}
                  className="pr-10"
                />
                {filters.lat && filters.lng && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                  </div>
                )}
              </div>
              <Button
                variant="outline"
                size="icon"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="flex-shrink-0"
                title="Usar mi ubicación"
              >
                {isLocating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Locate className="w-4 h-4" />
                )}
              </Button>
            </div>
            {locationError && (
              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                <span>⚠️</span>
                {locationError}
              </p>
            )}
          </div>

          {/* Radius slider */}
          <div className="lg:w-48">
            <Label className="text-sm font-medium mb-2 block">
              Radio: {filters.radiusKm} km
            </Label>
            <Slider
              value={[filters.radiusKm]}
              onValueChange={([value]) =>
                onFiltersChange({ ...filters, radiusKm: value })
              }
              min={5}
              max={100}
              step={5}
              className="mt-3"
            />
          </div>

          {/* Search button */}
          <div className="flex items-end">
            <Button
              onClick={onSearch}
              disabled={!filters.lat || !filters.lng || isLoading}
              className="rainbow-button rounded-xl px-6 h-10 w-full lg:w-auto"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Search className="w-4 h-4 mr-2" />
              )}
              Buscar eventos
            </Button>
          </div>
        </div>

        {/* Filters toggle */}
        <div className="flex items-center justify-between mt-4 pt-4 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <Filter className="w-4 h-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <ChevronDown
              className={`w-4 h-4 transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </Button>

          {activeFiltersCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Limpiar filtros
            </Button>
          )}
        </div>

        {/* Expanded filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t">
                {/* Category */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Categoría
                  </Label>
                  <Select
                    value={filters.category || ""}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, category: value || null })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          <span className="flex items-center gap-2">
                            <span>{cat.emoji}</span>
                            <span>{cat.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Age range */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Rango de edad
                  </Label>
                  <Select
                    value={
                      filters.ageMin !== null && filters.ageMax !== null
                        ? `${filters.ageMin}-${filters.ageMax}`
                        : ""
                    }
                    onValueChange={(value) => {
                      if (!value) {
                        onFiltersChange({ ...filters, ageMin: null, ageMax: null });
                      } else {
                        const [min, max] = value.split("-").map(Number);
                        onFiltersChange({ ...filters, ageMin: min, ageMax: max });
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Todas las edades" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las edades</SelectItem>
                      {ageRanges.map((range) => (
                        <SelectItem
                          key={`${range.min}-${range.max}`}
                          value={`${range.min}-${range.max}`}
                        >
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date range */}
                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Fecha
                  </Label>
                  <div className="flex gap-2">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-left font-normal"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {filters.dateFrom
                            ? format(filters.dateFrom, "d MMM", { locale: es })
                            : "Desde"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateFrom || undefined}
                          onSelect={(date) =>
                            onFiltersChange({ ...filters, dateFrom: date || null })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>

                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="flex-1 justify-start text-left font-normal"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          {filters.dateTo
                            ? format(filters.dateTo, "d MMM", { locale: es })
                            : "Hasta"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={filters.dateTo || undefined}
                          onSelect={(date) =>
                            onFiltersChange({ ...filters, dateTo: date || null })
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Quick category pills */}
      <div className="flex flex-wrap gap-2">
        {categories.slice(0, 6).map((cat) => (
          <Button
            key={cat.value}
            variant={filters.category === cat.value ? "default" : "outline"}
            size="sm"
            onClick={() =>
              onFiltersChange({
                ...filters,
                category: filters.category === cat.value ? null : cat.value,
              })
            }
            className={`rounded-full gap-1 ${
              filters.category === cat.value
                ? "rainbow-button"
                : "bg-card hover:bg-muted"
            }`}
          >
            <span>{cat.emoji}</span>
            <span>{cat.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
