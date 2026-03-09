"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { KeyRound, CheckCircle, ArrowLeft } from "lucide-react";

function ResetForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setLoading(true);

    try {
      // For now, we'll show a success message
      // In production, this would call the actual password reset API
      // await authClient.resetPassword({ token, newPassword: password });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al restablecer la contraseña. El enlace podría haber expirado.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-2">
            <CardHeader className="space-y-3 text-center pb-6">
              <CardTitle className="text-2xl font-bold tracking-tight text-destructive">
                Enlace inválido
              </CardTitle>
              <CardDescription className="text-base">
                El enlace de recuperación no es válido o ha expirado. Por favor, solicita uno nuevo.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Link href="/recuperar" className="w-full">
                <Button
                  className="w-full h-11 transition-all hover:scale-[1.02]"
                >
                  Solicitar nuevo enlace
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border-2">
            <CardHeader className="space-y-3 text-center pb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-2xl flex items-center justify-center shadow-lg"
              >
                <CheckCircle className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                ¡Contraseña actualizada!
              </CardTitle>
              <CardDescription className="text-base">
                Tu contraseña ha sido restablecida correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Link href="/login" className="w-full">
                <Button
                  className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                >
                  Ir a iniciar sesión
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl border-2">
          <CardHeader className="space-y-3 text-center pb-6">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg"
            >
              <KeyRound className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Nueva contraseña
            </CardTitle>
            <CardDescription className="text-base">
              Introduce tu nueva contraseña
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-5">
              {error && (
                <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold">Nueva contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Mínimo 6 caracteres"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 transition-all focus:ring-2"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold">Confirmar contraseña</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Repite la contraseña"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="h-11 transition-all focus:ring-2"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Button
                type="submit"
                className="w-full h-12 text-base font-semibold transition-all hover:scale-[1.02] bg-gradient-to-r from-primary to-secondary hover:opacity-90"
                disabled={loading}
              >
                {loading ? "Guardando..." : "Guardar nueva contraseña"}
              </Button>
              <Link
                href="/login"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Volver al inicio de sesión
              </Link>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}

export default function ResetPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <Card className="w-full max-w-md shadow-xl border-2">
          <CardHeader className="space-y-2 text-center pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight">Cargando...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <ResetForm />
    </Suspense>
  );
}
