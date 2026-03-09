import { NextResponse } from "next/server";
import { totalumSdk } from "@/lib/totalum";
import type { Activity, ActivitySession, ActivityStats } from "@/types/database";

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

// GET - Fetch single activity by slug with sessions
export async function GET(
  req: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { searchParams } = new URL(req.url);
    const trackView = searchParams.get("track_view") === "true";

    console.log("[API] GET /api/activities/[slug] - Fetching:", slug);

    // Fetch activity by slug
    const activityResult = await totalumSdk.crud.getRecords<Activity>("activity", {
      filter: [{ slug }],
      pagination: { limit: 1, page: 0 },
    });

    if (!activityResult.data || activityResult.data.length === 0) {
      return NextResponse.json({ ok: false, error: "Actividad no encontrada" }, { status: 404 });
    }

    const activity = activityResult.data[0];

    // Fetch sessions for this activity
    const sessionsResult = await totalumSdk.crud.getRecords<ActivitySession>("activity_session", {
      filter: [
        { activity: activity._id },
        { status: "active" },
      ],
      sort: { start_date_time: 1 },
      pagination: { limit: 100, page: 0 },
    });

    // Track view if requested (increment stats)
    if (trackView) {
      try {
        // Get stats record
        const statsResult = await totalumSdk.crud.getRecords<ActivityStats>("activity_stats", {
          filter: [{ activity: activity._id }],
          pagination: { limit: 1, page: 0 },
        });

        if (statsResult.data && statsResult.data.length > 0) {
          const stats = statsResult.data[0];
          await totalumSdk.crud.editRecordById("activity_stats", stats._id, {
            views: (stats.views || 0) + 1,
            last_updated_at: new Date().toISOString(),
          });
          console.log("[API] Activity view tracked:", activity._id);
        }
      } catch (e) {
        console.error("[API] Failed to track view:", e);
        // Don't fail the request if tracking fails
      }
    }

    console.log("[API] GET /api/activities/[slug] - Found activity with", sessionsResult.data?.length || 0, "sessions");

    return NextResponse.json({
      ok: true,
      data: {
        activity,
        sessions: sessionsResult.data || [],
      },
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/activities/[slug]", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}
