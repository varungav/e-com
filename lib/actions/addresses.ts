"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

async function requireUser(redirectTo: string) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirectTo=${encodeURIComponent(redirectTo)}`);
  return { supabase: createClient(), user };
}

function readAddressForm(formData: FormData) {
  return {
    label: String(formData.get("label") || "Home"),
    full_name: String(formData.get("fullName") || ""),
    phone: String(formData.get("phone") || "") || null,
    line1: String(formData.get("line1") || ""),
    line2: String(formData.get("line2") || "") || null,
    city: String(formData.get("city") || ""),
    state: String(formData.get("state") || ""),
    postal_code: String(formData.get("postalCode") || ""),
  };
}

export async function createAddress(formData: FormData) {
  const { supabase, user } = await requireUser("/account/addresses");
  const fields = readAddressForm(formData);

  const { count } = await supabase
    .from("addresses")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { error } = await supabase.from("addresses").insert({
    ...fields,
    user_id: user.id,
    is_default: (count ?? 0) === 0, // first address becomes default automatically
  });

  if (error) {
    redirect(`/account/addresses?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  redirect("/account/addresses");
}

export async function updateAddress(addressId: string, formData: FormData) {
  const { supabase, user } = await requireUser("/account/addresses");
  const fields = readAddressForm(formData);

  const { error } = await supabase
    .from("addresses")
    .update(fields)
    .eq("id", addressId)
    .eq("user_id", user.id);

  if (error) {
    redirect(`/account/addresses/${addressId}/edit?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
  redirect("/account/addresses");
}

export async function deleteAddress(addressId: string) {
  const { supabase, user } = await requireUser("/account/addresses");
  await supabase.from("addresses").delete().eq("id", addressId).eq("user_id", user.id);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}

export async function setDefaultAddress(addressId: string) {
  const { supabase, user } = await requireUser("/account/addresses");
  await supabase.from("addresses").update({ is_default: false }).eq("user_id", user.id);
  await supabase
    .from("addresses")
    .update({ is_default: true })
    .eq("id", addressId)
    .eq("user_id", user.id);
  revalidatePath("/account/addresses");
  revalidatePath("/checkout");
}
