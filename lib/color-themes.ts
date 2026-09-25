// Single source of truth for the site's selectable primary accent color
// themes — used by the footer's temporary switcher, the dashboard's theme
// setting, and the CSS custom properties (--primary / --primary-foreground /
// --secondary) that drive the `bg-primary` / `text-primary-foreground` /
// `bg-secondary` utility classes.
export type ColorThemeName = "red" | "blue" | "lightBlue" | "yellow";

export interface ColorThemePreset {
  label: string;
  color: string;
  foreground: string;
}

export const COLOR_THEME_PRESETS: Record<ColorThemeName, ColorThemePreset> = {
  red: { label: "Rojo", color: "#dc2626", foreground: "#ffffff" },
  blue: { label: "Azul", color: "#2563eb", foreground: "#ffffff" },
  lightBlue: { label: "Celeste", color: "#0ea5e9", foreground: "#ffffff" },
  yellow: { label: "Amarillo", color: "#eab308", foreground: "#111111" },
};

export const COLOR_THEME_NAMES = Object.keys(COLOR_THEME_PRESETS) as ColorThemeName[];

export const DEFAULT_COLOR_THEME: ColorThemeName = "blue";

export function isColorThemeName(value: unknown): value is ColorThemeName {
  return typeof value === "string" && (COLOR_THEME_NAMES as string[]).includes(value);
}

// Lets an admin force the text paired with the primary background to white
// or black regardless of the preset's own default, for cases their exact
// custom hex doesn't contrast well with the preset's usual pairing.
export type ColorThemeTextMode = "auto" | "white" | "black";

export const COLOR_THEME_TEXT_MODES: { value: ColorThemeTextMode; label: string }[] = [
  { value: "auto", label: "Automático" },
  { value: "white", label: "Blanco" },
  { value: "black", label: "Negro" },
];

export function isColorThemeTextMode(value: unknown): value is ColorThemeTextMode {
  return value === "auto" || value === "white" || value === "black";
}

export function resolvePrimaryForeground(
  mode: ColorThemeTextMode,
  presetForeground: string,
): string {
  if (mode === "white") return "#ffffff";
  if (mode === "black") return "#111111";
  return presetForeground;
}

export const DEFAULT_SECONDARY_COLOR = "#64748b";
