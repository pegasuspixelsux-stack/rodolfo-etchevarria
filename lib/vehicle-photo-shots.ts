// Canonical 10-shot photo set every vehicle listing should have, and the
// fixed order they're stored/displayed in. Used by the guided dashboard
// upload UI and by the public car detail page's image gallery fallback.
export type ShotPositionId =
  | "front-center"
  | "front-left"
  | "front-right"
  | "side-driver"
  | "side-passenger"
  | "rear-center"
  | "rear-left"
  | "rear-right"
  | "interior-front"
  | "interior-rear";

export type ShotGroup = "front" | "side" | "rear" | "interior";

export interface ShotPosition {
  id: ShotPositionId;
  label: string;
  shortLabel: string;
  group: ShotGroup;
}

export const SHOT_POSITIONS: ShotPosition[] = [
  { id: "front-center", label: "Frente — Centro", shortLabel: "Frente centro", group: "front" },
  { id: "front-left", label: "Frente — Esquina Izquierda", shortLabel: "Frente izq.", group: "front" },
  { id: "front-right", label: "Frente — Esquina Derecha", shortLabel: "Frente der.", group: "front" },
  { id: "side-driver", label: "Lateral — Lado del Conductor", shortLabel: "Lateral conductor", group: "side" },
  { id: "side-passenger", label: "Lateral — Lado del Acompañante", shortLabel: "Lateral acompañante", group: "side" },
  { id: "rear-center", label: "Atrás — Centro", shortLabel: "Atrás centro", group: "rear" },
  { id: "rear-left", label: "Atrás — Esquina Izquierda", shortLabel: "Atrás izq.", group: "rear" },
  { id: "rear-right", label: "Atrás — Esquina Derecha", shortLabel: "Atrás der.", group: "rear" },
  { id: "interior-front", label: "Interior — Cabina Delantera", shortLabel: "Interior delantero", group: "interior" },
  { id: "interior-rear", label: "Interior — Asientos Traseros", shortLabel: "Interior trasero", group: "interior" },
];

export const MAX_VEHICLE_PHOTOS = SHOT_POSITIONS.length;

export const SHOT_POSITION_INDEX: Record<ShotPositionId, number> = Object.fromEntries(
  SHOT_POSITIONS.map((position, index) => [position.id, index]),
) as Record<ShotPositionId, number>;
