"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function setUserRole(formData: FormData) {
  const email = String(formData.get("email") || "").trim();
  const role = String(formData.get("role") || "admin");

  if (!email) {
    redirect(`/admin/users?error=${encodeURIComponent("Enter an email address")}`);
  }

  const supabase = createClient();
  const { error } = await supabase.rpc("admin_set_user_role", {
    target_email: email,
    new_role: role,
  });

  if (error) {
    redirect(`/admin/users?error=${encodeURIComponent(error.message)}`);
  }

  revalidatePath("/admin/users");
  redirect(`/admin/users?message=${encodeURIComponent(`${email} is now ${role}`)}`);
}
