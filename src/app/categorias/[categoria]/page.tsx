import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  SEO_CONFIG,
  SEO_CITIES,
  SEO_CATEGORIES,
  getCategoryBySlug,
  generateTitle,
  generateDescription,
} from "@/lib/seo/config";
import {
  generateBreadcrumbSchema,
  generateFAQSchema,
  combineSchemas,
} from "@/lib/seo/schema";
import { CategoryPageClient } from "./CategoryPageClient";

interface Props {
  params: Promise<{ categoria: string }>;
}

// Generate static paths for all categories
export async function generateStaticParams() {
  return SEO_CATEGORIES.map((cat) => ({
    categoria: cat.slug,
  }));
}

// Generate metadata
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const category = getCategoryBySlug(categoria);

  if (!category) {
    return {
      title: "Categoría no encontrada",
      description: "La categoría que buscas no está disponible.",
    };
  }

  const title = generateTitle("category", { category: categoria });
  const description = generateDescription("category", { category: categoria });
  const canonicalUrl = `${SEO_CONFIG.siteUrl}/categorias/${categoria}`;

  return {
    title,
    description,
    keywords: [
      ...category.keywords,
      `talleres de ${category.shortName.toLowerCase()} para niños`,
      `actividades de ${category.shortName.toLowerCase()} infantiles`,
      `${category.shortName.toLowerCase()} para peques`,
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
          alt: category.name,
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

export default async function CategoryPage({ params }: Props) {
  const { categoria } = await params;
  const category = getCategoryBySlug(categoria);

  if (!category) {
    notFound();
  }

  // Generate structured data
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Inicio", url: "/" },
    { name: "Categorías", url: "/categorias" },
    { name: category.name, url: `/categorias/${categoria}` },
  ]);

  const faqSchema = generateFAQSchema(category.faqs);

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

      <CategoryPageClient
        category={category}
        cities={SEO_CITIES}
        allCategories={SEO_CATEGORIES}
      />
    </>
  );
}
