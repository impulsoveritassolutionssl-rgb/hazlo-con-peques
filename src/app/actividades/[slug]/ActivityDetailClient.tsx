"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  ArrowLeft,
  Share2,
  Heart,
  CheckCircle,
  Loader2,
  AlertCircle,
  Minus,
  Plus,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Activity, ActivitySession, User as UserType } from "@/types/database";
import { getActivityImageUrl, ImagePreviewModal } from "@/components/ui/activity-thumbnail";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

const CATEGORY_INFO: Record<string, { emoji: string; color: string }> = {
  ciencia: { emoji: "🔬", color: "bg-blue-100 text-blue-800" },
  arte: { emoji: "🎨", color: "bg-pink-100 text-pink-800" },
  musica: { emoji: "🎵", color: "bg-purple-100 text-purple-800" },
  naturaleza: { emoji: "🌿", color: "bg-green-100 text-green-800" },
  lectura: { emoji: "📚", color: "bg-amber-100 text-amber-800" },
  experimentos: { emoji: "🧪", color: "bg-cyan-100 text-cyan-800" },
};

interface ActivityDetailClientProps {
  slug: string;
}

export function ActivityDetailClient({ slug }: ActivityDetailClientProps) {
  const router = useRouter();
  const { data: session } = useSession();

  const [activity, setActivity] = useState<Activity | null>(null);
  const [sessions, setSessions] = useState<ActivitySession[]>([]);
  const [children, setChildren] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Booking state
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [selectedChild, setSelectedChild] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Image preview state
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Track view
  useEffect(() => {
    const trackView = async () => {
      if (!activity) return;
      try {
        await fetch("/api/stats", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ activity_id: activity._id, event_type: "view" }),
        });
      } catch (err) {
        console.error("Error tracking view:", err);
      }
    };

    if (activity) {
      trackView();
    }
  }, [activity]);

  // Fetch activity and sessions
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/activities/${slug}`);
        const data = (await response.json()) as {
          ok: boolean;
          data?: { activity: Activity; sessions: ActivitySession[] };
          error?: string;
        };

        if (data.ok && data.data) {
          setActivity(data.data.activity);
          setSessions(data.data.sessions || []);
        } else {
          setError("Actividad no encontrada");
        }
      } catch (err) {
        console.error("Error fetching activity:", err);
        setError("Error al cargar la actividad");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug]);

  // Fetch children if logged in as parent
  useEffect(() => {
    const fetchChildren = async () => {
      if (!session?.user) return;
      const userRole = (session.user as { role?: string })?.role;
      if (userRole !== "padre") return;

      try {
        const response = await fetch("/api/kids");
        const data = (await response.json()) as { ok: boolean; data?: UserType[] };
        if (data.ok && data.data) {
          setChildren(data.data);
        }
      } catch (err) {
        console.error("Error fetching children:", err);
      }
    };

    fetchChildren();
  }, [session]);

  const handleBooking = async () => {
    if (!activity) return;

    const userRole = (session?.user as { role?: string })?.role;
    if (!session?.user || userRole !== "padre") {
      router.push(`/login?redirect=/actividades/${slug}`);
      return;
    }

    if (!selectedChild) {
      setError("Por favor selecciona un niño para la reserva");
      return;
    }

    // Track click on reserve button
    try {
      await fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activity_id: activity._id, event_type: "click_reserve" }),
      });
    } catch (err) {
      console.error("Error tracking click:", err);
    }

    setBookingLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const bookingData: Record<string, unknown> = {
        activity: activity._id,
        child_user: selectedChild,
        quantity,
      };

      if (selectedSession) {
        bookingData.session = selectedSession;
      }

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bookingData),
      });

      const result = (await response.json()) as {
        ok: boolean;
        data?: { booking: unknown; tickets: unknown[] };
        error?: string | { message?: string };
      };

      if (result.ok && result.data) {
        setSuccess(`¡Reserva confirmada! Se han generado ${result.data.tickets?.length || 1} ticket(s).`);
        // Refresh sessions to update capacity
        const refreshResponse = await fetch(`/api/activities/${slug}`);
        const refreshData = (await refreshResponse.json()) as {
          ok: boolean;
          data?: { activity: Activity; sessions: ActivitySession[] };
        };
        if (refreshData.ok && refreshData.data) {
          setSessions(refreshData.data.sessions || []);
        }
      } else {
        const errorMsg = typeof result.error === "string" ? result.error : result.error?.message || "Error al realizar la reserva";
        setError(errorMsg);
      }
    } catch (err) {
      console.error("Error booking:", err);
      setError("Error de conexión al realizar la reserva");
    } finally {
      setBookingLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("es-ES", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (cents?: number) => {
    if (cents === undefined || cents === 0) return "Gratis";
    return `${(cents / 100).toFixed(2)}€`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Actividad no encontrada</h2>
          <p className="text-muted-foreground mb-6">{error || "Esta actividad no existe o ha sido eliminada."}</p>
          <Link href="/actividades">
            <Button>Ver todas las actividades</Button>
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = activity.category ? CATEGORY_INFO[activity.category] : null;
  const userRole = (session?.user as { role?: string })?.role;
  const isParent = userRole === "padre";

  // Determine capacity and price source
  const hasMultipleSessions = sessions.length > 0;
  const selectedSessionData = selectedSession
    ? sessions.find((s) => s._id === selectedSession)
    : null;

  const availableCapacity = selectedSessionData
    ? selectedSessionData.capacity_available
    : activity.capacity_available ?? 0;

  const price = selectedSessionData
    ? selectedSessionData.price_cents
    : activity.price_cents ?? 0;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/actividades" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
            <ArrowLeft className="w-5 h-5" />
            <span className="hidden sm:inline">Volver</span>
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Heart className="w-5 h-5" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumbs */}
        <Breadcrumbs
          items={[
            { label: "Actividades", href: "/actividades" },
            ...(activity.category ? [{ label: activity.category.charAt(0).toUpperCase() + activity.category.slice(1), href: `/categorias/${activity.category}` }] : []),
            { label: activity.title },
          ]}
          className="mb-6"
        />

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image - Professional Preview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 to-secondary/20 cursor-pointer group"
              onClick={() => getActivityImageUrl(activity.images) && setShowImagePreview(true)}
            >
              {getActivityImageUrl(activity.images) ? (
                <>
                  <img
                    src={getActivityImageUrl(activity.images)!}
                    alt={activity.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => {
                      console.log("[ActivityDetail] Image failed to load:", (e.target as HTMLImageElement).src);
                      // Hide the image on error
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                    <span className="text-white opacity-0 group-hover:opacity-100 transition-opacity font-medium bg-black/50 px-4 py-2 rounded-full text-sm">
                      Ver imagen completa
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-8xl">{categoryInfo?.emoji || "🎯"}</span>
                </div>
              )}
            </motion.div>

            {/* Image Preview Modal */}
            {getActivityImageUrl(activity.images) && (
              <ImagePreviewModal
                src={getActivityImageUrl(activity.images)!}
                alt={activity.title}
                isOpen={showImagePreview}
                onClose={() => setShowImagePreview(false)}
              />
            )}

            {/* Title & Badges */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex flex-wrap gap-2 mb-4">
                {activity.category && categoryInfo && (
                  <Badge className={categoryInfo.color}>
                    {categoryInfo.emoji} {activity.category}
                  </Badge>
                )}
                <Badge variant="outline" className="capitalize">
                  {activity.modality === "presencial" && <MapPin className="w-3 h-3 mr-1" />}
                  {activity.modality}
                </Badge>
                {activity.age_min !== undefined && (
                  <Badge variant="outline">
                    <Users className="w-3 h-3 mr-1" />
                    {activity.age_min}-{activity.age_max || 18} años
                  </Badge>
                )}
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
                {activity.title}
              </h1>

              {activity.short_description && (
                <p className="text-lg text-muted-foreground">
                  {activity.short_description}
                </p>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Descripción</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    {activity.description?.split("\n").map((paragraph, i) => (
                      <p key={i} className="text-foreground/80">{paragraph}</p>
                    )) || <p className="text-muted-foreground">Sin descripción disponible.</p>}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Requirements */}
            {activity.requirements && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Requisitos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-foreground/80">{activity.requirements}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Location */}
            {(activity.location_name || activity.location_address || activity.online_link) && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      {activity.modality === "online" ? "Enlace de acceso" : "Ubicación"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activity.modality === "online" ? (
                      <p className="text-foreground/80">
                        El enlace de acceso se enviará tras confirmar la reserva.
                      </p>
                    ) : (
                      <div>
                        {activity.location_name && (
                          <p className="font-medium text-foreground">{activity.location_name}</p>
                        )}
                        {activity.location_address && (
                          <p className="text-muted-foreground">{activity.location_address}</p>
                        )}
                        {activity.city && (
                          <p className="text-muted-foreground">{activity.city}</p>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Sidebar - Booking Card */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="sticky top-24"
            >
              <Card className="border-2 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    {formatPrice(price)}
                    {price > 0 && <span className="text-base font-normal text-muted-foreground">/plaza</span>}
                  </CardTitle>
                  <CardDescription>
                    {availableCapacity > 0
                      ? `${availableCapacity} plazas disponibles`
                      : "Sin plazas disponibles"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Session Selection */}
                  {hasMultipleSessions && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Selecciona una sesión
                      </label>
                      <div className="space-y-2">
                        {sessions
                          .filter((s) => s.status === "active")
                          .map((session) => (
                            <div
                              key={session._id}
                              onClick={() => setSelectedSession(session._id)}
                              className={`p-3 rounded-xl border-2 cursor-pointer transition-all ${
                                selectedSession === session._id
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              } ${session.capacity_available === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <p className="font-medium text-foreground">
                                    {formatDate(session.start_date_time).split(",")[0]}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {formatTime(session.start_date_time)} - {formatTime(session.end_date_time)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-primary">{formatPrice(session.price_cents)}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {session.capacity_available} plazas
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}

                  {/* Date & Time for single session */}
                  {!hasMultipleSessions && activity.start_date_time && (
                    <div className="p-3 bg-muted/50 rounded-xl">
                      <div className="flex items-center gap-2 text-foreground mb-1">
                        <Calendar className="w-4 h-4" />
                        <span className="font-medium">{formatDate(activity.start_date_time)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        <span>
                          {formatTime(activity.start_date_time)}
                          {activity.end_date_time && ` - ${formatTime(activity.end_date_time)}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Child Selection (for parents) */}
                  {isParent && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Selecciona un niño
                      </label>
                      {children.length > 0 ? (
                        <select
                          value={selectedChild || ""}
                          onChange={(e) => setSelectedChild(e.target.value)}
                          className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                        >
                          <option value="">Selecciona...</option>
                          {children.map((child) => (
                            <option key={child._id} value={child._id}>
                              {child.name}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          No tienes niños registrados.{" "}
                          <Link href="/dashboard/padre" className="text-primary hover:underline">
                            Añade uno
                          </Link>
                        </p>
                      )}
                    </div>
                  )}

                  {/* Quantity Selection */}
                  {isParent && (
                    <div>
                      <label className="text-sm font-medium text-foreground mb-2 block">
                        Cantidad de plazas
                      </label>
                      <div className="flex items-center gap-4">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.max(1, quantity - 1))}
                          disabled={quantity <= 1}
                        >
                          <Minus className="w-4 h-4" />
                        </Button>
                        <span className="text-xl font-bold text-foreground w-8 text-center">
                          {quantity}
                        </span>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => setQuantity(Math.min(availableCapacity, quantity + 1))}
                          disabled={quantity >= availableCapacity}
                        >
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  {isParent && price > 0 && (
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-foreground">Total</span>
                        <span className="text-2xl font-bold text-foreground">
                          {((price * quantity) / 100).toFixed(2)}€
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Error/Success Messages */}
                  {error && (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
                      <AlertCircle className="w-5 h-5" />
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="p-3 bg-green-50 text-green-700 rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      {success}
                    </div>
                  )}

                  {/* Book Button */}
                  <Button
                    onClick={handleBooking}
                    disabled={
                      availableCapacity === 0 ||
                      bookingLoading ||
                      (hasMultipleSessions && !selectedSession) ||
                      !!success
                    }
                    className="w-full h-12 text-lg bg-gradient-to-r from-primary to-secondary"
                  >
                    {bookingLoading ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : success ? (
                      <>
                        <CheckCircle className="w-5 h-5 mr-2" />
                        Reservado
                      </>
                    ) : availableCapacity === 0 ? (
                      "Sin plazas"
                    ) : !session?.user ? (
                      "Iniciar sesión para reservar"
                    ) : !isParent ? (
                      "Solo padres pueden reservar"
                    ) : (
                      "Reservar ahora"
                    )}
                  </Button>

                  {/* Cancellation Policy */}
                  {activity.cancellation_policy && (
                    <p className="text-xs text-muted-foreground text-center">
                      {activity.cancellation_policy}
                    </p>
                  )}

                  {success && (
                    <Link href="/dashboard/padre">
                      <Button variant="outline" className="w-full">
                        Ver mis reservas
                      </Button>
                    </Link>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
