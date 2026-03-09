import { NextResponse } from "next/server";
import { z } from "zod";
import { totalumSdk } from "@/lib/totalum";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Activity } from "@/types/database";

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

// Generate URL-friendly slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .substring(0, 100);
}

// Schema for activity creation/update
const activitySchema = z.object({
  title: z.string().min(1, "El título es requerido"),
  short_description: z.string().optional(),
  description: z.string().optional(),
  category: z.enum(["ciencia", "arte", "musica", "naturaleza", "lectura", "experimentos"]).optional(),
  age_min: z.number().min(0).optional(),
  age_max: z.number().min(0).optional(),
  modality: z.enum(["presencial", "online", "en-casa"]).default("presencial"),
  location_name: z.string().optional(),
  location_address: z.string().optional(),
  city: z.string().optional(),
  online_link: z.string().optional(),
  start_date_time: z.string().optional(),
  end_date_time: z.string().optional(),
  capacity_total: z.number().min(1).optional(),
  capacity_available: z.number().min(0).optional(),
  price_cents: z.number().min(0).optional(),
  requirements: z.string().optional(),
  cancellation_policy: z.string().optional(),
  visibility: z.enum(["public", "unlisted"]).optional(),
  status: z.enum(["draft", "published", "cancelled"]).optional(),
  // Image fields - can be fileId string or array of {name: fileId}
  posterFileId: z.string().optional(),
  images: z.array(z.object({ name: z.string() }).or(z.object({ url: z.string(), name: z.string() }))).optional(),
});

// GET - Fetch activities (public or filtered by organizer)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const organizerId = searchParams.get("organizer_id");
    const status = searchParams.get("status");
    const category = searchParams.get("category");
    const modality = searchParams.get("modality");
    const city = searchParams.get("city");
    const ageMin = searchParams.get("age_min");
    const ageMax = searchParams.get("age_max");
    const publicOnly = searchParams.get("public") === "true";
    const slug = searchParams.get("slug");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "0");

    // Build filter
    const filter: Record<string, unknown>[] = [];

    // If fetching by slug, get single activity
    if (slug) {
      filter.push({ slug });
    }

    if (organizerId) {
      filter.push({ organizer_user: organizerId });
    }

    // Public listing: only show published activities with public visibility
    if (publicOnly) {
      filter.push({ status: "published" });
      filter.push({ visibility: "public" });
    } else if (status) {
      filter.push({ status });
    }

    if (category) {
      filter.push({ category });
    }
    if (modality) {
      filter.push({ modality });
    }
    if (city) {
      filter.push({ city: { regex: city, options: "i" } });
    }
    if (ageMin) {
      filter.push({ age_min: { lte: parseInt(ageMin) } });
    }
    if (ageMax) {
      filter.push({ age_max: { gte: parseInt(ageMax) } });
    }

    console.log("[API] GET /api/activities - Filter:", JSON.stringify(filter));

    const result = await totalumSdk.crud.getRecords<Activity>("activity", {
      filter: filter.length > 0 ? filter : undefined,
      pagination: { limit, page },
      sort: { createdAt: -1 },
    });

    console.log("[API] GET /api/activities - Result count:", result.data?.length || 0);

    return NextResponse.json({
      ok: true,
      data: result.data || [],
      metadata: result.metadata,
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/activities", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// POST - Create a new activity
export async function POST(req: Request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    // Check if user is an organizer
    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== "organizador") {
      return NextResponse.json(
        { ok: false, error: "Solo los organizadores pueden crear actividades" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = activitySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = generateSlug(parsed.data.title);

    // Check if slug exists and append random string if needed
    const existingSlug = await totalumSdk.crud.getRecords("activity", {
      filter: [{ slug }],
      pagination: { limit: 1, page: 0 },
    });

    if (existingSlug.data && existingSlug.data.length > 0) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Handle images - if posterFileId is provided, convert to Totalum file format
    let imagesData: Array<{ name: string }> | undefined = undefined;
    if (parsed.data.posterFileId) {
      imagesData = [{ name: parsed.data.posterFileId }];
      console.log("[API] POST /api/activities - Adding poster image:", parsed.data.posterFileId);
    } else if (parsed.data.images && parsed.data.images.length > 0) {
      imagesData = parsed.data.images.map((img) => {
        if ("name" in img && typeof img.name === "string") {
          return { name: img.name };
        }
        return img as { name: string };
      });
      console.log("[API] POST /api/activities - Adding images:", imagesData.length);
    }

    // Remove posterFileId from data as it's not a real field
    const { posterFileId: _posterFileId, ...restData } = parsed.data;

    const activityData = {
      ...restData,
      slug,
      organizer_user: session.user.id,
      status: "draft" as const,
      visibility: "public" as const,
      capacity_available: restData.capacity_total || 0,
      ...(imagesData && { images: imagesData }),
    };

    console.log("[API] POST /api/activities - Creating activity:", activityData.title);

    const result = await totalumSdk.crud.createRecord("activity", activityData);

    // Create initial draft checklist
    await totalumSdk.crud.createRecord("activity_draft_checklist", {
      activity: result.data?._id,
      has_title: parsed.data.title ? "yes" : "no",
      has_cover: "no",
      has_description: parsed.data.description ? "yes" : "no",
      has_session: parsed.data.start_date_time ? "yes" : "no",
      has_capacity: parsed.data.capacity_total ? "yes" : "no",
      has_price: parsed.data.price_cents !== undefined ? "yes" : "no",
      has_location: parsed.data.modality !== "presencial" || parsed.data.location_name ? "yes" : "no",
      completion_percent: 0,
    });

    // Create initial stats record
    await totalumSdk.crud.createRecord("activity_stats", {
      activity: result.data?._id,
      views: 0,
      clicks_reserve: 0,
      bookings_count: 0,
      revenue_cents: 0,
      checkins_count: 0,
      last_updated_at: new Date().toISOString(),
    });

    console.log("[API] POST /api/activities - Created:", result.data?._id);

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err) {
    console.error("[API ERROR] POST /api/activities", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// PATCH - Update an activity
export async function PATCH(req: Request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    // Get ID from query params OR body
    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("activity_id") || searchParams.get("id");

    const body = (await req.json().catch(() => ({}))) as { id?: string; [key: string]: unknown };
    const { id: bodyId, ...updateData } = body;

    // Use query param id first, then body id
    const id = queryId || bodyId;

    if (!id) {
      console.log("[API] PATCH /api/activities - Missing ID. Query params:", Object.fromEntries(searchParams));
      return NextResponse.json({ ok: false, error: "ID de actividad requerido" }, { status: 400 });
    }

    console.log("[API] PATCH /api/activities - Updating activity:", id, "with data:", JSON.stringify(updateData));

    // Get current activity to verify ownership
    const current = await totalumSdk.crud.getRecordById<Activity>("activity", id);

    if (!current.data) {
      return NextResponse.json({ ok: false, error: "Actividad no encontrada" }, { status: 404 });
    }

    // Check ownership
    const organizerId = typeof current.data.organizer_user === "string"
      ? current.data.organizer_user
      : current.data.organizer_user._id;

    if (organizerId !== session.user.id) {
      return NextResponse.json(
        { ok: false, error: "No tienes permiso para editar esta actividad" },
        { status: 403 }
      );
    }

    // Handle status change to published
    if (updateData.status === "published" && current.data.status !== "published") {
      updateData.published_at = new Date().toISOString();

      // Generate slug if missing
      if (!current.data.slug) {
        updateData.slug = generateSlug(current.data.title);
      }
    }

    // Update capacity_available if capacity_total changes
    if (updateData.capacity_total && updateData.capacity_total !== current.data.capacity_total) {
      const newCapTotal = Number(updateData.capacity_total);
      const oldCapTotal = current.data.capacity_total || 0;
      const diff = newCapTotal - oldCapTotal;
      updateData.capacity_available = Math.max(0, (current.data.capacity_available || 0) + diff);
    }

    // Handle image updates - convert posterFileId to Totalum file format
    if (updateData.posterFileId && typeof updateData.posterFileId === "string") {
      // Merge with existing images or replace
      updateData.images = [{ name: updateData.posterFileId }];
      console.log("[API] PATCH /api/activities - Updating poster image:", updateData.posterFileId);
      delete updateData.posterFileId;
    }

    console.log("[API] PATCH /api/activities - Updating:", id);

    const result = await totalumSdk.crud.editRecordById("activity", id, updateData);

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err) {
    console.error("[API ERROR] PATCH /api/activities", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// DELETE - Cancel an activity (soft delete)
export async function DELETE(req: Request) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ ok: false, error: "ID de actividad requerido" }, { status: 400 });
    }

    // Get current activity to verify ownership
    const current = await totalumSdk.crud.getRecordById<Activity>("activity", id);

    if (!current.data) {
      return NextResponse.json({ ok: false, error: "Actividad no encontrada" }, { status: 404 });
    }

    // Check ownership
    const organizerId = typeof current.data.organizer_user === "string"
      ? current.data.organizer_user
      : current.data.organizer_user._id;

    if (organizerId !== session.user.id) {
      return NextResponse.json(
        { ok: false, error: "No tienes permiso para cancelar esta actividad" },
        { status: 403 }
      );
    }

    console.log("[API] DELETE /api/activities - Cancelling:", id);

    // Soft delete - mark as cancelled
    const result = await totalumSdk.crud.editRecordById("activity", id, {
      status: "cancelled",
    });

    return NextResponse.json({ ok: true, data: result.data });
  } catch (err) {
    console.error("[API ERROR] DELETE /api/activities", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

