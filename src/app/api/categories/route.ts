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

// GET - Fetch all kid categories
export async function GET() {
  try {
    console.log("[API] GET /api/categories - Fetching categories");

    const result = await totalumSdk.crud.getRecords("kid_category", {
      sort: { order: 1 },
      pagination: { limit: 100, page: 0 },
    });

    console.log("[API] GET /api/categories - Result count:", result.data?.length || 0);

    return NextResponse.json({
      ok: true,
      data: result.data || [],
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/categories", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

