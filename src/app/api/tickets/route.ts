import { NextResponse } from "next/server";
import { totalumSdk } from "@/lib/totalum";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Ticket, Booking } from "@/types/database";

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

// GET - Fetch tickets for the logged-in parent
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;

    // Parents can see their tickets, organizers can see tickets for their activities
    if (userRole !== "padre" && userRole !== "organizador") {
      return NextResponse.json(
        { ok: false, error: "No tienes permiso para ver tickets" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const bookingId = searchParams.get("booking_id");

    if (userRole === "padre") {
      // Get all bookings for this parent first
      const bookingsResult = await totalumSdk.crud.getRecords("booking", {
        filter: [{ parent_user: session.user.id }],
      });

      if (!bookingsResult.data || bookingsResult.data.length === 0) {
        return NextResponse.json({
          ok: true,
          data: [],
        });
      }

      const bookingIds = bookingsResult.data.map((b) => (b as Booking)._id);

      // Build filter for tickets
      const filter: Record<string, unknown>[] = [{ booking: { $in: bookingIds } }];

      if (status) {
        filter.push({ status });
      }
      if (bookingId && bookingIds.includes(bookingId)) {
        filter.push({ booking: bookingId });
      }

      const ticketsResult = await totalumSdk.crud.getRecords("ticket", {
        filter,
        sort: { issued_at: -1 },
      });

      console.log("[API] GET /api/tickets - Parent tickets count:", ticketsResult.data?.length || 0);

      return NextResponse.json({
        ok: true,
        data: ticketsResult.data || [],
      });
    }

    // Organizer view - need activity_id or booking_id
    const activityId = searchParams.get("activity_id");

    if (!activityId && !bookingId) {
      return NextResponse.json(
        { ok: false, error: "activity_id o booking_id es requerido para organizadores" },
        { status: 400 }
      );
    }

    if (bookingId) {
      // Get tickets for specific booking
      const filter: Record<string, unknown>[] = [{ booking: bookingId }];
      if (status) {
        filter.push({ status });
      }

      const ticketsResult = await totalumSdk.crud.getRecords("ticket", {
        filter,
        sort: { issued_at: -1 },
      });

      return NextResponse.json({
        ok: true,
        data: ticketsResult.data || [],
      });
    }

    // Get all bookings for the activity
    const bookingsResult = await totalumSdk.crud.getRecords("booking", {
      filter: [{ activity: activityId }],
    });

    if (!bookingsResult.data || bookingsResult.data.length === 0) {
      return NextResponse.json({
        ok: true,
        data: [],
      });
    }

    const bookingIds = bookingsResult.data.map((b) => (b as Booking)._id);

    const filter: Record<string, unknown>[] = [{ booking: { $in: bookingIds } }];
    if (status) {
      filter.push({ status });
    }

    const ticketsResult = await totalumSdk.crud.getRecords("ticket", {
      filter,
      sort: { issued_at: -1 },
    });

    console.log("[API] GET /api/tickets - Activity tickets count:", ticketsResult.data?.length || 0);

    return NextResponse.json({
      ok: true,
      data: ticketsResult.data || [],
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/tickets", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// GET ticket by code (for display/QR)
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { ticket_code } = body as { ticket_code?: string };

    if (!ticket_code) {
      return NextResponse.json(
        { ok: false, error: "ticket_code es requerido" },
        { status: 400 }
      );
    }

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

    // Verify ownership (parent must own the booking)
    const userRole = (session.user as { role?: string })?.role;

    if (userRole === "padre") {
      const bookingId = typeof ticket.booking === "string" ? ticket.booking : ticket.booking._id;
      const bookingResult = await totalumSdk.crud.getRecordById("booking", bookingId);
      const booking = bookingResult.data as Booking | undefined;

      if (!booking || booking.parent_user !== session.user.id) {
        return NextResponse.json(
          { ok: false, error: "No tienes permiso para ver este ticket" },
          { status: 403 }
        );
      }
    }

    console.log("[API] POST /api/tickets - Found ticket:", ticket_code);

    return NextResponse.json({
      ok: true,
      data: ticket,
    });
  } catch (err) {
    console.error("[API ERROR] POST /api/tickets", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

