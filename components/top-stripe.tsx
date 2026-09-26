"use client";

import { MapPin, Clock } from "lucide-react";
import { useSiteSettings } from "@/lib/firebase/site-settings";

export function TopStripe() {
  const { settings } = useSiteSettings();

  return (
    <div className="fixed top-0 left-0 right-0 z-50 w-full bg-black text-white text-[0.75rem] sm:text-[0.8rem]">
      <div className="mx-auto flex h-9 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-1 sm:gap-2">
          <MapPin size={14} className="shrink-0" />
          <span className="truncate">{settings.dealerLocation}</span>
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Clock size={14} className="shrink-0" />
          <span className="truncate">{settings.dealerHours}</span>
        </div>
      </div>
    </div>
  );
}
