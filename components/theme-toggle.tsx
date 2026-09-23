"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "@/components/theme-provider";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const isLight = theme === "light";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isLight}
      aria-label="Toggle light theme"
      onClick={toggleTheme}
      className={`relative flex h-8 w-14 shrink-0 items-center rounded-full border border-border-strong bg-surface-2 p-1 transition-colors duration-300 ${className}`}
    >
      <span
        className={`flex h-6 w-6 items-center justify-center rounded-full bg-foreground text-accent-foreground transition-transform duration-300 ease-out ${
          isLight ? "translate-x-6" : "translate-x-0"
        }`}
      >
        {isLight ? <Sun size={14} /> : <Moon size={14} />}
      </span>
    </button>
  );
}
