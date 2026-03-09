"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PeriodicTableEmbedProps {
  srcUrl: string;
  title: string;
  backUrl?: string;
}

/**
 * Specialized embed component for the Periodic Table game
 * - Fixed/sticky layout that fills the entire viewport below the nav
 * - Minimal control bar to maximize table visibility
 * - Shows footer on mobile
 */
export function PeriodicTableEmbed({ srcUrl, title, backUrl = "/games" }: PeriodicTableEmbedProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Set up load timeout detection for iframe blocking
  useEffect(() => {
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    if (isLoading && !loadError) {
      loadTimeoutRef.current = setTimeout(() => {
        console.log("[PeriodicTableEmbed] Load timeout - iframe may be blocked");
        if (isLoading) {
          setLoadError(true);
          setIsLoading(false);
        }
      }, 8000); // Longer timeout for periodic table
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isLoading, loadError]);

  // Handle iframe load
  const handleIframeLoad = () => {
    console.log("[PeriodicTableEmbed] Iframe loaded successfully");
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setIsLoading(false);
    setLoadError(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    console.log("[PeriodicTableEmbed] Iframe failed to load");
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setIsLoading(false);
    setLoadError(true);
  };

  // Retry loading
  const retryLoad = () => {
    console.log("[PeriodicTableEmbed] Retrying load");
    setIsLoading(true);
    setLoadError(false);
    if (iframeRef.current) {
      iframeRef.current.src = srcUrl;
    }
  };

  // Open in new tab
  const openInNewTab = () => {
    window.open(srcUrl, "_blank", "noopener,noreferrer");
  };

  // Go back
  const handleBack = () => {
    if (backUrl) {
      router.push(backUrl);
    } else {
      router.back();
    }
  };

  return (
    <div
      ref={containerRef}
      className="fixed inset-x-0 top-16 bottom-16 md:bottom-0 flex flex-col bg-background z-30"
    >
      {/* Compact control bar - minimized height, only back button and title */}
      <div className="flex items-center px-3 py-2 bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-orange-500/10 border-b border-border/30 shrink-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBack}
          className="h-8 px-3 gap-1.5 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Volver</span>
        </Button>
        <span className="ml-2 text-sm font-medium text-foreground/80 truncate">
          {title}
        </span>
      </div>

      {/* Iframe container - takes all remaining space */}
      <div className="flex-1 w-full relative overflow-hidden">
        {/* Loading state */}
        {isLoading && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground">Cargando {title}...</p>
          </div>
        )}

        {/* Error/Blocked state */}
        {loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10 p-6">
            <div className="max-w-md text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-yellow-500/10 flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-yellow-500" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                No se pudo cargar la tabla periódica
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                El contenido no permite ser integrado directamente. Puedes abrirlo en una nueva pestaña.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={retryLoad} variant="outline" className="gap-2">
                  <RefreshCw className="w-4 h-4" />
                  Reintentar
                </Button>
                <Button onClick={openInNewTab} className="gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Abrir en nueva pestaña
                </Button>
              </div>
              <Button
                variant="ghost"
                onClick={handleBack}
                className="mt-4 text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver a Juegos
              </Button>
            </div>
          </div>
        )}

        {/* Iframe - fills entire container */}
        <iframe
          ref={iframeRef}
          src={srcUrl}
          title={title}
          className="absolute inset-0 w-full h-full border-0"
          allow="fullscreen; clipboard-read; clipboard-write; gamepad; accelerometer; gyroscope; autoplay"
          sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-pointer-lock allow-downloads"
          referrerPolicy="no-referrer"
          loading="eager"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
    </div>
  );
}

export default PeriodicTableEmbed;
