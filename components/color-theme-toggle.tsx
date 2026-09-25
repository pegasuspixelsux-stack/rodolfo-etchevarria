"use client";

import { useTheme } from "@/components/theme-provider";
import { COLOR_THEME_NAMES, COLOR_THEME_PRESETS } from "@/lib/color-themes";

/**
 * Temporary footer control for previewing the site's primary accent color
 * themes. Only affects this browser (localStorage) — the dashboard's
 * "Apariencia" setting controls the actual default for every visitor.
 */
export function ColorThemeToggle({ className = "" }: { className?: string }) {
  const { colorTheme, setColorTheme } = useTheme();

  return (
    <div className={`flex items-center gap-1.5 ${className}`} role="group" aria-label="Color del tema">
      {COLOR_THEME_NAMES.map((name) => {
        const preset = COLOR_THEME_PRESETS[name];
        const active = colorTheme === name;
        return (
          <button
            key={name}
            type="button"
            aria-label={preset.label}
            aria-pressed={active}
            onClick={() => setColorTheme(name)}
            className={`flex h-6 w-6 items-center justify-center rounded-none border transition-all duration-200 ${
              active ? "border-foreground scale-110" : "border-border-strong hover:scale-105"
            }`}
          >
            <span
              className="h-full w-full"
              style={{ backgroundColor: preset.color }}
            />
          </button>
        );
      })}
    </div>
  );
}
