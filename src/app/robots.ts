import { MetadataRoute } from "next";
import { SEO_CONFIG } from "@/lib/seo/config";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = SEO_CONFIG.siteUrl;

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dashboard/",
          "/profile/",
          "/stripe/",
          "/verificar-email/",
          "/reset/",
          "/recuperar/",
          "/_next/",
          "/admin/",
        ],
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: ["/api/", "/dashboard/", "/profile/", "/stripe/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
