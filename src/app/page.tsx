"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/hooks/useAuthStore";
import { loginUsuario } from "@/services/auth.service";
import { clientErrorHandler, clientSuccessHandler } from "@/utils/handlers/clientError.handler";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
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
  const { user, setUser } = useAuthStore();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    // Si la cookie expiró pero el localStorage sigue ahí, este flujo evita rebotes.
    if (isHydrated && user) {
      router.push("/dashboard");
    }
  }, [user, isHydrated, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { user } = await loginUsuario({ username, password });
      setUser(user);
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
    <div className="flex items-center justify-center min-h-screen bg-deepspace-100 p-4 overflow-hidden relative">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-bluegreen-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-[-10%] right-[-10%] w-96 h-96 bg-amber-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute bottom-[-20%] left-[20%] w-96 h-96 bg-princeton-500 rounded-full mix-blend-screen filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <Card className="shadow-2xl border-white/10 bg-card/95 backdrop-blur-xl">
          <CardHeader className="space-y-3 pb-6 border-b border-border/50">
            <div className="w-16 h-16 bg-gradient-to-tr from-bluegreen-500 to-amber-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-bluegreen-500/30 mb-2">
              <Wrench className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight text-center text-deepspace-500">
              Listado ST
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground font-medium text-sm">
              Sistema Integral de Servicio Técnico
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-deepspace-500">Usuario</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Ej: admin"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="bg-skybase-900 border-border focus-visible:ring-princeton-500 transition-all h-11"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold text-deepspace-500">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-skybase-900 border-border focus-visible:ring-princeton-500 transition-all h-11"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-11 bg-gradient-to-r from-bluegreen-500 to-bluegreen-600 hover:from-bluegreen-400 hover:to-bluegreen-500 text-white font-semibold tracking-wide shadow-lg shadow-bluegreen-500/30 transition-all hover:scale-[1.02]" 
                disabled={loading}
              >
                {loading ? "Accediendo..." : "Ingresar al Sistema"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
