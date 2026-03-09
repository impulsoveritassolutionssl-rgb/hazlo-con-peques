// Schema.org structured data generators for SEO
// Implements JSON-LD for Event, Organization, BreadcrumbList, FAQPage

import { SEO_CONFIG, getCityBySlug, getCategoryBySlug } from "./config";

interface EventSchemaData {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  location?: {
    name?: string;
    address?: string;
    city?: string;
    postalCode?: string;
    lat?: number;
    lng?: number;
  };
  isOnline?: boolean;
  price?: number; // in cents
  currency?: string;
  organizerName?: string;
  image?: string;
  url: string;
  availability?: "InStock" | "SoldOut" | "LimitedAvailability";
}

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

// Organization Schema - for the website
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SEO_CONFIG.organization.name,
    url: SEO_CONFIG.organization.url,
    logo: `${SEO_CONFIG.siteUrl}${SEO_CONFIG.organization.logo}`,
    contactPoint: {
      "@type": "ContactPoint",
      email: SEO_CONFIG.organization.contactEmail,
      contactType: "customer service",
      availableLanguage: ["Spanish"],
    },
    sameAs: [
      // Add social media URLs here when available
    ],
  };
}

// WebSite Schema with SearchAction
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SEO_CONFIG.siteName,
    url: SEO_CONFIG.siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SEO_CONFIG.siteUrl}/eventos?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

// Event Schema
export function generateEventSchema(event: EventSchemaData) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.name,
    description: event.description || "",
    url: event.url,
  };

  // Dates
  if (event.startDate) {
    schema.startDate = event.startDate;
  }
  if (event.endDate) {
    schema.endDate = event.endDate;
  }

  // Location
  if (event.isOnline) {
    schema.eventAttendanceMode = "https://schema.org/OnlineEventAttendanceMode";
    schema.location = {
      "@type": "VirtualLocation",
      url: event.url,
    };
  } else if (event.location) {
    schema.eventAttendanceMode = "https://schema.org/OfflineEventAttendanceMode";
    schema.location = {
      "@type": "Place",
      name: event.location.name || "",
      address: {
        "@type": "PostalAddress",
        streetAddress: event.location.address || "",
        addressLocality: event.location.city || "",
        postalCode: event.location.postalCode || "",
        addressCountry: "ES",
      },
    };
    if (event.location.lat && event.location.lng) {
      (schema.location as Record<string, unknown>).geo = {
        "@type": "GeoCoordinates",
        latitude: event.location.lat,
        longitude: event.location.lng,
      };
    }
  }

  // Price / Offers
  if (event.price !== undefined) {
    schema.offers = {
      "@type": "Offer",
      price: (event.price / 100).toFixed(2),
      priceCurrency: event.currency || "EUR",
      availability: event.availability
        ? `https://schema.org/${event.availability}`
        : "https://schema.org/InStock",
      url: event.url,
    };
  }

  // Image
  if (event.image) {
    schema.image = event.image.startsWith("http")
      ? event.image
      : `${SEO_CONFIG.siteUrl}${event.image}`;
  }

  // Organizer
  if (event.organizerName) {
    schema.organizer = {
      "@type": "Organization",
      name: event.organizerName,
    };
  }

  // Audience (children)
  schema.audience = {
    "@type": "PeopleAudience",
    suggestedMinAge: 2,
    suggestedMaxAge: 10,
  };

  return schema;
}

// BreadcrumbList Schema
export function generateBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url.startsWith("http") ? item.url : `${SEO_CONFIG.siteUrl}${item.url}`,
    })),
  };
}

// FAQPage Schema
export function generateFAQSchema(faqs: FAQItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
}

// LocalBusiness Schema for city pages
export function generateLocalBusinessSchema(citySlug: string) {
  const city = getCityBySlug(citySlug);
  if (!city) return null;

  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: `${SEO_CONFIG.siteName} - ${city.name}`,
    description: city.description,
    url: `${SEO_CONFIG.siteUrl}/eventos/${city.slug}`,
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: city.region,
      },
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: city.lat,
      longitude: city.lng,
    },
  };
}

// ItemList Schema for event listings
export function generateEventListSchema(events: Array<{ name: string; url: string; image?: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    numberOfItems: events.length,
    itemListElement: events.map((event, index) => ({
      "@type": "ListItem",
      position: index + 1,
      url: event.url.startsWith("http") ? event.url : `${SEO_CONFIG.siteUrl}${event.url}`,
      name: event.name,
      image: event.image,
    })),
  };
}

// Combine multiple schemas into a single script tag content
export function combineSchemas(...schemas: (Record<string, unknown> | null)[]) {
  const validSchemas = schemas.filter((s) => s !== null);
  if (validSchemas.length === 0) return null;
  if (validSchemas.length === 1) return validSchemas[0];

  return {
    "@context": "https://schema.org",
    "@graph": validSchemas.map((s) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { "@context": _, ...rest } = s as Record<string, unknown>;
      return rest;
    }),
  };
}
