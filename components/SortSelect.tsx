"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronDown } from "lucide-react";

const OPTIONS = [
  { value: "newest", label: "Newest" },
  { value: "price-asc", label: "Price: Low to High" },
  { value: "price-desc", label: "Price: High to Low" },
  { value: "name", label: "Name: A to Z" },
];

export default function SortSelect() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "newest") {
      params.delete("sort");
    } else {
      params.set("sort", e.target.value);
    }
    router.push(`/shop?${params.toString()}`);
  }

  return (
    <div className="relative inline-flex">
      <select
        className="appearance-none rounded-full border border-ink-100 bg-white py-2 pl-4 pr-9 text-sm font-medium text-ink-900 shadow-sm transition hover:border-ink-200 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand-200"
        value={searchParams.get("sort") || "newest"}
        onChange={handleChange}
        aria-label="Sort products"
      >
        {OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
    </div>
  );
}
