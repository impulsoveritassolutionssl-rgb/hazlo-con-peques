"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";

function VerificarEmailForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">(
    token ? "loading" : "no-token"
  );

  useEffect(() => {
    if (!token) {
      setStatus("no-token");
      return;
    }

    // Verify email with token
    const verifyEmail = async () => {
      try {
        // In production, this would call the actual verification API
        // await authClient.verifyEmail({ token });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1500));

        setStatus("success");
      } catch (err) {
        console.error("Email verification error:", err);
        setStatus("error");
      }
    };

    verifyEmail();
  }, [token]);

  if (status === "loading") {
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
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Loader2 className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold tracking-tight">
                Verificando email...
              </CardTitle>
              <CardDescription className="text-base">
                Por favor, espera mientras verificamos tu dirección de correo electrónico.
              </CardDescription>
            </CardHeader>
          </Card>
        </motion.div>
      </div>
    );
  }

  if (status === "no-token") {
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
                Verificación de email
              </CardTitle>
              <CardDescription className="text-base">
                Para verificar tu email, haz clic en el enlace que te hemos enviado a tu correo electrónico.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 bg-muted/50 rounded-xl text-sm text-muted-foreground text-center">
                Si no has recibido el email, revisa tu carpeta de spam o solicita uno nuevo desde tu perfil.
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Link href="/login" className="w-full">
                <Button
                  className="w-full h-11 transition-all hover:scale-[1.02]"
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

  if (status === "error") {
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
                className="mx-auto w-16 h-16 bg-gradient-to-br from-destructive to-destructive/70 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <XCircle className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-2xl font-bold tracking-tight text-destructive">
                Error de verificación
              </CardTitle>
              <CardDescription className="text-base">
                El enlace de verificación no es válido o ha expirado. Por favor, solicita uno nuevo desde tu perfil.
              </CardDescription>
            </CardHeader>
            <CardFooter className="flex flex-col space-y-4 pt-4">
              <Link href="/login" className="w-full">
                <Button
                  className="w-full h-11 transition-all hover:scale-[1.02]"
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
              ¡Email verificado!
            </CardTitle>
            <CardDescription className="text-base">
              Tu dirección de correo electrónico ha sido verificada correctamente. Ya puedes acceder a todas las funciones de Peques.
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

export default function VerificarEmailPage() {
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
      <VerificarEmailForm />
    </Suspense>
  );
}
