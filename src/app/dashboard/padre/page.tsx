"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CalendarDays,
  Users,
  Ticket,
  Plus,
  Search,
  Heart,
  Clock,
  ChevronRight,
  Baby,
  Loader2,
  QrCode,
  XCircle,
  Copy,
  CheckCircle,
  Sparkles,
  Star,
} from "lucide-react";
import Link from "next/link";
import type { Booking, User as DBUser, Ticket as TicketType, CalendarItem } from "@/types/database";

const bookingStatusConfig: Record<string, { label: string; color: string }> = {
  reserved: { label: "Reservada", color: "bg-blue-100 text-blue-800" },
  paid: { label: "Pagada", color: "bg-green-100 text-green-800" },
  checked_in: { label: "Check-in", color: "bg-purple-100 text-purple-800" },
  cancelled: { label: "Cancelada", color: "bg-red-100 text-red-800" },
};

const ticketStatusConfig: Record<string, { label: string; color: string }> = {
  active: { label: "Activo", color: "bg-green-100 text-green-800" },
  used: { label: "Usado", color: "bg-blue-100 text-blue-800" },
  cancelled: { label: "Cancelado", color: "bg-red-100 text-red-800" },
};

interface BookingWithDetails extends Booking {
  activity_title?: string;
  activity_date?: string;
  activity_location?: string;
  child_name?: string;
}

interface TicketWithDetails extends TicketType {
  activity_title?: string;
  activity_date?: string;
}

// Rainbow Metric Card Component
function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  delay = 0,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ElementType;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
    >
      <Card className="rainbow-card-accent border-2 hover:shadow-lg transition-all hover:scale-[1.02] overflow-hidden">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {title}
            </CardTitle>
            <div className="w-10 h-10 rainbow-border rounded-xl flex items-center justify-center bg-white">
              <Icon className="w-5 h-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold rainbow-text">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export default function PadreDashboard() {
  const { data: session, isPending } = useSession();
  const [activeTab, setActiveTab] = useState("bookings");
  const [children, setChildren] = useState<DBUser[]>([]);
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [tickets, setTickets] = useState<TicketWithDetails[]>([]);
  const [calendarItems, setCalendarItems] = useState<CalendarItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Fetch children
  const fetchChildren = useCallback(async () => {
    try {
      const response = await fetch("/api/kids");
      const data = (await response.json()) as { ok: boolean; data?: DBUser[] };
      if (data.ok && data.data) {
        setChildren(data.data);
      }
    } catch (err) {
      console.error("Error fetching children:", err);
    }
  }, []);

  // Fetch bookings
  const fetchBookings = useCallback(async () => {
    try {
      const response = await fetch("/api/bookings");
      const data = (await response.json()) as { ok: boolean; data?: Booking[] };
      if (data.ok && data.data) {
        // Enrich bookings with activity details
        const enrichedBookings: BookingWithDetails[] = [];
        for (const booking of data.data) {
          const activityId = typeof booking.activity === "string" ? booking.activity : booking.activity._id;
          try {
            const actResponse = await fetch(`/api/activities?id=${activityId}`);
            const actData = (await actResponse.json()) as { ok: boolean; data?: { title: string; start_date_time?: string; location_name?: string }[] };
            const activity = actData.data?.[0];

            let childName = "";
            if (booking.child_user) {
              const childId = typeof booking.child_user === "string" ? booking.child_user : booking.child_user._id;
              const child = children.find((c) => c._id === childId);
              childName = child?.name || "";
            }

            enrichedBookings.push({
              ...booking,
              activity_title: activity?.title || "Actividad",
              activity_date: activity?.start_date_time,
              activity_location: activity?.location_name,
              child_name: childName,
            });
          } catch {
            enrichedBookings.push(booking);
          }
        }
        setBookings(enrichedBookings);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  }, [children]);

  // Fetch tickets
  const fetchTickets = useCallback(async () => {
    try {
      const response = await fetch("/api/tickets");
      const data = (await response.json()) as { ok: boolean; data?: TicketType[] };
      if (data.ok && data.data) {
        setTickets(data.data as TicketWithDetails[]);
      }
    } catch (err) {
      console.error("Error fetching tickets:", err);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchChildren();
      setLoading(false);
    };
    loadData();
  }, [fetchChildren]);

  useEffect(() => {
    if (children.length >= 0 && !loading) {
      fetchBookings();
      fetchTickets();
    }
  }, [children, loading, fetchBookings, fetchTickets]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ booking_id: bookingId, status: "cancelled" }),
      });
      const data = (await response.json()) as { ok: boolean };
      if (data.ok) {
        fetchBookings();
        fetchTickets();
      }
    } catch (err) {
      console.error("Error cancelling booking:", err);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  if (isPending || loading) {
    return (
      <div className="min-h-screen bg-muted/30 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="rainbow-border-animated p-4 rounded-full">
            <Loader2 className="w-12 h-12 animate-spin text-primary" />
          </div>
          <p className="text-muted-foreground rainbow-text-animated font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  const userName = session?.user?.name || "Padre";
  const activeBookings = bookings.filter((b) => b.status !== "cancelled");
  const activeTickets = tickets.filter((t) => t.status === "active");

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Rainbow Dashboard Header Bar */}
      <div className="rainbow-hero border-b relative overflow-hidden">
        <div className="container mx-auto px-4 py-4 flex items-center gap-3 relative z-10">
          <div className="w-12 h-12 rainbow-border-animated rounded-xl flex items-center justify-center bg-white shadow-lg">
            <Heart className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg text-foreground flex items-center gap-2">
              Panel de Familia
              <Sparkles className="w-4 h-4 text-yellow-500" />
            </h1>
            <p className="text-sm text-muted-foreground">Gestiona las actividades de tus peques</p>
          </div>
        </div>
        <div className="rainbow-line-animated" />
      </div>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Welcome Banner with Rainbow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="rainbow-hero rounded-2xl p-6 md:p-8 text-foreground relative overflow-hidden rainbow-glow">
            {/* Decorative elements */}
            <div className="absolute top-4 right-4 text-4xl opacity-20">
              <Star className="w-12 h-12 text-yellow-400 animate-pulse" />
            </div>
            <div className="absolute bottom-4 left-8 text-3xl opacity-20">
              <Sparkles className="w-10 h-10 text-pink-400" />
            </div>

            <div className="relative z-10">
              <span className="rainbow-pill-soft mb-3 inline-flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Bienvenido de vuelta
              </span>
              <h2 className="text-2xl md:text-3xl font-bold mb-2 rainbow-text-animated">
                ¡Hola, {userName}!
              </h2>
              <p className="text-muted-foreground mb-4 max-w-xl">
                Descubre nuevas actividades para tus peques y gestiona sus reservas de forma fácil y divertida.
              </p>
              <Link href="/actividades">
                <Button className="rainbow-button">
                  <Search className="w-4 h-4 mr-2" />
                  Buscar actividades
                </Button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards with Rainbow Theme */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            title="Reservas activas"
            value={activeBookings.length}
            subtitle="Pendientes o confirmadas"
            icon={CalendarDays}
            delay={0.1}
          />
          <MetricCard
            title="Tickets activos"
            value={activeTickets.length}
            subtitle="Listos para usar"
            icon={Ticket}
            delay={0.15}
          />
          <MetricCard
            title="Total reservas"
            value={bookings.length}
            subtitle="Historial completo"
            icon={CheckCircle}
            delay={0.2}
          />
          <MetricCard
            title="Mis peques"
            value={children.length}
            subtitle="Perfiles registrados"
            icon={Users}
            delay={0.25}
          />
        </div>

        {/* Children Section with Rainbow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8"
        >
          <Card className="rainbow-card-accent border-2 overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between rainbow-hero">
              <div>
                <CardTitle className="flex items-center gap-2 rainbow-text">
                  <Baby className="w-5 h-5" />
                  Mis peques
                </CardTitle>
                <CardDescription>Perfiles de tus hijos registrados</CardDescription>
              </div>
              <Button size="sm" className="rainbow-border bg-white hover:bg-white/90 text-foreground">
                <Plus className="w-4 h-4 mr-2" />
                Añadir peque
              </Button>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {children.map((child, index) => (
                  <motion.div
                    key={child._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className="flex items-center gap-4 p-4 rainbow-card-accent rounded-xl hover:shadow-md transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <div className="w-14 h-14 rainbow-border rounded-xl flex items-center justify-center text-3xl bg-white shadow-sm">
                      {child.avatar?.url ? (
                        <img src={child.avatar.url} alt={child.name} className="w-full h-full object-cover rounded-xl" />
                      ) : (
                        "👶"
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground">{child.name}</h3>
                      <p className="text-sm text-muted-foreground capitalize">{child.role}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </motion.div>
                ))}

                {children.length === 0 && (
                  <div className="col-span-full text-center py-8">
                    <div className="w-16 h-16 rainbow-border-animated rounded-full mx-auto mb-4 flex items-center justify-center bg-white">
                      <Baby className="w-8 h-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">
                      Aún no has añadido ningún peque
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Añade el perfil de tus hijos para reservar actividades
                    </p>
                    <Button className="rainbow-button">
                      <Plus className="w-4 h-4 mr-2" />
                      Añadir primer peque
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Tabs with Rainbow Style */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6 p-1 rainbow-border rounded-xl bg-white">
              <TabsTrigger
                value="bookings"
                className="gap-2 data-[state=active]:rainbow-button data-[state=active]:text-white rounded-lg transition-all"
              >
                <CalendarDays className="w-4 h-4" />
                Reservas
              </TabsTrigger>
              <TabsTrigger
                value="tickets"
                className="gap-2 data-[state=active]:rainbow-button data-[state=active]:text-white rounded-lg transition-all"
              >
                <QrCode className="w-4 h-4" />
                Tickets
              </TabsTrigger>
            </TabsList>

            {/* Bookings Tab */}
            <TabsContent value="bookings">
              <Card className="rainbow-card-accent border-2 overflow-hidden">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="rainbow-text">Mis reservas</CardTitle>
                    <CardDescription>Historial de reservas realizadas</CardDescription>
                  </div>
                  <Link href="/actividades">
                    <Button size="sm" className="rainbow-button">
                      <Search className="w-4 h-4 mr-2" />
                      Nueva reserva
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rainbow-border-animated rounded-full mx-auto mb-4 flex items-center justify-center bg-white">
                          <CalendarDays className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No tienes reservas</h3>
                        <p className="text-muted-foreground mb-4">
                          Explora nuestras actividades y reserva una experiencia increíble
                        </p>
                        <Link href="/actividades">
                          <Button className="rainbow-button">
                            <Search className="w-4 h-4 mr-2" />
                            Explorar actividades
                          </Button>
                        </Link>
                      </div>
                    ) : (
                      bookings.map((booking, index) => (
                        <motion.div
                          key={booking._id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="flex items-center justify-between p-4 rainbow-card-accent rounded-xl hover:shadow-md transition-all"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 rainbow-border rounded-xl flex items-center justify-center bg-white">
                              <CalendarDays className="w-6 h-6 text-primary" />
                            </div>
                            <div>
                              <h4 className="font-medium text-foreground">{booking.activity_title}</h4>
                              <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                                {booking.activity_date && (
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {new Date(booking.activity_date).toLocaleDateString("es-ES", {
                                      day: "numeric",
                                      month: "short",
                                    })}
                                  </span>
                                )}
                                <span>·</span>
                                <span>{booking.quantity} plaza{booking.quantity > 1 ? "s" : ""}</span>
                                {booking.child_name && (
                                  <>
                                    <span>·</span>
                                    <span>{booking.child_name}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={bookingStatusConfig[booking.status]?.color || "bg-gray-100"}>
                              {bookingStatusConfig[booking.status]?.label || booking.status}
                            </Badge>
                            {booking.status === "reserved" && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleCancelBooking(booking._id)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Tickets Tab */}
            <TabsContent value="tickets">
              <Card className="rainbow-card-accent border-2 overflow-hidden">
                <CardHeader>
                  <CardTitle className="rainbow-text">Mis tickets</CardTitle>
                  <CardDescription>Entradas para tus actividades reservadas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {tickets.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="w-16 h-16 rainbow-border-animated rounded-full mx-auto mb-4 flex items-center justify-center bg-white">
                          <QrCode className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="font-semibold text-foreground mb-2">No tienes tickets</h3>
                        <p className="text-muted-foreground">
                          Los tickets aparecerán aquí cuando realices una reserva
                        </p>
                      </div>
                    ) : (
                      <div className="grid sm:grid-cols-2 gap-4">
                        {tickets.map((ticket, index) => (
                          <motion.div
                            key={ticket._id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.05 }}
                            className={`p-4 rounded-xl rainbow-card-accent overflow-hidden ${
                              ticket.status === "active"
                                ? "rainbow-glow"
                                : ticket.status === "used"
                                ? "opacity-80"
                                : "opacity-60"
                            }`}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <QrCode className={`w-5 h-5 ${
                                  ticket.status === "active" ? "text-primary" : "text-muted-foreground"
                                }`} />
                                <Badge className={ticketStatusConfig[ticket.status]?.color || "bg-gray-100"}>
                                  {ticketStatusConfig[ticket.status]?.label || ticket.status}
                                </Badge>
                              </div>
                              {ticket.status === "active" && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => copyToClipboard(ticket.ticket_code)}
                                  className="h-8 w-8"
                                >
                                  {copiedCode === ticket.ticket_code ? (
                                    <CheckCircle className="w-4 h-4 text-green-600" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </Button>
                              )}
                            </div>

                            <div className="rainbow-border rounded-lg p-3 mb-3 text-center bg-white">
                              <p className="font-mono text-lg font-bold tracking-wider rainbow-text">
                                {ticket.ticket_code}
                              </p>
                            </div>

                            <div className="text-sm text-muted-foreground">
                              <p>Emitido: {new Date(ticket.issued_at).toLocaleDateString("es-ES")}</p>
                              {ticket.used_at && (
                                <p>Usado: {new Date(ticket.used_at).toLocaleDateString("es-ES")}</p>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Quick Links with Rainbow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 grid sm:grid-cols-2 gap-4"
        >
          <Link href="/actividades">
            <Card className="rainbow-card-accent border-2 hover:shadow-lg transition-all cursor-pointer h-full group hover:scale-[1.02]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rainbow-border rounded-xl flex items-center justify-center bg-white group-hover:rainbow-glow transition-all">
                  <Search className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:rainbow-text transition-all">Buscar actividades</h3>
                  <p className="text-sm text-muted-foreground">Encuentra nuevas experiencias</p>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/">
            <Card className="rainbow-card-accent border-2 hover:shadow-lg transition-all cursor-pointer h-full group hover:scale-[1.02]">
              <CardContent className="p-6 flex items-center gap-4">
                <div className="w-12 h-12 rainbow-border rounded-xl flex items-center justify-center bg-white group-hover:rainbow-glow transition-all">
                  <Heart className="w-6 h-6 text-secondary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground group-hover:rainbow-text transition-all">Ir al inicio</h3>
                  <p className="text-sm text-muted-foreground">Volver a la página principal</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      </main>
    </div>
  );
}
