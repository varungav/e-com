"use client";

import { useState } from "react";
import { SlidersHorizontal, X } from "lucide-react";

export default function FilterPanel({
  children,
  activeCount,
  defaultOpen = false,
}: {
  children: React.ReactNode;
  activeCount: number;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="mb-6">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        className={`pill inline-flex items-center gap-2 ${
          isOpen
            ? "bg-brand text-white shadow-soft"
            : "bg-white text-ink-600 ring-1 ring-inset ring-ink-100 hover:bg-ink-50"
        }`}
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="h-4 w-4" /> : <SlidersHorizontal className="h-4 w-4" />}
        Filters
        {activeCount > 0 && (
          <span
            className={`flex h-5 min-w-[20px] items-center justify-center rounded-full px-1 text-xs font-bold ${
              isOpen ? "bg-white/25" : "bg-brand text-white"
            }`}
          >
            {activeCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="animate-fade-slide-up mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {children}
        </div>
      )}
    </div>
  );
}
