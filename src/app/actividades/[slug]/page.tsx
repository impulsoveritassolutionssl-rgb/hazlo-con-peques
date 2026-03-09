import { Metadata } from "next";
import { notFound } from "next/navigation";
import { totalumSdk } from "@/lib/totalum";
import { SEO_CONFIG } from "@/lib/seo/config";
import {
  generateEventSchema,
  generateBreadcrumbSchema,
  combineSchemas,
} from "@/lib/seo/schema";
import { ActivityDetailClient } from "./ActivityDetailClient";

interface Props {
  params: Promise<{ slug: string }>;
}

interface ActivityData {
  _id: string;
  title: string;
  short_description?: string;
  description?: string;
  category?: string;
  modality?: string;
  price_cents?: number;
  start_date_time?: string;
  end_date_time?: string;
  location_name?: string;
  location_address?: string;
  city?: string;
  postal_code?: string;
  lat?: number;
  lng?: number;
  images?: Array<string | { url: string; name?: string }>;
  status?: string;
  visibility?: string;
  slug?: string;
  organizer?: string;
  organizer_name?: string;
}

interface UserData {
  _id: string;
  name?: string;
  business_name?: string;
}

// Fetch activity data
async function getActivity(slug: string): Promise<ActivityData | null> {
  try {
    const response = await totalumSdk.crud.getRecords<ActivityData>("activity", {
      filter: [{ slug }],
      pagination: { limit: 1, page: 1 },
    });

    if (response?.data && response.data.length > 0) {
      const activity = response.data[0];

      // Fetch organizer name if needed
      let organizerName = "";
      if (activity.organizer) {
        try {
          const orgResponse = await totalumSdk.crud.getRecords<UserData>("user", {
            filter: [{ _id: activity.organizer }],
            pagination: { limit: 1, page: 1 },
          });
          if (orgResponse?.data && orgResponse.data.length > 0) {
            organizerName = orgResponse.data[0].business_name || orgResponse.data[0].name || "";
          }
        } catch (e) {
          console.error("[ActivityPage] Error fetching organizer:", e);
        }
      }

      return { ...activity, organizer_name: organizerName };
    }
    return null;
  } catch (error) {
    console.error("[ActivityPage] Error fetching activity:", error);
    return null;
  }
}

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const activity = await getActivity(slug);

  if (!activity) {
    return {
      title: "Actividad no encontrada",
      description: "La actividad que buscas no está disponible.",
    };
  }

  const title = `${activity.title} | ${SEO_CONFIG.siteName}`;
  const description = activity.short_description || activity.description?.slice(0, 160) || SEO_CONFIG.defaultDescription;
  const canonicalUrl = `${SEO_CONFIG.siteUrl}/actividades/${slug}`;

  // Get image URL
  let imageUrl = SEO_CONFIG.defaultOgImage;
  if (activity.images && Array.isArray(activity.images) && activity.images.length > 0) {
    const firstImage = activity.images[0];
    if (typeof firstImage === "string") {
      imageUrl = firstImage.startsWith("http") ? firstImage : `${SEO_CONFIG.siteUrl}${firstImage}`;
    } else if (firstImage?.url) {
      imageUrl = firstImage.url.startsWith("http") ? firstImage.url : `${SEO_CONFIG.siteUrl}${firstImage.url}`;
    }
  }

  return {
    title,
    description,
    keywords: [
      activity.category ? `${activity.category} para niños` : "actividades para niños",
      activity.city ? `actividades niños ${activity.city}` : "actividades infantiles",
      "talleres para niños",
      "eventos infantiles",
    ],
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: SEO_CONFIG.siteName,
      locale: SEO_CONFIG.locale,
      type: "article",
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: activity.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ActivityPage({ params }: Props) {
  const { slug } = await params;
  const activity = await getActivity(slug);

  if (!activity || activity.status !== "published" || activity.visibility !== "public") {
    notFound();
  }

  // Generate Event schema
  let imageUrl = "";
  if (activity.images && Array.isArray(activity.images) && activity.images.length > 0) {
    const firstImage = activity.images[0];
    if (typeof firstImage === "string") {
      imageUrl = firstImage;
    } else if (firstImage?.url) {
      imageUrl = firstImage.url;
    }
  }

  const eventSchema = generateEventSchema({
    name: activity.title,
    description: activity.short_description || activity.description,
    startDate: activity.start_date_time,
    endDate: activity.end_date_time,
    location: activity.modality === "online" ? undefined : {
      name: activity.location_name,
      address: activity.location_address,
      city: activity.city,
      postalCode: activity.postal_code,
      lat: activity.lat,
      lng: activity.lng,
    },
    isOnline: activity.modality === "online",
    price: activity.price_cents,
    currency: "EUR",
    organizerName: activity.organizer_name,
    image: imageUrl,
    url: `${SEO_CONFIG.siteUrl}/actividades/${slug}`,
    availability: "InStock",
  });

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Inicio", url: "/" },
    { name: "Actividades", url: "/actividades" },
    ...(activity.category ? [{ name: activity.category.charAt(0).toUpperCase() + activity.category.slice(1), url: `/categorias/${activity.category}` }] : []),
    { name: activity.title, url: `/actividades/${slug}` },
  ]);

  const combinedSchema = combineSchemas(eventSchema, breadcrumbSchema);

  return (
    <>
      {/* Structured Data */}
      {combinedSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(combinedSchema),
          }}
        />
      )}

      <ActivityDetailClient slug={slug} />
    </>
  );
}
