import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft, CheckCircle2, MapPin, Package, Receipt, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { formatPrice } from "@/lib/format";

const STATUS_STEPS = [
  { key: "paid", label: "Order placed", icon: CheckCircle2 },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "delivered", label: "Delivered", icon: Package },
];

function statusIndex(status: string) {
  if (status === "cancelled") return -1;
  const idx = STATUS_STEPS.findIndex((s) => s.key === status);
  return idx === -1 ? 0 : idx;
}

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirectTo=/account/orders/${params.id}`);

  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", order.id);
  const currentStep = statusIndex(order.status);

  const hasStructuredAddress = Boolean(order.shipping_line1);

  return (
    <div className="mx-auto max-w-2xl">
      <Link href="/account/orders" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back to orders
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-ink-900">
          Order #{order.id.slice(0, 8).toUpperCase()}
        </h1>
        <span className="badge bg-ink-100 text-ink-600 capitalize">{order.status}</span>
      </div>
      <p className="mt-1 text-sm text-ink-400">
        Placed on{" "}
        {new Date(order.created_at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
        })}
      </p>

      {order.status !== "cancelled" && (
        <div className="card mt-6 p-6">
          <ol className="flex items-center">
            {STATUS_STEPS.map((step, i) => {
              const Icon = step.icon;
              const reached = i <= currentStep;
              return (
                <li key={step.key} className="flex flex-1 items-center last:flex-none">
                  <div className="flex flex-col items-center gap-2">
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-full ${
                        reached ? "bg-brand text-white" : "bg-ink-100 text-ink-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span className={`text-xs ${reached ? "font-medium text-ink-900" : "text-ink-400"}`}>
                      {step.label}
                    </span>
                  </div>
                  {i < STATUS_STEPS.length - 1 && (
                    <span className={`mx-2 h-0.5 flex-1 ${i < currentStep ? "bg-brand" : "bg-ink-100"}`} />
                  )}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      <div className="card mt-6 p-6">
        <h2 className="mb-3 flex items-center gap-2 font-semibold text-ink-900">
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

        <div className="mt-4 space-y-1.5 border-t border-ink-100 pt-4 text-sm">
          <div className="flex justify-between text-ink-600">
            <span>Subtotal</span>
            <span>{formatPrice(order.subtotal_cents || order.total_cents, order.currency)}</span>
          </div>
          {order.discount_cents > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount {order.promo_code ? `(${order.promo_code})` : ""}</span>
              <span>−{formatPrice(order.discount_cents, order.currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-ink-100 pt-1.5 font-semibold text-ink-900">
            <span>Total</span>
            <span>{formatPrice(order.total_cents, order.currency)}</span>
          </div>
        </div>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="mb-2 flex items-center gap-2 font-semibold text-ink-900">
          <MapPin className="h-4 w-4" /> Shipping address
        </h2>
        <p className="text-sm text-ink-600">{order.shipping_name}</p>
        {hasStructuredAddress ? (
          <>
            <p className="text-sm text-ink-600">
              {order.shipping_line1}
              {order.shipping_line2 ? `, ${order.shipping_line2}` : ""}
            </p>
            <p className="text-sm text-ink-600">
              {order.shipping_city}, {order.shipping_state} {order.shipping_postal_code}
            </p>
            {order.shipping_phone && <p className="text-sm text-ink-400">Phone: {order.shipping_phone}</p>}
          </>
        ) : (
          <p className="whitespace-pre-line text-sm text-ink-600">{order.shipping_address}</p>
        )}
      </div>

      {order.razorpay_payment_id && (
        <div className="card mt-6 p-6">
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-ink-900">
            <Receipt className="h-4 w-4" /> Payment
          </h2>
          <p className="text-sm text-ink-600">Payment ID: {order.razorpay_payment_id}</p>
        </div>
      )}
    </div>
  );
}
