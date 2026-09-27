import Link from "next/link";
import { PackageSearch } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/session";
import { updateOrderStatus } from "@/lib/actions/orders";
import AdminNav from "@/components/AdminNav";
import SubmitButton from "@/components/SubmitButton";
import { formatPrice } from "@/lib/format";

const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"] as const;

const statusStyles: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  shipped: "bg-brand-50 text-brand-dark",
  delivered: "bg-emerald-50 text-emerald-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AdminOrdersPage() {
  await requireAdmin("/admin/orders");
  const supabase = createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("*, order_items(count)")
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="mx-auto max-w-4xl">
      <AdminNav active="orders" />
      <h1 className="text-2xl font-bold text-ink-900">Manage orders</h1>
      <p className="mt-1 text-sm text-ink-400">
        {orders?.length ?? 0} order{orders?.length === 1 ? "" : "s"} · update status as orders ship
        and get delivered
      </p>

      <div className="card mt-6 divide-y divide-ink-100">
        {(orders || []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <PackageSearch className="h-6 w-6 text-ink-400" />
            <p className="text-sm text-ink-400">No orders yet.</p>
          </div>
        ) : (
          (orders as any[]).map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="font-mono text-sm font-semibold text-ink-900 hover:underline"
                >
                  #{order.id.slice(0, 8).toUpperCase()}
                </Link>
                <p className="mt-0.5 text-xs text-ink-400">
                  {order.shipping_name || "—"} ·{" "}
                  {new Date(order.created_at).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  · {order.order_items?.[0]?.count ?? 0} item
                  {order.order_items?.[0]?.count === 1 ? "" : "s"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span className="font-semibold text-ink-900">
                  {formatPrice(order.total_cents, order.currency)}
                </span>
                <span className={`badge capitalize ${statusStyles[order.status] ?? "bg-ink-100 text-ink-600"}`}>
                  {order.status}
                </span>
                <form
                  action={async (formData: FormData) => {
                    "use server";
                    await updateOrderStatus(order.id, String(formData.get("status")));
                  }}
                  className="flex items-center gap-2"
                >
                  <select
                    name="status"
                    defaultValue={order.status}
                    className="input h-9 w-auto py-0 text-sm"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                  <SubmitButton className="btn-secondary" spinnerClassName="spinner-dark" pendingText="Saving...">
                    Update
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
