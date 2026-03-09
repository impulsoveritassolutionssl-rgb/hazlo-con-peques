// src/lib/nav.ts
// Centralized navigation configuration - single source of truth

import {
  Home,
  Search,
  CalendarDays,
  Gamepad2,
  User,
  Heart,
  Building2,
  Users,
  Settings,
  BarChart3,
  Sparkles,
  BookOpen,
  type LucideIcon,
} from "lucide-react";

export type UserRole = "peque" | "padre" | "organizador" | "admin" | "guest";

export interface NavItem {
  id: string;
  label: string;
  href: string;
  icon: LucideIcon;
  /** Roles that can see this item. Empty array means visible to all. */
  roles: UserRole[];
  /** Pattern to match for active state (regex or exact) */
  match?: string | RegExp;
  /** If true, only show when authenticated */
  requiresAuth?: boolean;
  /** If true, only show when NOT authenticated */
  guestOnly?: boolean;
  /** Mobile bottom nav only */
  mobileOnly?: boolean;
  /** Desktop top nav only */
  desktopOnly?: boolean;
}

// Main navigation items - Public routes visible to everyone
export const mainNavItems: NavItem[] = [
  {
    id: "home",
    label: "Inicio",
    href: "/",
    icon: Home,
    roles: [],
    match: /^\/$/,
  },
  {
    id: "activities",
    label: "Explorar",
    href: "/actividades",
    icon: Search,
    roles: [],
    match: /^\/actividades/,
  },
  {
    id: "events",
    label: "Eventos",
    href: "/eventos",
    icon: CalendarDays,
    roles: [],
    match: /^\/eventos/,
  },
  {
    id: "games",
    label: "Juegos",
    href: "/games",
    icon: Gamepad2,
    roles: [],
    match: /^\/games/,
  },
];

// Dashboard navigation items (role-specific)
export const dashboardNavItems: NavItem[] = [
  // Peque dashboard items
  {
    id: "peque-learn",
    label: "Aprender",
    href: "/dashboard/peque",
    icon: BookOpen,
    roles: ["peque"],
    match: /^\/dashboard\/peque$/,
    requiresAuth: true,
  },
  {
    id: "peque-games",
    label: "Juegos",
    href: "/games",
    icon: Gamepad2,
    roles: ["peque"],
    match: /^\/games/,
    requiresAuth: true,
  },
  // Padre dashboard items
  {
    id: "padre-panel",
    label: "Mi Panel",
    href: "/dashboard/padre",
    icon: Heart,
    roles: ["padre"],
    match: /^\/dashboard\/padre$/,
    requiresAuth: true,
  },
  {
    id: "padre-kids",
    label: "Mis Peques",
    href: "/dashboard/padre",
    icon: Users,
    roles: ["padre"],
    match: /^\/dashboard\/padre/,
    requiresAuth: true,
    mobileOnly: true,
  },
  // Organizador dashboard items
  {
    id: "org-panel",
    label: "Panel",
    href: "/dashboard/organizador",
    icon: Building2,
    roles: ["organizador"],
    match: /^\/dashboard\/organizador$/,
    requiresAuth: true,
  },
  {
    id: "org-activities",
    label: "Actividades",
    href: "/dashboard/organizador",
    icon: CalendarDays,
    roles: ["organizador"],
    match: /^\/dashboard\/organizador/,
    requiresAuth: true,
    mobileOnly: true,
  },
  {
    id: "org-analytics",
    label: "Analytics",
    href: "/dashboard/organizador",
    icon: BarChart3,
    roles: ["organizador"],
    match: /^\/dashboard\/organizador/,
    requiresAuth: true,
    mobileOnly: true,
  },
];

// Profile/settings item (always last)
export const profileNavItem: NavItem = {
  id: "profile",
  label: "Perfil",
  href: "/profile",
  icon: User,
  roles: [],
  match: /^\/profile/,
  requiresAuth: true,
};

// Auth items for guests
export const authNavItems: NavItem[] = [
  {
    id: "login",
    label: "Entrar",
    href: "/login",
    icon: User,
    roles: [],
    guestOnly: true,
    match: /^\/login$/,
  },
  {
    id: "register",
    label: "Registrarse",
    href: "/registro",
    icon: Sparkles,
    roles: [],
    guestOnly: true,
    match: /^\/registro$/,
  },
];

/**
 * Get navigation items based on user role and auth state
 */
export function getNavItemsForRole(
  role: UserRole | null,
  isAuthenticated: boolean,
  options?: {
    mobileOnly?: boolean;
    desktopOnly?: boolean;
    includeDashboard?: boolean;
  }
): NavItem[] {
  const { mobileOnly, desktopOnly, includeDashboard = true } = options || {};

  let items: NavItem[] = [...mainNavItems];

  // Add dashboard items if authenticated and role matches
  if (isAuthenticated && includeDashboard && role) {
    const roleItems = dashboardNavItems.filter(
      (item) => item.roles.length === 0 || item.roles.includes(role)
    );
    items = [...items, ...roleItems];
  }

  // Filter by auth state
  items = items.filter((item) => {
    if (item.requiresAuth && !isAuthenticated) return false;
    if (item.guestOnly && isAuthenticated) return false;
    return true;
  });

  // Filter by role
  items = items.filter((item) => {
    if (item.roles.length === 0) return true;
    if (!role) return false;
    return item.roles.includes(role);
  });

  // Filter by mobile/desktop
  if (mobileOnly) {
    items = items.filter((item) => !item.desktopOnly);
  }
  if (desktopOnly) {
    items = items.filter((item) => !item.mobileOnly);
  }

  // Add profile item if authenticated
  if (isAuthenticated) {
    items.push(profileNavItem);
  }

  // Add auth items for guests
  if (!isAuthenticated) {
    items.push(...authNavItems);
  }

  return items;
}

/**
 * Check if a nav item matches the current path
 */
export function isNavItemActive(item: NavItem, pathname: string): boolean {
  if (!item.match) {
    return pathname === item.href;
  }

  if (typeof item.match === "string") {
    return pathname === item.match;
  }

  return item.match.test(pathname);
}

/**
 * Get the dashboard href for a given role
 */
export function getDashboardHref(role: UserRole | null): string {
  switch (role) {
    case "peque":
      return "/dashboard/peque";
    case "padre":
      return "/dashboard/padre";
    case "organizador":
      return "/dashboard/organizador";
    case "admin":
      return "/dashboard/organizador"; // Admin uses organizador dashboard
    default:
      return "/dashboard/padre";
  }
}

/**
 * Get page title based on pathname
 */
export function getPageTitle(pathname: string): string {
  if (pathname === "/") return "Inicio";
  if (pathname.startsWith("/actividades")) return "Actividades";
  if (pathname.startsWith("/games")) return "Juegos";
  if (pathname.startsWith("/dashboard/peque")) return "Mi Espacio";
  if (pathname.startsWith("/dashboard/padre")) return "Panel de Familia";
  if (pathname.startsWith("/dashboard/organizador")) return "Panel de Organizador";
  if (pathname.startsWith("/profile")) return "Perfil";
  return "Peques";
}

/**
 * Landing page sections for smooth scroll navigation
 */
export const landingNavSections = [
  { id: "actividades", label: "Actividades" },
  { id: "como-funciona", label: "Cómo funciona" },
  { id: "aprendizaje", label: "Aprendizaje" },
  { id: "testimonios", label: "Testimonios" },
  { id: "faq", label: "FAQ" },
];
