"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, ArrowLeft, CheckCircle } from "lucide-react";

export default function RecuperarPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // For now, we'll show a success message
      // In production, this would call the actual password reset API
      // await authClient.forgetPassword({ email });

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSuccess(true);
    } catch (err: unknown) {
      console.error("Password reset error:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al enviar el email. Inténtalo de nuevo.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

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
                ¡Email enviado!
              </CardTitle>
              <CardDescription className="text-base">
                Hemos enviado un enlace de recuperación a <strong>{email}</strong>. Revisa tu bandeja de entrada y sigue las instrucciones.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground text-center">
                Si no recibes el email en unos minutos, revisa tu carpeta de spam.
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Link href="/login" className="w-full">
                <Button
                  variant="outline"
                  className="w-full h-11 transition-all hover:scale-[1.02]"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver al inicio de sesión
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
              <Mail className="w-8 h-8 text-white" />
            </motion.div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Recuperar contraseña
            </CardTitle>
            <CardDescription className="text-base">
              Introduce tu email y te enviaremos un enlace para restablecer tu contraseña
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
                <Label htmlFor="email" className="text-sm font-semibold">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
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
                {loading ? "Enviando..." : "Enviar enlace de recuperación"}
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
