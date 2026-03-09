// src/app/layout.tsx
import React from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shell";
import { Footer } from "@/components/common/Footer";
import { ScriptExecutor } from "@/components/ScriptExecutor";
import { DevToolsHandler } from "@/components/DevToolsHandler";
import { SEO_CONFIG } from "@/lib/seo/config";
import { generateOrganizationSchema, generateWebSiteSchema, combineSchemas } from "@/lib/seo/schema";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });

export const metadata: Metadata = {
  metadataBase: new URL(SEO_CONFIG.siteUrl),
  title: {
    default: SEO_CONFIG.defaultTitle,
    template: `%s | ${SEO_CONFIG.siteName}`,
  },
  description: SEO_CONFIG.defaultDescription,
  keywords: [
    "actividades para niños",
    "eventos infantiles",
    "talleres para niños",
    "planes con niños",
    "cuentacuentos",
    "ciencia para niños",
    "arte infantil",
    "manualidades niños",
    "actividades educativas",
    "ocio familiar",
  ],
  authors: [{ name: SEO_CONFIG.siteName, url: SEO_CONFIG.siteUrl }],
  creator: SEO_CONFIG.siteName,
  publisher: SEO_CONFIG.siteName,
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: SEO_CONFIG.siteUrl,
    languages: {
      "es-ES": SEO_CONFIG.siteUrl,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "android-chrome-192x192", url: "/android-chrome-192x192.png" },
      { rel: "android-chrome-512x512", url: "/android-chrome-512x512.png" },
    ],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: SEO_CONFIG.locale,
    url: SEO_CONFIG.siteUrl,
    siteName: SEO_CONFIG.siteName,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [
      {
        url: SEO_CONFIG.defaultOgImage,
        width: SEO_CONFIG.ogImageWidth,
        height: SEO_CONFIG.ogImageHeight,
        alt: `${SEO_CONFIG.siteName} - Actividades para niños`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: SEO_CONFIG.twitter,
    creator: SEO_CONFIG.twitter,
    title: SEO_CONFIG.defaultTitle,
    description: SEO_CONFIG.defaultDescription,
    images: [SEO_CONFIG.defaultOgImage],
  },
  verification: {
    // Add verification codes when available
    // google: "your-google-verification-code",
  },
  category: "education",
};

// SUPER IMPORTANT: NOT EDIT THE FOLLOWING 2 LINES TO FORCE NEXT.JS TO RENDER DYNAMICALLY
export const dynamic = "force-dynamic";
export const revalidate = 0;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  // Generate combined schema for organization and website
  const combinedSchema = combineSchemas(
    generateOrganizationSchema(),
    generateWebSiteSchema()
  );

  return (
    <html lang="es">
      <head>
        {/* Structured Data */}
        {combinedSchema && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(combinedSchema),
            }}
          />
        )}
        {/* Preconnect to external resources for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://totalum-files.s3.eu-south-2.amazonaws.com" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ScriptExecutor />
        <DevToolsHandler />
        <div className="min-h-screen flex flex-col">
          <AppShell>
            {children}
          </AppShell>
          <Footer />
        </div>
      </body>
    </html>
  );
}
