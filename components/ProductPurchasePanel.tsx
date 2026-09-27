"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Minus, Plus, ShoppingCart, Zap } from "lucide-react";
import { addToCart } from "@/lib/actions/cart";

export default function ProductPurchasePanel({
  productId,
  maxQuantity,
  disabled,
}: {
  productId: string;
  maxQuantity: number;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, startAddTransition] = useTransition();
  const [justAdded, setJustAdded] = useState(false);
  const [isBuyingNow, setIsBuyingNow] = useState(false);

  function handleAddToCart() {
    startAddTransition(async () => {
      await addToCart(productId, quantity);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1600);
    });
  }

  function handleBuyNow() {
    setIsBuyingNow(true);
    router.push(`/checkout?buyNow=${productId}&qty=${quantity}`);
  }

  return (
    <div className="mt-8 space-y-4">
      <div>
        <label className="label" htmlFor="quantity">
          Quantity
        </label>
        <div className="inline-flex items-center rounded-full border border-ink-100 bg-white">
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            disabled={disabled || quantity <= 1}
            className="flex h-10 w-10 items-center justify-center text-ink-600 disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span id="quantity" className="w-10 text-center font-medium text-ink-900">
            {quantity}
          </span>
          <button
            type="button"
            onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
            disabled={disabled || quantity >= maxQuantity}
            className="flex h-10 w-10 items-center justify-center text-ink-600 disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={disabled || isAdding}
          aria-busy={isAdding}
          className="btn-secondary flex-1 justify-center"
        >
          {isAdding ? (
            <span className="spinner-dark" aria-hidden="true" />
          ) : justAdded ? (
            <Check className="h-4 w-4 animate-pop-in" />
          ) : (
            <ShoppingCart className="h-4 w-4" />
          )}
          {isAdding ? "Adding..." : justAdded ? "Added to cart" : "Add to Cart"}
        </button>

        <button
          type="button"
          onClick={handleBuyNow}
          disabled={disabled || isBuyingNow}
          aria-busy={isBuyingNow}
          className="btn flex-1 justify-center"
        >
          {isBuyingNow ? <span className="spinner" aria-hidden="true" /> : <Zap className="h-4 w-4" />}
          {isBuyingNow ? "Redirecting..." : "Buy Now"}
        </button>
      </div>
    </div>
  );
}
