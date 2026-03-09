import { NextResponse } from "next/server";
import { z } from "zod";
import { totalumSdk } from "@/lib/totalum";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

// Schema for creating a child account
const createChildSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  avatar: z.string().optional(),
  pin_code: z.string().length(4, "El PIN debe tener 4 dígitos"),
});

// GET - Fetch children linked to the parent
export async function GET() {
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
        { ok: false, error: "Solo los padres pueden ver sus hijos" },
        { status: 403 }
      );
    }

    console.log("[API] GET /api/kids - Fetching children for parent:", session.user.id);

    // Get parent-child links
    const linksResult = await totalumSdk.crud.getRecords("parent_child_link", {
      filter: [{ parent_user: session.user.id }],
      pagination: { limit: 50, page: 0 },
    });

    console.log("[API] GET /api/kids - Links found:", linksResult.data?.length || 0);

    // If there are links, fetch the child user data
    const children = [];
    if (linksResult.data && linksResult.data.length > 0) {
      for (const link of linksResult.data) {
        const childId = typeof link.child_user === "string" ? link.child_user : (link.child_user as { _id: string })?._id;
        if (childId) {
          const childResult = await totalumSdk.crud.getRecordById("user", childId);
          if (childResult.data) {
            children.push({
              ...childResult.data,
              pin_code: link.pin_code,
            });
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      data: children,
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/kids", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// POST - Create a child account linked to the parent
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
        { ok: false, error: "Solo los padres pueden crear cuentas de hijos" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = createChildSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Create a peque user
    const childData = {
      name: parsed.data.name,
      email: `peque_${Date.now()}@peques.local`, // Generate a placeholder email
      role: "peque",
      status: "active",
      avatar: parsed.data.avatar || "👦",
    };

    console.log("[API] POST /api/kids - Creating child user:", childData);

    const childResult = await totalumSdk.crud.createRecord("user", childData);

    if (!childResult.data?._id) {
      throw new Error("Failed to create child user");
    }

    console.log("[API] POST /api/kids - Child created:", childResult.data._id);

    // Create parent-child link
    const linkData = {
      parent_user: session.user.id,
      child_user: childResult.data._id,
      pin_code: parsed.data.pin_code,
    };

    console.log("[API] POST /api/kids - Creating parent-child link:", linkData);

    await totalumSdk.crud.createRecord("parent_child_link", linkData);

    return NextResponse.json({
      ok: true,
      data: {
        ...childResult.data,
        pin_code: parsed.data.pin_code,
      },
    });
  } catch (err) {
    console.error("[API ERROR] POST /api/kids", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

