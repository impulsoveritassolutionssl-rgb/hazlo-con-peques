// src/components/common/Footer.tsx
"use client";

import Link from "next/link";
import { Sparkles, Instagram, Facebook, Twitter, Youtube, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BRAND_ASSETS } from "@/assets/files";

const footerLinks = {
  plataforma: [
    { label: "Actividades", href: "#actividades" },
    { label: "Cómo funciona", href: "#como-funciona" },
    { label: "Publica tu evento", href: "/registro" },
    { label: "Blog", href: "#" },
  ],
  soporte: [
    { label: "Centro de ayuda", href: "#" },
    { label: "Contacto", href: "#" },
    { label: "FAQ", href: "#faq" },
  ],
  legal: [
    { label: "Política de privacidad", href: "/privacy-policy" },
    { label: "Términos de servicio", href: "/terms-of-service" },
    { label: "Cookies", href: "#" },
  ],
};

const socialLinks = [
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Facebook, href: "#", label: "Facebook" },
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Youtube, href: "#", label: "Youtube" },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith("#")) {
      e.preventDefault();
      const targetId = href.replace("#", "");
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <footer className="bg-gradient-to-b from-muted/30 to-muted/50 border-t relative">
      {/* Rainbow line at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] rainbow-line-animated" />
      {/* Main footer content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-12 md:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand column */}
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <img
                src={BRAND_ASSETS.logo}
                alt={BRAND_ASSETS.logoAlt}
                width={44}
                height={44}
                className="hover:scale-105 transition-transform rounded-lg"
              />
              <span className="font-bold text-xl sm:text-2xl rainbow-text">
                Hazlo con Peques
              </span>
            </Link>
            <p className="text-muted-foreground text-sm mb-6 max-w-xs">
              La plataforma donde los niños aprenden jugando. Actividades educativas,
              divertidas y seguras para toda la familia.
            </p>
            <Button
              size="sm"
              className="rainbow-button rounded-xl font-semibold"
              asChild
            >
              <a
                href="#actividades"
                onClick={(e) => handleSmoothScroll(e, "#actividades")}
              >
                <Sparkles className="w-4 h-4 mr-1" />
                Explorar actividades
              </a>
            </Button>
          </div>

          {/* Plataforma links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Plataforma</h3>
            <ul className="space-y-3">
              {footerLinks.plataforma.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      onClick={(e) => handleSmoothScroll(e, link.href)}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Soporte links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Soporte</h3>
            <ul className="space-y-3">
              {footerLinks.soporte.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    onClick={(e) => handleSmoothScroll(e, link.href)}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal links */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.label}>
                  {link.href.startsWith("/") ? (
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      {link.label}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Copyright */}
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <span>&copy; {currentYear} Hazlo con Peques.</span>
              <span>Hecho con</span>
              <Heart className="w-4 h-4 text-secondary fill-secondary" />
              <span>para las familias</span>
            </div>

            {/* Social links */}
            <div className="flex items-center gap-2">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    aria-label={social.label}
                    className="w-10 h-10 rounded-full bg-card border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all"
                  >
                    <Icon className="w-5 h-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
