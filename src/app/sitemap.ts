import { MetadataRoute } from "next";
import { SEO_CONFIG, SEO_CITIES, SEO_CATEGORIES } from "@/lib/seo/config";
import { totalumSdk } from "@/lib/totalum";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SEO_CONFIG.siteUrl;
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/eventos`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/actividades`,
      lastModified: now,
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/registro`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
  ];

  // City pages
  const cityPages: MetadataRoute.Sitemap = SEO_CITIES.map((city) => ({
    url: `${baseUrl}/eventos/${city.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // Category pages
  const categoryPages: MetadataRoute.Sitemap = SEO_CATEGORIES.map((cat) => ({
    url: `${baseUrl}/categorias/${cat.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.8,
  }));

  // City + Category combination pages (high value for SEO)
  const cityCategoryPages: MetadataRoute.Sitemap = [];
  for (const city of SEO_CITIES) {
    for (const cat of SEO_CATEGORIES) {
      cityCategoryPages.push({
        url: `${baseUrl}/eventos/${city.slug}/${cat.slug}`,
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.7,
      });
    }
  }

  // Dynamic activity/event pages
  let activityPages: MetadataRoute.Sitemap = [];
  try {
    const response = await totalumSdk.crud.getRecords<{ slug?: string; updatedAt?: string }>("activity", {
      filter: [{ status: "published" }, { visibility: "public" }],
      pagination: { limit: 1000, page: 1 },
    });

    if (response?.data) {
      activityPages = response.data.map((activity) => ({
        url: `${baseUrl}/actividades/${activity.slug || ""}`,
        lastModified: activity.updatedAt ? new Date(activity.updatedAt) : now,
        changeFrequency: "weekly" as const,
        priority: 0.6,
      }));
    }
  } catch (error) {
    console.error("[Sitemap] Error fetching activities:", error);
  }

  return [
    ...staticPages,
    ...cityPages,
    ...categoryPages,
    ...cityCategoryPages,
    ...activityPages,
  ];
}
