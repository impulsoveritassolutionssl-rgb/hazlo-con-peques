import { NextResponse } from "next/server";
import { z } from "zod";
import { totalumSdk } from "@/lib/totalum";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Activity, ActivitySession, Booking } from "@/types/database";

// Helper function for serializing errors
function serializeError(err: unknown) {
  const e = err as { message?: string; code?: string; name?: string; response?: { status?: number; data?: unknown }; stack?: string };
  return {
    message: e?.message ?? "Unknown error",
    code: e?.code ?? null,
    name: e?.name ?? null,
    status: e?.response?.status ?? null,
    responseData: e?.response?.data ?? null,
  };
}

// Generate unique ticket code
function generateTicketCode(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `PEQ-${timestamp}-${random}`;
}

// Schema for booking creation
const createBookingSchema = z.object({
  activity: z.string().min(1, "La actividad es requerida"),
  session: z.string().optional(), // Session ID for multi-session activities
  child_user: z.string().min(1, "El niño es requerido"),
  quantity: z.number().min(1).max(10).default(1),
});

// GET - Fetch bookings
export async function GET(req: Request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get("activity_id");
    const sessionId = searchParams.get("session_id");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "0");

    // Build filter based on user role
    const filter: Record<string, unknown>[] = [];
    const userRole = (session.user as { role?: string })?.role;

    // If parent, show only their bookings
    if (userRole === "padre") {
      filter.push({ parent_user: session.user.id });
    }

    // If organizer, they can filter by their activities (handled in query)
    if (activityId) {
      filter.push({ activity: activityId });
    }
    if (sessionId) {
      filter.push({ session: sessionId });
    }
    if (status) {
      filter.push({ status });
    }

    console.log("[API] GET /api/bookings - Filter:", JSON.stringify(filter));

    const result = await totalumSdk.crud.getRecords("booking", {
      filter: filter.length > 0 ? filter : undefined,
      pagination: { limit, page },
      sort: { booked_at: -1 },
    });

    console.log("[API] GET /api/bookings - Result count:", result.data?.length || 0);

    return NextResponse.json({
      ok: true,
      data: result.data || [],
      metadata: result.metadata,
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/bookings", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// POST - Create a new booking (atomic transaction)
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    // Check if user is a parent
    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== "padre") {
      return NextResponse.json(
        { ok: false, error: "Solo los padres pueden realizar reservas" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = createBookingSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { activity: activityId, session: sessionId, child_user, quantity } = parsed.data;

    // 1. Get activity details
    const activityResult = await totalumSdk.crud.getRecordById("activity", activityId);
    const activity = activityResult.data as Activity | undefined;

    if (!activity) {
      return NextResponse.json(
        { ok: false, error: "Actividad no encontrada" },
        { status: 404 }
      );
    }

    if (activity.status !== "published") {
      return NextResponse.json(
        { ok: false, error: "Esta actividad no está disponible para reservas" },
        { status: 400 }
      );
    }

    // 2. Determine capacity source (session or activity)
    let capacitySource: { capacity_available: number; price_cents: number; start_date_time?: string; end_date_time?: string };
    let activitySession: ActivitySession | null = null;

    if (sessionId) {
      // Multi-session activity: get session capacity
      const sessionResult = await totalumSdk.crud.getRecordById("activity_session", sessionId);
      activitySession = sessionResult.data as ActivitySession | undefined ?? null;

      if (!activitySession) {
        return NextResponse.json(
          { ok: false, error: "Sesión no encontrada" },
          { status: 404 }
        );
      }

      if (activitySession.status !== "active") {
        return NextResponse.json(
          { ok: false, error: "Esta sesión no está disponible" },
          { status: 400 }
        );
      }

      capacitySource = {
        capacity_available: activitySession.capacity_available,
        price_cents: activitySession.price_cents,
        start_date_time: activitySession.start_date_time,
        end_date_time: activitySession.end_date_time,
      };
    } else {
      // Single-session activity: use activity capacity
      capacitySource = {
        capacity_available: activity.capacity_available ?? 0,
        price_cents: activity.price_cents ?? 0,
        start_date_time: activity.start_date_time,
        end_date_time: activity.end_date_time,
      };
    }

    // 3. Check capacity (atomic check)
    if (capacitySource.capacity_available < quantity) {
      return NextResponse.json(
        {
          ok: false,
          error: capacitySource.capacity_available === 0
            ? "No hay plazas disponibles"
            : `Solo quedan ${capacitySource.capacity_available} plazas disponibles`
        },
        { status: 400 }
      );
    }

    console.log("[API] POST /api/bookings - Capacity check passed. Available:", capacitySource.capacity_available, "Requested:", quantity);

    // 4. Create booking
    const bookingData = {
      activity: activityId,
      session: sessionId || undefined,
      parent_user: session.user.id,
      child_user,
      quantity,
      status: "reserved",
      booked_at: new Date().toISOString(),
    };

    console.log("[API] POST /api/bookings - Creating booking:", bookingData);

    const bookingResult = await totalumSdk.crud.createRecord("booking", bookingData);
    const booking = bookingResult.data as Booking | undefined;

    if (!booking?._id) {
      return NextResponse.json(
        { ok: false, error: "Error al crear la reserva" },
        { status: 500 }
      );
    }

    console.log("[API] POST /api/bookings - Booking created:", booking._id);

    // 5. Create tickets (one per quantity)
    const tickets = [];
    for (let i = 0; i < quantity; i++) {
      const ticketData = {
        booking: booking._id,
        ticket_code: generateTicketCode(),
        issued_at: new Date().toISOString(),
        status: "active",
      };

      console.log("[API] POST /api/bookings - Creating ticket:", ticketData.ticket_code);
      const ticketResult = await totalumSdk.crud.createRecord("ticket", ticketData);
      if (ticketResult.data) {
        tickets.push(ticketResult.data);
      }
    }

    // 6. Create calendar item for parent
    if (capacitySource.start_date_time) {
      const calendarData = {
        parent_user: session.user.id,
        activity: activityId,
        booking: booking._id,
        title: activity.title,
        start_date_time: capacitySource.start_date_time,
        end_date_time: capacitySource.end_date_time || capacitySource.start_date_time,
      };

      console.log("[API] POST /api/bookings - Creating calendar item");
      await totalumSdk.crud.createRecord("calendar_item", calendarData);
    }

    // 7. Decrement capacity
    const newCapacity = capacitySource.capacity_available - quantity;

    if (sessionId && activitySession) {
      // Update session capacity
      await totalumSdk.crud.editRecordById("activity_session", sessionId, {
        capacity_available: newCapacity,
        status: newCapacity === 0 ? "sold_out" : "active",
      });
      console.log("[API] POST /api/bookings - Session capacity updated to:", newCapacity);
    } else {
      // Update activity capacity
      await totalumSdk.crud.editRecordById("activity", activityId, {
        capacity_available: newCapacity,
      });
      console.log("[API] POST /api/bookings - Activity capacity updated to:", newCapacity);
    }

    // 8. Update activity stats
    const statsResult = await totalumSdk.crud.getRecords("activity_stats", {
      filter: [{ activity: activityId }],
      pagination: { limit: 1, page: 0 },
    });

    if (statsResult.data && statsResult.data.length > 0) {
      const stats = statsResult.data[0] as { _id: string; bookings_count: number; revenue_cents: number };
      await totalumSdk.crud.editRecordById("activity_stats", stats._id, {
        bookings_count: (stats.bookings_count || 0) + 1,
        revenue_cents: (stats.revenue_cents || 0) + (capacitySource.price_cents * quantity),
        last_updated_at: new Date().toISOString(),
      });
      console.log("[API] POST /api/bookings - Stats updated");
    }

    return NextResponse.json({
      ok: true,
      data: {
        booking,
        tickets,
      }
    });
  } catch (err) {
    console.error("[API ERROR] POST /api/bookings", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// PATCH - Update booking status (cancel)
export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { booking_id, status } = body as { booking_id?: string; status?: string };

    if (!booking_id) {
      return NextResponse.json(
        { ok: false, error: "booking_id es requerido" },
        { status: 400 }
      );
    }

    // Get existing booking
    const bookingResult = await totalumSdk.crud.getRecordById("booking", booking_id);
    const booking = bookingResult.data as Booking | undefined;

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    const userRole = (session.user as { role?: string })?.role;

    // Only parent (owner) or organizer can cancel
    if (userRole === "padre" && booking.parent_user !== session.user.id) {
      return NextResponse.json(
        { ok: false, error: "No tienes permiso para modificar esta reserva" },
        { status: 403 }
      );
    }

    // Handle cancellation
    if (status === "cancelled") {
      // Restore capacity
      const quantity = booking.quantity || 1;

      if (booking.session) {
        const sessionResult = await totalumSdk.crud.getRecordById("activity_session", booking.session as string);
        const actSession = sessionResult.data as ActivitySession | undefined;
        if (actSession) {
          await totalumSdk.crud.editRecordById("activity_session", actSession._id, {
            capacity_available: actSession.capacity_available + quantity,
            status: "active", // Reactivate if was sold_out
          });
        }
      } else {
        const activityResult = await totalumSdk.crud.getRecordById("activity", booking.activity as string);
        const activity = activityResult.data as Activity | undefined;
        if (activity) {
          await totalumSdk.crud.editRecordById("activity", activity._id, {
            capacity_available: (activity.capacity_available ?? 0) + quantity,
          });
        }
      }

      // Cancel all tickets for this booking
      const ticketsResult = await totalumSdk.crud.getRecords("ticket", {
        filter: [{ booking: booking_id }],
      });

      if (ticketsResult.data) {
        for (const ticket of ticketsResult.data) {
          await totalumSdk.crud.editRecordById("ticket", (ticket as { _id: string })._id, {
            status: "cancelled",
          });
        }
      }

      // Delete calendar item
      const calendarResult = await totalumSdk.crud.getRecords("calendar_item", {
        filter: [{ booking: booking_id }],
      });

      if (calendarResult.data && calendarResult.data.length > 0) {
        await totalumSdk.crud.deleteRecordById("calendar_item", (calendarResult.data[0] as { _id: string })._id);
      }
    }

    // Update booking
    const updateData: Record<string, unknown> = { status };
    if (status === "cancelled") {
      updateData.cancellation_at = new Date().toISOString();
    }

    await totalumSdk.crud.editRecordById("booking", booking_id, updateData);

    console.log("[API] PATCH /api/bookings - Updated booking:", booking_id, "to status:", status);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API ERROR] PATCH /api/bookings", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

