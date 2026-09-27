import { notFound, redirect } from "next/navigation";
import Image from "next/image";
import { ShieldCheck, Zap } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { formatPrice } from "@/lib/format";
import CheckoutForm from "@/components/CheckoutForm";
import type { CheckoutSource } from "@/lib/actions/payment";

type DisplayLine = {
  key: string;
  name: string;
  quantity: number;
  priceCents: number;
  currency: string;
  imageUrl: string | null;
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: { buyNow?: string; qty?: string };
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirectTo=/checkout");

  const supabase = createClient();
  const isBuyNow = Boolean(searchParams.buyNow);

  let items: DisplayLine[];
  let source: CheckoutSource;

  if (isBuyNow) {
    const quantity = Math.max(1, Number(searchParams.qty) || 1);
    const { data: product } = await supabase
      .from("products")
      .select("id, name, price_cents, currency, image_url, stock, is_active")
      .eq("id", searchParams.buyNow!)
      .single();

    if (!product || !product.is_active) notFound();
    if (product.stock < quantity) redirect(`/products/${searchParams.buyNow}?error=Not enough stock`);

    items = [
      {
        key: product.id,
        name: product.name,
        quantity,
        priceCents: product.price_cents,
        currency: product.currency,
        imageUrl: product.image_url,
      },
    ];
    source = { mode: "buyNow", productId: product.id, quantity };
  } else {
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("id, quantity, product:products(name, price_cents, currency, image_url)")
      .eq("user_id", user.id);

    const cartLines = (cartItems || []) as unknown as Array<{
      id: string;
      quantity: number;
      product: { name: string; price_cents: number; currency: string; image_url: string | null } | null;
    }>;

    items = cartLines
      .filter((i) => i.product)
      .map((i) => ({
        key: i.id,
        name: i.product!.name,
        quantity: i.quantity,
        priceCents: i.product!.price_cents,
        currency: i.product!.currency,
        imageUrl: i.product!.image_url,
      }));

    if (items.length === 0) redirect("/cart");
    source = { mode: "cart" };
  }

  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  const subtotal = items.reduce((sum, i) => sum + i.priceCents * i.quantity, 0);
  const currency = items[0].currency;

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-ink-900">Checkout</h1>
      <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-400">
        <ShieldCheck className="h-4 w-4 text-green-600" /> Secure payment powered by Razorpay
      </p>

      {isBuyNow && (
        <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-3 py-1.5 text-sm font-medium text-brand-dark">
          <Zap className="h-3.5 w-3.5" /> Buy Now — your saved cart isn&apos;t affected
        </p>
      )}

      <div className="card mt-6 p-6">
        <h2 className="font-semibold text-ink-900">Order items</h2>
        <ul className="mt-3 divide-y divide-ink-100">
          {items.map((item) => (
            <li key={item.key} className="flex items-center gap-3 py-3">
              <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-lg bg-ink-50">
                {item.imageUrl && (
                  <Image src={item.imageUrl} alt={item.name} fill className="object-cover" sizes="56px" />
                )}
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium text-ink-900">{item.name}</p>
                <p className="text-ink-400">Qty {item.quantity}</p>
              </div>
              <span className="text-sm font-semibold text-ink-900">
                {formatPrice(item.priceCents * item.quantity, item.currency)}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <CheckoutForm
        addresses={addresses || []}
        customerEmail={user.email || ""}
        subtotalCents={subtotal}
        currency={currency}
        source={source}
      />
    </div>
  );
}
