"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Users,
  TrendingUp,
  Plus,
  Eye,
  Edit,
  Building2,
  TicketCheck,
  Clock,
  CheckCircle,
  XCircle,
  QrCode,
  BarChart3,
  Loader2,
  ExternalLink,
  Send,
  Sparkles,
  Star,
  ArrowUpRight,
  Zap,
  Target,
  DollarSign,
  MousePointerClick,
  EyeIcon,
  Percent,
  Activity,
  TrendingDown,
} from "lucide-react";
import Link from "next/link";
import type { Activity as ActivityType, Booking } from "@/types/database";
import AIActivityWizard from "@/components/activity-wizard/AIActivityWizard";
import { ActivityMiniThumbnail, getActivityImageUrl } from "@/components/ui/activity-thumbnail";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode; bgClass: string }> = {
  draft: {
    label: "Borrador",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
    icon: <Clock className="w-3 h-3" />,
    bgClass: "from-yellow-500/20 to-orange-500/20"
  },
  published: {
    label: "Publicada",
    color: "bg-green-100 text-green-800 border-green-200",
    icon: <CheckCircle className="w-3 h-3" />,
    bgClass: "from-green-500/20 to-emerald-500/20"
  },
  cancelled: {
    label: "Cancelada",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: <XCircle className="w-3 h-3" />,
    bgClass: "from-red-500/20 to-rose-500/20"
  },
};

const bookingStatusConfig: Record<string, { label: string; color: string }> = {
  reserved: { label: "Reservada", color: "bg-blue-100 text-blue-800" },
  paid: { label: "Pagada", color: "bg-green-100 text-green-800" },
  checked_in: { label: "Check-in", color: "bg-purple-100 text-purple-800" },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
};

interface StatsData {
  total: {
    views: number;
    clicks_reserve: number;
    bookings_count: number;
    revenue_cents: number;
    checkins_count: number;
    activities_count: number;
    conversion_rate: string;
  };
  by_activity: Array<{
    activity_id: string;
    activity_title: string;
    activity_status: string;
    views: number;
    clicks_reserve: number;
    bookings_count: number;
    revenue_cents: number;
    checkins_count: number;
    conversion_rate: string;
  }>;
}

interface BookingWithRelations extends Booking {
  activity_title?: string;
}

// Metric card with rainbow styling
function MetricCard({
  icon: Icon,
  label,
  value,
  subvalue,
  trend,
  colorClass,
  delay = 0
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  subvalue?: string;
  trend?: "up" | "down" | "neutral";
  colorClass: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="rainbow-card-accent border-2 hover:shadow-xl transition-all duration-300 overflow-hidden group">
        <div className={`absolute inset-0 bg-gradient-to-br ${colorClass} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        <CardHeader className="pb-2 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {label}
            </CardTitle>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br ${colorClass}`}>
              <Icon className="w-5 h-5 text-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="relative z-10">
          <div className="flex items-end gap-2">
            <p className="text-3xl font-bold text-foreground">{value}</p>
            {trend && trend !== "neutral" && (
              <span className={`text-sm font-medium flex items-center ${trend === "up" ? "text-green-600" : "text-red-600"}`}>
                {trend === "up" ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              </span>
            )}
          </div>
          {subvalue && (
            <p className="text-xs text-muted-foreground mt-1">{subvalue}</p>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function OrganizadorDashboard() {
  const { data: session, isPending } = useSession();
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [activityFilter, setActivityFilter] = useState<string>("all");
  const [showWizard, setShowWizard] = useState(false);
  const [editingActivity, setEditingActivity] = useState<ActivityType | null>(null);

  // Check-in state
  const [ticketCode, setTicketCode] = useState("");
  const [checkInResult, setCheckInResult] = useState<{
    valid: boolean;
    reason?: string;
    child_name?: string;
    parent_name?: string;
    ticket?: { ticket_code: string };
  } | null>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [selectedActivityForCheckIn, setSelectedActivityForCheckIn] = useState<string>("");

  // Fetch activities
  const fetchActivities = useCallback(async () => {
    try {
      console.log("[Dashboard] Fetching activities...");
      const response = await fetch("/api/activities");
      const data = (await response.json()) as { ok: boolean; data?: ActivityType[] };
      if (data.ok && data.data) {
        setActivities(data.data);
        console.log("[Dashboard] Fetched activities:", data.data.length);
      }
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  }, []);

  // Fetch bookings for organizer's activities
  const fetchBookings = useCallback(async () => {
    try {
      console.log("[Dashboard] Fetching bookings...");
      const allBookings: BookingWithRelations[] = [];
      for (const activity of activities) {
        const response = await fetch(`/api/bookings?activity_id=${activity._id}`);
        const data = (await response.json()) as { ok: boolean; data?: Booking[] };
        if (data.ok && data.data) {
          data.data.forEach((booking) => {
            allBookings.push({
              ...booking,
              activity_title: activity.title,
            });
          });
        }
      }
      setBookings(allBookings);
      console.log("[Dashboard] Fetched bookings:", allBookings.length);
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  }, [activities]);

  // Fetch stats
  const fetchStats = useCallback(async () => {
    try {
      console.log("[Dashboard] Fetching stats...");
      const response = await fetch("/api/stats");
      const data = (await response.json()) as { ok: boolean; data?: StatsData };
      if (data.ok && data.data) {
        setStats(data.data);
        console.log("[Dashboard] Stats loaded:", data.data);
      }
    } catch (err) {
      console.error("Error fetching stats:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchActivities();
      await fetchStats();
      setLoading(false);
    };
    loadData();
  }, [fetchActivities, fetchStats]);

  useEffect(() => {
    if (activities.length > 0) {
      fetchBookings();
    }
  }, [activities, fetchBookings]);

  const handlePublish = async (activityId: string) => {
    try {
      console.log("[Dashboard] Publishing activity:", activityId);
      const response = await fetch(`/api/activities?activity_id=${activityId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "published", published_at: new Date().toISOString() }),
      });
      const data = (await response.json()) as { ok: boolean };
      if (data.ok) {
        fetchActivities();
      }
    } catch (err) {
      console.error("Error publishing activity:", err);
    }
  };

  const handleCheckIn = async () => {
    if (!ticketCode || !selectedActivityForCheckIn) return;

    setCheckInLoading(true);
    setCheckInResult(null);

    try {
      const validateResponse = await fetch(
        `/api/checkin?ticket_code=${encodeURIComponent(ticketCode)}&activity_id=${selectedActivityForCheckIn}`
      );
      const validateData = (await validateResponse.json()) as {
        ok: boolean;
        data?: { valid: boolean; reason?: string; child_name?: string; parent_name?: string; ticket?: { ticket_code: string } };
      };

      if (!validateData.ok || !validateData.data?.valid) {
        setCheckInResult(validateData.data || { valid: false, reason: "Error desconocido" });
        return;
      }

      const checkInResponse = await fetch("/api/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ticket_code: ticketCode, activity_id: selectedActivityForCheckIn }),
      });
      const checkInData = (await checkInResponse.json()) as { ok: boolean };

      if (checkInData.ok) {
        setCheckInResult({ valid: true, ...validateData.data });
        setTicketCode("");
        fetchStats();
      } else {
        setCheckInResult({ valid: false, reason: "Error al realizar el check-in" });
      }
    } catch (err) {
      console.error("Error during check-in:", err);
      setCheckInResult({ valid: false, reason: "Error de conexión" });
    } finally {
      setCheckInLoading(false);
    }
  };

  const filteredActivities = activities.filter((a) => {
    if (activityFilter === "all") return true;
    return a.status === activityFilter;
  });

  if (isPending || loading) {
    return (
      <div className="min-h-screen rainbow-hero rainbow-blobs flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 p-8 bg-card/80 backdrop-blur-sm rounded-2xl shadow-xl"
        >
          <div className="relative">
            <div className="w-16 h-16 border-4 border-primary/20 rounded-full animate-pulse" />
            <Loader2 className="w-10 h-10 animate-spin text-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <p className="text-muted-foreground font-medium">Cargando tu panel mágico...</p>
        </motion.div>
      </div>
    );
  }

  const userName = session?.user?.name || "Organizador";
  const publishedActivities = activities.filter((a) => a.status === "published").length;
  const draftActivities = activities.filter((a) => a.status === "draft").length;
  const totalCapacity = activities.reduce((acc, a) => acc + (a.capacity_total || 0), 0);
  const totalBookingsCount = stats?.total.bookings_count || bookings.length;
  const occupancyRate = totalCapacity > 0 ? ((totalBookingsCount / totalCapacity) * 100).toFixed(1) : "0";

  return (
    <div className="min-h-screen rainbow-hero rainbow-blobs">
      {/* Rainbow Header Bar */}
      <div className="bg-card/90 backdrop-blur-sm border-b relative">
        <div className="absolute bottom-0 left-0 right-0 h-[3px] rainbow-line-animated" />
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ rotate: -10, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="w-12 h-12 rainbow-button rounded-xl flex items-center justify-center shadow-lg"
            >
              <Building2 className="w-6 h-6 text-white" />
            </motion.div>
            <div>
              <h1 className="font-bold text-xl rainbow-text">Panel de Organizador</h1>
              <p className="text-sm text-muted-foreground">Gestiona tus actividades y eventos</p>
            </div>
          </div>
          <Button
            className="rainbow-button rounded-xl font-semibold hidden sm:flex"
            onClick={() => {
              setEditingActivity(null);
              setShowWizard(true);
            }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Nueva actividad
          </Button>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl relative z-10">
        {/* Welcome Banner with Rainbow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="rainbow-border rainbow-border-animated bg-card rounded-2xl p-6 md:p-8 relative overflow-hidden">
            {/* Decorative sparkles */}
            <motion.div
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute top-4 right-4 text-yellow-400 opacity-60"
            >
              <Sparkles className="w-8 h-8" />
            </motion.div>
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute bottom-4 right-12 text-primary opacity-40"
            >
              <Star className="w-6 h-6" />
            </motion.div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 rainbow-pill-soft px-4 py-2 rounded-full mb-4">
                <Zap className="w-4 h-4" />
                <span className="text-sm font-medium">Panel de control</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                ¡Hola, <span className="rainbow-text-animated">{userName}</span>!
              </h2>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                Bienvenido a tu centro de control. Aquí puedes gestionar tus actividades,
                revisar las reservas y hacer crecer tu negocio con familias increíbles.
              </p>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="rainbow-button rounded-xl font-semibold"
                  onClick={() => {
                    setEditingActivity(null);
                    setShowWizard(true);
                  }}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Crear actividad
                </Button>
                <Button
                  variant="outline"
                  className="rounded-xl font-medium rainbow-border-thin"
                  asChild
                >
                  <Link href="/actividades">
                    <Eye className="w-4 h-4 mr-2" />
                    Ver como familia
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Metrics Grid - Coherent with app logic */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            icon={CalendarDays}
            label="Actividades"
            value={stats?.total.activities_count || activities.length}
            subvalue={`${publishedActivities} publicadas · ${draftActivities} borradores`}
            colorClass="from-primary/20 to-violet-500/20"
            delay={0.1}
          />
          <MetricCard
            icon={TicketCheck}
            label="Reservas"
            value={stats?.total.bookings_count || 0}
            subvalue={`${stats?.total.checkins_count || 0} check-ins realizados`}
            colorClass="from-secondary/20 to-orange-500/20"
            delay={0.15}
          />
          <MetricCard
            icon={EyeIcon}
            label="Visitas"
            value={stats?.total.views || 0}
            subvalue={`${stats?.total.clicks_reserve || 0} clics en reservar`}
            trend={stats?.total.views && stats.total.views > 0 ? "up" : "neutral"}
            colorClass="from-accent/20 to-emerald-500/20"
            delay={0.2}
          />
          <MetricCard
            icon={DollarSign}
            label="Ingresos"
            value={`${((stats?.total.revenue_cents || 0) / 100).toFixed(2)}€`}
            subvalue={`${stats?.total.conversion_rate || "0.0"}% conversión`}
            colorClass="from-yellow/20 to-amber-500/20"
            delay={0.25}
          />
        </div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        >
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{occupancyRate}%</p>
              <p className="text-xs text-muted-foreground">Ocupación</p>
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-secondary/10 rounded-lg flex items-center justify-center">
              <MousePointerClick className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.total.clicks_reserve || 0}</p>
              <p className="text-xs text-muted-foreground">Clics reservar</p>
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
              <Percent className="w-5 h-5 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stats?.total.conversion_rate || "0.0"}%</p>
              <p className="text-xs text-muted-foreground">Conversión</p>
            </div>
          </div>
          <div className="bg-card/80 backdrop-blur-sm rounded-xl border p-4 flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{totalCapacity}</p>
              <p className="text-xs text-muted-foreground">Plazas totales</p>
            </div>
          </div>
        </motion.div>

        {/* Main Tabs with Rainbow styling */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.35 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="bg-card/80 backdrop-blur-sm rounded-xl border p-1 mb-6">
              <TabsList className="grid w-full grid-cols-4 bg-transparent">
                <TabsTrigger
                  value="overview"
                  className="gap-2 data-[state=active]:rainbow-button data-[state=active]:text-white rounded-lg transition-all"
                >
                  <BarChart3 className="w-4 h-4" />
                  <span className="hidden sm:inline">Resumen</span>
                </TabsTrigger>
                <TabsTrigger
                  value="activities"
                  className="gap-2 data-[state=active]:rainbow-button data-[state=active]:text-white rounded-lg transition-all"
                >
                  <CalendarDays className="w-4 h-4" />
                  <span className="hidden sm:inline">Actividades</span>
                </TabsTrigger>
                <TabsTrigger
                  value="reservations"
                  className="gap-2 data-[state=active]:rainbow-button data-[state=active]:text-white rounded-lg transition-all"
                >
                  <TicketCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Reservas</span>
                </TabsTrigger>
                <TabsTrigger
                  value="checkin"
                  className="gap-2 data-[state=active]:rainbow-button data-[state=active]:text-white rounded-lg transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span className="hidden sm:inline">Check-in</span>
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Overview Tab - Analytics Dashboard */}
            <TabsContent value="overview">
              <div className="space-y-6">
                {/* Performance by Activity */}
                <Card className="rainbow-card-accent border-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-primary" />
                      Rendimiento por actividad
                    </CardTitle>
                    <CardDescription>Estadísticas detalladas de cada actividad</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {stats?.by_activity && stats.by_activity.length > 0 ? (
                      <div className="space-y-4">
                        {stats.by_activity.map((actStat, index) => (
                          <motion.div
                            key={actStat.activity_id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-muted/50 rounded-xl p-4 hover:shadow-md transition-shadow"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-2 h-10 rounded-full bg-gradient-to-b ${statusConfig[actStat.activity_status]?.bgClass || "from-gray-300 to-gray-400"}`} />
                                <div>
                                  <h4 className="font-semibold text-foreground">{actStat.activity_title}</h4>
                                  <Badge className={statusConfig[actStat.activity_status]?.color || "bg-gray-100"}>
                                    {statusConfig[actStat.activity_status]?.icon}
                                    <span className="ml-1">{statusConfig[actStat.activity_status]?.label || actStat.activity_status}</span>
                                  </Badge>
                                </div>
                              </div>
                            </div>

                            {/* Funnel visualization */}
                            <div className="grid grid-cols-5 gap-2 text-center">
                              <div className="bg-card rounded-lg p-3 border">
                                <p className="text-xl font-bold text-foreground">{actStat.views}</p>
                                <p className="text-xs text-muted-foreground">Visitas</p>
                              </div>
                              <div className="flex items-center justify-center">
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground rotate-90" />
                              </div>
                              <div className="bg-card rounded-lg p-3 border">
                                <p className="text-xl font-bold text-foreground">{actStat.clicks_reserve}</p>
                                <p className="text-xs text-muted-foreground">Clics</p>
                              </div>
                              <div className="flex items-center justify-center">
                                <ArrowUpRight className="w-4 h-4 text-muted-foreground rotate-90" />
                              </div>
                              <div className="bg-card rounded-lg p-3 border">
                                <p className="text-xl font-bold text-primary">{actStat.bookings_count}</p>
                                <p className="text-xs text-muted-foreground">Reservas</p>
                              </div>
                            </div>

                            <div className="mt-4 flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">
                                Ingresos: <span className="font-semibold text-foreground">{(actStat.revenue_cents / 100).toFixed(2)}€</span>
                              </span>
                              <span className="text-muted-foreground">
                                Conversión: <span className="font-semibold text-primary">{actStat.conversion_rate}%</span>
                              </span>
                              <span className="text-muted-foreground">
                                Check-ins: <span className="font-semibold text-foreground">{actStat.checkins_count}</span>
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 rainbow-button rounded-full mx-auto mb-4 flex items-center justify-center">
                          <BarChart3 className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Aún sin datos de analíticas</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Las estadísticas aparecerán cuando tus actividades empiecen a recibir visitas y reservas.
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Activities Tab */}
            <TabsContent value="activities">
              <Card className="rainbow-card-accent border-2">
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-primary" />
                      Mis actividades
                    </CardTitle>
                    <CardDescription>Gestiona y edita tus actividades</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={activityFilter}
                      onChange={(e) => setActivityFilter(e.target.value)}
                      className="h-9 rounded-xl border border-input bg-background px-3 py-1 text-sm focus:ring-2 focus:ring-primary"
                    >
                      <option value="all">Todas</option>
                      <option value="published">Publicadas</option>
                      <option value="draft">Borradores</option>
                      <option value="cancelled">Canceladas</option>
                    </select>
                    <Button
                      size="sm"
                      className="rainbow-button rounded-xl"
                      onClick={() => {
                        setEditingActivity(null);
                        setShowWizard(true);
                      }}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Nueva
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <AnimatePresence mode="popLayout">
                      {filteredActivities.map((activity, index) => (
                        <motion.div
                          key={activity._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:bg-muted/80 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <ActivityMiniThumbnail
                              src={getActivityImageUrl(activity.images)}
                              alt={activity.title}
                              category={activity.category}
                              className="w-14 h-14 group-hover:scale-105 transition-transform"
                            />
                            <div className="min-w-0">
                              <h3 className="font-semibold text-foreground truncate">{activity.title}</h3>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                <span className="text-sm text-muted-foreground">
                                  {activity.start_date_time
                                    ? new Date(activity.start_date_time).toLocaleDateString("es-ES", {
                                        day: "numeric",
                                        month: "short",
                                      })
                                    : "Multi-sesión"}
                                </span>
                                <span className="text-sm text-muted-foreground capitalize">
                                  {activity.modality}
                                </span>
                                {activity.price_cents !== undefined && (
                                  <span className="text-sm font-medium rainbow-text">
                                    {activity.price_cents === 0 ? "Gratis" : `${(activity.price_cents / 100).toFixed(2)}€`}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            {activity.status && statusConfig[activity.status] && (
                              <Badge
                                variant="outline"
                                className={`${statusConfig[activity.status].color} gap-1 hidden sm:flex`}
                              >
                                {statusConfig[activity.status].icon}
                                {statusConfig[activity.status].label}
                              </Badge>
                            )}

                            {activity.status === "draft" && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePublish(activity._id)}
                                className="gap-1 rainbow-border-thin"
                              >
                                <Send className="w-3 h-3" />
                                Publicar
                              </Button>
                            )}

                            <div className="flex items-center gap-1">
                              {activity.slug && (
                                <Link href={`/actividades/${activity.slug}`} target="_blank">
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <ExternalLink className="w-4 h-4" />
                                  </Button>
                                </Link>
                              )}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => {
                                  setEditingActivity(activity);
                                  setShowWizard(true);
                                }}
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {filteredActivities.length === 0 && (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 rainbow-button rounded-full mx-auto mb-4 flex items-center justify-center">
                          <CalendarDays className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">
                          {activityFilter === "all"
                            ? "¡Crea tu primera actividad!"
                            : `No hay actividades ${activityFilter === "published" ? "publicadas" : activityFilter === "draft" ? "en borrador" : "canceladas"}`}
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          {activityFilter === "all"
                            ? "Empieza a publicar actividades y llega a miles de familias"
                            : "Prueba con otro filtro o crea una nueva actividad"}
                        </p>
                        <Button
                          className="rainbow-button rounded-xl"
                          onClick={() => {
                            setEditingActivity(null);
                            setShowWizard(true);
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Crear actividad
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Reservations Tab */}
            <TabsContent value="reservations">
              <Card className="rainbow-card-accent border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TicketCheck className="w-5 h-5 text-primary" />
                    Reservas recientes
                  </CardTitle>
                  <CardDescription>Gestiona las inscripciones a tus actividades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-20 h-20 rainbow-button rounded-full mx-auto mb-4 flex items-center justify-center">
                          <TicketCheck className="w-10 h-10 text-white" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Aún no hay reservas</h3>
                        <p className="text-muted-foreground max-w-md mx-auto">
                          Las reservas aparecerán aquí cuando las familias se inscriban a tus actividades
                        </p>
                      </div>
                    ) : (
                      bookings.map((booking, index) => (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 bg-muted/50 rounded-xl hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <TicketCheck className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{booking.activity_title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {booking.quantity} plaza{booking.quantity > 1 ? "s" : ""} ·{" "}
                                {new Date(booking.booked_at).toLocaleDateString("es-ES", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </p>
                            </div>
                          </div>
                          <Badge className={bookingStatusConfig[booking.status]?.color || "bg-gray-100"}>
                            {bookingStatusConfig[booking.status]?.label || booking.status}
                          </Badge>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Check-in Tab */}
            <TabsContent value="checkin">
              <Card className="rainbow-card-accent border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-primary" />
                    Check-in de asistentes
                  </CardTitle>
                  <CardDescription>Valida los tickets de los asistentes a tus actividades</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-md mx-auto space-y-6">
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm font-medium text-foreground">Selecciona actividad</label>
                        <select
                          value={selectedActivityForCheckIn}
                          onChange={(e) => setSelectedActivityForCheckIn(e.target.value)}
                          className="mt-1 w-full h-12 rounded-xl border border-input bg-background px-4 text-sm focus:ring-2 focus:ring-primary"
                        >
                          <option value="">Selecciona una actividad</option>
                          {activities
                            .filter((a) => a.status === "published")
                            .map((a) => (
                              <option key={a._id} value={a._id}>
                                {a.title}
                              </option>
                            ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-sm font-medium text-foreground">Código del ticket</label>
                        <div className="mt-1 flex gap-2">
                          <Input
                            value={ticketCode}
                            onChange={(e) => setTicketCode(e.target.value.toUpperCase())}
                            placeholder="PEQ-XXXXX-XXXX"
                            className="h-12 font-mono rounded-xl"
                          />
                          <Button
                            onClick={handleCheckIn}
                            disabled={!ticketCode || !selectedActivityForCheckIn || checkInLoading}
                            className="h-12 px-6 rainbow-button rounded-xl"
                          >
                            {checkInLoading ? (
                              <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                              <QrCode className="w-5 h-5" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>

                    <AnimatePresence>
                      {checkInResult && (
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          className={`p-6 rounded-xl ${
                            checkInResult.valid
                              ? "bg-green-50 border-2 border-green-200"
                              : "bg-red-50 border-2 border-red-200"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-4">
                            {checkInResult.valid ? (
                              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                                <CheckCircle className="w-7 h-7 text-green-600" />
                              </div>
                            ) : (
                              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                                <XCircle className="w-7 h-7 text-red-600" />
                              </div>
                            )}
                            <h3 className={`text-lg font-bold ${checkInResult.valid ? "text-green-800" : "text-red-800"}`}>
                              {checkInResult.valid ? "¡Check-in exitoso!" : "Check-in fallido"}
                            </h3>
                          </div>

                          {checkInResult.valid ? (
                            <div className="space-y-2 text-green-700">
                              <p><strong>Niño:</strong> {checkInResult.child_name}</p>
                              <p><strong>Padre/Madre:</strong> {checkInResult.parent_name}</p>
                              <p><strong>Ticket:</strong> {checkInResult.ticket?.ticket_code}</p>
                            </div>
                          ) : (
                            <p className="text-red-700">{checkInResult.reason}</p>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {activities.filter(a => a.status === "published").length === 0 && (
                      <div className="text-center py-8">
                        <div className="w-16 h-16 rainbow-button rounded-full mx-auto mb-4 flex items-center justify-center">
                          <QrCode className="w-8 h-8 text-white" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">Sin actividades publicadas</h3>
                        <p className="text-muted-foreground text-sm">
                          Publica una actividad para empezar a hacer check-ins
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Links */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 grid sm:grid-cols-2 gap-4"
        >
          <Link href="/actividades">
            <Card className="border-2 hover:shadow-xl hover:border-primary/50 transition-all cursor-pointer h-full rainbow-card-accent group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 rainbow-button rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Eye className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Ver página pública</h3>
                  <p className="text-sm text-muted-foreground">Así ven las familias tus actividades</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/">
            <Card className="border-2 hover:shadow-xl hover:border-secondary/50 transition-all cursor-pointer h-full rainbow-card-accent group">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-14 h-14 bg-gradient-to-r from-secondary to-orange-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Building2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Ir al inicio</h3>
                  <p className="text-sm text-muted-foreground">Volver a la página principal</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </main>

      {/* AI Activity Wizard Modal */}
      {showWizard && (
        <AIActivityWizard
          onClose={() => {
            setShowWizard(false);
            setEditingActivity(null);
          }}
          onSuccess={() => {
            fetchActivities();
            fetchStats();
          }}
          editData={editingActivity ? {
            _id: editingActivity._id,
            title: editingActivity.title,
            category: editingActivity.category,
            age_min: editingActivity.age_min,
            age_max: editingActivity.age_max,
            modality: editingActivity.modality,
            short_description: editingActivity.short_description,
            description: editingActivity.description,
            requirements: editingActivity.requirements,
            location_name: editingActivity.location_name,
            location_address: editingActivity.location_address,
            city: editingActivity.city,
            online_link: editingActivity.online_link,
            cancellation_policy: editingActivity.cancellation_policy,
          } : undefined}
        />
      )}
    </div>
  );
}
