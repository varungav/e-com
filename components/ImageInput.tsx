"use client";

import { useState } from "react";
import Image from "next/image";

export default function ImageInput({
  name,
  label,
  currentImageUrl,
}: {
  name: string;
  label: string;
  currentImageUrl?: string | null;
}) {
  const [preview, setPreview] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
  }

  const shownImage = preview || currentImageUrl;

  return (
    <div>
      <label className="label" htmlFor={name}>
        {label}
      </label>

      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-ink-50 ring-1 ring-inset ring-ink-100">
          {shownImage ? (
            preview ? (
              // Blob/object URL from a freshly picked file — plain <img> avoids
              // next/image's remote-host allowlist (it's a local-only preview).
              // eslint-disable-next-line @next/next/no-img-element
              <img src={shownImage} alt="Preview" className="h-full w-full object-cover" />
            ) : (
              <Image src={shownImage} alt="Current image" fill className="object-cover" sizes="80px" />
            )
          ) : (
            <div className="flex h-full items-center justify-center text-[10px] text-ink-400">
              No image
            </div>
          )}
        </div>

        <input
          className="input flex-1"
          id={name}
          name={name}
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}
