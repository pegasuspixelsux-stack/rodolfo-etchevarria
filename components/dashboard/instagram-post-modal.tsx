"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Download, Edit3, ImageUp, LayoutTemplate, Minus, Plus, RotateCcw, X } from "lucide-react";
import type { InventoryItem } from "@/lib/dashboard-data";
import { CarCard } from "@/components/car-card";
import { InstagramGlyph } from "@/components/icons/instagram-glyph";
import { carDetails, type CarDetailImage } from "@/data/car-details";
import { shareImageOrOpenInstagram } from "@/lib/share/share-to-instagram";
import {
  BLOCK_OFFSET_MAX,
  BLOCK_OFFSET_MIN,
  BLOCK_OFFSET_STEP,
  currency,
  DEFAULT_BLOCK_OFFSET_PERCENT,
  DEFAULT_BOTTOM_GRADIENT_PERCENT,
  DEFAULT_GRADIENT_COLOR,
  DEFAULT_INSTAGRAM_HANDLE,
  DEFAULT_LOGO_SRC,
  DEFAULT_MODEL_SIZE_REM,
  DEFAULT_PRESET,
  DEFAULT_TEXT_COLOR,
  DEFAULT_TOP_GRADIENT_PERCENT,
  DEFAULT_YEAR_MAKE_SIZE_REM,
  defaultPriceText,
  defaultTitle,
  DISCLAIMER_TEXT,
  FORMAT_OPTIONS,
  FUEL_TYPE_LABELS,
  generateInstagramGraphic,
  GRADIENT_HEIGHT_MAX,
  GRADIENT_HEIGHT_MIN,
  GRADIENT_HEIGHT_STEP,
  GRADIENT_INTENSITY_DEFAULT,
  GRADIENT_INTENSITY_MAX,
  GRADIENT_INTENSITY_MIN,
  GRADIENT_INTENSITY_STEP,
  hexToRgb,
  isColorDark,
  type LogoPosition,
  mileageFormat,
  type PostFormat,
  type PostPreset,
  slugify,
  TITLE_SIZE_REM_MAX,
  TITLE_SIZE_REM_MIN,
  TITLE_SIZE_REM_STEP,
} from "@/lib/share/instagram-graphic";

// Saved combinations of every IG Reels tunable (font sizes, gradient, text color, block
// offsets, title alignment) so staff can reuse a look instead of re-adjusting every control
// each time. Kept in localStorage — this dashboard has no backend endpoint for it, and it's
// a per-browser convenience, not shared data.
const CARD_PRESET_STORAGE_KEY = "ig-reel-card-presets";

type CardPresetSettings = {
  yearMakeSizeRem: number;
  modelSizeRem: number;
  gradientColor: string;
  gradientIntensity: number;
  topGradientPercent: number;
  bottomGradientPercent: number;
  textColor: string;
  topBlockOffsetPercent: number;
  bottomBlockOffsetPercent: number;
  titleAlign: LogoPosition;
};

function loadCardPresets(): Record<string, CardPresetSettings> {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(CARD_PRESET_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, CardPresetSettings>) : {};
  } catch {
    return {};
  }
}

// A 9:16 canvas's centered 4:5 Instagram feed-crop safe area leaves this much margin (as a
// percent of card height) above and below it — see instagram-graphic.ts's SAFE_CROP_HEIGHT_TO_WIDTH.
const SAFE_AREA_MARGIN_PERCENT = 14.84;

const LOGO_POSITION_OPTIONS: { id: LogoPosition; label: string }[] = [
  { id: "left", label: "Izquierda" },
  { id: "center", label: "Centro" },
  { id: "right", label: "Derecha" },
];

const PRESET_OPTIONS: { id: PostPreset; label: string; description: string }[] = [
  {
    id: "card",
    label: "IG Reels",
    description: "Idéntico a la ficha del sitio web",
  },
  {
    id: "classic",
    label: "IG Feed",
    description: "Plantilla de marca personalizable",
  },
];

export function InstagramPostModal({
  open,
  onClose,
  item,
}: {
  open: boolean;
  onClose: () => void;
  item: InventoryItem | null;
}) {
  const gallery = useMemo<CarDetailImage[]>(() => {
    if (!item) return [];
    const detail = carDetails[item.id];
    if (detail && detail.images.length > 0) return detail.images;
    return [{ src: item.image, alt: `${item.make} ${item.model}` }];
  }, [item]);

  const [preset, setPreset] = useState<PostPreset>(DEFAULT_PRESET);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [title, setTitle] = useState("");
  const [priceText, setPriceText] = useState("");
  const [logoPosition, setLogoPosition] = useState<LogoPosition>("right");
  const [format, setFormat] = useState<PostFormat>("square");
  const [gradientColor, setGradientColor] = useState(DEFAULT_GRADIENT_COLOR);
  const [gradientIntensity, setGradientIntensity] = useState(GRADIENT_INTENSITY_DEFAULT);
  const [logoSrc, setLogoSrc] = useState(DEFAULT_LOGO_SRC);
  const [instagramHandle, setInstagramHandle] = useState(DEFAULT_INSTAGRAM_HANDLE);
  const [yearMakeSizeRem, setYearMakeSizeRem] = useState(DEFAULT_YEAR_MAKE_SIZE_REM);
  const [modelSizeRem, setModelSizeRem] = useState(DEFAULT_MODEL_SIZE_REM);
  const [topGradientPercent, setTopGradientPercent] = useState(DEFAULT_TOP_GRADIENT_PERCENT);
  const [bottomGradientPercent, setBottomGradientPercent] = useState(DEFAULT_BOTTOM_GRADIENT_PERCENT);
  const [textColor, setTextColor] = useState(DEFAULT_TEXT_COLOR);
  const [topBlockOffsetPercent, setTopBlockOffsetPercent] = useState(DEFAULT_BLOCK_OFFSET_PERCENT);
  const [bottomBlockOffsetPercent, setBottomBlockOffsetPercent] = useState(DEFAULT_BLOCK_OFFSET_PERCENT);
  const [titleAlign, setTitleAlign] = useState<LogoPosition>("center");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [cardPresets, setCardPresets] = useState<Record<string, CardPresetSettings>>({});
  const [presetName, setPresetName] = useState("");

  useEffect(() => {
    setCardPresets(loadCardPresets());
  }, []);

  const handleSavePreset = () => {
    const name = presetName.trim();
    if (!name) return;
    const settings: CardPresetSettings = {
      yearMakeSizeRem,
      modelSizeRem,
      gradientColor,
      gradientIntensity,
      topGradientPercent,
      bottomGradientPercent,
      textColor,
      topBlockOffsetPercent,
      bottomBlockOffsetPercent,
      titleAlign,
    };
    const next = { ...cardPresets, [name]: settings };
    setCardPresets(next);
    window.localStorage.setItem(CARD_PRESET_STORAGE_KEY, JSON.stringify(next));
    setPresetName("");
  };

  const handleLoadPreset = (name: string) => {
    const settings = cardPresets[name];
    if (!settings) return;
    setYearMakeSizeRem(settings.yearMakeSizeRem);
    setModelSizeRem(settings.modelSizeRem);
    setGradientColor(settings.gradientColor);
    setGradientIntensity(settings.gradientIntensity);
    setTopGradientPercent(settings.topGradientPercent);
    setBottomGradientPercent(settings.bottomGradientPercent);
    setTextColor(settings.textColor);
    setTopBlockOffsetPercent(settings.topBlockOffsetPercent);
    setBottomBlockOffsetPercent(settings.bottomBlockOffsetPercent);
    setTitleAlign(settings.titleAlign);
  };

  const handleDeletePreset = (name: string) => {
    const next = { ...cardPresets };
    delete next[name];
    setCardPresets(next);
    window.localStorage.setItem(CARD_PRESET_STORAGE_KEY, JSON.stringify(next));
  };

  useEffect(() => {
    if (!open || !item) return;
    setPreset(DEFAULT_PRESET);
    setSelectedImageIndex(0);
    setTitle(defaultTitle(item));
    setPriceText(defaultPriceText(item));
    setLogoPosition("right");
    setFormat("square");
    setGradientColor(DEFAULT_GRADIENT_COLOR);
    setGradientIntensity(GRADIENT_INTENSITY_DEFAULT);
    setLogoSrc(DEFAULT_LOGO_SRC);
    setInstagramHandle(DEFAULT_INSTAGRAM_HANDLE);
    setYearMakeSizeRem(DEFAULT_YEAR_MAKE_SIZE_REM);
    setModelSizeRem(DEFAULT_MODEL_SIZE_REM);
    setTopGradientPercent(DEFAULT_TOP_GRADIENT_PERCENT);
    setBottomGradientPercent(DEFAULT_BOTTOM_GRADIENT_PERCENT);
    setTextColor(DEFAULT_TEXT_COLOR);
    setTopBlockOffsetPercent(DEFAULT_BLOCK_OFFSET_PERCENT);
    setBottomBlockOffsetPercent(DEFAULT_BLOCK_OFFSET_PERCENT);
    setTitleAlign("center");
    setError(null);
  }, [open, item]);

  if (!item) return null;

  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") setLogoSrc(reader.result);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleDownload = async () => {
    setIsGenerating(true);
    setError(null);
    try {
      const blob = await generateInstagramGraphic({
        imageSrc: gallery[selectedImageIndex]?.src ?? item.image,
        logoSrc,
        title,
        priceText,
        logoPosition,
        format,
        gradientColor,
        gradientIntensity,
        instagramHandle,
        item,
        preset,
        yearMakeSizeRem,
        modelSizeRem,
        topGradientPercent,
        bottomGradientPercent,
        textColor,
        topBlockOffsetPercent,
        bottomBlockOffsetPercent,
        titleAlign,
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${slugify(`${item.year}-${item.make}-${item.model}`)}-${preset}-instagram-post.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 2000);
    } catch {
      setError("No se pudo generar la imagen. Inténtalo de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleShareToInstagram = async () => {
    setIsSharing(true);
    setError(null);
    try {
      const blob = await generateInstagramGraphic({
        imageSrc: gallery[selectedImageIndex]?.src ?? item.image,
        logoSrc,
        title,
        priceText,
        logoPosition,
        format,
        gradientColor,
        gradientIntensity,
        instagramHandle,
        item,
        preset,
        yearMakeSizeRem,
        modelSizeRem,
        topGradientPercent,
        bottomGradientPercent,
        textColor,
        topBlockOffsetPercent,
        bottomBlockOffsetPercent,
        titleAlign,
      });
      const filename = `${slugify(`${item.year}-${item.make}-${item.model}`)}-${preset}-instagram-post.png`;
      await shareImageOrOpenInstagram(
        blob,
        filename,
        `${item.make} ${item.model}`,
        `${item.make} ${item.model} — ${priceText}`,
      );
    } catch {
      setError("No se pudo abrir Instagram. Inténtalo de nuevo.");
    } finally {
      setIsSharing(false);
    }
  };

  const activeImage = gallery[selectedImageIndex] ?? { src: item.image, alt: item.model };
  const activeFormat = FORMAT_OPTIONS.find((f) => f.id === format) ?? FORMAT_OPTIONS[0];
  const [gradR, gradG, gradB] = hexToRgb(gradientColor);
  const isDark = isColorDark([gradR, gradG, gradB]);
  const primaryTextClass = isDark ? "text-white" : "text-slate-900";
  const secondaryTextClass = isDark ? "text-slate-200" : "text-slate-600";
  const mutedTextClass = isDark ? "text-slate-300" : "text-slate-500";
  const fuelLabel = FUEL_TYPE_LABELS[item.fuelType] ?? item.fuelType;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 12 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="relative z-10 max-h-[92vh] w-full max-w-4xl overflow-y-auto rounded-none border border-slate-200 bg-white shadow-xl"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-semibold text-slate-900">
                Generador de Publicación para Instagram
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Cerrar"
                className="flex h-8 w-8 items-center justify-center rounded-none text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-6 p-6 md:grid-cols-2">
              <div className="mx-auto w-full max-w-[420px]">
                {preset === "card" ? (
                  <motion.div
                    initial="visible"
                    animate="visible"
                    className="pointer-events-none relative mx-auto aspect-[9/16] w-auto max-w-full overflow-hidden"
                    style={{ height: "min(70vh, 569px)" }}
                  >
                    <CarCard
                      car={item}
                      layout="portrait"
                      previewLiftPercent={SAFE_AREA_MARGIN_PERCENT - bottomBlockOffsetPercent}
                      previewImageShiftPercent={10}
                      previewSplitLayout
                      previewSafeTopPercent={SAFE_AREA_MARGIN_PERCENT - topBlockOffsetPercent}
                      previewYearMakeSizeRem={yearMakeSizeRem}
                      previewModelSizeRem={modelSizeRem}
                      previewGradientColor={gradientColor}
                      previewGradientIntensity={gradientIntensity}
                      previewTopGradientPercent={topGradientPercent}
                      previewBottomGradientPercent={bottomGradientPercent}
                      previewTextColor={textColor}
                      previewTitleAlign={titleAlign}
                    />
                  </motion.div>
                ) : (
                <div
                  className={`relative w-full max-h-[70vh] overflow-hidden rounded-none bg-slate-100 ${activeFormat.aspectClass}`}
                >
                  <img
                    src={activeImage.src}
                    alt={activeImage.alt}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                  <div
                    className="absolute inset-x-0 bottom-0 h-2/3"
                    style={{
                      background: `linear-gradient(to top, rgba(${gradR}, ${gradG}, ${gradB}, ${
                        gradientIntensity / 100
                      }) 0%, transparent 100%)`,
                    }}
                  />

                  {/* Logo position is the only layout choice the dealer makes -- the bottom
                      text block below (title / specs+pricing / disclaimer) never changes. */}
                  {logoPosition === "left" && (
                    <img
                      src={logoSrc}
                      alt="Logo"
                      className="absolute left-3 top-3 h-8 max-w-[140px] object-contain object-left"
                    />
                  )}
                  {logoPosition === "center" && (
                    <img
                      src={logoSrc}
                      alt="Logo"
                      className="absolute left-1/2 top-3 h-8 max-w-[140px] -translate-x-1/2 object-contain"
                    />
                  )}
                  {logoPosition === "right" && (
                    <img
                      src={logoSrc}
                      alt="Logo"
                      className="absolute right-3 top-3 h-8 max-w-[140px] object-contain object-right"
                    />
                  )}

                  <div className="absolute inset-x-4 bottom-10 flex flex-col gap-1">
                    <p className={`text-right text-lg font-bold leading-none ${primaryTextClass}`}>
                      {priceText}
                    </p>
                    <p className={`line-clamp-2 text-2xl font-extrabold leading-tight ${primaryTextClass}`}>
                      {title}
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <p className={`truncate text-sm font-semibold ${secondaryTextClass}`}>
                        {item.year} | {mileageFormat.format(item.mileage)} km | {fuelLabel}
                      </p>
                      <p className={`text-xs ${mutedTextClass}`}>{currency.format(item.price)}</p>
                    </div>
                  </div>

                  <p
                    className={`absolute inset-x-4 bottom-7 text-center text-[0.45rem] leading-tight ${mutedTextClass}`}
                    style={{ opacity: 0.7 }}
                  >
                    {DISCLAIMER_TEXT}
                  </p>

                  <div
                    className={`absolute inset-x-0 bottom-0 flex h-7 items-center justify-center gap-2 px-3 text-[0.6rem] font-semibold ${
                      isDark ? "text-white" : "text-slate-900"
                    }`}
                    style={{ backgroundColor: gradientColor }}
                  >
                    <span>Visítenos {instagramHandle}</span>
                    <span>•</span>
                    <span>Link in Bio</span>
                  </div>
                </div>
                )}
              </div>

              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                    <LayoutTemplate size={13} />
                    Estilo
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRESET_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setPreset(option.id)}
                        className={`flex flex-col items-start gap-0.5 border px-3 py-2.5 text-left transition-colors ${
                          preset === option.id
                            ? "border-indigo-500 bg-indigo-50"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <span className="text-sm font-medium text-slate-900">{option.label}</span>
                        <span className="text-[0.7rem] text-slate-500">{option.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
                {preset === "card" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Tamaño Año/Marca</label>
                      <div className="flex items-center gap-3 rounded-none border border-slate-200 px-3 py-2">
                        <button
                          type="button"
                          onClick={() =>
                            setYearMakeSizeRem((v) =>
                              Math.max(TITLE_SIZE_REM_MIN, +(v - TITLE_SIZE_REM_STEP).toFixed(1)),
                            )
                          }
                          disabled={yearMakeSizeRem <= TITLE_SIZE_REM_MIN}
                          aria-label="Disminuir tamaño de año/marca"
                          className="flex h-7 w-7 items-center justify-center rounded-none border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="flex-1 text-center text-sm font-medium text-slate-900">
                          {yearMakeSizeRem.toFixed(1)}rem
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setYearMakeSizeRem((v) =>
                              Math.min(TITLE_SIZE_REM_MAX, +(v + TITLE_SIZE_REM_STEP).toFixed(1)),
                            )
                          }
                          disabled={yearMakeSizeRem >= TITLE_SIZE_REM_MAX}
                          aria-label="Aumentar tamaño de año/marca"
                          className="flex h-7 w-7 items-center justify-center rounded-none border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Tamaño Modelo</label>
                      <div className="flex items-center gap-3 rounded-none border border-slate-200 px-3 py-2">
                        <button
                          type="button"
                          onClick={() =>
                            setModelSizeRem((v) => Math.max(TITLE_SIZE_REM_MIN, +(v - TITLE_SIZE_REM_STEP).toFixed(1)))
                          }
                          disabled={modelSizeRem <= TITLE_SIZE_REM_MIN}
                          aria-label="Disminuir tamaño de modelo"
                          className="flex h-7 w-7 items-center justify-center rounded-none border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="flex-1 text-center text-sm font-medium text-slate-900">
                          {modelSizeRem.toFixed(1)}rem
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            setModelSizeRem((v) => Math.min(TITLE_SIZE_REM_MAX, +(v + TITLE_SIZE_REM_STEP).toFixed(1)))
                          }
                          disabled={modelSizeRem >= TITLE_SIZE_REM_MAX}
                          aria-label="Aumentar tamaño de modelo"
                          className="flex h-7 w-7 items-center justify-center rounded-none border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
                {preset === "classic" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="flex items-center gap-1.5 text-sm font-medium text-slate-600">
                        <Edit3 size={13} />
                        Título
                      </label>
                      <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-11 w-full rounded-none border border-slate-200 bg-white px-4 text-sm text-slate-900 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Precio / Cuota</label>
                      <input
                        value={priceText}
                        onChange={(e) => setPriceText(e.target.value)}
                        className="h-11 w-full rounded-none border border-slate-200 bg-white px-4 text-sm text-slate-900 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Identidad de Marca</label>
                      <div className="flex items-center gap-3 rounded-none border border-slate-200 p-3">
                        <div className="flex h-12 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-none bg-slate-100">
                          <img src={logoSrc} alt="Logo actual" className="max-h-full max-w-full object-contain" />
                        </div>
                        <div className="flex flex-1 flex-col gap-1.5">
                          <button
                            type="button"
                            onClick={() => setLogoSrc(DEFAULT_LOGO_SRC)}
                            className="flex h-8 items-center justify-center gap-1.5 rounded-none border border-slate-200 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                          >
                            <RotateCcw size={12} />
                            Usar Logo Predeterminado
                          </button>
                          <button
                            type="button"
                            onClick={() => logoFileInputRef.current?.click()}
                            className="flex h-8 items-center justify-center gap-1.5 rounded-none border border-slate-200 text-xs font-medium text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900"
                          >
                            <ImageUp size={12} />
                            Subir Nuevo Logo
                          </button>
                          <input
                            ref={logoFileInputRef}
                            type="file"
                            accept="image/png,image/jpeg,image/svg+xml"
                            className="hidden"
                            onChange={handleLogoUpload}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600">Instagram</label>
                  <input
                    value={instagramHandle}
                    onChange={(e) => setInstagramHandle(e.target.value)}
                    placeholder="@drivetime"
                    className="h-11 w-full rounded-none border border-slate-200 bg-white px-4 text-sm text-slate-900 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600">Color del Degradado</label>
                  <div className="flex items-center gap-3 rounded-none border border-slate-200 px-3 py-2">
                    <input
                      type="color"
                      value={gradientColor}
                      onChange={(e) => setGradientColor(e.target.value)}
                      aria-label="Color del degradado"
                      className="h-9 w-14 cursor-pointer rounded-none border border-slate-200 bg-white p-1"
                    />
                    <span className="text-sm font-medium text-slate-900">{gradientColor.toUpperCase()}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600">Intensidad del Degradado</label>
                  <div className="flex items-center gap-3 rounded-none border border-slate-200 px-3 py-2">
                    <button
                      type="button"
                      onClick={() =>
                        setGradientIntensity((v) => Math.max(GRADIENT_INTENSITY_MIN, v - GRADIENT_INTENSITY_STEP))
                      }
                      disabled={gradientIntensity <= GRADIENT_INTENSITY_MIN}
                      aria-label="Disminuir intensidad"
                      className="flex h-7 w-7 items-center justify-center rounded-none border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="flex-1 text-center text-sm font-medium text-slate-900">
                      {gradientIntensity}%
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setGradientIntensity((v) => Math.min(GRADIENT_INTENSITY_MAX, v + GRADIENT_INTENSITY_STEP))
                      }
                      disabled={gradientIntensity >= GRADIENT_INTENSITY_MAX}
                      aria-label="Aumentar intensidad"
                      className="flex h-7 w-7 items-center justify-center rounded-none border border-slate-200 text-slate-600 transition-colors hover:border-slate-300 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {preset === "card" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Altura Degradado Superior</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={GRADIENT_HEIGHT_MIN}
                          max={GRADIENT_HEIGHT_MAX}
                          step={GRADIENT_HEIGHT_STEP}
                          value={topGradientPercent}
                          onChange={(e) => setTopGradientPercent(Number(e.target.value))}
                          aria-label="Altura del degradado superior"
                          className="h-2 flex-1 cursor-pointer accent-indigo-600"
                        />
                        <span className="w-12 text-right text-sm font-medium text-slate-900">
                          {topGradientPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Altura Degradado Inferior</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={GRADIENT_HEIGHT_MIN}
                          max={GRADIENT_HEIGHT_MAX}
                          step={GRADIENT_HEIGHT_STEP}
                          value={bottomGradientPercent}
                          onChange={(e) => setBottomGradientPercent(Number(e.target.value))}
                          aria-label="Altura del degradado inferior"
                          className="h-2 flex-1 cursor-pointer accent-indigo-600"
                        />
                        <span className="w-12 text-right text-sm font-medium text-slate-900">
                          {bottomGradientPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Color de Texto</label>
                      <div className="flex items-center gap-3 rounded-none border border-slate-200 px-3 py-2">
                        <input
                          type="color"
                          value={textColor}
                          onChange={(e) => setTextColor(e.target.value)}
                          aria-label="Color de texto"
                          className="h-9 w-14 cursor-pointer rounded-none border border-slate-200 bg-white p-1"
                        />
                        <span className="text-sm font-medium text-slate-900">{textColor.toUpperCase()}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Alineación del Título</label>
                      <div className="grid grid-cols-3 gap-2">
                        {LOGO_POSITION_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setTitleAlign(option.id)}
                            className={`rounded-none border px-2 py-2 text-sm font-medium transition-colors ${
                              titleAlign === option.id
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Posición Bloque Superior</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={BLOCK_OFFSET_MIN}
                          max={BLOCK_OFFSET_MAX}
                          step={BLOCK_OFFSET_STEP}
                          value={topBlockOffsetPercent}
                          onChange={(e) => setTopBlockOffsetPercent(Number(e.target.value))}
                          aria-label="Posición del bloque superior"
                          className="h-2 flex-1 cursor-pointer accent-indigo-600"
                        />
                        <span className="w-12 text-right text-sm font-medium text-slate-900">
                          {topBlockOffsetPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Posición Bloque Inferior</label>
                      <div className="flex items-center gap-3">
                        <input
                          type="range"
                          min={BLOCK_OFFSET_MIN}
                          max={BLOCK_OFFSET_MAX}
                          step={BLOCK_OFFSET_STEP}
                          value={bottomBlockOffsetPercent}
                          onChange={(e) => setBottomBlockOffsetPercent(Number(e.target.value))}
                          aria-label="Posición del bloque inferior"
                          className="h-2 flex-1 cursor-pointer accent-indigo-600"
                        />
                        <span className="w-12 text-right text-sm font-medium text-slate-900">
                          {bottomBlockOffsetPercent}%
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2 border-t border-slate-200 pt-4">
                      <label className="text-sm font-medium text-slate-600">Guardar Configuración</label>
                      <div className="flex gap-2">
                        <input
                          value={presetName}
                          onChange={(e) => setPresetName(e.target.value)}
                          placeholder="Nombre del preset"
                          className="h-9 flex-1 rounded-none border border-slate-200 bg-white px-3 text-sm text-slate-900 focus-visible:border-indigo-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100"
                        />
                        <button
                          type="button"
                          onClick={handleSavePreset}
                          disabled={!presetName.trim()}
                          className="flex h-9 items-center justify-center rounded-none bg-indigo-600 px-3 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Guardar
                        </button>
                      </div>
                      {Object.keys(cardPresets).length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          {Object.keys(cardPresets).map((name) => (
                            <div
                              key={name}
                              className="flex items-center justify-between gap-2 border border-slate-200 px-3 py-1.5"
                            >
                              <span className="truncate text-sm text-slate-700">{name}</span>
                              <div className="flex flex-shrink-0 items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleLoadPreset(name)}
                                  className="rounded-none px-2 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50"
                                >
                                  Cargar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeletePreset(name)}
                                  aria-label={`Eliminar preset ${name}`}
                                  className="flex h-6 w-6 items-center justify-center rounded-none text-slate-400 hover:bg-red-50 hover:text-red-600"
                                >
                                  <X size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}

                {preset === "classic" && (
                  <>
                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Formato</label>
                      <div className="grid grid-cols-3 gap-2">
                        {FORMAT_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setFormat(option.id)}
                            className={`rounded-none border px-2 py-2 text-[0.75rem] font-medium transition-colors ${
                              format === option.id
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-sm font-medium text-slate-600">Posición del Logo</label>
                      <div className="grid grid-cols-3 gap-2">
                        {LOGO_POSITION_OPTIONS.map((option) => (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() => setLogoPosition(option.id)}
                            className={`rounded-none border px-2 py-2 text-sm font-medium transition-colors ${
                              logoPosition === option.id
                                ? "border-indigo-500 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-slate-600">Fotos del vehículo</label>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {gallery.map((image, index) => (
                      <button
                        key={image.src + index}
                        type="button"
                        onClick={() => setSelectedImageIndex(index)}
                        className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-none border-2 transition-colors ${
                          index === selectedImageIndex
                            ? "border-indigo-500"
                            : "border-transparent hover:border-slate-300"
                        }`}
                      >
                        <img src={image.src} alt={image.alt} className="h-full w-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button
                  type="button"
                  onClick={handleDownload}
                  disabled={isGenerating}
                  className="mt-2 flex h-11 items-center justify-center gap-2 rounded-none bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Download size={16} />
                  {isGenerating ? "Generando..." : "Descargar Imagen Final"}
                </button>

                <button
                  type="button"
                  onClick={handleShareToInstagram}
                  disabled={isSharing}
                  className="flex h-11 items-center justify-center gap-2 rounded-none border border-slate-200 bg-white text-sm font-medium text-slate-900 transition-colors hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <InstagramGlyph size={16} />
                  {isSharing ? "Abriendo..." : "Abrir en Instagram"}
                </button>
                <p className="text-center text-[0.75rem] text-slate-500">
                  Desde el celular abre la app de Instagram — debes tener la sesión iniciada, de lo
                  contrario te pedirá iniciar sesión.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
