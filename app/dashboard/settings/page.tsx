"use client";

import { useState } from "react";
import { Film, Images, Trash2 } from "lucide-react";
import { DashboardField, dashboardInputClass } from "@/components/dashboard/form-field";
import { useSiteSettings, updateSiteSettings, type HeroMode } from "@/lib/firebase/site-settings";
import { uploadHeroVideo } from "@/lib/firebase/storage";

export default function SettingsPage() {
  const { settings } = useSiteSettings();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleModeChange = async (mode: HeroMode) => {
    await updateSiteSettings({ heroMode: mode });
  };

  const handleVideoUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const url = await uploadHeroVideo(file);
      await updateSiteSettings({ heroVideoUrl: url, heroMode: "video" });
    } catch (err) {
      console.error("uploadHeroVideo failed:", err);
      setError("No se pudo subir el video. Intenta de nuevo.");
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveVideo = async () => {
    await updateSiteSettings({ heroVideoUrl: null, heroMode: "slideshow" });
  };

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Configuración</h1>
        <p className="mt-1 text-sm text-slate-500">
          Administra la configuración general de tu concesionario.
        </p>
      </div>

      <section className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Hero de la Página Principal</h2>
        <p className="mt-1 text-sm text-slate-500">
          Elegí si la sección principal del sitio muestra un carrusel de fotos
          o un video de fondo.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => handleModeChange("slideshow")}
            className={`flex items-center gap-3 border p-4 text-left transition-colors ${
              settings.heroMode === "slideshow"
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600">
              <Images size={18} />
            </span>
            <span>
              <span className="block text-sm font-medium text-slate-900">
                Diapositivas
              </span>
              <span className="block text-xs text-slate-500">
                Carrusel de fotos rotando automáticamente
              </span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleModeChange("video")}
            disabled={!settings.heroVideoUrl}
            className={`flex items-center gap-3 border p-4 text-left transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
              settings.heroMode === "video"
                ? "border-indigo-500 bg-indigo-50"
                : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-none border border-slate-200 bg-white text-slate-600">
              <Film size={18} />
            </span>
            <span>
              <span className="block text-sm font-medium text-slate-900">Video</span>
              <span className="block text-xs text-slate-500">
                {settings.heroVideoUrl
                  ? "Video de fondo en loop"
                  : "Subí un video para habilitar esta opción"}
              </span>
            </span>
          </button>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-6">
          <DashboardField label="Subir Video del Hero">
            <input
              type="file"
              accept="video/*"
              disabled={uploading}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleVideoUpload(file);
              }}
              className={dashboardInputClass}
            />
          </DashboardField>
          {uploading && <p className="text-xs text-slate-500">Subiendo video…</p>}
          {error && <p className="text-xs text-red-600">{error}</p>}

          {settings.heroVideoUrl && (
            <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-start">
              <video
                key={settings.heroVideoUrl}
                src={settings.heroVideoUrl}
                muted
                loop
                autoPlay
                playsInline
                className="h-40 w-full max-w-xs rounded-none border border-slate-200 object-cover sm:w-64"
              />
              <button
                type="button"
                onClick={handleRemoveVideo}
                className="flex h-9 items-center gap-1.5 self-start rounded-none border border-slate-200 px-3 text-xs font-medium text-slate-600 transition-colors hover:border-red-300 hover:text-red-600"
              >
                <Trash2 size={13} />
                Quitar video
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
