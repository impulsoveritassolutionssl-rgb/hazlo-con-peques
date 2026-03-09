import { NextResponse } from "next/server";
import { totalumSdk } from "@/lib/totalum";

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

// GET - Fetch kid modules with optional category filter
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category_id");
    const isActive = searchParams.get("is_active");
    const limit = parseInt(searchParams.get("limit") || "50");
    const page = parseInt(searchParams.get("page") || "0");

    // Build filter
    const filter: Record<string, unknown>[] = [];

    if (categoryId) {
      filter.push({ category: categoryId });
    }
    if (isActive) {
      filter.push({ is_active: isActive });
    }

    console.log("[API] GET /api/modules - Filter:", JSON.stringify(filter));

    const result = await totalumSdk.crud.getRecords("kid_module", {
      filter: filter.length > 0 ? filter : undefined,
      pagination: { limit, page },
      sort: { order: 1 },
    });

    console.log("[API] GET /api/modules - Result count:", result.data?.length || 0);

    return NextResponse.json({
      ok: true,
      data: result.data || [],
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/modules", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}
