"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { ImageOff, Loader2, Image as ImageIcon } from "lucide-react";

// Default fallback images for different contexts
const FALLBACK_IMAGES = {
  default: "https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&h=300&fit=crop",
  activity: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=400&h=300&fit=crop",
};

// Category-based emoji fallbacks
const CATEGORY_EMOJI: Record<string, string> = {
  ciencia: "🔬",
  arte: "🎨",
  musica: "🎵",
  naturaleza: "🌿",
  lectura: "📚",
  experimentos: "🧪",
};

export interface ActivityThumbnailProps {
  /** Image URL - can be Totalum file URL or external URL */
  src?: string | null;
  /** Alternative text for accessibility */
  alt?: string;
  /** Size variant of the thumbnail */
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "full";
  /** Activity category for emoji fallback */
  category?: string;
  /** Custom className */
  className?: string;
  /** Show loading state */
  showLoading?: boolean;
  /** Custom fallback content */
  fallbackContent?: React.ReactNode;
  /** Whether to show border */
  bordered?: boolean;
  /** Aspect ratio */
  aspectRatio?: "square" | "video" | "portrait" | "auto";
  /** Click handler */
  onClick?: () => void;
}

const sizeClasses = {
  xs: "w-8 h-8",
  sm: "w-12 h-12",
  md: "w-16 h-16",
  lg: "w-24 h-24",
  xl: "w-32 h-32",
  full: "w-full h-full",
};

const aspectRatioClasses = {
  square: "aspect-square",
  video: "aspect-video",
  portrait: "aspect-[3/4]",
  auto: "",
};

/**
 * Professional thumbnail component for activity images
 * Handles loading states, error fallbacks, and different display modes
 */
export function ActivityThumbnail({
  src,
  alt = "Imagen de actividad",
  size = "md",
  category,
  className,
  showLoading = true,
  fallbackContent,
  bordered = false,
  aspectRatio = "square",
  onClick,
}: ActivityThumbnailProps) {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "error">(
    src ? "loading" : "error"
  );
  const [currentSrc, setCurrentSrc] = useState<string | null>(src || null);

  // Reset state when src changes
  useEffect(() => {
    if (src) {
      setImageState("loading");
      setCurrentSrc(src);
    } else {
      setImageState("error");
      setCurrentSrc(null);
    }
  }, [src]);

  const handleLoad = () => {
    console.log("[ActivityThumbnail] Image loaded successfully:", currentSrc?.substring(0, 50));
    setImageState("loaded");
  };

  const handleError = () => {
    console.log("[ActivityThumbnail] Image failed to load:", currentSrc?.substring(0, 50));
    // Try fallback
    if (currentSrc !== FALLBACK_IMAGES.activity) {
      setCurrentSrc(FALLBACK_IMAGES.activity);
      setImageState("loading");
    } else {
      setImageState("error");
    }
  };

  const categoryEmoji = category ? CATEGORY_EMOJI[category] : null;

  // Determine the wrapper classes
  const wrapperClasses = cn(
    "relative overflow-hidden rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 transition-all duration-300",
    sizeClasses[size],
    aspectRatio !== "auto" && aspectRatioClasses[aspectRatio],
    bordered && "border-2 border-border",
    onClick && "cursor-pointer hover:scale-105 hover:shadow-lg",
    className
  );

  // Render loading state
  if (imageState === "loading" && showLoading) {
    return (
      <div className={wrapperClasses} onClick={onClick}>
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-1/3 h-1/3 max-w-6 max-h-6 animate-spin text-primary/50" />
        </div>
        {/* Hidden image to trigger load */}
        {currentSrc && (
          <img
            src={currentSrc}
            alt={alt}
            className="opacity-0 w-full h-full object-cover"
            onLoad={handleLoad}
            onError={handleError}
          />
        )}
      </div>
    );
  }

  // Render error/fallback state
  if (imageState === "error" || !currentSrc) {
    return (
      <div className={wrapperClasses} onClick={onClick}>
        <div className="absolute inset-0 flex items-center justify-center">
          {fallbackContent ? (
            fallbackContent
          ) : categoryEmoji ? (
            <span className="text-2xl sm:text-3xl md:text-4xl">{categoryEmoji}</span>
          ) : (
            <ImageOff className="w-1/3 h-1/3 max-w-8 max-h-8 text-muted-foreground/40" />
          )}
        </div>
      </div>
    );
  }

  // Render loaded image
  return (
    <div className={wrapperClasses} onClick={onClick}>
      <img
        src={currentSrc}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
}

/**
 * Mini thumbnail for dashboard lists - compact with no rounded corners conflicts
 */
export function ActivityMiniThumbnail({
  src,
  alt = "Miniatura",
  category,
  className,
}: {
  src?: string | null;
  alt?: string;
  category?: string;
  className?: string;
}) {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const categoryEmoji = category ? CATEGORY_EMOJI[category] : "🎯";

  // Don't show image if no src or error
  if (!src || imageError) {
    return (
      <div
        className={cn(
          "w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center shrink-0",
          className
        )}
      >
        <span className="text-lg">{categoryEmoji}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted relative",
        className
      )}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground/50" />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover transition-opacity duration-300",
          isLoading ? "opacity-0" : "opacity-100"
        )}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.log("[MiniThumbnail] Image error:", src?.substring(0, 50));
          setImageError(true);
          setIsLoading(false);
        }}
        loading="lazy"
      />
    </div>
  );
}

/**
 * Image preview modal for full-size viewing
 */
export function ImagePreviewModal({
  src,
  alt,
  isOpen,
  onClose,
}: {
  src: string;
  alt?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div className="relative max-w-4xl max-h-[90vh] w-full">
        <img
          src={src}
          alt={alt || "Vista previa"}
          className="w-full h-full object-contain rounded-lg"
          onClick={(e) => e.stopPropagation()}
        />
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          ✕
        </button>
      </div>
    </div>
  );
}

/**
 * Helper to extract image URL from activity images array
 */
export function getActivityImageUrl(
  images?: Array<{ url?: string; name?: string } | string> | null
): string | null {
  if (!images || images.length === 0) return null;

  const firstImage = images[0];

  // Handle string URLs directly
  if (typeof firstImage === "string") {
    return firstImage;
  }

  // Handle object with url property
  if (firstImage && typeof firstImage === "object" && "url" in firstImage && firstImage.url) {
    return firstImage.url;
  }

  return null;
}

export default ActivityThumbnail;
