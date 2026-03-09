import { NextResponse } from "next/server";
import { z } from "zod";
import { totalumSdk } from "@/lib/totalum";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import type { OrganizerProfile } from "@/types/database";

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

// Schema for profile update
const updateProfileSchema = z.object({
  brand_name: z.string().optional(),
  phone: z.string().optional(),
  bio: z.string().optional(),
  website: z.string().url().optional().or(z.literal("")),
  payout_info: z.string().optional(),
});

// GET - Get organizer profile
export async function GET(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;

    // Check if requesting own profile or another organizer's public profile
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("user_id");

    if (userId && userId !== session.user.id) {
      // Public profile view (limited info)
      const profileResult = await totalumSdk.crud.getRecords("organizer_profile", {
        filter: [{ user: userId }],
        pagination: { limit: 1, page: 0 },
      });

      if (!profileResult.data || profileResult.data.length === 0) {
        return NextResponse.json(
          { ok: false, error: "Perfil no encontrado" },
          { status: 404 }
        );
      }

      const profile = profileResult.data[0] as OrganizerProfile;

      // Return only public info
      return NextResponse.json({
        ok: true,
        data: {
          brand_name: profile.brand_name,
          bio: profile.bio,
          website: profile.website,
          logo: profile.logo,
          verified: profile.verified,
        }
      });
    }

    // Own profile (full info)
    if (userRole !== "organizador") {
      return NextResponse.json(
        { ok: false, error: "Solo los organizadores tienen perfil de organizador" },
        { status: 403 }
      );
    }

    const profileResult = await totalumSdk.crud.getRecords("organizer_profile", {
      filter: [{ user: session.user.id }],
      pagination: { limit: 1, page: 0 },
    });

    if (!profileResult.data || profileResult.data.length === 0) {
      // Create profile if it doesn't exist
      const newProfile = {
        user: session.user.id,
        verified: "no",
      };

      const createResult = await totalumSdk.crud.createRecord("organizer_profile", newProfile);

      console.log("[API] GET /api/organizer-profile - Created new profile for:", session.user.id);

      return NextResponse.json({
        ok: true,
        data: createResult.data,
      });
    }

    console.log("[API] GET /api/organizer-profile - Found profile for:", session.user.id);

    return NextResponse.json({
      ok: true,
      data: profileResult.data[0],
    });
  } catch (err) {
    console.error("[API ERROR] GET /api/organizer-profile", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}

// PATCH - Update organizer profile
export async function PATCH(req: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ ok: false, error: "No autorizado" }, { status: 401 });
    }

    const userRole = (session.user as { role?: string })?.role;
    if (userRole !== "organizador") {
      return NextResponse.json(
        { ok: false, error: "Solo los organizadores pueden actualizar su perfil" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = updateProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.flatten() },
        { status: 400 }
      );
    }

    // Get existing profile
    const profileResult = await totalumSdk.crud.getRecords("organizer_profile", {
      filter: [{ user: session.user.id }],
      pagination: { limit: 1, page: 0 },
    });

    if (!profileResult.data || profileResult.data.length === 0) {
      // Create profile if it doesn't exist
      const newProfile = {
        user: session.user.id,
        ...parsed.data,
        verified: "no",
      };

      const createResult = await totalumSdk.crud.createRecord("organizer_profile", newProfile);

      console.log("[API] PATCH /api/organizer-profile - Created new profile with data");

      return NextResponse.json({
        ok: true,
        data: createResult.data,
      });
    }

    const profile = profileResult.data[0] as OrganizerProfile;

    // Update profile
    await totalumSdk.crud.editRecordById("organizer_profile", profile._id, parsed.data);

    console.log("[API] PATCH /api/organizer-profile - Updated profile:", profile._id);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[API ERROR] PATCH /api/organizer-profile", err);
    return NextResponse.json({ ok: false, error: serializeError(err) }, { status: 500 });
  }
}
