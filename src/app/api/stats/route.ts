import { NextResponse } from "next/server";
import { totalumSdk } from "@/lib/totalum";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { Activity, ActivityStats } from "@/types/database";

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

// GET - Get stats for activities (organizer only)
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== "organizador") {
      return NextResponse.json(
        { ok: false, error: "Solo los organizadores pueden ver estadísticas" },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const activityId = searchParams.get("activity_id");

    // If specific activity requested
    if (activityId) {
      // Verify ownership
      const activityResult = await totalumSdk.crud.getRecordById("activity", activityId);
      const activity = activityResult.data as Activity | undefined;

      if (!activity) {
        return NextResponse.json(
          { ok: false, error: "Actividad no encontrada" },
          { status: 404 }
        );
      }

      if (activity.organizer_user !== session.user.id) {
        return NextResponse.json(
          { ok: false, error: "No tienes permiso para ver estas estadísticas" },
          { status: 403 }
        );
      }

      const statsResult = await totalumSdk.crud.getRecords("activity_stats", {
        filter: [{ activity: activityId }],
        pagination: { limit: 1, page: 0 },
      });

      if (!statsResult.data || statsResult.data.length === 0) {
        // Return default stats if none exist
        return NextResponse.json({
          ok: true,
          data: {
            views: 0,
            clicks_reserve: 0,
            bookings_count: 0,
            revenue_cents: 0,
            checkins_count: 0,
          }
        });
      }

      const stats = statsResult.data[0] as ActivityStats;

      console.log("[API] GET /api/stats - Activity stats:", activityId);

      return NextResponse.json({
        ok: true,
        data: {
          views: stats.views || 0,
          clicks_reserve: stats.clicks_reserve || 0,
          bookings_count: stats.bookings_count || 0,
          revenue_cents: stats.revenue_cents || 0,
          checkins_count: stats.checkins_count || 0,
          last_updated_at: stats.last_updated_at,
        }
      });
    }

    // Get all activities for this organizer and aggregate stats
    const activitiesResult = await totalumSdk.crud.getRecords("activity", {
      filter: [{ organizer_user: session.user.id }],
    });

    if (!activitiesResult.data || activitiesResult.data.length === 0) {
      return NextResponse.json({
        ok: true,
        data: {
          total: {
            views: 0,
            clicks_reserve: 0,
            bookings_count: 0,
            revenue_cents: 0,
            checkins_count: 0,
            activities_count: 0,
          },
          by_activity: [],
        }
      });
    }

    // Get stats for all activities (fetch individually to avoid $in operator)
    const statsMap = new Map<string, ActivityStats>();
    for (const a of activitiesResult.data) {
      const activity = a as Activity;
      const statsResult = await totalumSdk.crud.getRecords("activity_stats", {
        filter: [{ activity: activity._id }],
        pagination: { limit: 1, page: 0 },
      });
      if (statsResult.data && statsResult.data.length > 0) {
        statsMap.set(activity._id, statsResult.data[0] as ActivityStats);
      }
    }

    // Build response with aggregated totals
    let totalViews = 0;
    let totalClicksReserve = 0;
    let totalBookings = 0;
    let totalRevenue = 0;
    let totalCheckins = 0;

    const byActivity = activitiesResult.data.map((a) => {
      const activity = a as Activity;
      const stats = statsMap.get(activity._id);

      const views = stats?.views || 0;
      const clicks = stats?.clicks_reserve || 0;
      const bookings = stats?.bookings_count || 0;
      const revenue = stats?.revenue_cents || 0;
      const checkins = stats?.checkins_count || 0;

      totalViews += views;
      totalClicksReserve += clicks;
      totalBookings += bookings;
      totalRevenue += revenue;
      totalCheckins += checkins;

      return {
        activity_id: activity._id,
        activity_title: activity.title,
        activity_status: activity.status,
        views,
        clicks_reserve: clicks,
        bookings_count: bookings,
        revenue_cents: revenue,
        checkins_count: checkins,
        conversion_rate: views > 0 ? ((bookings / views) * 100).toFixed(1) : "0.0",
      };
    });

    console.log("[API] GET /api/stats - Aggregated stats for organizer:", session.user.id);

    return NextResponse.json({
      ok: true,
      data: {
        total: {
          views: totalViews,
          clicks_reserve: totalClicksReserve,
          bookings_count: totalBookings,
          revenue_cents: totalRevenue,
          checkins_count: totalCheckins,
          activities_count: activitiesResult.data.length,
          conversion_rate: totalViews > 0 ? ((totalBookings / totalViews) * 100).toFixed(1) : "0.0",
        },
        by_activity: byActivity,
      }
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/stats", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// POST - Track an event (views, clicks)
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { activity_id, event_type } = body as { activity_id?: string; event_type?: string };

    if (!activity_id || !event_type) {
      return NextResponse.json(
        { ok: false, error: "activity_id y event_type son requeridos" },
        { status: 400 }
      );
    }

    if (!["view", "click_reserve"].includes(event_type)) {
      return NextResponse.json(
        { ok: false, error: "event_type debe ser 'view' o 'click_reserve'" },
        { status: 400 }
      );
    }

    // Get or create stats record
    const statsResult = await totalumSdk.crud.getRecords("activity_stats", {
      filter: [{ activity: activity_id }],
      pagination: { limit: 1, page: 0 },
    });

    if (!statsResult.data || statsResult.data.length === 0) {
      // Create stats record if it doesn't exist
      const newStats = {
        activity: activity_id,
        views: event_type === "view" ? 1 : 0,
        clicks_reserve: event_type === "click_reserve" ? 1 : 0,
        bookings_count: 0,
        revenue_cents: 0,
        checkins_count: 0,
        last_updated_at: new Date().toISOString(),
      };

      await totalumSdk.crud.createRecord("activity_stats", newStats);
    } else {
      // Update existing stats
      const stats = statsResult.data[0] as ActivityStats;
      const updateData: Record<string, unknown> = {
        last_updated_at: new Date().toISOString(),
      };

      if (event_type === "view") {
        updateData.views = (stats.views || 0) + 1;
      } else if (event_type === "click_reserve") {
        updateData.clicks_reserve = (stats.clicks_reserve || 0) + 1;
      }

      await totalumSdk.crud.editRecordById("activity_stats", stats._id, updateData);
    }

    console.log("[API] POST /api/stats - Tracked event:", event_type, "for activity:", activity_id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API ERROR] POST /api/stats", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}
