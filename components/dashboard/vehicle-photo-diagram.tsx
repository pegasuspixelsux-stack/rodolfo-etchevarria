import { Check } from "lucide-react";
import { SHOT_POSITIONS, type ShotPositionId } from "@/lib/vehicle-photo-shots";

// Top-down schematic used to point the user to exactly where each of the 10
// required shots should be taken from — 8 markers around the car outline for
// the exterior angles, 2 inside it for the interior shots.
const MARKER_COORDS: Record<ShotPositionId, { x: number; y: number }> = {
  "front-center": { x: 100, y: 14 },
  "front-left": { x: 34, y: 40 },
  "front-right": { x: 166, y: 40 },
  "side-driver": { x: 14, y: 170 },
  "side-passenger": { x: 186, y: 170 },
  "rear-center": { x: 100, y: 326 },
  "rear-left": { x: 34, y: 300 },
  "rear-right": { x: 166, y: 300 },
  "interior-front": { x: 100, y: 115 },
  "interior-rear": { x: 100, y: 225 },
};

export function VehiclePhotoDiagram({
  filled,
  nextId,
  onSelect,
}: {
  filled: Partial<Record<ShotPositionId, boolean>>;
  nextId: ShotPositionId | null;
  onSelect: (id: ShotPositionId) => void;
}) {
  return (
    <svg
      viewBox="0 0 200 340"
      role="img"
      aria-label="Diagrama de las 10 posiciones de foto requeridas para el vehículo"
      className="mx-auto h-auto w-full max-w-[220px]"
    >
      <rect x="55" y="30" width="90" height="280" rx="26" className="fill-slate-100 stroke-slate-300" strokeWidth="2" />
      <rect x="70" y="66" width="60" height="46" rx="8" className="fill-slate-200" />
      <rect x="70" y="228" width="60" height="46" rx="8" className="fill-slate-200" />
      <rect x="39" y="66" width="13" height="42" rx="4" className="fill-slate-400" />
      <rect x="148" y="66" width="13" height="42" rx="4" className="fill-slate-400" />
      <rect x="39" y="232" width="13" height="42" rx="4" className="fill-slate-400" />
      <rect x="148" y="232" width="13" height="42" rx="4" className="fill-slate-400" />

      {SHOT_POSITIONS.map((position, index) => {
        const coord = MARKER_COORDS[position.id];
        const isFilled = Boolean(filled[position.id]);
        const isNext = position.id === nextId;
        return (
          <g
            key={position.id}
            transform={`translate(${coord.x}, ${coord.y})`}
            onClick={() => onSelect(position.id)}
            className="cursor-pointer"
          >
            <title>{position.label}</title>
            {isNext && (
              <circle r="15" className="fill-none stroke-indigo-500" strokeWidth="2">
                <animate attributeName="r" values="13;17;13" dur="1.6s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.7;0.1;0.7" dur="1.6s" repeatCount="indefinite" />
              </circle>
            )}
            <circle
              r="11"
              className={
                isFilled
                  ? "fill-emerald-500 stroke-emerald-600"
                  : isNext
                    ? "fill-indigo-600 stroke-indigo-700"
                    : "fill-white stroke-slate-300"
              }
              strokeWidth="1.5"
            />
            {isFilled ? (
              <foreignObject x="-7" y="-7" width="14" height="14">
                <Check size={14} className="text-white" strokeWidth={3} />
              </foreignObject>
            ) : (
              <text
                textAnchor="middle"
                dominantBaseline="central"
                className={`text-[10px] font-semibold ${isNext ? "fill-white" : "fill-slate-500"}`}
              >
                {index + 1}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}
