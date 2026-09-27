"use client";

import { useFormStatus } from "react-dom";

export default function SubmitButton({
  children,
  pendingText,
  className = "btn w-full",
  spinnerClassName = "spinner",
}: {
  children: React.ReactNode;
  pendingText?: string;
  className?: string;
  spinnerClassName?: string;
}) {
  const { pending } = useFormStatus();

  return (
    <button type="submit" className={className} disabled={pending} aria-busy={pending}>
      {pending && <span className={spinnerClassName} aria-hidden="true" />}
      {pending ? pendingText ?? children : children}
    </button>
  );
}
