"use client";

import type { CSSProperties } from "react";

export function RangeSlider({
  label,
  value,
  min,
  max,
  step,
  onChange,
  formatValue,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
  formatValue: (value: number) => string;
}) {
  const progress = ((value - min) / (max - min)) * 100;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <label className="text-[0.85rem] font-medium text-muted">{label}</label>
        <span className="text-[0.95rem] font-semibold text-foreground">
          {formatValue(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-slider"
        style={{ "--progress": `${progress}%` } as CSSProperties}
        aria-label={label}
      />
    </div>
  );
}
