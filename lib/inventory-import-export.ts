import ExcelJS from "exceljs";
import type { Car } from "@/data/cars";
import type { InventoryItem, InventoryStatus } from "@/lib/dashboard-data";
import { slugify } from "@/lib/share/instagram-graphic";

type FuelType = Car["fuelType"];
type BodyType = Car["bodyType"];

const DEFAULT_IMAGE_URL =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1600&q=80";

const FUEL_TYPE_LABELS: Record<FuelType, string> = {
  Gasoline: "Nafta",
  Hybrid: "Híbrido",
  Electric: "Eléctrico",
};

const BODY_TYPE_LABELS: Record<BodyType, string> = {
  Sedan: "Sedán",
  SUV: "SUV",
  Coupe: "Cupé",
  Truck: "Camioneta",
};

const STATUS_LABELS: Record<InventoryStatus, string> = {
  Available: "Disponible",
  Reserved: "Reservado",
  Sold: "Vendido",
};

const FUEL_TYPE_VALUES = Object.keys(FUEL_TYPE_LABELS) as FuelType[];
const BODY_TYPE_VALUES = Object.keys(BODY_TYPE_LABELS) as BodyType[];
const STATUS_VALUES = Object.keys(STATUS_LABELS) as InventoryStatus[];

export interface ImportedVehicleDraft {
  make: string;
  model: string;
  trim: string;
  year: number;
  price: number;
  mileage: number;
  transmission: string;
  fuelType: FuelType;
  bodyType: BodyType;
  color: string;
  colorHex: string;
  status: InventoryStatus;
  description: string;
}

export interface ParsedRowError {
  row: number;
  reason: string;
}

export interface ParseResult {
  valid: ImportedVehicleDraft[];
  errors: ParsedRowError[];
}

interface TemplateColumn {
  key: keyof ImportedVehicleDraft;
  header: string;
  width: number;
}

const TEMPLATE_COLUMNS: TemplateColumn[] = [
  { key: "make", header: "Marca", width: 16 },
  { key: "model", header: "Modelo", width: 16 },
  { key: "trim", header: "Versión", width: 16 },
  { key: "year", header: "Año", width: 8 },
  { key: "price", header: "Precio", width: 12 },
  { key: "mileage", header: "Kilometraje", width: 12 },
  { key: "transmission", header: "Transmisión", width: 18 },
  { key: "fuelType", header: "Combustible", width: 14 },
  { key: "bodyType", header: "Carrocería", width: 12 },
  { key: "color", header: "Color", width: 16 },
  { key: "colorHex", header: "Código de Color", width: 16 },
  { key: "status", header: "Estado", width: 14 },
  { key: "description", header: "Descripción", width: 40 },
];

const EXAMPLE_ROWS: Record<keyof ImportedVehicleDraft, string | number>[] = [
  {
    make: "Toyota",
    model: "Camry",
    trim: "SE",
    year: 2022,
    price: 28500,
    mileage: 15000,
    transmission: "Automática",
    fuelType: "Nafta",
    bodyType: "Sedán",
    color: "Blanco Perlado",
    colorHex: "#f2f1ec",
    status: "Disponible",
    description: "Fila de ejemplo — reemplazá estos datos por los del vehículo real.",
  },
  {
    make: "Ford",
    model: "F-150",
    trim: "XLT",
    year: 2021,
    price: 34900,
    mileage: 42000,
    transmission: "Automática",
    fuelType: "Nafta",
    bodyType: "Camioneta",
    color: "Gris Plata",
    colorHex: "#8a8d91",
    status: "Disponible",
    description: "",
  },
];

// Header text is matched case/accent-insensitively so dealers can bring their
// own spreadsheet wording (English or Spanish) instead of only the template's.
const HEADER_ALIASES: Record<string, keyof ImportedVehicleDraft> = {
  marca: "make",
  make: "make",
  brand: "make",
  modelo: "model",
  model: "model",
  version: "trim",
  versión: "trim",
  trim: "trim",
  ano: "year",
  anio: "year",
  año: "year",
  year: "year",
  precio: "price",
  price: "price",
  kilometraje: "mileage",
  km: "mileage",
  mileage: "mileage",
  millas: "mileage",
  transmision: "transmission",
  transmisión: "transmission",
  transmission: "transmission",
  combustible: "fuelType",
  "fuel type": "fuelType",
  fueltype: "fuelType",
  carroceria: "bodyType",
  carrocería: "bodyType",
  "body type": "bodyType",
  bodytype: "bodyType",
  color: "color",
  "codigo de color": "colorHex",
  "código de color": "colorHex",
  "color hex": "colorHex",
  colorhex: "colorHex",
  hex: "colorHex",
  estado: "status",
  status: "status",
  descripcion: "description",
  descripción: "description",
  description: "description",
};

function normalizeHeaderText(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, " ");
}

function resolveHeaderKey(raw: string): keyof ImportedVehicleDraft | undefined {
  return HEADER_ALIASES[normalizeHeaderText(raw)];
}

function resolveEnum<T extends string>(
  raw: string | undefined,
  labels: Record<T, string>,
  values: T[],
  fallback: T,
): T {
  const text = normalizeHeaderText(raw ?? "");
  if (!text) return fallback;
  const byValue = values.find((value) => normalizeHeaderText(value) === text);
  if (byValue) return byValue;
  const byLabel = values.find((value) => normalizeHeaderText(labels[value]) === text);
  return byLabel ?? fallback;
}

function parseNumber(raw: string | undefined): number {
  const cleaned = (raw ?? "").replace(/[^\d.-]/g, "");
  const value = Number(cleaned);
  return Number.isFinite(value) ? value : NaN;
}

function rowsToDrafts(rows: Record<string, string>[]): ParseResult {
  const valid: ImportedVehicleDraft[] = [];
  const errors: ParsedRowError[] = [];

  rows.forEach((raw, index) => {
    const rowNumber = index + 2; // row 1 is the header
    const make = (raw.make ?? "").trim();
    const model = (raw.model ?? "").trim();
    const price = parseNumber(raw.price);

    if (!make) {
      errors.push({ row: rowNumber, reason: "Falta la marca" });
      return;
    }
    if (!model) {
      errors.push({ row: rowNumber, reason: "Falta el modelo" });
      return;
    }
    if (!Number.isFinite(price) || price <= 0) {
      errors.push({ row: rowNumber, reason: "Precio inválido o faltante" });
      return;
    }

    const year = Number((raw.year ?? "").trim());
    const mileage = parseNumber(raw.mileage);

    valid.push({
      make,
      model,
      trim: (raw.trim ?? "").trim() || "Base",
      year: Number.isFinite(year) && year > 0 ? year : new Date().getFullYear(),
      price,
      mileage: Number.isFinite(mileage) && mileage >= 0 ? mileage : 0,
      transmission: (raw.transmission ?? "").trim() || "Automatic",
      fuelType: resolveEnum(raw.fuelType, FUEL_TYPE_LABELS, FUEL_TYPE_VALUES, "Gasoline"),
      bodyType: resolveEnum(raw.bodyType, BODY_TYPE_LABELS, BODY_TYPE_VALUES, "Sedan"),
      color: (raw.color ?? "").trim() || "Jet Black",
      colorHex: (raw.colorHex ?? "").trim() || "#0a0a0b",
      status: resolveEnum(raw.status, STATUS_LABELS, STATUS_VALUES, "Available"),
      description: (raw.description ?? "").trim(),
    });
  });

  return { valid, errors };
}

function splitCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

  for (let i = 0; i < normalized.length; i++) {
    const char = normalized[i];
    if (inQuotes) {
      if (char === '"') {
        if (normalized[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += char;
      }
    } else if (char === '"') {
      inQuotes = true;
    } else if (char === ",") {
      row.push(field);
      field = "";
    } else if (char === "\n") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else {
      field += char;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((cells) => !(cells.length === 1 && cells[0].trim() === ""));
}

function parseCsvRows(text: string): Record<string, string>[] {
  const rows = splitCsvRows(text);
  if (rows.length === 0) return [];

  const headerKeys = rows[0].map((cell) => resolveHeaderKey(cell));
  return rows.slice(1).map((cells) => {
    const record: Record<string, string> = {};
    headerKeys.forEach((key, i) => {
      if (key) record[key] = cells[i] ?? "";
    });
    return record;
  });
}

function cellToString(value: ExcelJS.CellValue): string {
  if (value === null || value === undefined) return "";
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "object") {
    if ("result" in value) return cellToString((value as { result: ExcelJS.CellValue }).result);
    if ("richText" in value) {
      return (value as { richText: { text: string }[] }).richText.map((part) => part.text).join("");
    }
    if ("text" in value) return String((value as { text: unknown }).text);
    return String(value);
  }
  return String(value);
}

async function parseXlsxRows(file: File): Promise<Record<string, string>[]> {
  const buffer = await file.arrayBuffer();
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const sheet = workbook.worksheets[0];
  if (!sheet) return [];

  const headerKeys: (keyof ImportedVehicleDraft | undefined)[] = [];
  sheet.getRow(1).eachCell({ includeEmpty: true }, (cell, colNumber) => {
    headerKeys[colNumber] = resolveHeaderKey(cellToString(cell.value));
  });

  const rows: Record<string, string>[] = [];
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    const record: Record<string, string> = {};
    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
      const key = headerKeys[colNumber];
      if (key) record[key] = cellToString(cell.value);
    });
    if (Object.values(record).some((value) => value.trim() !== "")) {
      rows.push(record);
    }
  });
  return rows;
}

export async function parseInventoryFile(file: File): Promise<ParseResult> {
  const isCsv = file.name.toLowerCase().endsWith(".csv") || file.type === "text/csv";
  const rows = isCsv ? parseCsvRows(await file.text()) : await parseXlsxRows(file);
  return rowsToDrafts(rows);
}

export function generateVehicleId(draft: Pick<ImportedVehicleDraft, "make" | "model" | "trim" | "year">): string {
  const base = slugify(`${draft.make}-${draft.model}-${draft.trim}-${draft.year}`) || "vehiculo";
  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base}-${suffix}`;
}

export function draftToInventoryItem(draft: ImportedVehicleDraft): InventoryItem {
  return {
    id: generateVehicleId(draft),
    make: draft.make,
    model: draft.model,
    trim: draft.trim,
    year: draft.year,
    price: draft.price,
    mileage: draft.mileage,
    transmission: draft.transmission,
    fuelType: draft.fuelType,
    bodyType: draft.bodyType,
    color: draft.color,
    colorHex: draft.colorHex,
    status: draft.status,
    image: DEFAULT_IMAGE_URL,
    description: draft.description || undefined,
  };
}

async function downloadWorkbook(workbook: ExcelJS.Workbook, filename: string): Promise<void> {
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function buildInventorySheet(workbook: ExcelJS.Workbook) {
  const sheet = workbook.addWorksheet("Inventario");
  sheet.columns = TEMPLATE_COLUMNS.map(({ key, header, width }) => ({ header, key, width }));
  sheet.getRow(1).font = { bold: true };
  return sheet;
}

export async function downloadInventoryTemplate(): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = buildInventorySheet(workbook);
  EXAMPLE_ROWS.forEach((row) => sheet.addRow(row));
  await downloadWorkbook(workbook, "plantilla-inventario-dealio.xlsx");
}

export async function exportInventoryToExcel(items: InventoryItem[]): Promise<void> {
  const workbook = new ExcelJS.Workbook();
  const sheet = buildInventorySheet(workbook);
  items.forEach((item) => {
    sheet.addRow({
      make: item.make,
      model: item.model,
      trim: item.trim,
      year: item.year,
      price: item.price,
      mileage: item.mileage,
      transmission: item.transmission,
      fuelType: FUEL_TYPE_LABELS[item.fuelType],
      bodyType: BODY_TYPE_LABELS[item.bodyType],
      color: item.color,
      colorHex: item.colorHex,
      status: STATUS_LABELS[item.status],
      description: item.description ?? "",
    });
  });
  const date = new Date().toISOString().slice(0, 10);
  await downloadWorkbook(workbook, `inventario-dealio-${date}.xlsx`);
}
