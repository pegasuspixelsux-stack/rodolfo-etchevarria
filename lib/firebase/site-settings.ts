"use client";

import { useEffect, useState } from "react";
import { doc, getDoc, onSnapshot, setDoc } from "firebase/firestore";
import { getFirebaseDb } from "@/lib/firebase/db";

const COLLECTION = "settings";
const DOC_ID = "site";

export type HeroMode = "slideshow" | "video";

export interface SiteSettings {
  heroMode: HeroMode;
  heroVideoUrl: string | null;
}

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  heroMode: "slideshow",
  heroVideoUrl: null,
};

function toSiteSettings(data: Record<string, unknown> | undefined): SiteSettings {
  if (!data) return DEFAULT_SITE_SETTINGS;
  return {
    heroMode: data.heroMode === "video" ? "video" : "slideshow",
    heroVideoUrl: typeof data.heroVideoUrl === "string" ? data.heroVideoUrl : null,
  };
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
