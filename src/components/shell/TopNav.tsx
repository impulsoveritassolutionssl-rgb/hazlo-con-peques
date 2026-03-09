// src/components/shell/TopNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BRAND_ASSETS } from "@/assets/files";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sparkles,
  Menu,
  X,
  LogOut,
  User,
  ChevronDown,
  Home,
} from "lucide-react";
import {
  type NavItem,
  type UserRole,
  getNavItemsForRole,
  isNavItemActive,
  getDashboardHref,
  landingNavSections,
} from "@/lib/nav";

interface TopNavProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role?: UserRole | null;
  } | null;
  isAuthenticated: boolean;
  onSignOut?: () => void;
}

export function TopNav({ user, isAuthenticated, onSignOut }: TopNavProps) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLandingPage = pathname === "/";
  const role = (user?.role as UserRole) || null;

  // Get nav items for desktop (excluding mobile-only items)
  const navItems = getNavItemsForRole(role, isAuthenticated, {
    desktopOnly: true,
    includeDashboard: !isLandingPage, // Don't show dashboard nav on landing
  }).filter((item) => !item.guestOnly); // Filter out auth items for desktop nav

  // Handle smooth scroll for landing page sections
  const handleSmoothScroll = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
        setMobileMenuOpen(false);
      }
    }
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Rainbow line at bottom of header */}
      <div className="absolute bottom-0 left-0 right-0 h-[2px] rainbow-line-animated opacity-60" />
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <img
              src={BRAND_ASSETS.logo}
              alt={BRAND_ASSETS.logoAlt}
              width={44}
              height={44}
              className="group-hover:scale-105 transition-transform rounded-lg"
            />
            <span className="hidden sm:inline font-bold text-xl sm:text-2xl rainbow-text">
              Hazlo con Peques
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {/* Show landing sections on home page, otherwise show main nav */}
            {isLandingPage ? (
              <>
                {landingNavSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => handleSmoothScroll(e, `#${section.id}`)}
                    className="rainbow-underline text-sm font-medium text-muted-foreground hover:text-foreground px-4 py-2 rounded-lg hover:bg-primary/5 transition-all duration-200"
                  >
                    {section.label}
                  </a>
                ))}
              </>
            ) : (
              <>
                {navItems
                  .filter((item) => !item.requiresAuth || isAuthenticated)
                  .slice(0, 4) // Limit to 4 items in nav
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = isNavItemActive(item, pathname);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        className={`rainbow-underline flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg transition-all duration-200 ${
                          isActive
                            ? "text-foreground active"
                            : "text-muted-foreground hover:text-foreground hover:bg-primary/5"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    );
                  })}
              </>
            )}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            {isLandingPage && (
              <Button
                variant="ghost"
                size="sm"
                className="rounded-xl font-medium"
                asChild
              >
                <Link href="/registro">
                  Publica tu evento
                </Link>
              </Button>
            )}

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 rounded-xl px-2"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.image || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:inline text-sm font-medium">
                      {user.name?.split(" ")[0] || "Usuario"}
                    </span>
                    <ChevronDown className="w-4 h-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="font-medium text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href={getDashboardHref(role)} className="cursor-pointer">
                      <Home className="mr-2 h-4 w-4" />
                      Mi panel
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={onSignOut}
                    className="text-destructive cursor-pointer"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl font-medium"
                  asChild
                >
                  <Link href="/login">Entrar</Link>
                </Button>
                <Button
                  size="sm"
                  className="rainbow-button rounded-xl font-semibold"
                  asChild
                >
                  <Link href="/registro">
                    <Sparkles className="w-4 h-4 mr-1" />
                    Registrarse
                  </Link>
                </Button>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-muted transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 border-t animate-in slide-in-from-top-2 duration-200">
            {isLandingPage ? (
              <>
                {landingNavSections.map((section) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    onClick={(e) => handleSmoothScroll(e, `#${section.id}`)}
                    className="block py-3 px-4 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
                  >
                    {section.label}
                  </a>
                ))}
              </>
            ) : (
              <>
                {navItems
                  .filter((item) => !item.requiresAuth || isAuthenticated)
                  .map((item) => {
                    const Icon = item.icon;
                    const isActive = isNavItemActive(item, pathname);
                    return (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={`flex items-center gap-3 py-3 px-4 text-sm font-medium rounded-lg transition-all ${
                          isActive
                            ? "text-primary bg-primary/10"
                            : "text-foreground hover:text-primary hover:bg-primary/5"
                        }`}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
              </>
            )}

            <div className="pt-4 space-y-2 border-t mt-2">
              {isLandingPage && (
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full rounded-xl font-medium"
                  asChild
                >
                  <Link href="/registro">
                    Publica tu evento
                  </Link>
                </Button>
              )}

              {isAuthenticated && user ? (
                <>
                  <Button
                    size="sm"
                    className="w-full rounded-xl font-semibold"
                    asChild
                  >
                    <Link
                      href={getDashboardHref(role)}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <User className="w-4 h-4 mr-1" />
                      Mi panel
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full rounded-xl font-medium"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onSignOut?.();
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Cerrar sesión
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full rounded-xl font-medium"
                    asChild
                  >
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      Iniciar sesión
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="rainbow-button w-full rounded-xl font-semibold"
                    asChild
                  >
                    <Link href="/registro" onClick={() => setMobileMenuOpen(false)}>
                      <Sparkles className="w-4 h-4 mr-1" />
                      Registrarse
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
