"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  BookOpen,
  ImagePlus,
  FileText,
  Calendar,
  MapPin,
  X,
  Plus,
  Trash2,
  Loader2,
  Upload,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  RotateCcw,
  Wand2,
  Eye,
  Zap,
  RefreshCw,
  Copy,
  Bot,
  Image as ImageIcon,
  Star,
  Rocket,
} from "lucide-react";
import type {
  ActivityFormData,
  SessionFormData,
  ActivityCategory,
  ActivityModality,
  Currency,
  PosterAnalysisResult,
  ExtractedEventData,
  ExtractedField,
  GeneratedEventContent,
} from "@/types/database";

// Step configuration with new AI poster step
const STEPS = [
  { id: 1, title: "Cartel del evento", description: "Sube el cartel y la IA lo analiza", icon: Sparkles },
  { id: 2, title: "Datos básicos", description: "Título, categoría y edades", icon: BookOpen },
  { id: 3, title: "Descripción", description: "Detalla tu actividad", icon: FileText },
  { id: 4, title: "Sesiones", description: "Fechas y precios", icon: Calendar },
  { id: 5, title: "Ubicación", description: "Dónde será la actividad", icon: MapPin },
];

const CATEGORIES: { value: ActivityCategory; label: string; color: string }[] = [
  { value: "ciencia", label: "Ciencia", color: "#3B82F6" },
  { value: "arte", label: "Arte", color: "#F97316" },
  { value: "musica", label: "Música", color: "#8B5CF6" },
  { value: "naturaleza", label: "Naturaleza", color: "#22C55E" },
  { value: "lectura", label: "Lectura", color: "#EAB308" },
  { value: "experimentos", label: "Experimentos", color: "#EC4899" },
];

const MODALITIES: { value: ActivityModality; label: string }[] = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
  { value: "en-casa", label: "En casa" },
];

// Confidence badge component with rainbow styling
function ConfidenceBadge({ confidence }: { confidence: number }) {
  if (confidence >= 0.8) {
    return (
      <Badge className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-xs border-0">
        <CheckCircle2 className="w-3 h-3 mr-1" />
        Alta
      </Badge>
    );
  }
  if (confidence >= 0.5) {
    return (
      <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs border-0">
        <AlertCircle className="w-3 h-3 mr-1" />
        Media
      </Badge>
    );
  }
  return (
    <Badge className="bg-gradient-to-r from-red-400 to-rose-500 text-white text-xs border-0">
      <AlertCircle className="w-3 h-3 mr-1" />
      Baja
    </Badge>
  );
}

// AI-filled indicator with rainbow pulse
function AIFilledIndicator() {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-flex items-center ml-2">
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Bot className="w-4 h-4 rainbow-text" />
            </motion.div>
          </span>
        </TooltipTrigger>
        <TooltipContent className="rainbow-border">
          <p className="flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Campo completado por IA
          </p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface AIActivityWizardProps {
  onClose: () => void;
  onSuccess?: (activityId: string) => void;
  editData?: Partial<ActivityFormData & { _id: string }>;
}

export default function AIActivityWizard({ onClose, onSuccess, editData }: AIActivityWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // AI Analysis state
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [posterPreviewUrl, setPosterPreviewUrl] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<PosterAnalysisResult | null>(null);
  const [uploadedFileId, setUploadedFileId] = useState<string | null>(null);
  const [aiFieldsApplied, setAiFieldsApplied] = useState<Set<string>>(new Set());
  const [preAiFormData, setPreAiFormData] = useState<Partial<ActivityFormData> | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form state
  const [formData, setFormData] = useState<Partial<ActivityFormData>>({
    title: editData?.title || "",
    category: editData?.category || undefined,
    age_min: editData?.age_min || 3,
    age_max: editData?.age_max || 12,
    modality: editData?.modality || "presencial",
    short_description: editData?.short_description || "",
    description: editData?.description || "",
    requirements: editData?.requirements || "",
    sessions: editData?.sessions || [],
    location_name: editData?.location_name || "",
    location_address: editData?.location_address || "",
    city: editData?.city || "",
    online_link: editData?.online_link || "",
    cancellation_policy: editData?.cancellation_policy || "",
  });

  const [coverImageUrl, setCoverImageUrl] = useState<string>("");
  const [galleryUrls, setGalleryUrls] = useState<string[]>([]);

  // Session being added
  const [newSession, setNewSession] = useState<Partial<SessionFormData>>({
    start_date_time: "",
    end_date_time: "",
    capacity_total: 10,
    price_cents: 1500,
    currency: "eur" as Currency,
  });

  const updateFormData = <K extends keyof ActivityFormData>(key: K, value: ActivityFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  // Handle file selection
  const handleFileSelect = useCallback((file: File) => {
    // Validate file type
    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      setError("Por favor, sube una imagen JPG, PNG o WebP");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("La imagen no puede superar los 10MB");
      return;
    }

    setError(null);
    setPosterFile(file);

    // Create preview URL
    const reader = new FileReader();
    reader.onload = (e) => {
      setPosterPreviewUrl(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Handle drag and drop
  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const file = e.dataTransfer.files[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Analyze poster with AI
  const analyzePostr = async () => {
    if (!posterFile) return;

    setIsAnalyzing(true);
    setAnalysisProgress(10);
    setError(null);

    // Save current form data before AI fills it
    setPreAiFormData({ ...formData });

    try {
      // Progress animation
      const progressInterval = setInterval(() => {
        setAnalysisProgress((prev) => Math.min(prev + 5, 85));
      }, 500);

      const uploadFormData = new FormData();
      uploadFormData.append("file", posterFile);

      console.log("[Wizard] Sending poster for analysis...");

      const response = await fetch("/api/analyze-poster", {
        method: "POST",
        body: uploadFormData,
      });

      clearInterval(progressInterval);
      setAnalysisProgress(90);

      const result = (await response.json()) as {
        ok: boolean;
        data?: PosterAnalysisResult;
        fileId?: string;
        error?: string;
      };

      if (!result.ok || !result.data) {
        throw new Error(result.error || "Error al analizar el cartel");
      }

      setAnalysisProgress(100);
      setAnalysisResult(result.data);
      setUploadedFileId(result.fileId || null);

      console.log("[Wizard] Analysis complete:", result.data);

      // Auto-apply high confidence fields
      autoApplyHighConfidenceFields(result.data);
    } catch (err) {
      console.error("[Wizard] Analysis error:", err);
      setError(err instanceof Error ? err.message : "Error desconocido al analizar");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Auto-apply fields with high confidence (>= 0.8)
  const autoApplyHighConfidenceFields = (result: PosterAnalysisResult) => {
    const newFormData = { ...formData };
    const appliedFields = new Set<string>();

    const { extractedData, generatedContent } = result;

    // Apply extracted fields
    if (extractedData.title.value && extractedData.title.confidence >= 0.8) {
      newFormData.title = extractedData.title.value;
      appliedFields.add("title");
    }

    if (extractedData.category.value && extractedData.category.confidence >= 0.7) {
      // Map extended category to ActivityCategory
      const catMapping: Record<string, ActivityCategory> = {
        ciencia: "ciencia",
        arte: "arte",
        musica: "musica",
        lectura: "lectura",
        naturaleza: "naturaleza",
        experimentos: "experimentos",
        deporte: "naturaleza",
        tecnologia: "ciencia",
        idiomas: "lectura",
        otra: "arte",
      };
      newFormData.category = catMapping[extractedData.category.value] || "arte";
      appliedFields.add("category");
    }

    if (extractedData.format.value && extractedData.format.confidence >= 0.7) {
      newFormData.modality = extractedData.format.value;
      appliedFields.add("modality");
    }

    if (extractedData.ageMin.value !== null && extractedData.ageMin.confidence >= 0.7) {
      newFormData.age_min = extractedData.ageMin.value;
      appliedFields.add("age_min");
    }

    if (extractedData.ageMax.value !== null && extractedData.ageMax.confidence >= 0.7) {
      newFormData.age_max = extractedData.ageMax.value;
      appliedFields.add("age_max");
    }

    if (extractedData.locationName.value && extractedData.locationName.confidence >= 0.7) {
      newFormData.location_name = extractedData.locationName.value;
      appliedFields.add("location_name");
    }

    if (extractedData.address.value && extractedData.address.confidence >= 0.7) {
      newFormData.location_address = extractedData.address.value;
      appliedFields.add("location_address");
    }

    if (extractedData.city.value && extractedData.city.confidence >= 0.7) {
      newFormData.city = extractedData.city.value;
      appliedFields.add("city");
    }

    // Apply generated content
    if (generatedContent.shortDescription) {
      newFormData.short_description = generatedContent.shortDescription;
      appliedFields.add("short_description");
    }

    if (generatedContent.description) {
      newFormData.description = generatedContent.description;
      appliedFields.add("description");
    }

    if (generatedContent.cancellationPolicy) {
      newFormData.cancellation_policy = generatedContent.cancellationPolicy;
      appliedFields.add("cancellation_policy");
    }

    // Build requirements from extracted data
    const requirements: string[] = [];
    if (extractedData.requirements.value) {
      requirements.push(...extractedData.requirements.value);
    }
    if (extractedData.materials.value) {
      requirements.push(`Materiales necesarios: ${extractedData.materials.value.join(", ")}`);
    }
    if (requirements.length > 0) {
      newFormData.requirements = requirements.join("\n");
      appliedFields.add("requirements");
    }

    // Create session from extracted date/time/price
    if (extractedData.dateStart.value) {
      // Build valid datetime-local format: YYYY-MM-DDTHH:MM
      const dateStr = extractedData.dateStart.value; // Already YYYY-MM-DD
      const timeStr = extractedData.timeStart.value || "10:00"; // Default to 10:00 if no time

      // Validate date format
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(dateStr)) {
        console.log("[Wizard] Invalid date format:", dateStr);
      } else {
        const startDateTime = `${dateStr}T${timeStr}`;
        let endDateTime = startDateTime;

        if (extractedData.timeEnd.value) {
          const endDateStr = extractedData.dateEnd.value || dateStr;
          endDateTime = `${endDateStr}T${extractedData.timeEnd.value}`;
        } else if (extractedData.durationMinutes.value) {
          try {
            const startDate = new Date(startDateTime);
            startDate.setMinutes(startDate.getMinutes() + extractedData.durationMinutes.value);
            // Format as YYYY-MM-DDTHH:MM for datetime-local input
            const year = startDate.getFullYear();
            const month = String(startDate.getMonth() + 1).padStart(2, "0");
            const day = String(startDate.getDate()).padStart(2, "0");
            const hours = String(startDate.getHours()).padStart(2, "0");
            const mins = String(startDate.getMinutes()).padStart(2, "0");
            endDateTime = `${year}-${month}-${day}T${hours}:${mins}`;
          } catch (e) {
            console.log("[Wizard] Error calculating end time:", e);
            // Default to 1 hour later
            const [h, m] = timeStr.split(":").map(Number);
            const endH = String((h + 1) % 24).padStart(2, "0");
            endDateTime = `${dateStr}T${endH}:${String(m).padStart(2, "0")}`;
          }
        } else {
          // Default to 1 hour duration
          const [h, m] = timeStr.split(":").map(Number);
          const endH = String((h + 1) % 24).padStart(2, "0");
          endDateTime = `${dateStr}T${endH}:${String(m).padStart(2, "0")}`;
        }

        // Parse price
        let priceCents = 1500; // Default
        if (extractedData.price.value) {
          const priceMatch = extractedData.price.value.match(/(\d+)[,.]?(\d{2})?/);
          if (priceMatch) {
            const euros = parseInt(priceMatch[1]);
            const cents = priceMatch[2] ? parseInt(priceMatch[2]) : 0;
            priceCents = euros * 100 + cents;
          }
          if (extractedData.price.value.toLowerCase().includes("gratis")) {
            priceCents = 0;
          }
        }

        const session: SessionFormData = {
          start_date_time: startDateTime,
          end_date_time: endDateTime,
          capacity_total: extractedData.capacity.value || 20,
          price_cents: priceCents,
          currency: "eur",
        };

        console.log("[Wizard] Created session from AI:", session);
        newFormData.sessions = [session];
        appliedFields.add("sessions");
      }
    }

    setFormData(newFormData);
    setAiFieldsApplied(appliedFields);
  };

  // Apply a specific field from AI
  const applyAIField = (fieldName: string, value: unknown) => {
    if (fieldName === "title") updateFormData("title", value as string);
    else if (fieldName === "category") updateFormData("category", value as ActivityCategory);
    else if (fieldName === "modality") updateFormData("modality", value as ActivityModality);
    else if (fieldName === "age_min") updateFormData("age_min", value as number);
    else if (fieldName === "age_max") updateFormData("age_max", value as number);
    else if (fieldName === "location_name") updateFormData("location_name", value as string);
    else if (fieldName === "location_address") updateFormData("location_address", value as string);
    else if (fieldName === "city") updateFormData("city", value as string);
    else if (fieldName === "short_description") updateFormData("short_description", value as string);
    else if (fieldName === "description") updateFormData("description", value as string);
    else if (fieldName === "requirements") updateFormData("requirements", value as string);
    else if (fieldName === "cancellation_policy") updateFormData("cancellation_policy", value as string);

    setAiFieldsApplied((prev) => new Set([...prev, fieldName]));
  };

  // Undo all AI changes
  const undoAIChanges = () => {
    if (preAiFormData) {
      setFormData(preAiFormData);
      setAiFieldsApplied(new Set());
    }
  };

  // Session management
  const addSession = () => {
    if (
      newSession.start_date_time &&
      newSession.end_date_time &&
      newSession.capacity_total &&
      newSession.price_cents !== undefined
    ) {
      const session: SessionFormData = {
        start_date_time: newSession.start_date_time,
        end_date_time: newSession.end_date_time,
        capacity_total: newSession.capacity_total,
        price_cents: newSession.price_cents,
        currency: newSession.currency || "eur",
      };

      setFormData((prev) => ({
        ...prev,
        sessions: [...(prev.sessions || []), session],
      }));

      setNewSession({
        start_date_time: "",
        end_date_time: "",
        capacity_total: 10,
        price_cents: 1500,
        currency: "eur",
      });
    }
  };

  const removeSession = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sessions: (prev.sessions || []).filter((_, i) => i !== index),
    }));
  };

  // Step validation
  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return true; // Poster upload is optional
      case 2:
        return !!(formData.title && formData.category && formData.modality);
      case 3:
        return !!(formData.short_description && formData.description);
      case 4:
        return (formData.sessions || []).length > 0;
      case 5:
        if (formData.modality === "online") {
          return !!formData.online_link;
        }
        return !!(formData.location_name || formData.location_address);
      default:
        return false;
    }
  };

  // Submit handler
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Build payload with poster image if uploaded
      const payload: Record<string, unknown> = {
        ...formData,
      };

      // If we have an uploaded poster file from AI analysis, include it
      if (uploadedFileId) {
        payload.posterFileId = uploadedFileId;
        console.log("[Wizard] Including poster image:", uploadedFileId);
      } else if (coverImageUrl) {
        // Fallback to URL-based images (legacy)
        const images: { url: string; name: string }[] = [];
        images.push({ url: coverImageUrl, name: "cover" });
        galleryUrls.forEach((url, i) => {
          if (url) images.push({ url, name: `gallery-${i}` });
        });
        if (images.length > 0) {
          payload.images = images;
        }
      }

      const url = editData?._id ? `/api/activities?activity_id=${editData._id}` : "/api/activities";
      const method = editData?._id ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = (await response.json()) as { ok: boolean; data?: { _id: string }; error?: string };

      if (!result.ok) {
        throw new Error(typeof result.error === "string" ? result.error : "Error al guardar la actividad");
      }

      // Create sessions for new activity
      if (!editData?._id && result.data?._id && formData.sessions) {
        for (const session of formData.sessions) {
          await fetch("/api/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              activity: result.data._id,
              ...session,
            }),
          });
        }
      }

      onSuccess?.(result.data?._id || "");
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render AI extraction panel with rainbow styling
  const renderAIExtractionPanel = () => {
    if (!analysisResult) return null;

    const { extractedData, generatedContent, processingMetadata } = analysisResult;

    const fields = [
      { key: "title", label: "Título", value: extractedData.title },
      { key: "category", label: "Categoría", value: extractedData.category },
      { key: "age_min", label: "Edad mínima", value: extractedData.ageMin },
      { key: "age_max", label: "Edad máxima", value: extractedData.ageMax },
      { key: "dateStart", label: "Fecha", value: extractedData.dateStart },
      { key: "timeStart", label: "Hora inicio", value: extractedData.timeStart },
      { key: "timeEnd", label: "Hora fin", value: extractedData.timeEnd },
      { key: "location_name", label: "Lugar", value: extractedData.locationName },
      { key: "city", label: "Ciudad", value: extractedData.city },
      { key: "price", label: "Precio", value: extractedData.price },
      { key: "capacity", label: "Aforo", value: extractedData.capacity },
    ];

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 rainbow-border rainbow-border-animated rounded-2xl p-1"
      >
        <div className="bg-card rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rainbow-button rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground rainbow-text">Datos detectados por IA</h4>
                <p className="text-xs text-muted-foreground">
                  Confianza promedio: {Math.round(processingMetadata.confidenceScore * 100)}%
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={undoAIChanges}
              className="text-destructive hover:bg-destructive/10"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Deshacer todo
            </Button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {fields
              .filter((f) => f.value.value !== null)
              .map((field) => (
                <div
                  key={field.key}
                  className={`p-3 rounded-xl border-2 transition-all ${
                    aiFieldsApplied.has(field.key)
                      ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200"
                      : "bg-white border-gray-200 hover:border-primary/30"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">{field.label}</span>
                    <ConfidenceBadge confidence={field.value.confidence} />
                  </div>
                  <p className="font-medium text-sm text-foreground truncate">
                    {String(field.value.value)}
                  </p>
                  {!aiFieldsApplied.has(field.key) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 h-7 text-xs rainbow-border-thin hover:bg-primary/5"
                      onClick={() => applyAIField(field.key, field.value.value)}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Aplicar
                    </Button>
                  )}
                </div>
              ))}
          </div>

          {/* Generated content preview */}
          <div className="mt-4 pt-4 border-t border-primary/10">
            <h5 className="font-medium text-sm mb-2 flex items-center gap-2">
              <Wand2 className="w-4 h-4 rainbow-text" />
              <span className="rainbow-text">Contenido generado</span>
            </h5>
            <div className="space-y-2">
              <div className="p-3 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-xl border border-primary/10">
                <p className="text-xs text-muted-foreground mb-1">Descripción corta</p>
                <p className="text-sm">{generatedContent.shortDescription}</p>
                {!aiFieldsApplied.has("short_description") && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2 h-7 text-xs"
                    onClick={() => applyAIField("short_description", generatedContent.shortDescription)}
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Usar esta descripción
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  };

  // Render step content with rainbow styling
  const renderStepContent = () => {
    switch (currentStep) {
      // Step 1: Poster Upload + AI Analysis
      case 1:
        return (
          <div className="space-y-6">
            {/* Drop zone with rainbow border */}
            <div
              className={`
                relative rounded-2xl p-8 text-center transition-all overflow-hidden
                ${posterPreviewUrl ? "rainbow-border rainbow-border-animated" : "border-2 border-dashed border-muted-foreground/30 hover:border-primary/50"}
              `}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {posterPreviewUrl ? (
                <div className="space-y-4 bg-card rounded-xl p-4">
                  <div className="relative w-full max-w-md mx-auto aspect-[3/4] rounded-xl overflow-hidden shadow-xl rainbow-glow">
                    <img
                      src={posterPreviewUrl}
                      alt="Vista previa del cartel"
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="secondary"
                      size="icon"
                      className="absolute top-2 right-2 rounded-xl"
                      onClick={() => {
                        setPosterFile(null);
                        setPosterPreviewUrl(null);
                        setAnalysisResult(null);
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  {!isAnalyzing && !analysisResult && (
                    <Button
                      size="lg"
                      className="rainbow-button rounded-xl font-semibold"
                      onClick={analyzePostr}
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Analizar con IA Mágica
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-4 rainbow-hero rounded-xl p-8">
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-24 h-24 mx-auto rainbow-button rounded-2xl flex items-center justify-center shadow-xl"
                  >
                    <Upload className="w-12 h-12 text-white" />
                  </motion.div>
                  <div>
                    <h3 className="font-bold text-xl text-foreground rainbow-text-animated">
                      Arrastra el cartel del evento aquí
                    </h3>
                    <p className="text-muted-foreground mt-2">
                      o haz clic para seleccionar un archivo
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      JPG, PNG o WebP • Máximo 10MB
                    </p>
                    <p className="text-xs text-yellow-600 mt-1">
                      ⚠️ Los enlaces de Google Drive no funcionan directamente. Descarga la imagen primero.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="rounded-xl rainbow-border-thin"
                  >
                    <ImageIcon className="w-4 h-4 mr-2" />
                    Seleccionar imagen
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileSelect(file);
                    }}
                  />
                </div>
              )}
            </div>

            {/* Analysis progress with rainbow styling */}
            {isAnalyzing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4 p-6 rainbow-border rainbow-border-animated rounded-2xl"
              >
                <div className="bg-card rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    >
                      <Sparkles className="w-6 h-6 rainbow-text" />
                    </motion.div>
                    <span className="font-medium text-foreground">
                      La magia de la IA está trabajando...
                    </span>
                  </div>
                  <div className="relative h-3 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className="absolute inset-y-0 left-0 rainbow-button"
                      initial={{ width: "0%" }}
                      animate={{ width: `${analysisProgress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-2">
                    <span>Extrayendo texto</span>
                    <span>Interpretando datos</span>
                    <span>Generando contenido</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* AI Extraction panel */}
            {analysisResult && renderAIExtractionPanel()}

            {/* Skip option */}
            {!posterFile && (
              <div className="text-center pt-4 border-t">
                <p className="text-sm text-muted-foreground mb-2">
                  ¿No tienes un cartel? No hay problema
                </p>
                <Button variant="ghost" onClick={() => setCurrentStep(2)} className="rainbow-text">
                  Continuar sin cartel
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            )}
          </div>
        );

      // Step 2: Basic data
      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title" className="flex items-center text-foreground font-medium">
                Título de la actividad *
                {aiFieldsApplied.has("title") && <AIFilledIndicator />}
              </Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="Ej: Pequeños Científicos: El Mundo de las Moléculas"
                className="h-12 rounded-xl border-2 focus:border-primary focus:ring-primary/20"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="flex items-center text-foreground font-medium">
                  Categoría *
                  {aiFieldsApplied.has("category") && <AIFilledIndicator />}
                </Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => updateFormData("category", v as ActivityCategory)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-2">
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat.color }}
                          />
                          {cat.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="flex items-center text-foreground font-medium">
                  Modalidad *
                  {aiFieldsApplied.has("modality") && <AIFilledIndicator />}
                </Label>
                <Select
                  value={formData.modality}
                  onValueChange={(v) => updateFormData("modality", v as ActivityModality)}
                >
                  <SelectTrigger className="h-12 rounded-xl border-2">
                    <SelectValue placeholder="Selecciona modalidad" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {MODALITIES.map((mod) => (
                      <SelectItem key={mod.value} value={mod.value}>
                        {mod.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age_min" className="flex items-center text-foreground font-medium">
                  Edad mínima
                  {aiFieldsApplied.has("age_min") && <AIFilledIndicator />}
                </Label>
                <Input
                  id="age_min"
                  type="number"
                  min={0}
                  max={18}
                  value={formData.age_min || 3}
                  onChange={(e) => updateFormData("age_min", parseInt(e.target.value))}
                  className="h-12 rounded-xl border-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age_max" className="flex items-center text-foreground font-medium">
                  Edad máxima
                  {aiFieldsApplied.has("age_max") && <AIFilledIndicator />}
                </Label>
                <Input
                  id="age_max"
                  type="number"
                  min={0}
                  max={18}
                  value={formData.age_max || 12}
                  onChange={(e) => updateFormData("age_max", parseInt(e.target.value))}
                  className="h-12 rounded-xl border-2"
                />
              </div>
            </div>
          </div>
        );

      // Step 3: Description
      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="short_description" className="flex items-center text-foreground font-medium">
                Descripción corta *
                {aiFieldsApplied.has("short_description") && <AIFilledIndicator />}
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Un resumen breve que aparecerá en las tarjetas de búsqueda (máx. 150 caracteres)
              </p>
              <Textarea
                id="short_description"
                value={formData.short_description || ""}
                onChange={(e) => updateFormData("short_description", e.target.value.slice(0, 150))}
                placeholder="Una actividad divertida donde los niños aprenderán..."
                rows={2}
                className="rounded-xl border-2"
              />
              <p className="text-xs text-muted-foreground text-right">
                {(formData.short_description || "").length}/150
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description" className="flex items-center text-foreground font-medium">
                Descripción completa *
                {aiFieldsApplied.has("description") && <AIFilledIndicator />}
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                Describe en detalle qué harán los niños, qué aprenderán, materiales incluidos, etc.
              </p>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="En esta actividad los niños explorarán el fascinante mundo de..."
                rows={6}
                className="rounded-xl border-2"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements" className="flex items-center text-foreground font-medium">
                Requisitos (opcional)
                {aiFieldsApplied.has("requirements") && <AIFilledIndicator />}
              </Label>
              <p className="text-sm text-muted-foreground mb-2">
                ¿Necesitan traer algo? ¿Algún requisito previo?
              </p>
              <Textarea
                id="requirements"
                value={formData.requirements || ""}
                onChange={(e) => updateFormData("requirements", e.target.value)}
                placeholder="Los niños deben traer ropa cómoda..."
                rows={3}
                className="rounded-xl border-2"
              />
            </div>

            {/* Show AI-generated highlights if available */}
            {analysisResult?.generatedContent.bulletHighlights && (
              <Card className="rainbow-card-accent border-2">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Wand2 className="w-4 h-4 rainbow-text" />
                    <span className="rainbow-text">Puntos destacados sugeridos por IA</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {analysisResult.generatedContent.bulletHighlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <CheckCircle2 className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 rainbow-border-thin"
                    onClick={() => {
                      const bullets = analysisResult.generatedContent.bulletHighlights
                        .map((b) => `• ${b}`)
                        .join("\n");
                      updateFormData(
                        "description",
                        (formData.description || "") + "\n\n" + bullets
                      );
                    }}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Añadir a descripción
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        );

      // Step 4: Sessions
      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label className="flex items-center text-foreground font-medium">
                Sesiones programadas *
                {aiFieldsApplied.has("sessions") && <AIFilledIndicator />}
              </Label>
              <p className="text-sm text-muted-foreground">
                Añade al menos una sesión con fecha, horario, capacidad y precio
              </p>

              {/* Existing sessions */}
              {(formData.sessions || []).length > 0 && (
                <div className="space-y-3">
                  {(formData.sessions || []).map((session, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="flex items-center justify-between p-4 rainbow-card-accent bg-card rounded-xl border-2"
                    >
                      <div className="flex-1">
                        <p className="font-semibold text-foreground">
                          {new Date(session.start_date_time).toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(session.start_date_time).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" - "}
                          {new Date(session.end_date_time).toLocaleTimeString("es-ES", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                          {" · "}
                          {session.capacity_total} plazas ·{" "}
                          <span className="rainbow-text font-semibold">
                            {session.price_cents === 0 ? "Gratis" : `${(session.price_cents / 100).toFixed(2)}€`}
                          </span>
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSession(index)}
                        className="text-destructive hover:bg-destructive/10 rounded-xl"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add new session form */}
              <Card className="border-2 border-dashed border-primary/30 rounded-xl">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Fecha y hora de inicio</Label>
                      <Input
                        type="datetime-local"
                        value={newSession.start_date_time || ""}
                        onChange={(e) =>
                          setNewSession({ ...newSession, start_date_time: e.target.value })
                        }
                        className="h-12 rounded-xl border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Fecha y hora de fin</Label>
                      <Input
                        type="datetime-local"
                        value={newSession.end_date_time || ""}
                        onChange={(e) =>
                          setNewSession({ ...newSession, end_date_time: e.target.value })
                        }
                        className="h-12 rounded-xl border-2"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Capacidad (plazas)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={newSession.capacity_total || 10}
                        onChange={(e) =>
                          setNewSession({ ...newSession, capacity_total: parseInt(e.target.value) })
                        }
                        className="h-12 rounded-xl border-2"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground font-medium">Precio (€)</Label>
                      <Input
                        type="number"
                        min={0}
                        step={0.01}
                        value={((newSession.price_cents || 0) / 100).toFixed(2)}
                        onChange={(e) =>
                          setNewSession({
                            ...newSession,
                            price_cents: Math.round(parseFloat(e.target.value) * 100),
                          })
                        }
                        className="h-12 rounded-xl border-2"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSession}
                    disabled={!newSession.start_date_time || !newSession.end_date_time}
                    className="w-full rounded-xl rainbow-border-thin h-12 font-medium"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir sesión
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      // Step 5: Location
      case 5:
        return (
          <div className="space-y-6">
            {formData.modality === "online" ? (
              <div className="space-y-2">
                <Label htmlFor="online_link" className="text-foreground font-medium">
                  Enlace de la sesión online *
                </Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Enlace de Zoom, Meet, Teams u otra plataforma
                </p>
                <Input
                  id="online_link"
                  value={formData.online_link || ""}
                  onChange={(e) => updateFormData("online_link", e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="h-12 rounded-xl border-2"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="location_name" className="flex items-center text-foreground font-medium">
                    Nombre del lugar *
                    {aiFieldsApplied.has("location_name") && <AIFilledIndicator />}
                  </Label>
                  <Input
                    id="location_name"
                    value={formData.location_name || ""}
                    onChange={(e) => updateFormData("location_name", e.target.value)}
                    placeholder="Ej: Centro Cultural La Nave"
                    className="h-12 rounded-xl border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_address" className="flex items-center text-foreground font-medium">
                    Dirección
                    {aiFieldsApplied.has("location_address") && <AIFilledIndicator />}
                  </Label>
                  <Input
                    id="location_address"
                    value={formData.location_address || ""}
                    onChange={(e) => updateFormData("location_address", e.target.value)}
                    placeholder="Calle Example 123"
                    className="h-12 rounded-xl border-2"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city" className="flex items-center text-foreground font-medium">
                    Ciudad
                    {aiFieldsApplied.has("city") && <AIFilledIndicator />}
                  </Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    placeholder="Madrid"
                    className="h-12 rounded-xl border-2"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="cancellation_policy" className="flex items-center text-foreground font-medium">
                Política de cancelación
                {aiFieldsApplied.has("cancellation_policy") && <AIFilledIndicator />}
              </Label>
              <Textarea
                id="cancellation_policy"
                value={formData.cancellation_policy || ""}
                onChange={(e) => updateFormData("cancellation_policy", e.target.value)}
                placeholder="Cancelación gratuita hasta 48h antes del evento..."
                rows={3}
                className="rounded-xl border-2"
              />
            </div>

            {/* Preview card with rainbow styling */}
            <Card className="rainbow-border rainbow-border-animated rounded-2xl p-1">
              <div className="bg-card rounded-xl">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Eye className="w-5 h-5 rainbow-text" />
                    <span className="rainbow-text">Vista previa de la actividad</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <h3 className="font-bold text-xl text-foreground">{formData.title || "Título de tu actividad"}</h3>
                    <div className="flex flex-wrap gap-2">
                      {formData.category && (
                        <Badge className="rainbow-button text-white capitalize">
                          {formData.category}
                        </Badge>
                      )}
                      <Badge variant="outline" className="rounded-full">
                        {formData.age_min}-{formData.age_max} años
                      </Badge>
                      <Badge variant="outline" className="capitalize rounded-full">
                        {formData.modality}
                      </Badge>
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {formData.short_description || "Tu descripción corta aparecerá aquí..."}
                    </p>
                    {formData.location_name && (
                      <p className="text-sm flex items-center gap-1">
                        <MapPin className="w-4 h-4 rainbow-text" />
                        {formData.location_name}
                        {formData.city && `, ${formData.city}`}
                      </p>
                    )}
                    {(formData.sessions || []).length > 0 && (
                      <p className="text-sm flex items-center gap-1">
                        <Calendar className="w-4 h-4 rainbow-text" />
                        {(formData.sessions || []).length} sesión(es) programada(s)
                      </p>
                    )}
                  </div>
                </CardContent>
              </div>
            </Card>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl flex flex-col rainbow-glow"
      >
        {/* Header with rainbow styling */}
        <div className="p-6 border-b relative rainbow-hero">
          <div className="absolute bottom-0 left-0 right-0 h-[3px] rainbow-line-animated" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.8 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
                className="w-14 h-14 rainbow-button rounded-xl flex items-center justify-center shadow-xl"
              >
                <Sparkles className="w-7 h-7 text-white" />
              </motion.div>
              <div>
                <h2 className="text-xl font-bold rainbow-text">
                  {editData?._id ? "Editar actividad" : "Crear nueva actividad"}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {currentStep === 1
                    ? "Sube el cartel y deja que la magia de la IA te ayude"
                    : `Paso ${currentStep} de ${STEPS.length}: ${STEPS[currentStep - 1].description}`}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="rounded-xl hover:bg-destructive/10 hover:text-destructive"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Step indicators with rainbow styling */}
        <div className="px-6 py-4 border-b bg-muted/30">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            if (isCompleted || isActive) setCurrentStep(step.id);
                          }}
                          className={`
                            w-12 h-12 rounded-xl flex items-center justify-center transition-all cursor-pointer
                            ${isActive ? "rainbow-button shadow-lg scale-110" : ""}
                            ${isCompleted ? "bg-accent text-white shadow-md" : ""}
                            ${!isActive && !isCompleted ? "bg-muted text-muted-foreground hover:bg-muted/80" : ""}
                          `}
                        >
                          {isCompleted ? (
                            <Check className="w-5 h-5" />
                          ) : (
                            <Icon className={`w-5 h-5 ${isActive ? "text-white" : ""}`} />
                          )}
                        </button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{step.title}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-8 md:w-16 h-1 mx-2 rounded-full transition-colors ${
                        isCompleted ? "rainbow-button" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Poster preview sidebar for steps 2-5 */}
        <div className="flex-1 flex overflow-hidden">
          {/* Poster preview (sticky sidebar) */}
          {posterPreviewUrl && currentStep > 1 && (
            <div className="hidden lg:block w-52 shrink-0 border-r bg-muted/30 p-4">
              <div className="sticky top-4">
                <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                  <ImageIcon className="w-3 h-3" />
                  Cartel subido
                </p>
                <div className="aspect-[3/4] rounded-xl overflow-hidden shadow-lg rainbow-border p-0.5">
                  <img
                    src={posterPreviewUrl}
                    alt="Cartel"
                    className="w-full h-full object-cover rounded-lg"
                  />
                </div>
                {analysisResult && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 p-3 rainbow-card-accent rounded-xl bg-card"
                  >
                    <p className="text-xs font-medium flex items-center gap-1 rainbow-text">
                      <Sparkles className="w-3 h-3" />
                      IA aplicada
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {aiFieldsApplied.size} campos autocompletados
                    </p>
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 overflow-y-auto p-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
              >
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 p-4 bg-destructive/10 text-destructive rounded-xl flex items-center gap-2 border border-destructive/20"
              >
                <AlertCircle className="w-5 h-5 shrink-0" />
                {error}
              </motion.div>
            )}
          </div>
        </div>

        {/* Footer with rainbow styling */}
        <div className="p-6 border-t bg-muted/30 flex items-center justify-between relative">
          <div className="absolute top-0 left-0 right-0 h-[2px] rainbow-line opacity-40" />
          <Button
            variant="ghost"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
            className="rounded-xl"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          <div className="flex items-center gap-3">
            {/* Save draft button */}
            <Button variant="outline" onClick={onClose} className="rounded-xl rainbow-border-thin">
              Guardar borrador
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={() => setCurrentStep((s) => Math.min(STEPS.length, s + 1))}
                disabled={!canProceed() && currentStep !== 1}
                className="rainbow-button rounded-xl font-semibold"
              >
                {currentStep === 1 && posterFile && !analysisResult ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2" />
                    Analizar y continuar
                  </>
                ) : (
                  <>
                    Siguiente
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canProceed() || isSubmitting}
                className="rainbow-button rounded-xl font-semibold"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Publicando...
                  </>
                ) : (
                  <>
                    <Rocket className="w-4 h-4 mr-2" />
                    Publicar actividad
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
