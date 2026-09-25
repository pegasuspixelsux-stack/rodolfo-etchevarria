"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  COLOR_THEME_PRESETS,
  isColorThemeName,
  resolvePrimaryForeground,
  type ColorThemeName,
} from "@/lib/color-themes";
import { useSiteSettings } from "@/lib/firebase/site-settings";

type Theme = "dark" | "light";

const COLOR_THEME_STORAGE_KEY = "colorThemeOverride";

function applyPrimaryColor(color: string, foreground: string) {
  document.documentElement.style.setProperty("--primary", color);
  document.documentElement.style.setProperty("--primary-foreground", foreground);
}

function applySecondaryColor(color: string) {
  document.documentElement.style.setProperty("--secondary", color);
}

// A minimal external store so same-tab writes (via setColorTheme) and
// cross-tab writes (via the native "storage" event) both notify subscribers —
// the "storage" event alone only fires in *other* tabs, never the writer's.
let colorThemeListeners: Array<() => void> = [];

function getStoredColorTheme() {
  return window.localStorage.getItem(COLOR_THEME_STORAGE_KEY);
}

function setStoredColorTheme(name: ColorThemeName) {
  window.localStorage.setItem(COLOR_THEME_STORAGE_KEY, name);
  colorThemeListeners.forEach((listener) => listener());
}

function subscribeToColorTheme(callback: () => void) {
  colorThemeListeners.push(callback);
  window.addEventListener("storage", callback);
  return () => {
    colorThemeListeners = colorThemeListeners.filter((listener) => listener !== callback);
    window.removeEventListener("storage", callback);
  };
}

interface ThemeContextValue {
  theme: Theme;
  toggleTheme: () => void;
  colorTheme: ColorThemeName;
  setColorTheme: (name: ColorThemeName) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("dark");
  const { settings } = useSiteSettings();

  // A tester's footer-selected override (this browser only) takes precedence
  // over the dashboard-configured default for everyone.
  const storedColorTheme = useSyncExternalStore(subscribeToColorTheme, getStoredColorTheme, () => null);
  const hasOverride = isColorThemeName(storedColorTheme);
  const colorTheme = hasOverride ? storedColorTheme : settings.colorTheme;
  const primaryColor = hasOverride ? COLOR_THEME_PRESETS[storedColorTheme].color : settings.colorThemeColor;
  const primaryForeground = hasOverride
    ? COLOR_THEME_PRESETS[storedColorTheme].foreground
    : resolvePrimaryForeground(settings.colorThemeTextMode, COLOR_THEME_PRESETS[colorTheme].foreground);

  useEffect(() => {
    const stored = window.localStorage.getItem("theme");
    const initial: Theme = stored === "light" ? "light" : "dark";
    setTheme(initial);
    document.documentElement.setAttribute("data-theme", initial);
  }, []);

  useEffect(() => {
    applyPrimaryColor(primaryColor, primaryForeground);
  }, [primaryColor, primaryForeground]);

  useEffect(() => {
    applySecondaryColor(settings.secondaryColor);
  }, [settings.secondaryColor]);

  const toggleTheme = () => {
    setTheme((prev) => {
      const next: Theme = prev === "dark" ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      window.localStorage.setItem("theme", next);
      return next;
    });
  };

  const setColorTheme = (name: ColorThemeName) => {
    applyPrimaryColor(COLOR_THEME_PRESETS[name].color, COLOR_THEME_PRESETS[name].foreground);
    setStoredColorTheme(name);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, colorTheme, setColorTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
