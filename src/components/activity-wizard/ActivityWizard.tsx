"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Upload,
  Loader2,
} from "lucide-react";
import type { ActivityFormData, SessionFormData, ActivityCategory, ActivityModality, Currency } from "@/types/database";

const STEPS = [
  { id: 1, title: "Datos básicos", description: "Título, categoría y edades", icon: BookOpen },
  { id: 2, title: "Imágenes", description: "Portada y galería", icon: ImagePlus },
  { id: 3, title: "Descripción", description: "Detalla tu actividad", icon: FileText },
  { id: 4, title: "Sesiones", description: "Fechas y precios", icon: Calendar },
  { id: 5, title: "Ubicación", description: "Dónde será la actividad", icon: MapPin },
];

const CATEGORIES: { value: ActivityCategory; label: string }[] = [
  { value: "ciencia", label: "Ciencia" },
  { value: "arte", label: "Arte" },
  { value: "musica", label: "Música" },
  { value: "naturaleza", label: "Naturaleza" },
  { value: "lectura", label: "Lectura" },
  { value: "experimentos", label: "Experimentos" },
];

const MODALITIES: { value: ActivityModality; label: string }[] = [
  { value: "presencial", label: "Presencial" },
  { value: "online", label: "Online" },
  { value: "en-casa", label: "En casa" },
];

interface ActivityWizardProps {
  onClose: () => void;
  onSuccess?: (activityId: string) => void;
  editData?: Partial<ActivityFormData & { _id: string }>;
}

export default function ActivityWizard({ onClose, onSuccess, editData }: ActivityWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    price_cents: 1500, // 15.00€
    currency: "eur" as Currency,
  });

  const updateFormData = <K extends keyof ActivityFormData>(key: K, value: ActivityFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const addSession = () => {
    if (newSession.start_date_time && newSession.end_date_time && newSession.capacity_total && newSession.price_cents !== undefined) {
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

      // Reset new session form
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

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.title && formData.category && formData.modality);
      case 2:
        return true; // Images are optional
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

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      // Build images array
      const images: { url: string; name: string }[] = [];
      if (coverImageUrl) {
        images.push({ url: coverImageUrl, name: "cover" });
      }
      galleryUrls.forEach((url, i) => {
        if (url) images.push({ url, name: `gallery-${i}` });
      });

      const payload = {
        ...formData,
        images: images.length > 0 ? images : undefined,
      };

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

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Título de la actividad *</Label>
              <Input
                id="title"
                value={formData.title || ""}
                onChange={(e) => updateFormData("title", e.target.value)}
                placeholder="Ej: Pequeños Científicos: El Mundo de las Moléculas"
                className="h-12"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select
                  value={formData.category}
                  onValueChange={(v) => updateFormData("category", v as ActivityCategory)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Modalidad *</Label>
                <Select
                  value={formData.modality}
                  onValueChange={(v) => updateFormData("modality", v as ActivityModality)}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue placeholder="Selecciona modalidad" />
                  </SelectTrigger>
                  <SelectContent>
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
                <Label htmlFor="age_min">Edad mínima</Label>
                <Input
                  id="age_min"
                  type="number"
                  min={0}
                  max={18}
                  value={formData.age_min || 3}
                  onChange={(e) => updateFormData("age_min", parseInt(e.target.value))}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="age_max">Edad máxima</Label>
                <Input
                  id="age_max"
                  type="number"
                  min={0}
                  max={18}
                  value={formData.age_max || 12}
                  onChange={(e) => updateFormData("age_max", parseInt(e.target.value))}
                  className="h-12"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Imagen de portada</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Pega la URL de una imagen para la portada de tu actividad
              </p>
              <Input
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                className="h-12"
              />
              {coverImageUrl && (
                <div className="mt-4 relative aspect-video rounded-xl overflow-hidden bg-muted">
                  <img
                    src={coverImageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = "https://placehold.co/800x450?text=Error+de+imagen";
                    }}
                  />
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Galería de imágenes (opcional)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Añade más imágenes para mostrar tu actividad
              </p>
              {galleryUrls.map((url, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <Input
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...galleryUrls];
                      newUrls[index] = e.target.value;
                      setGalleryUrls(newUrls);
                    }}
                    placeholder="URL de imagen"
                    className="h-10"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setGalleryUrls(galleryUrls.filter((_, i) => i !== index))}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGalleryUrls([...galleryUrls, ""])}
                className="mt-2"
              >
                <Plus className="w-4 h-4 mr-2" />
                Añadir imagen
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="short_description">Descripción corta *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Un resumen breve que aparecerá en las tarjetas de búsqueda (máx. 150 caracteres)
              </p>
              <Textarea
                id="short_description"
                value={formData.short_description || ""}
                onChange={(e) => updateFormData("short_description", e.target.value.slice(0, 150))}
                placeholder="Una actividad divertida donde los niños aprenderán..."
                rows={2}
              />
              <p className="text-xs text-muted-foreground text-right">
                {(formData.short_description || "").length}/150
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción completa *</Label>
              <p className="text-sm text-muted-foreground mb-2">
                Describe en detalle qué harán los niños, qué aprenderán, materiales incluidos, etc.
              </p>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) => updateFormData("description", e.target.value)}
                placeholder="En esta actividad los niños explorarán el fascinante mundo de..."
                rows={6}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirements">Requisitos (opcional)</Label>
              <p className="text-sm text-muted-foreground mb-2">
                ¿Necesitan traer algo? ¿Algún requisito previo?
              </p>
              <Textarea
                id="requirements"
                value={formData.requirements || ""}
                onChange={(e) => updateFormData("requirements", e.target.value)}
                placeholder="Los niños deben traer ropa cómoda..."
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="space-y-4">
              <Label>Sesiones programadas *</Label>
              <p className="text-sm text-muted-foreground">
                Añade al menos una sesión con fecha, horario, capacidad y precio
              </p>

              {/* Existing sessions */}
              {(formData.sessions || []).length > 0 && (
                <div className="space-y-3">
                  {(formData.sessions || []).map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-xl"
                    >
                      <div className="flex-1">
                        <p className="font-medium">
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
                          {session.capacity_total} plazas · {(session.price_cents / 100).toFixed(2)}€
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeSession(index)}
                        className="text-destructive"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              {/* Add new session form */}
              <Card className="border-dashed">
                <CardContent className="pt-6">
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Fecha y hora de inicio</Label>
                      <Input
                        type="datetime-local"
                        value={newSession.start_date_time || ""}
                        onChange={(e) => setNewSession({ ...newSession, start_date_time: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Fecha y hora de fin</Label>
                      <Input
                        type="datetime-local"
                        value={newSession.end_date_time || ""}
                        onChange={(e) => setNewSession({ ...newSession, end_date_time: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label>Capacidad (plazas)</Label>
                      <Input
                        type="number"
                        min={1}
                        value={newSession.capacity_total || 10}
                        onChange={(e) =>
                          setNewSession({ ...newSession, capacity_total: parseInt(e.target.value) })
                        }
                        className="h-10"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Precio (€)</Label>
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
                        className="h-10"
                      />
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addSession}
                    disabled={!newSession.start_date_time || !newSession.end_date_time}
                    className="w-full"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Añadir sesión
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {formData.modality === "online" ? (
              <div className="space-y-2">
                <Label htmlFor="online_link">Enlace de la sesión online *</Label>
                <p className="text-sm text-muted-foreground mb-2">
                  Enlace de Zoom, Meet, Teams u otra plataforma
                </p>
                <Input
                  id="online_link"
                  value={formData.online_link || ""}
                  onChange={(e) => updateFormData("online_link", e.target.value)}
                  placeholder="https://zoom.us/j/..."
                  className="h-12"
                />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="location_name">Nombre del lugar *</Label>
                  <Input
                    id="location_name"
                    value={formData.location_name || ""}
                    onChange={(e) => updateFormData("location_name", e.target.value)}
                    placeholder="Ej: Centro Cultural La Nave"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location_address">Dirección</Label>
                  <Input
                    id="location_address"
                    value={formData.location_address || ""}
                    onChange={(e) => updateFormData("location_address", e.target.value)}
                    placeholder="Calle Example 123"
                    className="h-12"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="city">Ciudad</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => updateFormData("city", e.target.value)}
                    placeholder="Madrid"
                    className="h-12"
                  />
                </div>
              </>
            )}

            <div className="space-y-2">
              <Label htmlFor="cancellation_policy">Política de cancelación (opcional)</Label>
              <Textarea
                id="cancellation_policy"
                value={formData.cancellation_policy || ""}
                onChange={(e) => updateFormData("cancellation_policy", e.target.value)}
                placeholder="Cancelación gratuita hasta 48h antes del evento..."
                rows={3}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl max-h-[90vh] overflow-hidden bg-background rounded-2xl shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              {editData?._id ? "Editar actividad" : "Crear nueva actividad"}
            </h2>
            <p className="text-sm text-muted-foreground">
              Paso {currentStep} de {STEPS.length}: {STEPS[currentStep - 1].description}
            </p>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Step indicators */}
        <div className="px-6 py-4 border-b shrink-0">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center transition-all
                      ${isActive ? "bg-primary text-white" : ""}
                      ${isCompleted ? "bg-accent text-white" : ""}
                      ${!isActive && !isCompleted ? "bg-muted text-muted-foreground" : ""}
                    `}
                  >
                    {isCompleted ? <Check className="w-5 h-5" /> : <Icon className="w-5 h-5" />}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-8 md:w-16 h-1 mx-1 md:mx-2 rounded ${
                        isCompleted ? "bg-accent" : "bg-muted"
                      }`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
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
            <div className="mt-4 p-4 bg-destructive/10 text-destructive rounded-xl">
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t flex items-center justify-between shrink-0">
          <Button
            variant="ghost"
            onClick={() => setCurrentStep((s) => Math.max(1, s - 1))}
            disabled={currentStep === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Anterior
          </Button>

          {currentStep < STEPS.length ? (
            <Button
              onClick={() => setCurrentStep((s) => Math.min(STEPS.length, s + 1))}
              disabled={!canProceed()}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              Siguiente
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="bg-gradient-to-r from-primary to-secondary"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  {editData?._id ? "Guardar cambios" : "Crear actividad"}
                </>
              )}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
