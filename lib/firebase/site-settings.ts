"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/db";
import {
  COLOR_THEME_PRESETS,
  DEFAULT_COLOR_THEME,
  DEFAULT_SECONDARY_COLOR,
  isColorThemeName,
  isColorThemeTextMode,
  type ColorThemeName,
  type ColorThemeTextMode,
} from "@/lib/color-themes";

const COLLECTION = "settings";
const DOC_ID = "site";

export type HeroMode = "slideshow" | "video";

export interface SiteSettings {
  heroMode: HeroMode;
  heroVideoUrl: string | null;
  heroSlideshowImages: string[];
  gridHeading: string;
  gridSupportText: string;
  dealerLocation: string;
  dealerAddress: string;
  dealerHours: string;
  dealerPhone: string;
  dealerEmail: string;
  dealerWhatsapp: string;
  colorTheme: ColorThemeName;
  colorThemeColor: string;
  colorThemeTextMode: ColorThemeTextMode;
  secondaryColor: string;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroMode: "slideshow",
  heroVideoUrl: null,
  heroSlideshowImages: [],
  gridHeading: "Selección Premium",
  gridSupportText:
    "Vehículos seleccionados a mano, cada uno inspeccionado y certificado antes de llegar a ti.",
  dealerLocation: "Punta del Este",
  dealerAddress: "Av. Roosevelt y Parada 8, Punta del Este, Uruguay",
  dealerHours: "Lun – Sáb, 9 a 19 hs",
  dealerPhone: "(415) 555-0148",
  dealerEmail: "contacto@dealio.com",
  dealerWhatsapp: "+1 (415) 555-0148",
  colorTheme: DEFAULT_COLOR_THEME,
  colorThemeColor: COLOR_THEME_PRESETS[DEFAULT_COLOR_THEME].color,
  colorThemeTextMode: "auto",
  secondaryColor: DEFAULT_SECONDARY_COLOR,
};

const HEX_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;

const STRING_FIELDS = [
  "gridHeading",
  "gridSupportText",
  "dealerLocation",
  "dealerAddress",
  "dealerHours",
  "dealerPhone",
  "dealerEmail",
  "dealerWhatsapp",
] as const satisfies readonly (keyof SiteSettings)[];

function toSiteSettings(data: Record<string, unknown> | undefined): SiteSettings {
  if (!data) return DEFAULT_SITE_SETTINGS;
  const result = {
    heroMode: data.heroMode === "video" ? "video" : "slideshow",
    heroVideoUrl: typeof data.heroVideoUrl === "string" ? data.heroVideoUrl : null,
    heroSlideshowImages: Array.isArray(data.heroSlideshowImages)
      ? data.heroSlideshowImages.filter((url): url is string => typeof url === "string")
      : [],
  } as SiteSettings;
  for (const field of STRING_FIELDS) {
    const value = data[field];
    result[field] = typeof value === "string" && value.trim() ? value : DEFAULT_SITE_SETTINGS[field];
  }

  const colorTheme = isColorThemeName(data.colorTheme) ? data.colorTheme : DEFAULT_SITE_SETTINGS.colorTheme;
  result.colorTheme = colorTheme;
  const colorThemeColor = data.colorThemeColor;
  result.colorThemeColor =
    typeof colorThemeColor === "string" && HEX_PATTERN.test(colorThemeColor.trim())
      ? colorThemeColor.trim()
      : COLOR_THEME_PRESETS[colorTheme].color;

  result.colorThemeTextMode = isColorThemeTextMode(data.colorThemeTextMode)
    ? data.colorThemeTextMode
    : DEFAULT_SITE_SETTINGS.colorThemeTextMode;

  const secondaryColor = data.secondaryColor;
  result.secondaryColor =
    typeof secondaryColor === "string" && HEX_PATTERN.test(secondaryColor.trim())
      ? secondaryColor.trim()
      : DEFAULT_SITE_SETTINGS.secondaryColor;

  return result;
}

export async function getSiteSettingsOnce(): Promise<SiteSettings> {
  const db = getFirebaseDb();
  const snapshot = await getDoc(doc(db, COLLECTION, DOC_ID));
  return toSiteSettings(snapshot.data());
}

export async function updateSiteSettings(patch: Partial<SiteSettings>): Promise<void> {
  const db = getFirebaseDb();
  await setDoc(doc(db, COLLECTION, DOC_ID), patch, { merge: true });
}

export function useSiteSettings(initialSettings?: SiteSettings) {
  const [settings, setSettings] = useState<SiteSettings>(
    initialSettings ?? DEFAULT_SITE_SETTINGS,
  );
  const [loading, setLoading] = useState(initialSettings === undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const db = getFirebaseDb();
    const unsubscribe = onSnapshot(
      doc(db, COLLECTION, DOC_ID),
      (snapshot) => {
        setSettings(toSiteSettings(snapshot.data()));
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return unsubscribe;
  }, []);

  return { settings, loading, error };
}
