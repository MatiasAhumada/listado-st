"use client";

import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { THEME_TEXT } from "@/constants/theme.constant";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  const isDark = resolvedTheme === "dark";
  const label = isDark ? THEME_TEXT.useLight : THEME_TEXT.useDark;

  return (
    <Button
      type="button"
      variant="outline"
      className="fixed right-4 bottom-[calc(1rem+env(safe-area-inset-bottom))] z-50 gap-2 rounded-full border-border bg-card px-3 shadow-lg sm:right-6 sm:bottom-6"
      aria-label={label}
      title={label}
      onClick={() => setTheme(isDark ? "light" : "dark")}
    >
      {isDark ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
      <span className="hidden text-xs font-semibold sm:inline">{label}</span>
    </Button>
  );
}
