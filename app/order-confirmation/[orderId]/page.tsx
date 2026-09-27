import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, MapPin, Package, Receipt, Sparkles } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { formatPrice } from "@/lib/format";

export default async function OrderConfirmationPage({
  params,
}: {
  params: { orderId: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirectTo=/order-confirmation/${params.orderId}`);

  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.orderId)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);

  return (
    <div className="mx-auto max-w-2xl">
      <div className="card relative overflow-hidden p-8 text-center sm:p-12">
        <div className="pointer-events-none absolute inset-0 bg-hero opacity-60" />
        <div className="relative">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-9 w-9" />
          </span>
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand-dark">
            <Sparkles className="h-4 w-4" /> Order confirmed
          </p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-ink-900">
            Thank you{order.shipping_name ? `, ${order.shipping_name.split(" ")[0]}` : ""}!
          </h1>
          <p className="mt-2 text-ink-600">
            Your payment went through and your order is being processed.
          </p>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between border-b border-ink-100 pb-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-400">Order number</p>
            <p className="font-mono text-sm font-semibold text-ink-900">
              #{order.id.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-ink-400">Payment ID</p>
            <p className="font-mono text-xs text-ink-600">{order.razorpay_payment_id}</p>
          </div>
        </div>

        <div className="border-b border-ink-100 py-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Package className="h-4 w-4" /> Items
          </h2>
          <ul className="space-y-2 text-sm">
            {(items || []).map((item) => (
              <li key={item.id} className="flex justify-between">
                <span className="text-ink-600">
                  {item.product_name} × {item.quantity}
                </span>
                <span className="font-medium text-ink-900">
                  {formatPrice(item.unit_price_cents * item.quantity, order.currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="border-b border-ink-100 py-4">
          <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <Receipt className="h-4 w-4" /> Payment summary
          </h2>
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-ink-600">
              <span>Subtotal</span>
              <span>{formatPrice(order.subtotal_cents, order.currency)}</span>
            </div>
            {order.discount_cents > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Discount {order.promo_code ? `(${order.promo_code})` : ""}</span>
                <span>−{formatPrice(order.discount_cents, order.currency)}</span>
              </div>
            )}
            <div className="flex justify-between border-t border-ink-100 pt-1.5 font-semibold text-ink-900">
              <span>Total paid</span>
              <span>{formatPrice(order.total_cents, order.currency)}</span>
            </div>
          </div>
        </div>

        <div className="pt-4">
          <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold text-ink-900">
            <MapPin className="h-4 w-4" /> Shipping to
          </h2>
          <p className="text-sm text-ink-600">{order.shipping_name}</p>
          <p className="text-sm text-ink-600">
            {order.shipping_line1}
            {order.shipping_line2 ? `, ${order.shipping_line2}` : ""}
          </p>
          <p className="text-sm text-ink-600">
            {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
          </p>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <Link href="/account/orders" className="btn-secondary">
          View your orders
        </Link>
        <Link href="/shop" className="btn">
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
