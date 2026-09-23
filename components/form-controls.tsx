"use client";

import type { InputHTMLAttributes, ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[0.8rem] font-medium text-muted">{label}</label>
      {children}
    </div>
  );
}

export function FormSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full appearance-none rounded-xl border border-border-strong bg-surface px-4 pr-10 text-[0.9rem] text-foreground transition-colors duration-200 hover:border-foreground/30 focus-visible:border-foreground/50 focus-visible:outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option} className="bg-surface">
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-muted"
      />
    </div>
  );
}

export function FormInput(props: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="h-12 w-full rounded-xl border border-border-strong bg-surface px-4 text-[0.9rem] text-foreground placeholder:text-muted-2 transition-colors duration-200 hover:border-foreground/30 focus-visible:border-foreground/50 focus-visible:outline-none"
    />
  );
}
