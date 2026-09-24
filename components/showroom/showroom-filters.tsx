"use client";

import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { FormField, FormInput, FormSelect } from "@/components/form-controls";
import { RangeSlider } from "@/components/range-slider";

export const ALL = "Todas";

export type SortOption = "relevance" | "price-asc" | "price-desc" | "year-desc" | "mileage-asc";

export interface ShowroomFilterState {
  search: string;
  make: string;
  bodyType: string;
  fuelType: string;
  maxPrice: number;
  sortBy: SortOption;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "relevance", label: "Relevancia" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
  { value: "year-desc", label: "Año: más reciente" },
  { value: "mileage-asc", label: "Kilometraje: menor a mayor" },
];

const BODY_TYPE_LABELS: Record<string, string> = {
  Sedan: "Sedán",
  SUV: "SUV",
  Coupe: "Cupé",
};

const FUEL_TYPE_LABELS: Record<string, string> = {
  Gasoline: "Nafta",
  Hybrid: "Híbrido",
  Electric: "Eléctrico",
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

export function ShowroomFilters({
  state,
  onChange,
  onReset,
  makes,
  bodyTypes,
  fuelTypes,
  priceBounds,
  resultCount,
}: {
  state: ShowroomFilterState;
  onChange: (patch: Partial<ShowroomFilterState>) => void;
  onReset: () => void;
  makes: string[];
  bodyTypes: string[];
  fuelTypes: string[];
  priceBounds: { min: number; max: number };
  resultCount: number;
}) {
  return (
    <aside className="glass flex h-fit flex-col gap-6 rounded-none p-6 sm:p-7 lg:sticky lg:top-24">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2.5">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-none border border-border-strong text-foreground">
            <SlidersHorizontal size={15} />
          </span>
          <span className="text-[0.95rem] font-semibold text-foreground">
            Búsqueda Avanzada
          </span>
        </span>
        <button
          type="button"
          onClick={onReset}
          aria-label="Restablecer filtros"
          className="flex items-center gap-1.5 text-[0.78rem] text-muted transition-colors duration-200 hover:text-foreground"
        >
          <RotateCcw size={13} />
          Limpiar
        </button>
      </div>

      <FormField label="Buscar">
        <FormInput
          placeholder="Marca, modelo o versión"
          value={state.search}
          onChange={(event) => onChange({ search: event.target.value })}
        />
      </FormField>

      <FormField label="Marca">
        <FormSelect
          options={[ALL, ...makes]}
          value={state.make}
          onChange={(value) => onChange({ make: value })}
        />
      </FormField>

      <FormField label="Tipo de Carrocería">
        <FormSelect
          options={[ALL, ...bodyTypes]}
          value={state.bodyType}
          onChange={(value) => onChange({ bodyType: value })}
          labels={BODY_TYPE_LABELS}
        />
      </FormField>

      <FormField label="Combustible">
        <FormSelect
          options={[ALL, ...fuelTypes]}
          value={state.fuelType}
          onChange={(value) => onChange({ fuelType: value })}
          labels={FUEL_TYPE_LABELS}
        />
      </FormField>

      <RangeSlider
        label="Precio Máximo"
        value={state.maxPrice}
        min={priceBounds.min}
        max={priceBounds.max}
        step={1000}
        onChange={(value) => onChange({ maxPrice: value })}
        formatValue={(value) => currency.format(value)}
      />

      <FormField label="Ordenar por">
        <FormSelect
          options={SORT_OPTIONS.map((option) => option.value)}
          value={state.sortBy}
          onChange={(value) => onChange({ sortBy: value as SortOption })}
          labels={Object.fromEntries(SORT_OPTIONS.map((option) => [option.value, option.label]))}
        />
      </FormField>

      <p className="border-t border-border pt-5 text-[0.8rem] text-muted">
        {resultCount} {resultCount === 1 ? "vehículo encontrado" : "vehículos encontrados"}
      </p>
    </aside>
  );
}
