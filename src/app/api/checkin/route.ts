import { NextResponse } from "next/server";
import { z } from "zod";
import { totalumSdk } from "@/lib/totalum";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Activity, Ticket, Booking, User } from "@/types/database";

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

// Schema for check-in
const checkInSchema = z.object({
  ticket_code: z.string().min(1, "El código del ticket es requerido"),
  activity_id: z.string().min(1, "El ID de la actividad es requerido"),
});

// GET - Validate a ticket code (organizer preview)
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== "organizador") {
      return NextResponse.json(
        { ok: false, error: "Solo los organizadores pueden validar tickets" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const ticketCode = searchParams.get("ticket_code");
    const activityId = searchParams.get("activity_id");

    if (!ticketCode || !activityId) {
      return NextResponse.json(
        { ok: false, error: "ticket_code y activity_id son requeridos" },
        { status: 400 }
      );
    }

    // Find ticket by code
    const ticketResult = await totalumSdk.crud.getRecords("ticket", {
      filter: [{ ticket_code: ticketCode }],
      pagination: { limit: 1, page: 0 },
    });

    if (!ticketResult.data || ticketResult.data.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          valid: false,
          reason: "Ticket no encontrado",
        }
      });
    }

    const ticket = ticketResult.data[0] as Ticket;

    // Get booking
    const bookingId = typeof ticket.booking === "string" ? ticket.booking : ticket.booking._id;
    const bookingResult = await totalumSdk.crud.getRecordById("booking", bookingId);
    const booking = bookingResult.data as Booking | undefined;

    if (!booking) {
      return NextResponse.json({
        ok: true,
        data: {
          valid: false,
          reason: "Reserva no encontrada",
        }
      });
    }

    // Verify activity matches
    const bookingActivityId = typeof booking.activity === "string" ? booking.activity : booking.activity._id;
    if (bookingActivityId !== activityId) {
      return NextResponse.json({
        ok: true,
        data: {
          valid: false,
          reason: "Este ticket no corresponde a esta actividad",
        }
      });
    }

    // Verify organizer owns the activity
    const activityResult = await totalumSdk.crud.getRecordById("activity", activityId);
    const activity = activityResult.data as Activity | undefined;

    if (!activity || activity.organizer_user !== session.user.id) {
      return NextResponse.json(
        { ok: false, error: "No tienes permiso para esta actividad" },
        { status: 403 }
      );
    }

    // Check ticket status
    if (ticket.status === "cancelled") {
      return NextResponse.json({
        ok: true,
        data: {
          valid: false,
          reason: "Este ticket ha sido cancelado",
        }
      });
    }

    if (ticket.status === "used") {
      return NextResponse.json({
        ok: true,
        data: {
          valid: false,
          reason: "Este ticket ya ha sido utilizado",
          used_at: ticket.used_at,
        }
      });
    }

    // Get child info
    let childName = "No especificado";
    if (booking.child_user) {
      const childId = typeof booking.child_user === "string" ? booking.child_user : booking.child_user._id;
      const childResult = await totalumSdk.crud.getRecordById("user", childId);
      const child = childResult.data as User | undefined;
      if (child) {
        childName = child.name;
      }
    }

    // Get parent info
    let parentName = "No especificado";
    const parentId = typeof booking.parent_user === "string" ? booking.parent_user : booking.parent_user._id;
    const parentResult = await totalumSdk.crud.getRecordById("user", parentId);
    const parent = parentResult.data as User | undefined;
    if (parent) {
      parentName = parent.name;
    }

    console.log("[API] GET /api/checkin - Ticket valid:", ticketCode);

    return NextResponse.json({
      ok: true,
      data: {
        valid: true,
        ticket: {
          _id: ticket._id,
          ticket_code: ticket.ticket_code,
          status: ticket.status,
        },
        booking: {
          _id: booking._id,
          quantity: booking.quantity,
          booked_at: booking.booked_at,
        },
        child_name: childName,
        parent_name: parentName,
        activity_title: activity.title,
      }
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/checkin", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// POST - Perform check-in (mark ticket as used)
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== "organizador") {
      return NextResponse.json(
        { ok: false, error: "Solo los organizadores pueden hacer check-in" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = checkInSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { ticket_code, activity_id } = parsed.data;

    // Find ticket by code
    const ticketResult = await totalumSdk.crud.getRecords("ticket", {
      filter: [{ ticket_code }],
      pagination: { limit: 1, page: 0 },
    });

    if (!ticketResult.data || ticketResult.data.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Ticket no encontrado" },
        { status: 404 }
      );
    }

    const ticket = ticketResult.data[0] as Ticket;

    // Get booking
    const bookingId = typeof ticket.booking === "string" ? ticket.booking : ticket.booking._id;
    const bookingResult = await totalumSdk.crud.getRecordById("booking", bookingId);
    const booking = bookingResult.data as Booking | undefined;

    if (!booking) {
      return NextResponse.json(
        { ok: false, error: "Reserva no encontrada" },
        { status: 404 }
      );
    }

    // Verify activity matches
    const bookingActivityId = typeof booking.activity === "string" ? booking.activity : booking.activity._id;
    if (bookingActivityId !== activity_id) {
      return NextResponse.json(
        { ok: false, error: "Este ticket no corresponde a esta actividad" },
        { status: 400 }
      );
    }

    // Verify organizer owns the activity
    const activityResult = await totalumSdk.crud.getRecordById("activity", activity_id);
    const activity = activityResult.data as Activity | undefined;

    if (!activity || activity.organizer_user !== session.user.id) {
      return NextResponse.json(
        { ok: false, error: "No tienes permiso para esta actividad" },
        { status: 403 }
      );
    }

    // Check ticket status
    if (ticket.status === "cancelled") {
      return NextResponse.json(
        { ok: false, error: "Este ticket ha sido cancelado" },
        { status: 400 }
      );
    }

    if (ticket.status === "used") {
      return NextResponse.json(
        { ok: false, error: "Este ticket ya ha sido utilizado" },
        { status: 400 }
      );
    }

    // Perform check-in
    const now = new Date().toISOString();

    await totalumSdk.crud.editRecordById("ticket", ticket._id, {
      status: "used",
      used_at: now,
    });

    // Update booking status to checked_in if all tickets are used
    const allTicketsResult = await totalumSdk.crud.getRecords("ticket", {
      filter: [{ booking: bookingId }],
    });

    if (allTicketsResult.data) {
      const allUsed = allTicketsResult.data.every(
        (t) => (t as Ticket)._id === ticket._id || (t as Ticket).status === "used"
      );

      if (allUsed) {
        await totalumSdk.crud.editRecordById("booking", bookingId, {
          status: "checked_in",
        });
      }
    }

    // Update activity stats (increment checkins_count)
    const statsResult = await totalumSdk.crud.getRecords("activity_stats", {
      filter: [{ activity: activity_id }],
      pagination: { limit: 1, page: 0 },
    });

    if (statsResult.data && statsResult.data.length > 0) {
      const stats = statsResult.data[0] as { _id: string; checkins_count: number };
      await totalumSdk.crud.editRecordById("activity_stats", stats._id, {
        checkins_count: (stats.checkins_count || 0) + 1,
        last_updated_at: now,
      });
    }

    console.log("[API] POST /api/checkin - Check-in successful:", ticket_code);

    return NextResponse.json({
      ok: true,
      data: {
        ticket_code,
        checked_in_at: now,
      }
    });
  } catch (err) {
    console.error("[API ERROR] POST /api/checkin", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

