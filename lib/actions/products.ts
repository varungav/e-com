"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/supabase/types";

async function requireAdmin() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirectTo=/admin/products");

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

async function maybeUploadImage(
  supabase: any,
  formData: FormData
): Promise<{ url: string | null; error: string | null }> {
  const file = formData.get("image") as File | null;
  if (!file || file.size === 0) return { url: null, error: null };

  const ext = file.name.includes(".") ? file.name.split(".").pop() : "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error } = await supabase.storage.from("product-images").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });

  if (error) {
    return { url: null, error: `Image upload failed: ${error.message}` };
  }

  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return { url: data.publicUrl as string, error: null };
}

export async function createProduct(formData: FormData) {
  const supabase = await requireAdmin();

  const name = String(formData.get("name") || "");
  const description = String(formData.get("description") || "");
  const priceDollars = Number(formData.get("price") || 0);
  const stock = Number(formData.get("stock") || 0);
  const categoryId = String(formData.get("categoryId") || "") || null;

  const { url: imageUrl, error: uploadError } = await maybeUploadImage(supabase, formData);

  if (uploadError) {
    redirect(`/admin/products/new?error=${encodeURIComponent(uploadError)}`);
  }

  const { error } = await supabase.from("products").insert({
    name,
    slug: `${slugify(name)}-${Date.now().toString(36)}`,
    description,
    price_cents: Math.round(priceDollars * 100),
    stock,
    category_id: categoryId,
    image_url: imageUrl,
  });

  if (error) {
    redirect(`/admin/products/new?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function updateProduct(productId: string, formData: FormData) {
  const supabase = await requireAdmin();

  const name = String(formData.get("name") || "");
  const description = String(formData.get("description") || "");
  const priceDollars = Number(formData.get("price") || 0);
  const stock = Number(formData.get("stock") || 0);
  const categoryId = String(formData.get("categoryId") || "") || null;
  const isActive = formData.get("isActive") === "on";

  const { url: imageUrl, error: uploadError } = await maybeUploadImage(supabase, formData);

  if (uploadError) {
    redirect(`/admin/products/${productId}/edit?error=${encodeURIComponent(uploadError)}`);
  }

  const update: Database["public"]["Tables"]["products"]["Update"] = {
    name,
    description,
    price_cents: Math.round(priceDollars * 100),
    stock,
    category_id: categoryId,
    is_active: isActive,
    updated_at: new Date().toISOString(),
  };
  if (imageUrl) update.image_url = imageUrl;

  const { error } = await supabase.from("products").update(update).eq("id", productId);

  if (error) {
    redirect(`/admin/products/${productId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
  redirect("/admin/products");
}

export async function deleteProduct(productId: string) {
  const supabase = await requireAdmin();
  await supabase.from("products").delete().eq("id", productId);
  revalidatePath("/admin/products");
  revalidatePath("/");
  revalidatePath("/shop");
}
