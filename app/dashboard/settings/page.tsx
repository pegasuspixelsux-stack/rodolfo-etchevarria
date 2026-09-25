"use client";

import { useState } from "react";
import Image from "next/image";
import { Film, Images, Trash2 } from "lucide-react";
import { DashboardField, dashboardInputClass } from "@/components/dashboard/form-field";
import {
  useSiteSettings,
  updateSiteSettings,
  type HeroMode,
  type SiteSettings,
} from "@/lib/firebase/site-settings";
import { uploadHeroVideo, uploadHeroSlideshowImage } from "@/lib/firebase/storage";
import {
  COLOR_THEME_NAMES,
  COLOR_THEME_PRESETS,
  COLOR_THEME_TEXT_MODES,
  type ColorThemeName,
} from "@/lib/color-themes";

type DealerInfoDraft = Pick<
  SiteSettings,
  "dealerLocation" | "dealerAddress" | "dealerHours" | "dealerPhone" | "dealerEmail" | "dealerWhatsapp"
>;

function pickDealerInfo(settings: SiteSettings): DealerInfoDraft {
  return {
    dealerLocation: settings.dealerLocation,
    dealerAddress: settings.dealerAddress,
    dealerHours: settings.dealerHours,
    dealerPhone: settings.dealerPhone,
    dealerEmail: settings.dealerEmail,
    dealerWhatsapp: settings.dealerWhatsapp,
  };
}

type ColorThemeDraft = Pick<
  SiteSettings,
  "colorTheme" | "colorThemeColor" | "colorThemeTextMode" | "secondaryColor"
>;

function pickColorTheme(settings: SiteSettings): ColorThemeDraft {
  return {
    colorTheme: settings.colorTheme,
    colorThemeColor: settings.colorThemeColor,
    colorThemeTextMode: settings.colorThemeTextMode,
    secondaryColor: settings.secondaryColor,
  };
}

export default function SettingsPage() {
  const { settings } = useSiteSettings();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [imagesError, setImagesError] = useState<string | null>(null);

  const [gridHeading, setGridHeading] = useState(settings.gridHeading);
  const [gridSupportText, setGridSupportText] = useState(settings.gridSupportText);
  const [loadedGridHeading, setLoadedGridHeading] = useState(settings.gridHeading);
  const [loadedGridSupportText, setLoadedGridSupportText] = useState(settings.gridSupportText);
  const [gridTextDirty, setGridTextDirty] = useState(false);
  const [savingGridText, setSavingGridText] = useState(false);

  if (
    !gridTextDirty &&
    (settings.gridHeading !== loadedGridHeading || settings.gridSupportText !== loadedGridSupportText)
  ) {
    setLoadedGridHeading(settings.gridHeading);
    setLoadedGridSupportText(settings.gridSupportText);
    setGridHeading(settings.gridHeading);
    setGridSupportText(settings.gridSupportText);
  }

  const handleSaveGridText = async () => {
    setSavingGridText(true);
    try {
      await updateSiteSettings({ gridHeading, gridSupportText });
      setGridTextDirty(false);
    } finally {
      setSavingGridText(false);
    }
  };

  const [dealerInfo, setDealerInfo] = useState<DealerInfoDraft>(pickDealerInfo(settings));
  const [loadedDealerInfo, setLoadedDealerInfo] = useState<DealerInfoDraft>(pickDealerInfo(settings));
  const [dealerInfoDirty, setDealerInfoDirty] = useState(false);
  const [savingDealerInfo, setSavingDealerInfo] = useState(false);

  const currentDealerInfo = pickDealerInfo(settings);
  if (
    !dealerInfoDirty &&
    (Object.keys(currentDealerInfo) as (keyof DealerInfoDraft)[]).some(
      (key) => currentDealerInfo[key] !== loadedDealerInfo[key],
    )
  ) {
    setLoadedDealerInfo(currentDealerInfo);
    setDealerInfo(currentDealerInfo);
  }

  const updateDealerInfoField = (field: keyof DealerInfoDraft, value: string) => {
    setDealerInfo((current) => ({ ...current, [field]: value }));
    setDealerInfoDirty(true);
  };

  const handleSaveDealerInfo = async () => {
    setSavingDealerInfo(true);
    try {
      await updateSiteSettings(dealerInfo);
      setDealerInfoDirty(false);
    } finally {
      setSavingDealerInfo(false);
    }
  };

  const [colorThemeDraft, setColorThemeDraft] = useState<ColorThemeDraft>(pickColorTheme(settings));
  const [loadedColorTheme, setLoadedColorTheme] = useState<ColorThemeDraft>(pickColorTheme(settings));
  const [colorThemeDirty, setColorThemeDirty] = useState(false);
  const [savingColorTheme, setSavingColorTheme] = useState(false);

  const currentColorTheme = pickColorTheme(settings);
  if (
    !colorThemeDirty &&
    (Object.keys(currentColorTheme) as (keyof ColorThemeDraft)[]).some(
      (key) => currentColorTheme[key] !== loadedColorTheme[key],
    )
  ) {
    setLoadedColorTheme(currentColorTheme);
    setColorThemeDraft(currentColorTheme);
  }

  const selectColorThemePreset = (name: ColorThemeName) => {
    setColorThemeDraft((current) => ({
      ...current,
      colorTheme: name,
      colorThemeColor: COLOR_THEME_PRESETS[name].color,
    }));
    setColorThemeDirty(true);
  };

  const updateColorThemeHex = (hex: string) => {
    setColorThemeDraft((current) => ({ ...current, colorThemeColor: hex }));
    setColorThemeDirty(true);
  };

  const updateColorThemeTextMode = (mode: ColorThemeDraft["colorThemeTextMode"]) => {
    setColorThemeDraft((current) => ({ ...current, colorThemeTextMode: mode }));
    setColorThemeDirty(true);
  };

  const updateSecondaryColor = (hex: string) => {
    setColorThemeDraft((current) => ({ ...current, secondaryColor: hex }));
    setColorThemeDirty(true);
  };

  const handleSaveColorTheme = async () => {
    setSavingColorTheme(true);
    try {
      await updateSiteSettings(colorThemeDraft);
      setColorThemeDirty(false);
    } finally {
      setSavingColorTheme(false);
    }
  };

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
      const message = err instanceof Error ? err.message : String(err);
      setError(`No se pudo subir el video: ${message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveVideo = async () => {
    await updateSiteSettings({ heroVideoUrl: null, heroMode: "slideshow" });
  };

  const handleSlideshowUpload = async (files: FileList) => {
    setUploadingImages(true);
    setImagesError(null);
    const results = await Promise.allSettled(
      Array.from(files).map((file) => uploadHeroSlideshowImage(file)),
    );
    const urls = results
      .filter((result): result is PromiseFulfilledResult<string> => result.status === "fulfilled")
      .map((result) => result.value);
    const failures = results.filter((result) => result.status === "rejected") as PromiseRejectedResult[];

    if (urls.length > 0) {
      await updateSiteSettings({ heroSlideshowImages: [...settings.heroSlideshowImages, ...urls] });
    }
    if (failures.length > 0) {
      console.error("uploadHeroSlideshowImage failed:", failures.map((f) => f.reason));
      const message = failures[0].reason instanceof Error ? failures[0].reason.message : String(failures[0].reason);
      setImagesError(
        `No se ${failures.length === 1 ? "pudo subir 1 imagen" : `pudieron subir ${failures.length} imágenes`}: ${message}`,
      );
    }
    setUploadingImages(false);
  };

  const handleRemoveSlideshowImage = async (url: string) => {
    await updateSiteSettings({
      heroSlideshowImages: settings.heroSlideshowImages.filter((image) => image !== url),
    });
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

      <section className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Imágenes del Carrusel</h2>
        <p className="mt-1 text-sm text-slate-500">
          Subí las fotos que rotan en el hero cuando el modo es "Diapositivas".
          Si no subís ninguna, se usan las fotos por defecto.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <DashboardField label="Subir Imágenes">
            <input
              type="file"
              accept="image/*"
              multiple
              disabled={uploadingImages}
              onChange={(event) => {
                const files = event.target.files;
                if (files && files.length > 0) void handleSlideshowUpload(files);
                event.target.value = "";
              }}
              className={dashboardInputClass}
            />
          </DashboardField>
          {uploadingImages && <p className="text-xs text-slate-500">Subiendo imágenes…</p>}
          {imagesError && <p className="text-xs text-red-600">{imagesError}</p>}

          {settings.heroSlideshowImages.length > 0 && (
            <div className="mt-2 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {settings.heroSlideshowImages.map((url) => (
                <div key={url} className="group relative aspect-video overflow-hidden rounded-none border border-slate-200">
                  <Image src={url} alt="Foto del carrusel" fill sizes="200px" className="object-cover" />
                  <button
                    type="button"
                    onClick={() => void handleRemoveSlideshowImage(url)}
                    aria-label="Quitar imagen"
                    className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-none border border-white/20 bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Sección de Inventario</h2>
        <p className="mt-1 text-sm text-slate-500">
          Editá el título y el texto de apoyo que aparecen arriba de la grilla
          de vehículos en la página principal.
        </p>

        <div className="mt-6 flex flex-col gap-4">
          <DashboardField label="Título">
            <input
              type="text"
              value={gridHeading}
              onChange={(event) => {
                setGridHeading(event.target.value);
                setGridTextDirty(true);
              }}
              className={dashboardInputClass}
            />
          </DashboardField>

          <DashboardField label="Texto de Apoyo">
            <textarea
              value={gridSupportText}
              onChange={(event) => {
                setGridSupportText(event.target.value);
                setGridTextDirty(true);
              }}
              rows={3}
              className={`${dashboardInputClass} h-auto resize-none py-2.5`}
            />
          </DashboardField>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => void handleSaveGridText()}
              disabled={!gridTextDirty || savingGridText}
              className="flex h-10 items-center rounded-none bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingGridText ? "Guardando…" : "Guardar cambios"}
            </button>
            {!gridTextDirty && !savingGridText && (
              <span className="text-xs text-slate-400">Sin cambios pendientes</span>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Información de Contacto</h2>
        <p className="mt-1 text-sm text-slate-500">
          Estos datos se muestran en el hero, el pie de página y la sección de
          contacto del sitio.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DashboardField label="Ubicación (ciudad)">
            <input
              type="text"
              value={dealerInfo.dealerLocation}
              onChange={(event) => updateDealerInfoField("dealerLocation", event.target.value)}
              className={dashboardInputClass}
            />
          </DashboardField>

          <DashboardField label="Horario">
            <input
              type="text"
              value={dealerInfo.dealerHours}
              onChange={(event) => updateDealerInfoField("dealerHours", event.target.value)}
              className={dashboardInputClass}
            />
          </DashboardField>

          <DashboardField label="Dirección">
            <input
              type="text"
              value={dealerInfo.dealerAddress}
              onChange={(event) => updateDealerInfoField("dealerAddress", event.target.value)}
              className={`${dashboardInputClass} sm:col-span-2`}
            />
          </DashboardField>

          <DashboardField label="Teléfono">
            <input
              type="tel"
              value={dealerInfo.dealerPhone}
              onChange={(event) => updateDealerInfoField("dealerPhone", event.target.value)}
              className={dashboardInputClass}
            />
          </DashboardField>

          <DashboardField label="WhatsApp">
            <input
              type="tel"
              value={dealerInfo.dealerWhatsapp}
              onChange={(event) => updateDealerInfoField("dealerWhatsapp", event.target.value)}
              className={dashboardInputClass}
            />
          </DashboardField>

          <DashboardField label="Correo electrónico">
            <input
              type="email"
              value={dealerInfo.dealerEmail}
              onChange={(event) => updateDealerInfoField("dealerEmail", event.target.value)}
              className={`${dashboardInputClass} sm:col-span-2`}
            />
          </DashboardField>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSaveDealerInfo()}
            disabled={!dealerInfoDirty || savingDealerInfo}
            className="flex h-10 items-center rounded-none bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingDealerInfo ? "Guardando…" : "Guardar cambios"}
          </button>
          {!dealerInfoDirty && !savingDealerInfo && (
            <span className="text-xs text-slate-400">Sin cambios pendientes</span>
          )}
        </div>
      </section>

      <section className="rounded-none border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Apariencia</h2>
        <p className="mt-1 text-sm text-slate-500">
          Elegí el color de acento principal del sitio, el color del texto que
          lo acompaña y un color secundario para detalles. El selector del pie
          de página es temporal para pruebas — esta es la fuente definitiva
          para todos los visitantes.
        </p>

        <div className="mt-6 flex flex-wrap gap-3">
          {COLOR_THEME_NAMES.map((name) => {
            const preset = COLOR_THEME_PRESETS[name];
            const active = colorThemeDraft.colorTheme === name;
            return (
              <button
                key={name}
                type="button"
                onClick={() => selectColorThemePreset(name)}
                aria-pressed={active}
                className={`flex items-center gap-2.5 border p-3 pr-4 text-left transition-colors ${
                  active ? "border-indigo-500 bg-indigo-50" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <span
                  className="h-6 w-6 flex-shrink-0 rounded-none border border-slate-200"
                  style={{ backgroundColor: preset.color }}
                />
                <span className="text-sm font-medium text-slate-900">{preset.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DashboardField label="Color exacto (hex)">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorThemeDraft.colorThemeColor}
                onChange={(event) => updateColorThemeHex(event.target.value)}
                className="h-11 w-14 flex-shrink-0 cursor-pointer rounded-none border border-slate-200 bg-white p-1"
              />
              <input
                type="text"
                value={colorThemeDraft.colorThemeColor}
                onChange={(event) => updateColorThemeHex(event.target.value)}
                className={dashboardInputClass}
              />
            </div>
          </DashboardField>

          <DashboardField label="Color secundario (detalles)">
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={colorThemeDraft.secondaryColor}
                onChange={(event) => updateSecondaryColor(event.target.value)}
                className="h-11 w-14 flex-shrink-0 cursor-pointer rounded-none border border-slate-200 bg-white p-1"
              />
              <input
                type="text"
                value={colorThemeDraft.secondaryColor}
                onChange={(event) => updateSecondaryColor(event.target.value)}
                className={dashboardInputClass}
              />
            </div>
          </DashboardField>
        </div>

        <div className="mt-6">
          <DashboardField label="Color del texto sobre el color principal">
            <div className="flex flex-wrap gap-2">
              {COLOR_THEME_TEXT_MODES.map(({ value, label }) => {
                const active = colorThemeDraft.colorThemeTextMode === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => updateColorThemeTextMode(value)}
                    aria-pressed={active}
                    className={`flex h-10 items-center rounded-none border px-4 text-sm font-medium transition-colors ${
                      active
                        ? "border-indigo-500 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 text-slate-600 hover:border-slate-300"
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </DashboardField>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => void handleSaveColorTheme()}
            disabled={!colorThemeDirty || savingColorTheme}
            className="flex h-10 items-center rounded-none bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {savingColorTheme ? "Guardando…" : "Guardar cambios"}
          </button>
          {!colorThemeDirty && !savingColorTheme && (
            <span className="text-xs text-slate-400">Sin cambios pendientes</span>
          )}
        </div>
      </section>
    </div>
  );
}
