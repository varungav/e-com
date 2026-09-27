"use client";

// template.tsx (unlike layout.tsx) remounts on every navigation, so this
// small fade/slide-in plays each time you move between pages instead of the
// content just snapping into place.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-slide-up">{children}</div>;
}
