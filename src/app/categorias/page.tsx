import { Metadata } from "next";
import Link from "next/link";
import { SEO_CONFIG, SEO_CATEGORIES, SEO_CITIES } from "@/lib/seo/config";
import { generateBreadcrumbSchema } from "@/lib/seo/schema";
import { Breadcrumbs } from "@/components/seo/Breadcrumbs";

export const metadata: Metadata = {
  title: `Categorías de Actividades para Niños | ${SEO_CONFIG.siteName}`,
  description: "Explora todas las categorías de actividades para niños: ciencia, arte, música, naturaleza, cuentacuentos, cocina, deportes y más. Encuentra el taller perfecto para tus peques.",
  keywords: [
    "categorías actividades niños",
    "tipos de talleres infantiles",
    "ciencia para niños",
    "arte para niños",
    "música para niños",
    "naturaleza para niños",
    "cuentacuentos",
    "cocina para niños",
  ],
  alternates: {
    canonical: `${SEO_CONFIG.siteUrl}/categorias`,
  },
  openGraph: {
    title: `Categorías de Actividades para Niños | ${SEO_CONFIG.siteName}`,
    description: "Explora todas las categorías de actividades para niños: ciencia, arte, música, naturaleza, cuentacuentos, cocina, deportes y más.",
    url: `${SEO_CONFIG.siteUrl}/categorias`,
    siteName: SEO_CONFIG.siteName,
    locale: SEO_CONFIG.locale,
    type: "website",
  },
};

export default function CategoriasPage() {
  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Inicio", url: "/" },
    { name: "Categorías", url: "/categorias" },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="flex-1">
        <main>
          {/* Hero section */}
          <section className="rainbow-hero py-12 md:py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
              <Breadcrumbs
                items={[{ label: "Categorías" }]}
                className="mb-6"
              />

              <div className="text-center mb-12">
                <div className="inline-flex items-center gap-2 rainbow-pill-soft px-4 py-2 rounded-full mb-4">
                  <span className="text-lg">🎯</span>
                  <span className="text-sm font-medium">Encuentra tu actividad</span>
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
                  Categorías de{" "}
                  <span className="rainbow-text-animated">actividades</span>
                </h1>

                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Descubre todos los tipos de actividades disponibles para tus peques.
                  Desde ciencia hasta arte, hay algo perfecto para cada niño.
                </p>
              </div>

              {/* Categories grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {SEO_CATEGORIES.map((category, index) => (
                  <Link
                    key={category.slug}
                    href={`/categorias/${category.slug}`}
                    className="group relative bg-card rounded-2xl border p-6 hover:border-primary hover:shadow-xl transition-all duration-300 overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    {/* Background decoration */}
                    <div
                      className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20 group-hover:opacity-40 transition-opacity"
                      style={{ backgroundColor: category.color }}
                    />

                    {/* Icon */}
                    <div
                      className="relative w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-4 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: `${category.color}15` }}
                    >
                      {category.icon}
                    </div>

                    {/* Content */}
                    <h2 className="text-xl font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                      {category.name}
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {category.description.split(".")[0]}.
                    </p>

                    {/* Keywords tags */}
                    <div className="mt-4 flex flex-wrap gap-1">
                      {category.keywords.slice(0, 2).map((keyword) => (
                        <span
                          key={keyword}
                          className="text-xs px-2 py-1 bg-muted rounded-full text-muted-foreground"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Cities section */}
          <section className="py-12 bg-muted/30">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
              <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
                Busca actividades por ciudad
              </h2>
              <div className="flex flex-wrap justify-center gap-3">
                {SEO_CITIES.map((city) => (
                  <Link
                    key={city.slug}
                    href={`/eventos/${city.slug}`}
                    className="px-5 py-2.5 bg-card border rounded-full hover:border-primary hover:shadow-md transition-all text-sm font-medium"
                  >
                    {city.name}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* SEO text */}
          <section className="py-12">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
              <div className="prose prose-lg max-w-none">
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  Actividades educativas y divertidas para niños
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  En Hazlo con Peques organizamos las mejores actividades para niños en categorías
                  pensadas para facilitar tu búsqueda. Ya sea que tu peque sea un pequeño científico,
                  un artista en ciernes, un amante de la naturaleza o un chef en potencia, tenemos
                  actividades perfectas para desarrollar sus talentos y curiosidad.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  Todas nuestras actividades están organizadas por profesionales verificados que
                  adaptan el contenido a cada grupo de edad. Desde bebés de 2 años hasta preadolescentes
                  de 10 años, cada niño encontrará experiencias enriquecedoras y divertidas.
                </p>
              </div>
            </div>
          </section>
        </main>
      </div>
    </>
  );
}
