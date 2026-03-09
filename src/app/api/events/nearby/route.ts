import { NextRequest, NextResponse } from "next/server";
import { totalumSdk } from "@/lib/totalum";

// Haversine formula to calculate distance between two coordinates in km
function haversineDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Calculate bounding box for initial filtering
function getBoundingBox(
  lat: number,
  lng: number,
  radiusKm: number
): { minLat: number; maxLat: number; minLng: number; maxLng: number } {
  const latDelta = radiusKm / 111; // ~111 km per degree latitude
  const lngDelta = radiusKm / (111 * Math.cos(toRad(lat)));

  return {
    minLat: lat - latDelta,
    maxLat: lat + latDelta,
    minLng: lng - lngDelta,
    maxLng: lng + lngDelta,
  };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extract query parameters
    const lat = parseFloat(searchParams.get("lat") || "0");
    const lng = parseFloat(searchParams.get("lng") || "0");
    const radiusKm = parseFloat(searchParams.get("radiusKm") || "50");
    const dateFrom = searchParams.get("dateFrom");
    const dateTo = searchParams.get("dateTo");
    const category = searchParams.get("category");
    const ageMin = searchParams.get("ageMin");
    const ageMax = searchParams.get("ageMax");

    console.log("[API/events/nearby] Query params:", {
      lat,
      lng,
      radiusKm,
      dateFrom,
      dateTo,
      category,
      ageMin,
      ageMax,
    });

    // Validate coordinates
    if (!lat || !lng || isNaN(lat) || isNaN(lng)) {
      return NextResponse.json(
        { ok: false, error: "Valid lat and lng coordinates are required" },
        { status: 400 }
      );
    }

    // Build filter for activities with coordinates and published status
    const filter: Record<string, unknown>[] = [
      { status: "published" },
      { lat: { ne: null } },
      { lng: { ne: null } },
    ];

    // Apply bounding box filter for initial optimization
    const bbox = getBoundingBox(lat, lng, radiusKm);
    filter.push({ lat: { gte: bbox.minLat, lte: bbox.maxLat } });
    filter.push({ lng: { gte: bbox.minLng, lte: bbox.maxLng } });

    // Date filters
    if (dateFrom) {
      filter.push({ start_date_time: { gte: new Date(dateFrom) } });
    }
    if (dateTo) {
      filter.push({ start_date_time: { lte: new Date(dateTo) } });
    }

    // Category filter
    if (category) {
      filter.push({ category: category });
    }

    // Age range filter - find activities that overlap with requested age range
    if (ageMin) {
      filter.push({ age_max: { gte: parseInt(ageMin) } });
    }
    if (ageMax) {
      filter.push({ age_min: { lte: parseInt(ageMax) } });
    }

    console.log("[API/events/nearby] Filter:", JSON.stringify(filter));

    // Fetch activities from database
    const response = await totalumSdk.crud.getRecords("activity", {
      filter: filter.length > 0 ? filter : undefined,
      pagination: { limit: 100, page: 1 },
    });

    const activities = response?.data || [];
    console.log("[API/events/nearby] Found activities:", activities.length);

    // Calculate exact distance and filter by radius using Haversine
    const eventsWithDistance = activities
      .map((activity: Record<string, unknown>) => {
        const actLat = activity.lat as number;
        const actLng = activity.lng as number;

        if (!actLat || !actLng) return null;

        const distanceKm = haversineDistance(lat, lng, actLat, actLng);

        // Only include events within the actual radius
        if (distanceKm > radiusKm) return null;

        return {
          _id: activity._id,
          title: activity.title,
          description: activity.description,
          short_description: activity.short_description,
          category: activity.category,
          start_date_time: activity.start_date_time,
          end_date_time: activity.end_date_time,
          location_name: activity.location_name,
          location_address: activity.location_address,
          city: activity.city,
          postal_code: activity.postal_code,
          country: activity.country,
          lat: actLat,
          lng: actLng,
          age_min: activity.age_min,
          age_max: activity.age_max,
          price_cents: activity.price_cents,
          capacity_available: activity.capacity_available,
          images: activity.images,
          slug: activity.slug,
          distanceKm: Math.round(distanceKm * 10) / 10, // Round to 1 decimal
        };
      })
      .filter(Boolean)
      .sort(
        (a: { distanceKm: number } | null, b: { distanceKm: number } | null) =>
          (a?.distanceKm || 0) - (b?.distanceKm || 0)
      );

    console.log(
      "[API/events/nearby] Events within radius:",
      eventsWithDistance.length
    );

    return NextResponse.json({
      ok: true,
      data: eventsWithDistance,
      meta: {
        total: eventsWithDistance.length,
        centerLat: lat,
        centerLng: lng,
        radiusKm,
      },
    });
  } catch (error) {
    console.error("[API/events/nearby] Error:", error);
    return NextResponse.json(
      { ok: false, error: "Failed to fetch nearby events" },
      { status: 500 }
    );
  }
}
