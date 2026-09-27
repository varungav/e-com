import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// React's `cache()` memoizes per server-render request: calling this from the
// layout's Navbar, a page, and a nested component all hit Supabase's Auth API
// only once instead of once per caller (each round-trip was ~300-450ms).
export const getCurrentUser = cache(async () => {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export const getCurrentProfile = cache(async () => {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
  return data;
});

// For admin-only pages: redirects to login (or home, if signed in but not
// admin) and otherwise returns the already-deduped user + profile.
export async function requireAdmin(redirectTo: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);

  const profile = await getCurrentProfile();
  if (profile?.role !== "admin") redirect("/");

  return { user, profile };
}
