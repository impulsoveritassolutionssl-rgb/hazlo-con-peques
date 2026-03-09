"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { signUp } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Building2, Users, ArrowRight, ArrowLeft, CheckCircle, Sparkles, Star, Rocket, Palette, Heart } from "lucide-react";
import type { UserRole } from "@/types/database";

type RegisterableRole = "organizador" | "padre";

const roleInfo: Record<RegisterableRole, { icon: React.ReactNode; title: string; description: string; color: string; bgColor: string; rainbowIndex: number }> = {
  organizador: {
    icon: <Building2 className="w-8 h-8" />,
    title: "Organizador",
    description: "Publica actividades y talleres para niños. Gestiona reservas y haz crecer tu negocio.",
    color: "text-secondary",
    bgColor: "bg-secondary/10 border-secondary/30 hover:border-secondary",
    rainbowIndex: 1,
  },
  padre: {
    icon: <Users className="w-8 h-8" />,
    title: "Padre / Madre",
    description: "Encuentra actividades para tus hijos. Reserva y sigue su progreso de aprendizaje.",
    color: "text-primary",
    bgColor: "bg-primary/10 border-primary/30 hover:border-primary",
    rainbowIndex: 5,
  },
};

export default function RegistroPage() {
  const [step, setStep] = useState<"role" | "form">("role");
  const [selectedRole, setSelectedRole] = useState<RegisterableRole | null>(null);
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    lastName: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelect = (role: RegisterableRole) => {
    setSelectedRole(role);
    setStep("form");
  };

  const handleBack = () => {
    setStep("role");
    setError("");
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Las contraseñas no coinciden");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      setLoading(false);
      return;
    }

    if (!selectedRole) {
      setError("Por favor selecciona un tipo de cuenta");
      setLoading(false);
      return;
    }

    try {
      console.log("Registering user with role:", selectedRole);

      // Use fetch to call the signup endpoint directly with custom fields
      const result = await signUp.email(
        {
          email: formData.email,
          password: formData.password,
          name: formData.name,
        },
        {
          body: {
            role: selectedRole,
            last_name: formData.lastName,
            status: "active",
          } as Record<string, string>,
        }
      );

      console.log("Registration result:", result);

      if (result.error) {
        setError(result.error.message || "Error al registrar. El email podría estar en uso.");
        setLoading(false);
        return;
      }

      // Set role cookie for middleware to use
      document.cookie = `user_role=${selectedRole}; path=/; max-age=${60 * 60 * 24 * 7}`;

      // Redirect based on role
      const dashboardUrl = selectedRole === "organizador"
        ? "/dashboard/organizador"
        : "/dashboard/padre";

      // Use window.location for a full page reload to ensure session cookie is picked up
      setTimeout(() => {
        window.location.href = dashboardUrl;
      }, 500);
    } catch (err: unknown) {
      console.error("Registration error:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al registrar. El email podría estar en uso.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 rainbow-hero rainbow-blobs relative overflow-hidden">
      {/* Decorative floating elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute top-20 left-[10%] text-secondary"
          animate={{ y: [0, -15, 0], rotate: [0, 10, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          <Rocket className="w-10 h-10 opacity-30" />
        </motion.div>
        <motion.div
          className="absolute top-32 right-[15%] text-primary"
          animate={{ y: [0, 12, 0], rotate: [0, -15, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Star className="w-8 h-8 opacity-30" />
        </motion.div>
        <motion.div
          className="absolute bottom-32 left-[15%] text-accent"
          animate={{ y: [0, -10, 0], x: [0, 8, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Palette className="w-9 h-9 opacity-25" />
        </motion.div>
        <motion.div
          className="absolute bottom-24 right-[10%] text-secondary"
          animate={{ y: [0, 15, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <Heart className="w-8 h-8 opacity-25" />
        </motion.div>
        <motion.div
          className="absolute top-[50%] left-[5%]"
          animate={{ y: [0, -8, 0], rotate: [0, 360] }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-7 h-7 text-primary opacity-30" />
        </motion.div>
        <motion.div
          className="absolute top-[40%] right-[5%]"
          animate={{ y: [0, 10, 0], rotate: [0, -360] }}
          transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        >
          <Sparkles className="w-6 h-6 text-accent opacity-25" />
        </motion.div>

        {/* Floating colored circles */}
        <motion.div
          className="absolute top-16 left-[25%] w-12 h-12 rounded-full bg-[var(--rainbow-1)]/10"
          animate={{ y: [0, -20, 0], scale: [1, 1.2, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-40 right-[20%] w-10 h-10 rounded-full bg-[var(--rainbow-3)]/10"
          animate={{ y: [0, 15, 0], x: [0, -10, 0] }}
          transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-40 left-[30%] w-14 h-14 rounded-full bg-[var(--rainbow-5)]/10"
          animate={{ y: [0, -12, 0], x: [0, 10, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 right-[25%] w-8 h-8 rounded-full bg-[var(--rainbow-7)]/10"
          animate={{ y: [0, 18, 0], scale: [1, 1.3, 1] }}
          transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="w-full max-w-lg relative z-10">
        <AnimatePresence mode="wait">
          {step === "role" ? (
            <motion.div
              key="role-selection"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-2xl border-2 rainbow-card-accent rainbow-glow bg-white/95 backdrop-blur-sm">
                <CardHeader className="space-y-3 text-center pb-6">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                    className="mx-auto w-16 h-16 rainbow-button rounded-2xl flex items-center justify-center shadow-lg"
                  >
                    <Sparkles className="w-8 h-8 text-white" />
                  </motion.div>
                  <CardTitle className="text-3xl font-bold tracking-tight">
                    ¡Únete a{" "}
                    <span className="rainbow-text-animated">
                      Peques
                    </span>
                    !
                  </CardTitle>
                  <CardDescription className="text-base">
                    Selecciona el tipo de cuenta que deseas crear
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(Object.entries(roleInfo) as [RegisterableRole, typeof roleInfo[RegisterableRole]][]).map(([role, info], index) => (
                    <motion.button
                      key={role}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * index }}
                      onClick={() => handleRoleSelect(role)}
                      className={`w-full p-6 rounded-xl border-2 text-left transition-all duration-300 ${info.bgColor} hover:shadow-lg hover:scale-[1.02] rainbow-ring group`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl bg-white shadow-md ${info.color} group-hover:shadow-lg transition-shadow`}>
                          {info.icon}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-foreground mb-1">{info.title}</h3>
                          <p className="text-sm text-muted-foreground">{info.description}</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground mt-1 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
                  ))}
                </CardContent>
                <CardFooter className="flex flex-col space-y-4 pt-4">
                  <div className="rainbow-line-thin w-24 mx-auto mb-2" />
                  <div className="text-sm text-center text-muted-foreground">
                    ¿Ya tienes cuenta?{" "}
                    <Link href="/login" className="font-semibold rainbow-text hover:underline transition-colors rainbow-underline">
                      Inicia sesión aquí
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            </motion.div>
          ) : (
            <motion.div
              key="registration-form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="shadow-2xl border-2 rainbow-card-accent rainbow-glow bg-white/95 backdrop-blur-sm">
                <CardHeader className="space-y-3 pb-6">
                  <button
                    onClick={handleBack}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit group"
                  >
                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Cambiar tipo de cuenta
                  </button>

                  {selectedRole && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-xl rainbow-border-thin ${roleInfo[selectedRole].bgColor.split(" ")[0]}`}
                    >
                      <div className={`p-2 rounded-lg bg-white shadow-sm ${roleInfo[selectedRole].color}`}>
                        {roleInfo[selectedRole].icon}
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Creando cuenta como</p>
                        <p className="font-semibold text-foreground">{roleInfo[selectedRole].title}</p>
                      </div>
                      <CheckCircle className={`w-5 h-5 ml-auto ${roleInfo[selectedRole].color}`} />
                    </motion.div>
                  )}

                  <CardTitle className="text-2xl font-bold tracking-tight pt-2">
                    <span className="rainbow-text">Completa</span> tu registro
                  </CardTitle>
                </CardHeader>

                <form onSubmit={handleRegister}>
                  <CardContent className="space-y-4">
                    {error && (
                      <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                        <AlertDescription>{error}</AlertDescription>
                      </Alert>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm font-semibold">Nombre</Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Tu nombre"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                          className="h-11 transition-all focus:ring-2 focus:ring-[var(--rainbow-5)]/30 focus:border-[var(--rainbow-5)]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="lastName" className="text-sm font-semibold">Apellidos</Label>
                        <Input
                          id="lastName"
                          type="text"
                          placeholder="Tus apellidos"
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="h-11 transition-all focus:ring-2 focus:ring-[var(--rainbow-5)]/30 focus:border-[var(--rainbow-5)]"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email" className="text-sm font-semibold">Correo electrónico</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="tu@email.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                        className="h-11 transition-all focus:ring-2 focus:ring-[var(--rainbow-5)]/30 focus:border-[var(--rainbow-5)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="password" className="text-sm font-semibold">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        placeholder="Mínimo 6 caracteres"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                        minLength={6}
                        className="h-11 transition-all focus:ring-2 focus:ring-[var(--rainbow-5)]/30 focus:border-[var(--rainbow-5)]"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirmar contraseña</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="Repite la contraseña"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        required
                        minLength={6}
                        className="h-11 transition-all focus:ring-2 focus:ring-[var(--rainbow-5)]/30 focus:border-[var(--rainbow-5)]"
                      />
                    </div>
                  </CardContent>

                  <CardFooter className="flex flex-col space-y-4 pt-4">
                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-semibold transition-all rainbow-button"
                      disabled={loading}
                    >
                      {loading ? "Creando cuenta..." : "Crear cuenta"}
                    </Button>

                    <div className="rainbow-line-thin w-16 mx-auto my-2" />

                    <p className="text-xs text-center text-muted-foreground">
                      Al registrarte, aceptas nuestros{" "}
                      <Link href="/terms-of-service" className="rainbow-text hover:underline">
                        Términos de servicio
                      </Link>{" "}
                      y{" "}
                      <Link href="/privacy-policy" className="rainbow-text hover:underline">
                        Política de privacidad
                      </Link>
                    </p>
                  </CardFooter>
                </form>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
