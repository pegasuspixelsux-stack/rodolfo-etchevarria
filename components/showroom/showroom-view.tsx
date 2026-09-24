"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import { motion } from "framer-motion";
import { Rows, Grid2x2 } from "lucide-react";
import { CarCard } from "@/components/car-card";
import { useInventory } from "@/lib/firebase/inventory";
import { fadeUp, staggerContainer } from "@/lib/motion";
import type { InventoryItem } from "@/lib/dashboard-data";
import {
  ALL,
  ShowroomFilters,
  type ShowroomFilterState,
} from "@/components/showroom/showroom-filters";

const PAGE_SIZE = 12;
const MOBILE_PAGE_SIZE = 6;
const MOBILE_BREAKPOINT = "(max-width: 767px)";

function subscribeToMobileBreakpoint(callback: () => void) {
  const mql = window.matchMedia(MOBILE_BREAKPOINT);
  mql.addEventListener("change", callback);
  return () => mql.removeEventListener("change", callback);
}
function getIsMobileSnapshot() {
  return window.matchMedia(MOBILE_BREAKPOINT).matches;
}
function getIsMobileServerSnapshot() {
  return false;
}

const DEFAULT_STATE: ShowroomFilterState = {
  search: "",
  make: ALL,
  bodyType: ALL,
  fuelType: ALL,
  maxPrice: Infinity,
  sortBy: "relevance",
};

export function ShowroomView({ initialCars }: { initialCars?: InventoryItem[] }) {
  const { items: cars, loading, error } = useInventory(initialCars);

  const priceBounds = useMemo(() => {
    if (cars.length === 0) return { min: 0, max: 200000 };
    const prices = cars.map((car) => car.price);
    return { min: 0, max: Math.max(...prices) };
  }, [cars]);

  const makes = useMemo(
    () => Array.from(new Set(cars.map((car) => car.make))).sort(),
    [cars],
  );
  const bodyTypes = useMemo(
    () => Array.from(new Set(cars.map((car) => car.bodyType))).sort(),
    [cars],
  );
  const fuelTypes = useMemo(
    () => Array.from(new Set(cars.map((car) => car.fuelType))).sort(),
    [cars],
  );

  const [filters, setFilters] = useState<ShowroomFilterState>(DEFAULT_STATE);
  const [loadedPages, setLoadedPages] = useState(1);
  const [mobileColumns, setMobileColumns] = useState<1 | 2>(1);
  const isMobile = useSyncExternalStore(
    subscribeToMobileBreakpoint,
    getIsMobileSnapshot,
    getIsMobileServerSnapshot,
  );
  const pageSize = isMobile ? MOBILE_PAGE_SIZE : PAGE_SIZE;
  const visibleCount = loadedPages * pageSize;

  useEffect(() => {
    if (priceBounds.max > 0 && filters.maxPrice === Infinity) {
      setFilters((current) => ({ ...current, maxPrice: priceBounds.max }));
    }
  }, [priceBounds.max, filters.maxPrice]);

  const handleFilterChange = (patch: Partial<ShowroomFilterState>) => {
    setFilters((current) => ({ ...current, ...patch }));
    setLoadedPages(1);
  };

  const handleReset = () => {
    setFilters({ ...DEFAULT_STATE, maxPrice: priceBounds.max });
    setLoadedPages(1);
  };

  const filtered = useMemo(() => {
    const query = filters.search.trim().toLowerCase();
    const result = cars.filter((car) => {
      if (filters.make !== ALL && car.make !== filters.make) return false;
      if (filters.bodyType !== ALL && car.bodyType !== filters.bodyType) return false;
      if (filters.fuelType !== ALL && car.fuelType !== filters.fuelType) return false;
      if (car.price > filters.maxPrice) return false;
      if (query) {
        const haystack = `${car.make} ${car.model} ${car.trim}`.toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      return true;
    });

    const sorted = [...result];
    switch (filters.sortBy) {
      case "price-asc":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "price-desc":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "year-desc":
        sorted.sort((a, b) => b.year - a.year);
        break;
      case "mileage-asc":
        sorted.sort((a, b) => a.mileage - b.mileage);
        break;
      default:
        break;
    }
    return sorted;
  }, [cars, filters]);

  const visibleCars = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  return (
    <section className="mx-auto max-w-7xl px-3 pb-28 pt-10 sm:px-6 lg:px-8">
      <motion.div
        variants={fadeUp}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        className="mb-10"
      >
        <h1 className="font-heading text-3xl font-normal tracking-tight text-foreground sm:text-5xl">
          Sala de Exhibición
        </h1>
        <p className="mt-3 max-w-xl text-[0.95rem] text-muted">
          Explorá nuestra colección completa de vehículos certificados — usá la
          búsqueda avanzada para encontrar exactamente lo que buscás.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        <ShowroomFilters
          state={filters}
          onChange={handleFilterChange}
          onReset={handleReset}
          makes={makes}
          bodyTypes={bodyTypes}
          fuelTypes={fuelTypes}
          priceBounds={priceBounds}
          resultCount={filtered.length}
        />

        <div>
          {error && (
            <p className="mb-6 text-center text-sm text-muted">
              No se pudo cargar el inventario — intenta de nuevo.
            </p>
          )}

          <div className="mb-4 flex items-center justify-end gap-1 border border-border-strong p-1 md:hidden">
            <button
              type="button"
              onClick={() => setMobileColumns(1)}
              aria-label="Ver en una columna"
              aria-pressed={mobileColumns === 1}
              className={`flex h-8 w-8 items-center justify-center transition-colors duration-200 ${
                mobileColumns === 1
                  ? "bg-foreground text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Rows size={15} />
            </button>
            <button
              type="button"
              onClick={() => setMobileColumns(2)}
              aria-label="Ver en dos columnas"
              aria-pressed={mobileColumns === 2}
              className={`flex h-8 w-8 items-center justify-center transition-colors duration-200 ${
                mobileColumns === 2
                  ? "bg-foreground text-accent-foreground"
                  : "text-muted hover:text-foreground"
              }`}
            >
              <Grid2x2 size={15} />
            </button>
          </div>

          {!loading && filtered.length === 0 && !error && (
            <div className="flex min-h-[300px] flex-col items-center justify-center gap-2 rounded-none border border-dashed border-border-strong text-center">
              <p className="text-[1rem] font-medium text-foreground">
                No encontramos vehículos con estos filtros
              </p>
              <p className="text-[0.85rem] text-muted">
                Probá ajustando el precio máximo o limpiando la búsqueda.
              </p>
            </div>
          )}

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className={`grid gap-3 sm:gap-6 lg:grid-cols-3 ${
              mobileColumns === 1 ? "grid-cols-1" : "grid-cols-2"
            }`}
          >
            {!loading &&
              visibleCars.map((car) => (
                <CarCard key={car.id} car={car} layout="portrait" mobileList={mobileColumns === 1} />
              ))}
          </motion.div>

          {hasMore && (
            <div className="mt-10 flex justify-center">
              <button
                type="button"
                onClick={() => setLoadedPages((count) => count + 1)}
                className="inline-flex h-11 items-center rounded-none border border-border-strong px-6 text-[0.85rem] font-medium text-foreground transition-colors duration-200 hover:border-foreground/40"
              >
                Cargar más vehículos
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
