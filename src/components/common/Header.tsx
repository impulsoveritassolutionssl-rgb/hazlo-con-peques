// src/components/common/Header.tsx
"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Sparkles, Menu, X, User, LogIn } from "lucide-react";
import { useSession, signOut } from "@/lib/auth-client";

const navLinks = [
  { href: "#actividades", label: "Actividades" },
  { href: "#como-funciona", label: "Cómo funciona" },
  { href: "#aprendizaje", label: "Aprendizaje" },
  { href: "#testimonios", label: "Testimonios" },
  { href: "#faq", label: "FAQ" },
];

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { data: session, isPending } = useSession();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const targetId = href.replace("#", "");
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setMobileMenuOpen(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    document.cookie = "user_role=; path=/; max-age=0";
    window.location.href = "/";
  };

  // Get the correct dashboard link based on user role
  const getDashboardLink = () => {
    const userRole = (session?.user as { role?: string })?.role;
    switch (userRole) {
      case "organizador":
        return "/dashboard/organizador";
      case "padre":
        return "/dashboard/padre";
      case "peque":
        return "/dashboard/peque";
      default:
        return "/dashboard/padre";
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center shadow-md group-hover:shadow-lg transition-shadow">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Peques
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="text-sm font-medium text-muted-foreground hover:text-primary px-4 py-2 rounded-lg hover:bg-primary/5 transition-all duration-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Desktop CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl font-medium"
              asChild
            >
              <a
                href="#publicar"
                onClick={(e) => handleSmoothScroll(e, "#publicar")}
              >
                Publicar actividad
              </a>
            </Button>

            {isPending ? (
              <div className="w-20 h-9 bg-muted animate-pulse rounded-xl" />
            ) : session ? (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-xl font-medium"
                  asChild
                >
                  <Link href={getDashboardLink()}>
                    <User className="w-4 h-4 mr-1" />
                    Mi panel
                  </Link>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl font-medium text-muted-foreground"
                  onClick={handleLogout}
                >
                  Salir
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl font-medium"
                  asChild
                >
                  <Link href="/login">
                    <LogIn className="w-4 h-4 mr-1" />
                    Entrar
                  </Link>
                </Button>
                <Button
                  size="sm"
                  className="rounded-xl font-semibold shadow-md hover:shadow-lg transition-shadow bg-gradient-to-r from-primary to-secondary"
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
          <div className="lg:hidden py-4 space-y-2 border-t">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleSmoothScroll(e, link.href)}
                className="block py-3 px-4 text-sm font-medium text-foreground hover:text-primary hover:bg-primary/5 rounded-lg transition-all"
              >
                {link.label}
              </a>
            ))}
            <div className="pt-4 space-y-2 border-t mt-2">
              <Button
                variant="outline"
                size="sm"
                className="w-full rounded-xl font-medium"
                asChild
              >
                <a
                  href="#publicar"
                  onClick={(e) => handleSmoothScroll(e, "#publicar")}
                >
                  Publicar actividad
                </a>
              </Button>

              {session ? (
                <>
                  <Button
                    size="sm"
                    className="w-full rounded-xl font-semibold"
                    asChild
                  >
                    <Link href={getDashboardLink()} onClick={() => setMobileMenuOpen(false)}>
                      <User className="w-4 h-4 mr-1" />
                      Mi panel
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full rounded-xl font-medium"
                    onClick={handleLogout}
                  >
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
                      <LogIn className="w-4 h-4 mr-1" />
                      Iniciar sesión
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    className="w-full rounded-xl font-semibold bg-gradient-to-r from-primary to-secondary"
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
