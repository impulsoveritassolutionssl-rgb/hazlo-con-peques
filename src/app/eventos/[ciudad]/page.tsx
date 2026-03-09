import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SEO_CONFIG,
  SEO_CITIES,
  SEO_CATEGORIES,
  getCityBySlug,
  generateTitle,
  generateDescription,
} from "@/lib/seo/config";
import {
  generateBreadcrumbSchema,
  generateLocalBusinessSchema,
  generateFAQSchema,
  combineSchemas,
} from "@/lib/seo/schema";
import { CityPageClient } from "./CityPageClient";

interface Props {
  params: Promise<{ ciudad: string }>;
}

// Generate static paths for all cities
export async function generateStaticParams() {
  return SEO_CITIES.map((city) => ({
    ciudad: city.slug,
  }));
}

// Generate metadata for the city page
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ciudad } = await params;
  const city = getCityBySlug(ciudad);

  if (!city) {
    return {
      title: "Ciudad no encontrada",
      description: "La ciudad que buscas no está disponible.",
    };
  }

  const title = generateTitle("city", { city: ciudad });
  const description = generateDescription("city", { city: ciudad });
  const canonicalUrl = `${SEO_CONFIG.siteUrl}/eventos/${ciudad}`;

  return {
    title,
    description,
    keywords: [
      `eventos con niños en ${city.name}`,
      `actividades para niños en ${city.name}`,
      `planes con niños en ${city.name}`,
      `talleres infantiles ${city.name}`,
      `que hacer con niños en ${city.name}`,
      ...city.neighborhoods.map((n) => `actividades niños ${n}`),
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
      type: "website",
      images: [
        {
          url: SEO_CONFIG.defaultOgImage,
          width: SEO_CONFIG.ogImageWidth,
          height: SEO_CONFIG.ogImageHeight,
          alt: `Actividades para niños en ${city.name}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [SEO_CONFIG.defaultOgImage],
    },
  };
}

export default async function CityPage({ params }: Props) {
  const { ciudad } = await params;
  const city = getCityBySlug(ciudad);

  if (!city) {
    notFound();
  }

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Inicio", url: "/" },
    { name: "Eventos", url: "/eventos" },
    { name: city.name, url: `/eventos/${ciudad}` },
  ]);

  const localBusinessSchema = generateLocalBusinessSchema(ciudad);

  // Generate city-specific FAQs
  const cityFaqs = [
    {
      question: `¿Qué tipos de actividades hay para niños en ${city.name}?`,
      answer: `En ${city.name} encontrarás todo tipo de actividades para niños: talleres de ciencia, arte y manualidades, cuentacuentos, música, actividades en la naturaleza, cocina para niños y mucho más. Todas las actividades están adaptadas a diferentes edades, desde bebés hasta preadolescentes.`,
    },
    {
      question: `¿Las actividades en ${city.name} son presenciales u online?`,
      answer: `La mayoría de las actividades en ${city.name} son presenciales, permitiendo a los niños interactuar directamente con los monitores y otros peques. También ofrecemos algunas opciones online para mayor flexibilidad. Puedes filtrar por tipo de actividad en nuestra búsqueda.`,
    },
    {
      question: `¿Cómo encuentro actividades cerca de mi zona en ${city.name}?`,
      answer: `Usa nuestro buscador introduciendo tu ubicación o código postal. Podrás ver en el mapa todas las actividades disponibles en ${city.name} y filtrar por distancia, categoría, edad y fechas. Las zonas más populares incluyen ${city.neighborhoods.slice(0, 3).join(", ")} y más.`,
    },
    {
      question: `¿Cuánto cuestan las actividades para niños en ${city.name}?`,
      answer: `Los precios varían según el tipo de actividad y duración. Encontrarás desde actividades gratuitas hasta talleres especializados. Cada actividad muestra claramente su precio y lo que incluye. Muchos organizadores ofrecen descuentos para hermanos o bonos mensuales.`,
    },
  ];

  const faqSchema = generateFAQSchema(cityFaqs);

  const combinedSchema = combineSchemas(
    breadcrumbSchema,
    localBusinessSchema,
    faqSchema
  );

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

      <CityPageClient
        city={city}
        categories={SEO_CATEGORIES}
        faqs={cityFaqs}
      />
    </>
  );
}
