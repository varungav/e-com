"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/admin/categories");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/");

  return supabase;
}

function slugify(name: string) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function createCategory(formData: FormData) {
  const supabase = await requireAdmin();

  const name = String(formData.get("name") || "").trim();
  if (!name) redirect("/admin/categories?error=Name is required");

  const { error } = await supabase.from("categories").insert({
    name,
    slug: slugify(name),
  });

  if (error) {
    redirect(`/admin/categories?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/categories");
  revalidatePath("/admin/products/new");
  revalidatePath("/");
  revalidatePath("/shop");
  redirect("/admin/categories");
}

export async function deleteCategory(categoryId: string) {
  const supabase = await requireAdmin();
  await supabase.from("categories").delete().eq("id", categoryId);
  revalidatePath("/admin/categories");
  revalidatePath("/");
  revalidatePath("/shop");
}
