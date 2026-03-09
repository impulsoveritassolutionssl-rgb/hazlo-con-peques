import { Metadata } from "next";
import { SEO_CONFIG } from "@/lib/seo/config";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";

export const metadata: Metadata = {
  title: `Eventos y Actividades para Niños Cerca de Ti | ${SEO_CONFIG.siteName}`,
  description: "Encuentra eventos, talleres y actividades para niños cerca de tu ubicación. Ciencia, arte, música, naturaleza y más experiencias educativas para peques de 2 a 10 años.",
  keywords: [
    "eventos con niños",
    "actividades para niños cerca de mí",
    "planes con niños",
    "talleres infantiles",
    "eventos infantiles",
    "que hacer con niños hoy",
    "actividades niños fin de semana",
    "eventos familiares",
  ],
  alternates: {
    canonical: `${SEO_CONFIG.siteUrl}/eventos`,
  },
  openGraph: {
    title: `Eventos y Actividades para Niños | ${SEO_CONFIG.siteName}`,
    description: "Encuentra eventos, talleres y actividades para niños cerca de tu ubicación. Ciencia, arte, música, naturaleza y más.",
    url: `${SEO_CONFIG.siteUrl}/eventos`,
    siteName: SEO_CONFIG.siteName,
    locale: SEO_CONFIG.locale,
    type: "website",
    images: [
      {
        url: SEO_CONFIG.defaultOgImage,
        width: SEO_CONFIG.ogImageWidth,
        height: SEO_CONFIG.ogImageHeight,
        alt: "Eventos para niños",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `Eventos y Actividades para Niños | ${SEO_CONFIG.siteName}`,
    description: "Encuentra eventos, talleres y actividades para niños cerca de tu ubicación.",
    images: [SEO_CONFIG.defaultOgImage],
  },
};

export default function EventosLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Inicio", url: "/" },
    { name: "Eventos", url: "/eventos" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />
      {children}
    </>
  );
}
