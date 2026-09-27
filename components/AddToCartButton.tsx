"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

export default function AddToCartButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  const [justAdded, setJustAdded] = useState(false);
  const wasPending = useRef(false);

  useEffect(() => {
    if (wasPending.current && !pending) {
      setJustAdded(true);
      const timer = setTimeout(() => setJustAdded(false), 1600);
      return () => clearTimeout(timer);
    }
    wasPending.current = pending;
  }, [pending]);

  return (
    <button
      type="submit"
      className="btn w-full sm:w-auto"
      disabled={disabled || pending}
      aria-busy={pending}
    >
      {pending ? (
        <>
          <span className="spinner" aria-hidden="true" />
          Adding...
        </>
      ) : justAdded ? (
        <span className="animate-pop-in">Added ✓</span>
      ) : (
        "Add to cart"
      )}
    </button>
  );
}
