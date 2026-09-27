import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight, PackageSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { formatPrice } from "@/lib/format";

const statusStyles: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  shipped: "bg-brand-50 text-brand-dark",
  cancelled: "bg-red-50 text-red-700",
};

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/account/orders");

  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(count)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-ink-900">Your orders</h1>
      <p className="mt-1 text-sm text-ink-400">Track and review everything you&apos;ve bought.</p>

      {!orders || orders.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center gap-3 py-16 text-center">
          <PackageSearch className="h-8 w-8 text-ink-400" />
          <p className="font-medium text-ink-900">No orders yet</p>
          <Link href="/shop" className="btn mt-2">
            Start shopping
          </Link>
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {(orders as any[]).map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="card flex items-center justify-between p-4 transition hover:-translate-y-0.5 hover:shadow-hover"
            >
              <div>
                <p className="font-mono text-sm font-semibold text-ink-900">
                  #{order.id.slice(0, 8).toUpperCase()}
                </p>
                <p className="mt-0.5 text-xs text-ink-400">
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}{" "}
                  · {order.order_items?.[0]?.count ?? 0} item
                  {order.order_items?.[0]?.count === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`badge ${statusStyles[order.status] ?? "bg-ink-100 text-ink-600"}`}>
                  {order.status}
                </span>
                <span className="font-semibold text-ink-900">
                  {formatPrice(order.total_cents, order.currency)}
                </span>
                <ChevronRight className="h-4 w-4 text-ink-400" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
