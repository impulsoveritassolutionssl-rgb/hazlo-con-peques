"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Maximize2, Minimize2, ExternalLink, AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GameEmbedProps {
  srcUrl: string;
  title: string;
  backUrl?: string;
  /** Fallback URL (local) to use if external URL is blocked */
  fallbackUrl?: string;
}

export function GameEmbed({ srcUrl, title, backUrl = "/games", fallbackUrl }: GameEmbedProps) {
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loadError, setLoadError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUrl, setCurrentUrl] = useState(srcUrl);
  const [usingFallback, setUsingFallback] = useState(false);
  const loadTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // Set up load timeout detection for iframe blocking
  useEffect(() => {
    // Clear any existing timeout
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }

    if (isLoading && !loadError) {
      // Set a timeout - if iframe doesn't load in 5 seconds, assume blocked
      loadTimeoutRef.current = setTimeout(() => {
        console.log("[GameEmbed] Load timeout - iframe may be blocked");
        // Only trigger error if still loading
        if (isLoading) {
          setLoadError(true);
          setIsLoading(false);
        }
      }, 5000);
    }

    return () => {
      if (loadTimeoutRef.current) {
        clearTimeout(loadTimeoutRef.current);
      }
    };
  }, [isLoading, loadError, currentUrl]);

  // Toggle fullscreen
  const toggleFullscreen = useCallback(async () => {
    if (!containerRef.current) return;

    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (err) {
      console.error("[GameEmbed] Fullscreen error:", err);
    }
  }, []);

  // Handle iframe load
  const handleIframeLoad = () => {
    console.log("[GameEmbed] Iframe loaded successfully:", currentUrl);
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setIsLoading(false);
    setLoadError(false);
  };

  // Handle iframe error
  const handleIframeError = () => {
    console.log("[GameEmbed] Iframe failed to load:", currentUrl);
    if (loadTimeoutRef.current) {
      clearTimeout(loadTimeoutRef.current);
    }
    setIsLoading(false);
    setLoadError(true);
  };

  // Reload the game
  const reloadGame = () => {
    console.log("[GameEmbed] Reloading game");
    setIsLoading(true);
    setLoadError(false);
    if (iframeRef.current) {
      // Force reload by setting src again
      const url = iframeRef.current.src;
      iframeRef.current.src = "";
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = url;
        }
      }, 100);
    }
  };

  // Retry loading (try fallback if available)
  const retryLoad = () => {
    console.log("[GameEmbed] Retrying load");
    setIsLoading(true);
    setLoadError(false);

    // If we have a fallback and aren't using it yet, try the fallback
    if (fallbackUrl && !usingFallback) {
      console.log("[GameEmbed] Switching to fallback URL:", fallbackUrl);
      setCurrentUrl(fallbackUrl);
      setUsingFallback(true);
    } else {
      // Otherwise just reload current URL
      if (iframeRef.current) {
        iframeRef.current.src = currentUrl;
      }
    }
  };

  // Use local fallback
  const useFallback = () => {
    if (fallbackUrl) {
      console.log("[GameEmbed] Manually switching to fallback:", fallbackUrl);
      setIsLoading(true);
      setLoadError(false);
      setCurrentUrl(fallbackUrl);
      setUsingFallback(true);
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
      className="relative flex flex-col w-full h-[calc(100dvh-4rem)] bg-background"
    >
      {/* Game controls bar - positioned below AppShell nav */}
      <div className="flex items-center justify-between px-3 py-2 bg-background/95 backdrop-blur-sm border-b border-border/50">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Volver</span>
          </Button>
          <span className="text-sm font-medium text-foreground/80 truncate max-w-[150px] sm:max-w-[300px]">
            {title}
          </span>
          {usingFallback && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-yellow-500/10 text-yellow-600 hidden sm:inline">
              Versión local
            </span>
          )}
        </div>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={reloadGame}
            className="text-muted-foreground hover:text-foreground"
            title="Recargar juego"
          >
            <RotateCcw className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleFullscreen}
            className="text-muted-foreground hover:text-foreground"
            title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={openInNewTab}
            className="text-muted-foreground hover:text-foreground"
            title="Abrir en nueva pestaña"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Game container */}
      <div className="relative flex-1 w-full overflow-hidden">
        {/* Loading state */}
        {isLoading && !loadError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-background z-10">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
            <p className="text-muted-foreground text-sm">Cargando {title}...</p>
            {usingFallback && (
              <p className="text-xs text-muted-foreground mt-2">Usando versión local</p>
            )}
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
                No se pudo cargar el juego
              </h3>
              <p className="text-muted-foreground text-sm mb-6">
                {usingFallback
                  ? "No se pudo cargar la versión local del juego. Intenta abrirlo en una nueva pestaña."
                  : "Este juego no permite ser integrado en otras páginas (iframe bloqueado). Puedes abrirlo en una nueva pestaña o probar la versión local."}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {fallbackUrl && !usingFallback && (
                  <Button onClick={useFallback} variant="outline" className="gap-2">
                    <RefreshCw className="w-4 h-4" />
                    Usar versión local
                  </Button>
                )}
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
                size="sm"
                onClick={handleBack}
                className="mt-4 text-muted-foreground"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Volver a Juegos
              </Button>
            </div>
          </div>
        )}

        {/* Iframe */}
        <iframe
          ref={iframeRef}
          src={currentUrl}
          title={title}
          className="w-full h-full border-0"
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

export default GameEmbed;
