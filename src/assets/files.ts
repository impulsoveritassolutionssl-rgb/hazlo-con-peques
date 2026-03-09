// Centralized file assets (images, logos, documents)
// All URLs here are validated and should be used throughout the app

/**
 * Brand assets - Logo and favicon images
 * IMPORTANT: These URLs are validated and should be used for all brand-related images
 */
export const BRAND_ASSETS = {
  // Main logo - rectangular with icon (for hero, navigation, footer, og-image)
  // Validated at: 2024 - Image exists and is accessible
  logo: "https://i.postimg.cc/NFNFJPm1/Logo-hazlo-con-peques.png",

  // Alt text for logo
  logoAlt: "Hazlo con Peques - Actividades para niños",

  // Favicon/icon (same logo works for favicon generation)
  favicon: "https://i.postimg.cc/NFNFJPm1/Logo-hazlo-con-peques.png",
} as const;

/**
 * Hero section images - validated external images
 */
export const HERO_IMAGES = {
  topLeft: "https://i.postimg.cc/DWGr73hJ/Aprende-jugando-ciencia-(1).png",
  topRight: "https://i.postimg.cc/VdS5xBms/Gemini-Generated-Image-f0i1irf0i1irf0i1-(1).png",
  bottomLeft: "https://i.postimg.cc/HJmx8q5M/Fotos-ninos-jugando-(1).png",
  bottomRight: "https://i.postimg.cc/w7sTfqQD/Gemini-Generated-Image-lg8w7plg8w7plg8w-(1).png",
} as const;

/**
 * Legacy files object for backward compatibility
 */
export const files: { [fileName: string]: { description: string; url: string } } = {
  logo: {
    description: "Logo principal de Hazlo con Peques - rectangular con icono",
    url: BRAND_ASSETS.logo,
  },
  favicon: {
    description: "Favicon/icono de la aplicación",
    url: BRAND_ASSETS.favicon,
  },
};
