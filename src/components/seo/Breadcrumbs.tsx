"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { motion } from "framer-motion";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumbs({ items, className = "" }: BreadcrumbsProps) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={`flex items-center flex-wrap gap-1 text-sm ${className}`}
    >
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Link
          href="/"
          className="flex items-center text-muted-foreground hover:text-primary transition-colors"
        >
          <Home className="w-4 h-4" />
          <span className="sr-only">Inicio</span>
        </Link>
      </motion.div>

      {items.map((item, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: (index + 1) * 0.1 }}
          className="flex items-center"
        >
          <ChevronRight className="w-4 h-4 text-muted-foreground/50 mx-1" />
          {item.href ? (
            <Link
              href={item.href}
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium" aria-current="page">
              {item.label}
            </span>
          )}
        </motion.div>
      ))}
    </nav>
  );
}
