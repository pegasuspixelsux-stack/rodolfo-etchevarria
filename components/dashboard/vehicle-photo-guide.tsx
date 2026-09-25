"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { Camera, Check, Trash2 } from "lucide-react";
import { uploadInventoryImage } from "@/lib/firebase/storage";
import { SHOT_POSITIONS, MAX_VEHICLE_PHOTOS, type ShotPositionId } from "@/lib/vehicle-photo-shots";
import { VehiclePhotoDiagram } from "@/components/dashboard/vehicle-photo-diagram";

/**
 * Guided 10-shot vehicle photo capture, built mobile-first: a top-down car
 * diagram shows which of the 10 required positions are done vs. missing, a
 * "next shot" button walks the user around the car in order, and each slot
 * can also be captured/retaken individually from the list below. Every file
 * goes through uploadInventoryImage (HEIC/format normalization, resize,
 * compress under 3MB) before it's stored.
 */
export function VehiclePhotoGuide({
  carId,
  value,
  onChange,
}: {
  carId: string;
  value: (string | null)[];
  onChange: (next: (string | null)[]) => void;
}) {
  const [uploadingId, setUploadingId] = useState<ShotPositionId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pendingSlotRef = useRef<ShotPositionId | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const filled: Partial<Record<ShotPositionId, boolean>> = {};
  SHOT_POSITIONS.forEach((position, index) => {
    filled[position.id] = Boolean(value[index]);
  });

  const filledCount = SHOT_POSITIONS.filter((position) => filled[position.id]).length;
  const nextPosition = SHOT_POSITIONS.find((position) => !filled[position.id]) ?? null;

  const openCaptureFor = (id: ShotPositionId) => {
    pendingSlotRef.current = id;
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (file: File) => {
    const slotId = pendingSlotRef.current;
    if (!slotId) return;
    const index = SHOT_POSITIONS.findIndex((position) => position.id === slotId);
    if (index === -1) return;

    setUploadingId(slotId);
    setError(null);
    try {
      const url = await uploadInventoryImage(file, carId);
      const next = [...value];
      while (next.length < MAX_VEHICLE_PHOTOS) next.push(null);
      next[index] = url;
      onChange(next);
    } catch (err) {
      console.error("uploadInventoryImage (vehicle photo guide) failed:", err);
      setError("No se pudo subir la foto. Intenta de nuevo.");
    } finally {
      setUploadingId(null);
      pendingSlotRef.current = null;
    }
  };

  const handleRemove = (id: ShotPositionId) => {
    const index = SHOT_POSITIONS.findIndex((position) => position.id === id);
    if (index === -1) return;
    const next = [...value];
    next[index] = null;
    onChange(next);
  };

  return (
    <div className="flex flex-col gap-4 rounded-none border border-slate-200 bg-white p-4">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.target.value = "";
          if (file) void handleFileSelected(file);
        }}
      />

      <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start sm:gap-6">
        <div className="w-full max-w-[180px] flex-shrink-0">
          <VehiclePhotoDiagram
            filled={filled}
            nextId={nextPosition?.id ?? null}
            onSelect={(id) => openCaptureFor(id)}
          />
        </div>

        <div className="flex w-full flex-col gap-3">
          <div>
            <p className="text-sm font-medium text-slate-900">
              {filledCount} de {MAX_VEHICLE_PHOTOS} fotos completas
            </p>
            <p className="mt-0.5 text-xs text-slate-500">
              Tocá un punto del diagrama o el botón de abajo para sacar la
              siguiente foto sugerida. Seguí el orden para no olvidarte
              ningún ángulo.
            </p>
          </div>

          {nextPosition ? (
            <button
              type="button"
              onClick={() => openCaptureFor(nextPosition.id)}
              disabled={uploadingId !== null}
              className="flex h-11 items-center justify-center gap-2 rounded-none bg-indigo-600 px-4 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Camera size={16} />
              {uploadingId === nextPosition.id
                ? "Subiendo…"
                : `Siguiente: ${nextPosition.label}`}
            </button>
          ) : (
            <p className="flex h-11 items-center justify-center gap-2 border border-emerald-200 bg-emerald-50 text-sm font-medium text-emerald-700">
              <Check size={16} />
              Set de 10 fotos completo
            </p>
          )}

          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-slate-100 pt-3">
        {SHOT_POSITIONS.map((position, index) => {
          const url = value[index];
          const isUploading = uploadingId === position.id;
          return (
            <div
              key={position.id}
              className="flex items-center gap-3 py-1"
            >
              <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-none border border-slate-200 bg-slate-50">
                {url ? (
                  <Image src={url} alt={position.label} fill sizes="48px" className="object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-xs font-medium text-slate-400">
                    {index + 1}
                  </span>
                )}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-slate-900">{position.label}</p>
                <p className="text-xs text-slate-500">
                  {url ? "Foto cargada" : isUploading ? "Subiendo…" : "Falta esta foto"}
                </p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-1">
                <button
                  type="button"
                  onClick={() => openCaptureFor(position.id)}
                  disabled={uploadingId !== null}
                  className="flex h-8 w-8 items-center justify-center rounded-none text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label={url ? `Retomar foto: ${position.label}` : `Tomar foto: ${position.label}`}
                >
                  <Camera size={15} />
                </button>
                {url && (
                  <button
                    type="button"
                    onClick={() => handleRemove(position.id)}
                    className="flex h-8 w-8 items-center justify-center rounded-none text-slate-500 transition-colors hover:bg-red-50 hover:text-red-600"
                    aria-label={`Quitar foto: ${position.label}`}
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
