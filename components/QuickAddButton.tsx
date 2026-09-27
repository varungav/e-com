"use client";

import { useState, useTransition } from "react";
import { Check, Plus } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";

export default function QuickAddButton({ productId }: { productId: string }) {
  const [isPending, startTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);

  function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    startTransition(async () => {
      await addToCart(productId, 1);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1400);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      aria-label="Quick add to cart"
      className="absolute bottom-3 right-3 flex h-9 w-9 items-center justify-center rounded-full bg-white text-ink-900 opacity-0 shadow-soft transition duration-200 hover:bg-brand hover:text-white group-hover:opacity-100 disabled:opacity-100"
    >
      {isPending ? (
        <span className="spinner-dark h-3.5 w-3.5" aria-hidden="true" />
      ) : justAdded ? (
        <Check className="h-4 w-4 animate-pop-in" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
    </button>
  );
}
