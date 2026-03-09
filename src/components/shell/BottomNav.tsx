// src/components/shell/BottomNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Home,
  Search,
  CalendarDays,
  Gamepad2,
  User,
  BookOpen,
  Heart,
  Building2,
} from "lucide-react";
import { type UserRole, isNavItemActive, getDashboardHref } from "@/lib/nav";
import { cn } from "@/lib/utils";

interface BottomNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole | null;
  } | null;
  isAuthenticated: boolean;
}

// Simple bottom nav items based on role - max 5 items for mobile
function getBottomNavItems(role: UserRole | null, isAuthenticated: boolean) {
  // Base items for everyone (4 items max for public, 5 for auth)
  const baseItems = [
    {
      id: "home",
      label: "Inicio",
      href: "/",
      icon: Home,
      match: /^\/$/,
    },
    {
      id: "activities",
      label: "Explorar",
      href: "/actividades",
      icon: Search,
      match: /^\/actividades/,
    },
    {
      id: "events",
      label: "Eventos",
      href: "/eventos",
      icon: CalendarDays,
      match: /^\/eventos/,
    },
    {
      id: "games",
      label: "Juegos",
      href: "/games",
      icon: Gamepad2,
      match: /^\/games/,
    },
  ];

  // Role-specific dashboard item - limit to 5 items max
  if (isAuthenticated && role) {
    // For authenticated users: Home, Explorar, Dashboard, Juegos, Perfil
    const authItems = [
      {
        id: "home",
        label: "Inicio",
        href: "/",
        icon: Home,
        match: /^\/$/,
      },
      {
        id: "activities",
        label: "Explorar",
        href: "/actividades",
        icon: Search,
        match: /^\/(actividades|eventos)/,
      },
      {
        id: "dashboard",
        label: role === "peque" ? "Aprender" : role === "padre" ? "Familia" : "Panel",
        href: getDashboardHref(role),
        icon: role === "peque" ? BookOpen : role === "padre" ? Heart : Building2,
        match: new RegExp(`^/dashboard/${role}`),
      },
      {
        id: "games",
        label: "Juegos",
        href: "/games",
        icon: Gamepad2,
        match: /^\/games/,
      },
      {
        id: "profile",
        label: "Perfil",
        href: "/profile",
        icon: User,
        match: /^\/profile/,
      },
    ];

    return authItems;
  }

  // Guest items - limit to 5 items
  return [
    ...baseItems,
    {
      id: "login",
      label: "Entrar",
      href: "/login",
      icon: User,
      match: /^\/(login|registro)/,
    },
  ];
}

export function BottomNav({ user, isAuthenticated }: BottomNavProps) {
  const pathname = usePathname();
  const role = (user?.role as UserRole) || null;

  const navItems = getBottomNavItems(role, isAuthenticated);

  // Don't show bottom nav on landing page (we use top nav there)
  const isLandingPage = pathname === "/";
  if (isLandingPage) return null;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/98 backdrop-blur-lg border-t safe-area-inset-bottom">
      {/* Rainbow line at top */}
      <div className="absolute top-0 left-0 right-0 h-[2px] rainbow-line opacity-50" />
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            typeof item.match === "string"
              ? pathname === item.match
              : item.match.test(pathname);

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full py-2 relative transition-all duration-200",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="bottomNavIndicator"
                  className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-1 rainbow-line rounded-full"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex flex-col items-center gap-0.5",
                  isActive && "transform scale-105"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all",
                  isActive && "bg-primary/10"
                )}>
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all",
                      isActive && "text-primary"
                    )}
                  />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium transition-all",
                    isActive ? "text-primary font-semibold" : "text-muted-foreground"
                  )}
                >
                  {item.label}
                </span>
              </motion.div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
