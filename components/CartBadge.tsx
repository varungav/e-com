import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";

// Rendered inside a <Suspense> boundary in the navbar so its query doesn't
// block the rest of the page from streaming in.
export default async function CartBadge() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = createClient();
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("quantity")
    .eq("user_id", user.id);

  const cartCount = (cartItems || []).reduce((sum, i) => sum + i.quantity, 0);
  if (cartCount === 0) return null;

  return (
    <span
      key={cartCount}
      className="animate-pop-in absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-white"
    >
      {cartCount}
    </span>
  );
}
