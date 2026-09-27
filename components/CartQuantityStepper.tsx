"use client";

import { useState, useTransition } from "react";
import { Minus, Plus } from "lucide-react";
import { updateCartQuantity } from "@/lib/actions/cart";

export default function CartQuantityStepper({
  cartItemId,
  initialQuantity,
  maxQuantity,
}: {
  cartItemId: string;
  initialQuantity: number;
  maxQuantity: number;
}) {
  const [quantity, setQuantity] = useState(initialQuantity);
  const [isPending, startTransition] = useTransition();

  function change(next: number) {
    const clamped = Math.max(1, Math.min(maxQuantity, next));
    if (clamped === quantity) return;
    setQuantity(clamped);
    startTransition(async () => {
      await updateCartQuantity(cartItemId, clamped);
    });
  }

  return (
    <div
      className={`inline-flex items-center rounded-full border border-ink-100 bg-white transition ${
        isPending ? "opacity-60" : ""
      }`}
    >
      <button
        type="button"
        onClick={() => change(quantity - 1)}
        disabled={quantity <= 1 || isPending}
        className="flex h-9 w-9 items-center justify-center text-ink-600 disabled:opacity-40"
        aria-label="Decrease quantity"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-8 text-center text-sm font-medium text-ink-900">{quantity}</span>
      <button
        type="button"
        onClick={() => change(quantity + 1)}
        disabled={quantity >= maxQuantity || isPending}
        className="flex h-9 w-9 items-center justify-center text-ink-600 disabled:opacity-40"
        aria-label="Increase quantity"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
