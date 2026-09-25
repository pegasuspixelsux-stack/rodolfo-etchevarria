// Placeholder cards shown only on the genuine first load (no cached/SSR data
// yet). Prevents the grid from ever rendering as blank space — see the
// `loading`-gating bug this replaces in car-grid.tsx / showroom-view.tsx.
export function CarGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="flex animate-pulse flex-col overflow-hidden bg-surface-2">
          <div className="aspect-square w-full bg-surface" />
          <div className="flex flex-col gap-2 p-4">
            <div className="h-4 w-3/4 bg-surface" />
            <div className="h-3 w-1/2 bg-surface" />
            <div className="h-5 w-2/3 bg-surface" />
          </div>
        </div>
      ))}
    </>
  );
}
