"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { loginUsuario } from "@/services/auth.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { Wrench } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  const router = useRouter();
  const { user, setUser, setToken } = useAuthStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && user) {
      router.push("/dashboard");
    }
  }, [user, isHydrated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user, token } = await loginUsuario({ username, password });
      setUser(user);
      setToken(token);
      clientSuccessHandler(`Bienvenido, ${user.username}`);
      router.push("/dashboard");
    } catch (error) {
      clientErrorHandler(error);
    } finally {
      setLoading(false);
    }
  };

  if (!isHydrated) return null;

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 w-full h-full bg-charcoal">
        <div className="absolute inset-0 bg-gradient-to-r from-lime/10 via-green/10 to-lime/10 animate-pulse" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-lime/20 rounded-full blur-3xl animate-blob" />
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-green/20 rounded-full blur-3xl animate-blob animation-delay-2000" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-lime/20 rounded-full blur-3xl animate-blob animation-delay-4000" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-lime to-green mb-4"
          >
            <Wrench className="w-8 h-8 text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-lavender mb-2">Listado ST</h1>
          <p className="text-lavender/60">
            Sistema Integral de Servicio Técnico
          </p>
        </div>

        <Card className="backdrop-blur-xl bg-dark/80 border border-lavender/10 shadow-2xl">
          <div className="p-8">
            <h2 className="text-2xl font-semibold text-lavender mb-6">
              Iniciar Sesión
            </h2>

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-lavender">
                  Usuario
                </Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ingresá tu usuario"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="bg-charcoal border-lavender/20 text-lavender placeholder:text-lavender/40 focus:border-lime"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-lavender">
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="bg-charcoal border-lavender/20 text-lavender placeholder:text-lavender/40 focus:border-lime"
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-lime hover:bg-green text-dark font-semibold py-6"
                disabled={loading}
              >
                {loading ? "Accediendo..." : "Ingresar al Sistema"}
              </Button>
            </form>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
