"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function requireUser() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirectTo=/cart");
  return { supabase, user };
}

export async function addToCart(productId: string, quantity: number = 1) {
  const { supabase, user } = await requireUser();

  const { data: existing } = await supabase
    .from("cart_items")
    .select("id, quantity")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (existing) {
    await supabase
      .from("cart_items")
      .update({ quantity: existing.quantity + quantity })
      .eq("id", existing.id);
  } else {
    await supabase.from("cart_items").insert({
      user_id: user.id,
      product_id: productId,
      quantity,
    });
  }

  revalidatePath("/cart");
  revalidatePath("/");
}

export async function updateCartQuantity(cartItemId: string, quantity: number) {
  const { supabase, user } = await requireUser();

  if (quantity <= 0) {
    await supabase.from("cart_items").delete().eq("id", cartItemId).eq("user_id", user.id);
  } else {
    await supabase
      .from("cart_items")
      .update({ quantity })
      .eq("id", cartItemId)
      .eq("user_id", user.id);
  }

  revalidatePath("/cart");
}

export async function removeFromCart(cartItemId: string) {
  const { supabase, user } = await requireUser();
  await supabase.from("cart_items").delete().eq("id", cartItemId).eq("user_id", user.id);
  revalidatePath("/cart");
}
