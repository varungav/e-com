"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/session";

export type PromoValidationResult = {
  code: string;
  discountCents: number;
  description: string | null;
};

// Re-validated on the server every time (checkout also re-runs this right
// before charging) — never trust a discount amount the client remembers.
export async function validatePromoCode(
  code: string,
  subtotalCents: number
): Promise<PromoValidationResult> {
  const normalized = code.trim().toUpperCase();
  if (!normalized) throw new Error("Enter a promo code.");

  const supabase = createClient();
  const { data: promo } = await supabase
    .from("promo_codes")
    .select("*")
    .eq("code", normalized)
    .eq("is_active", true)
    .maybeSingle();

  if (!promo) throw new Error("That promo code isn't valid.");

  if (promo.expires_at && new Date(promo.expires_at) < new Date()) {
    throw new Error("That promo code has expired.");
  }

  if (subtotalCents < promo.min_order_cents) {
    throw new Error(
      `This code needs a minimum order of ${(promo.min_order_cents / 100).toLocaleString("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      })}.`
    );
  }

  let discountCents =
    promo.discount_type === "percent"
      ? Math.round((subtotalCents * promo.discount_value) / 100)
      : promo.discount_value;

  if (promo.max_discount_cents) {
    discountCents = Math.min(discountCents, promo.max_discount_cents);
  }
  discountCents = Math.min(discountCents, subtotalCents);

  return { code: normalized, discountCents, description: promo.description };
}

export async function createPromoCode(formData: FormData) {
  await requireAdmin("/admin/coupons");

  const code = String(formData.get("code") || "").trim().toUpperCase();
  const description = String(formData.get("description") || "").trim() || null;
  const discountType = String(formData.get("discount_type") || "percent") as "percent" | "fixed";
  const discountValue = Number(formData.get("discount_value"));
  const maxDiscountRupees = formData.get("max_discount_cents");
  const minOrderRupees = Number(formData.get("min_order_cents") || 0);
  const expiresAt = String(formData.get("expires_at") || "").trim();

  if (!code) redirect("/admin/coupons?error=Code is required");
  if (!Number.isFinite(discountValue) || discountValue <= 0) {
    redirect("/admin/coupons?error=Enter a valid discount value");
  }
  if (discountType === "percent" && discountValue > 100) {
    redirect("/admin/coupons?error=Percent discount can't exceed 100");
  }

  const supabase = createClient();
  const { error } = await supabase.from("promo_codes").insert({
    code,
    description,
    discount_type: discountType,
    discount_value: discountType === "percent" ? discountValue : Math.round(discountValue * 100),
    max_discount_cents:
      maxDiscountRupees && Number(maxDiscountRupees) > 0
        ? Math.round(Number(maxDiscountRupees) * 100)
        : null,
    min_order_cents: Math.round(minOrderRupees * 100),
    expires_at: expiresAt ? new Date(expiresAt).toISOString() : null,
    is_active: true,
  });

  if (error) {
    redirect(`/admin/coupons?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/coupons");
  redirect("/admin/coupons");
}

export async function togglePromoActive(id: string, isActive: boolean) {
  await requireAdmin("/admin/coupons");
  const supabase = createClient();
  await supabase.from("promo_codes").update({ is_active: isActive }).eq("id", id);
  revalidatePath("/admin/coupons");
}

export async function deletePromoCode(id: string) {
  await requireAdmin("/admin/coupons");
  const supabase = createClient();
  await supabase.from("promo_codes").delete().eq("id", id);
  revalidatePath("/admin/coupons");
}
