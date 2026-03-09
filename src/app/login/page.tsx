"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn.email({
        email,
        password,
      });

      console.log("Login result:", result);

      // Check if login was successful
      if (result.error) {
        setError(result.error.message || "Error al iniciar sesión. Verifica tus credenciales.");
        setLoading(false);
        return;
      }

      // Get user role from result and set cookie
      const userRole = (result.data?.user as { role?: string })?.role;
      if (userRole) {
        document.cookie = `user_role=${userRole}; path=/; max-age=${60 * 60 * 24 * 7}`;
      }

      // Determine redirect URL based on role or provided redirect param
      let redirectUrl = redirect || "/";

      // If no specific redirect, go to role-based dashboard
      if (!redirect && userRole) {
        switch (userRole) {
          case "organizador":
            redirectUrl = "/dashboard/organizador";
            break;
          case "padre":
            redirectUrl = "/dashboard/padre";
            break;
          case "peque":
            redirectUrl = "/dashboard/peque";
            break;
        }
      }

      // Wait a bit for cookie to be set, then do a full page reload
      setTimeout(() => {
        window.location.href = redirectUrl;
      }, 500);
    } catch (err: unknown) {
      console.error("Login error:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al iniciar sesión. Verifica tus credenciales.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Rainbow bar at the very top of the page */}
      <div
        className="w-full h-[3px] flex-shrink-0"
        style={{
          background: "linear-gradient(90deg, #22c55e 0%, #3b82f6 25%, #a855f7 50%, #f97316 75%, #ef4444 100%)"
        }}
        aria-hidden="true"
      />

      {/* Main content area */}
      <div className="flex-1 flex items-center justify-center px-4 py-12 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="shadow-2xl border border-gray-100 rounded-2xl overflow-hidden bg-white">
            <CardHeader className="space-y-4 text-center pb-6 pt-8">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #6366f1 0%, #a855f7 50%, #f97316 100%)"
                }}
              >
                <Sparkles className="w-8 h-8 text-white" />
              </motion.div>
              <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">
                ¡Bienvenido a{" "}
                <span
                  className="bg-clip-text text-transparent"
                  style={{
                    backgroundImage: "linear-gradient(90deg, #7c3aed 0%, #a855f7 100%)"
                  }}
                >
                  Peques
                </span>
                !
              </CardTitle>
              <CardDescription className="text-base text-gray-500">
                Introduce tu email y contraseña para acceder
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-5 px-8">
                {error && (
                  <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">Correo electrónico</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="h-12 transition-all border-gray-200 focus:border-violet-400 focus:ring-violet-400/30 focus:ring-2 rounded-xl"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">Contraseña</Label>
                    <Link
                      href="/recuperar"
                      className="text-xs text-violet-600 hover:text-violet-800 hover:underline transition-colors font-medium"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Introduce tu contraseña"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="h-12 transition-all border-gray-200 focus:border-violet-400 focus:ring-violet-400/30 focus:ring-2 rounded-xl"
                  />
                </div>
              </CardContent>
              <CardFooter className="flex flex-col space-y-4 pt-4 pb-8 px-8">
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-semibold transition-all rounded-xl text-white border-0 shadow-lg hover:shadow-xl active:scale-[0.99] active:shadow-md focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2"
                  style={{
                    background: "linear-gradient(90deg, #6366f1 0%, #7c3aed 30%, #a855f7 60%, #f97316 100%)",
                    backgroundSize: "200% auto"
                  }}
                  disabled={loading}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundPosition = "right center";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundPosition = "left center";
                  }}
                >
                  {loading ? "Iniciando sesión..." : "Iniciar sesión"}
                </Button>
                <div className="text-sm text-center text-gray-500">
                  ¿No tienes cuenta?{" "}
                  <Link href="/registro" className="font-semibold text-violet-600 hover:text-violet-800 hover:underline transition-colors">
                    Regístrate aquí
                  </Link>
                </div>
              </CardFooter>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col">
        {/* Rainbow bar at the very top */}
        <div
          className="w-full h-[3px] flex-shrink-0"
          style={{
            background: "linear-gradient(90deg, #22c55e 0%, #3b82f6 25%, #a855f7 50%, #f97316 75%, #ef4444 100%)"
          }}
          aria-hidden="true"
        />
        <div className="flex-1 flex items-center justify-center px-4 bg-gradient-to-b from-gray-50/80 via-white to-gray-50/50">
          <Card className="w-full max-w-md shadow-2xl border border-gray-100 rounded-2xl bg-white">
            <CardHeader className="space-y-2 text-center pb-6 pt-8">
              <CardTitle className="text-3xl font-bold tracking-tight text-gray-900">Bienvenido</CardTitle>
              <CardDescription className="text-base text-gray-500">Cargando...</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
