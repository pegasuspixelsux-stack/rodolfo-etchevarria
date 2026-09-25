"use client";

import { useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Download, Loader2, UploadCloud } from "lucide-react";
import { Modal } from "@/components/dashboard/modal";
import type { InventoryItem } from "@/lib/dashboard-data";
import {
  downloadInventoryTemplate,
  draftToInventoryItem,
  parseInventoryFile,
  type ImportedVehicleDraft,
  type ParsedRowError,
} from "@/lib/inventory-import-export";

type Stage = "idle" | "parsing" | "preview" | "importing" | "done";

export function InventoryImportModal({
  open,
  onClose,
  addVehicle,
}: {
  open: boolean;
  onClose: () => void;
  addVehicle: (item: InventoryItem) => Promise<void>;
}) {
  const [stage, setStage] = useState<Stage>("idle");
  const [fileName, setFileName] = useState("");
  const [valid, setValid] = useState<ImportedVehicleDraft[]>([]);
  const [rowErrors, setRowErrors] = useState<ParsedRowError[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const [failedCount, setFailedCount] = useState(0);
  const [parseError, setParseError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setStage("idle");
    setFileName("");
    setValid([]);
    setRowErrors([]);
    setImportedCount(0);
    setFailedCount(0);
    setParseError(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFile = async (file: File) => {
    setFileName(file.name);
    setStage("parsing");
    setParseError(null);
    try {
      const result = await parseInventoryFile(file);
      setValid(result.valid);
      setRowErrors(result.errors);
      setStage("preview");
    } catch {
      setParseError("No se pudo leer el archivo. Verificá que sea un .xlsx o .csv válido.");
      setStage("idle");
    }
  };

  const handleImport = async () => {
    setStage("importing");
    let succeeded = 0;
    let failed = 0;
    for (const draft of valid) {
      try {
        await addVehicle(draftToInventoryItem(draft));
        succeeded++;
      } catch {
        failed++;
      }
    }
    setImportedCount(succeeded);
    setFailedCount(failed);
    setStage("done");
  };

  return (
    <Modal open={open} onClose={handleClose} title="Importar Inventario">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 rounded-none border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            Descargá la plantilla de ejemplo con las columnas de información general (marca,
            modelo, año, precio, etc.). Después de importar, podés editar cada vehículo para
            agregar fotos y características detalladas.
          </p>
          <button
            type="button"
            onClick={() => void downloadInventoryTemplate()}
            className="flex h-9 w-fit items-center gap-2 rounded-none border border-slate-300 bg-white px-3 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-100"
          >
            <Download size={14} />
            Descargar plantilla (.xlsx)
          </button>
        </div>

        {(stage === "idle" || stage === "parsing") && (
          <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-none border-2 border-dashed border-slate-300 bg-white px-4 py-10 text-center transition-colors hover:border-indigo-400 hover:bg-indigo-50/40">
            <input
              ref={inputRef}
              type="file"
              accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              className="hidden"
              disabled={stage === "parsing"}
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) void handleFile(file);
              }}
            />
            {stage === "parsing" ? (
              <>
                <Loader2 size={22} className="animate-spin text-indigo-600" />
                <span className="text-sm text-slate-500">Leyendo {fileName}…</span>
              </>
            ) : (
              <>
                <UploadCloud size={22} className="text-slate-400" />
                <span className="text-sm font-medium text-slate-700">
                  Hacé clic para subir un archivo .xlsx o .csv
                </span>
                <span className="text-xs text-slate-400">Formato de la plantilla o el tuyo propio</span>
              </>
            )}
          </label>
        )}

        {parseError && <p className="text-sm text-red-600">{parseError}</p>}

        {stage === "preview" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">{fileName}</span>
              <span className="font-medium text-slate-900">
                {valid.length} vehículo{valid.length === 1 ? "" : "s"} listo
                {valid.length === 1 ? "" : "s"} para importar
              </span>
            </div>

            {valid.length > 0 && (
              <div className="max-h-48 overflow-y-auto rounded-none border border-slate-200">
                <table className="w-full text-left text-xs">
                  <thead className="sticky top-0 bg-slate-50 text-slate-500">
                    <tr>
                      <th className="px-3 py-2">Vehículo</th>
                      <th className="px-3 py-2">Año</th>
                      <th className="px-3 py-2">Precio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {valid.map((draft, index) => (
                      <tr key={index}>
                        <td className="px-3 py-1.5 text-slate-700">
                          {draft.make} {draft.model} {draft.trim}
                        </td>
                        <td className="px-3 py-1.5 text-slate-500">{draft.year}</td>
                        <td className="px-3 py-1.5 text-slate-500">${draft.price.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {rowErrors.length > 0 && (
              <div className="flex flex-col gap-1.5 rounded-none border border-amber-200 bg-amber-50 p-3">
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-800">
                  <AlertCircle size={14} />
                  {rowErrors.length} fila{rowErrors.length === 1 ? "" : "s"} omitida
                  {rowErrors.length === 1 ? "" : "s"}
                </div>
                <ul className="max-h-24 overflow-y-auto text-xs text-amber-700">
                  {rowErrors.map((rowError, index) => (
                    <li key={index}>
                      Fila {rowError.row}: {rowError.reason}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={reset}
                className="flex h-10 flex-1 items-center justify-center rounded-none border border-slate-300 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100"
              >
                Elegir otro archivo
              </button>
              <button
                type="button"
                onClick={handleImport}
                disabled={valid.length === 0}
                className="flex h-10 flex-1 items-center justify-center rounded-none bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Importar {valid.length} vehículo{valid.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        )}

        {stage === "importing" && (
          <div className="flex flex-col items-center gap-2 py-8">
            <Loader2 size={22} className="animate-spin text-indigo-600" />
            <span className="text-sm text-slate-500">Importando vehículos…</span>
          </div>
        )}

        {stage === "done" && (
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 rounded-none border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
              <CheckCircle2 size={18} />
              <span>
                {importedCount} vehículo{importedCount === 1 ? "" : "s"} importado
                {importedCount === 1 ? "" : "s"} correctamente
                {failedCount > 0 ? `, ${failedCount} fallaron` : ""}.
              </span>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="flex h-10 items-center justify-center rounded-none bg-indigo-600 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Cerrar
            </button>
          </div>
        )}
      </div>
    </Modal>
  );
}
