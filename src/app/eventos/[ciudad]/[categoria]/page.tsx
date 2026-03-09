import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SEO_CONFIG,
  SEO_CITIES,
  SEO_CATEGORIES,
  getCityBySlug,
  getCategoryBySlug,
  generateTitle,
  generateDescription,
} from "@/lib/seo/config";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  combineSchemas,
} from "@/lib/seo/schema";
import { CityCategoryPageClient } from "./CityCategoryPageClient";

interface Props {
  params: Promise<{ ciudad: string; categoria: string }>;
}

// Generate static paths for all city+category combinations
export async function generateStaticParams() {
  const params: { ciudad: string; categoria: string }[] = [];
  for (const city of SEO_CITIES) {
    for (const cat of SEO_CATEGORIES) {
      params.push({
        ciudad: city.slug,
        categoria: cat.slug,
      });
    }
  }
  return params;
}

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ciudad, categoria } = await params;
  const city = getCityBySlug(ciudad);
  const category = getCategoryBySlug(categoria);

  if (!city || !category) {
    return {
      title: "Página no encontrada",
      description: "La página que buscas no está disponible.",
    };
  }

  const title = generateTitle("cityCategory", { city: ciudad, category: categoria });
  const description = generateDescription("cityCategory", { city: ciudad, category: categoria });
  const canonicalUrl = `${SEO_CONFIG.siteUrl}/eventos/${ciudad}/${categoria}`;

  return {
    title,
    description,
    keywords: [
      `${category.shortName.toLowerCase()} para niños en ${city.name}`,
      `talleres de ${category.shortName.toLowerCase()} ${city.name}`,
      `actividades de ${category.shortName.toLowerCase()} infantiles ${city.name}`,
      ...category.keywords.map((k) => `${k} ${city.name}`),
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
          alt: `${category.name} en ${city.name}`,
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

export default async function CityCategoryPage({ params }: Props) {
  const { ciudad, categoria } = await params;
  const city = getCityBySlug(ciudad);
  const category = getCategoryBySlug(categoria);

  if (!city || !category) {
    notFound();
  }

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Inicio", url: "/" },
    { name: "Eventos", url: "/eventos" },
    { name: city.name, url: `/eventos/${ciudad}` },
    { name: category.shortName, url: `/eventos/${ciudad}/${categoria}` },
  ]);

  // Use category FAQs customized for the city
  const localizedFaqs = category.faqs.map((faq) => ({
    question: faq.question.replace("los niños", `los niños en ${city.name}`),
    answer: faq.answer,
  }));

  const faqSchema = generateFAQSchema(localizedFaqs);

  const combinedSchema = combineSchemas(breadcrumbSchema, faqSchema);

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

      <CityCategoryPageClient
        city={city}
        category={category}
        allCategories={SEO_CATEGORIES}
        faqs={localizedFaqs}
      />
    </>
  );
}
