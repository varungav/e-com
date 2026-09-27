"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/session";
import type { Database } from "@/lib/supabase/types";

type OrderStatus = Database["public"]["Tables"]["orders"]["Row"]["status"];

const VALID_STATUSES: OrderStatus[] = ["pending", "paid", "shipped", "delivered", "cancelled"];

export async function updateOrderStatus(orderId: string, status: string) {
  await requireAdmin("/admin/orders");

  if (!VALID_STATUSES.includes(status as OrderStatus)) {
    throw new Error("Invalid order status.");
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("orders")
    .update({ status: status as OrderStatus })
    .eq("id", orderId);

  if (error) throw new Error(error.message);

  revalidatePath("/admin/orders");
  revalidatePath(`/account/orders/${orderId}`);
  revalidatePath("/account/orders");
}
