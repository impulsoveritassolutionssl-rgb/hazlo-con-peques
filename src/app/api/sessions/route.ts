import { NextResponse } from "next/server";
import { z } from "zod";
import { totalumSdk } from "@/lib/totalum";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Activity, ActivitySession } from "@/types/database";

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

// Schema for session creation
const createSessionSchema = z.object({
  activity: z.string().min(1, "La actividad es requerida"),
  start_date_time: z.string().min(1, "La fecha de inicio es requerida"),
  end_date_time: z.string().min(1, "La fecha de fin es requerida"),
  capacity_total: z.number().min(1, "La capacidad debe ser al menos 1"),
  price_cents: z.number().min(0, "El precio no puede ser negativo"),
  currency: z.enum(["eur", "usd"]).default("eur"),
  sales_start: z.string().optional(),
  sales_end: z.string().optional(),
});

// Schema for session update
const updateSessionSchema = z.object({
  session_id: z.string().min(1, "El ID de la sesión es requerido"),
  start_date_time: z.string().optional(),
  end_date_time: z.string().optional(),
  capacity_total: z.number().min(1).optional(),
  price_cents: z.number().min(0).optional(),
  sales_start: z.string().optional(),
  sales_end: z.string().optional(),
  status: z.enum(["active", "cancelled", "sold_out"]).optional(),
});

// GET - Fetch sessions for an activity
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get("activity_id");
    const status = searchParams.get("status");

    if (!activityId) {
      return NextResponse.json(
        { ok: false, error: "activity_id es requerido" },
        { status: 400 }
      );
    }

    const filter: Record<string, unknown>[] = [{ activity: activityId }];

    if (status) {
      filter.push({ status });
    }

    console.log("[API] GET /api/sessions - Filter:", JSON.stringify(filter));

    const result = await totalumSdk.crud.getRecords("activity_session", {
      filter,
      sort: { start_date_time: 1 },
    });

    console.log("[API] GET /api/sessions - Result count:", result.data?.length || 0);

    return NextResponse.json({
      ok: true,
      data: result.data || [],
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/sessions", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// POST - Create a new session (organizer only)
export async function POST(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== "organizador") {
      return NextResponse.json(
        { ok: false, error: "Solo los organizadores pueden crear sesiones" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = createSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Verify activity ownership
    const activityResult = await totalumSdk.crud.getRecordById("activity", parsed.data.activity);
    const activity = activityResult.data as Activity | undefined;

    if (!activity) {
      return NextResponse.json(
        { ok: false, error: "Actividad no encontrada" },
        { status: 404 }
      );
    }

    if (activity.organizer_user !== session.user.id) {
      return NextResponse.json(
        { ok: false, error: "No tienes permiso para modificar esta actividad" },
        { status: 403 }
      );
    }

    const sessionData = {
      ...parsed.data,
      capacity_available: parsed.data.capacity_total, // Initially, all capacity is available
      status: "active",
    };

    console.log("[API] POST /api/sessions - Creating session:", sessionData);

    const result = await totalumSdk.crud.createRecord("activity_session", sessionData);

    // Update activity draft checklist
    const checklistResult = await totalumSdk.crud.getRecords("activity_draft_checklist", {
      filter: [{ activity: parsed.data.activity }],
      pagination: { limit: 1, page: 0 },
    });

    if (checklistResult.data && checklistResult.data.length > 0) {
      const checklist = checklistResult.data[0] as { _id: string; completion_percent: number };
      const hasSession = "yes";
      const hasCapacity = parsed.data.capacity_total > 0 ? "yes" : "no";
      const hasPrice = parsed.data.price_cents >= 0 ? "yes" : "no";

      await totalumSdk.crud.editRecordById("activity_draft_checklist", checklist._id, {
        has_session: hasSession,
        has_capacity: hasCapacity,
        has_price: hasPrice,
      });
    }

    console.log("[API] POST /api/sessions - Created session:", result.data);

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err) {
    console.error("[API ERROR] POST /api/sessions", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// PATCH - Update a session (organizer only)
export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== "organizador") {
      return NextResponse.json(
        { ok: false, error: "Solo los organizadores pueden modificar sesiones" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = updateSessionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { session_id, ...updateData } = parsed.data;

    // Get session to verify ownership
    const sessionResult = await totalumSdk.crud.getRecordById("activity_session", session_id);
    const activitySession = sessionResult.data as ActivitySession | undefined;

    if (!activitySession) {
      return NextResponse.json(
        { ok: false, error: "Sesión no encontrada" },
        { status: 404 }
      );
    }

    // Get activity to verify ownership
    const activityId = typeof activitySession.activity === "string"
      ? activitySession.activity
      : activitySession.activity._id;

    const activityResult = await totalumSdk.crud.getRecordById("activity", activityId);
    const activity = activityResult.data as Activity | undefined;

    if (!activity || activity.organizer_user !== session.user.id) {
      return NextResponse.json(
        { ok: false, error: "No tienes permiso para modificar esta sesión" },
        { status: 403 }
      );
    }

    // If capacity_total is being updated, adjust capacity_available
    const finalUpdateData: Record<string, unknown> = { ...updateData };
    if (updateData.capacity_total !== undefined) {
      const bookedCount = activitySession.capacity_total - activitySession.capacity_available;
      const newAvailable = updateData.capacity_total - bookedCount;

      if (newAvailable < 0) {
        return NextResponse.json(
          { ok: false, error: `No puedes reducir la capacidad por debajo de ${bookedCount} (plazas ya reservadas)` },
          { status: 400 }
        );
      }

      finalUpdateData.capacity_available = newAvailable;
    }

    console.log("[API] PATCH /api/sessions - Updating session:", session_id, finalUpdateData);

    await totalumSdk.crud.editRecordById("activity_session", session_id, finalUpdateData);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API ERROR] PATCH /api/sessions", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// DELETE - Delete a session (organizer only, only if no bookings)
export async function DELETE(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== "organizador") {
      return NextResponse.json(
        { ok: false, error: "Solo los organizadores pueden eliminar sesiones" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("session_id");

    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "session_id es requerido" },
        { status: 400 }
      );
    }

    // Get session to verify ownership
    const sessionResult = await totalumSdk.crud.getRecordById("activity_session", sessionId);
    const activitySession = sessionResult.data as ActivitySession | undefined;

    if (!activitySession) {
      return NextResponse.json(
        { ok: false, error: "Sesión no encontrada" },
        { status: 404 }
      );
    }

    // Check for existing bookings
    const bookingsResult = await totalumSdk.crud.getRecords("booking", {
      filter: [{ session: sessionId }, { status: { ne: "cancelled" } }],
      pagination: { limit: 1, page: 0 },
    });

    if (bookingsResult.data && bookingsResult.data.length > 0) {
      return NextResponse.json(
        { ok: false, error: "No se puede eliminar una sesión con reservas activas" },
        { status: 400 }
      );
    }

    // Verify activity ownership
    const activityId = typeof activitySession.activity === "string"
      ? activitySession.activity
      : activitySession.activity._id;

    const activityResult = await totalumSdk.crud.getRecordById("activity", activityId);
    const activity = activityResult.data as Activity | undefined;

    if (!activity || activity.organizer_user !== session.user.id) {
      return NextResponse.json(
        { ok: false, error: "No tienes permiso para eliminar esta sesión" },
        { status: 403 }
      );
    }

    console.log("[API] DELETE /api/sessions - Deleting session:", sessionId);

    await totalumSdk.crud.deleteRecordById("activity_session", sessionId);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API ERROR] DELETE /api/sessions", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

