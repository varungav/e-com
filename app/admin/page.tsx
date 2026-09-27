import Link from "next/link";
import {
  IndianRupee,
  Package,
  PackageSearch,
  ShoppingBag,
  Tags,
  Ticket,
  Users,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/session";
import { formatPrice } from "@/lib/format";

const statusStyles: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  shipped: "bg-brand-50 text-brand-dark",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AdminDashboardPage() {
  await requireAdmin("/admin");
  const supabase = createClient();

  const [
    { count: productCount },
    { count: categoryCount },
    { count: orderCount },
    { data: paidOrders },
    { data: recentOrders },
  ] = await Promise.all([
    supabase.from("products").select("*", { count: "exact", head: true }),
    supabase.from("categories").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("*", { count: "exact", head: true }),
    supabase.from("orders").select("total_cents, currency").eq("status", "paid"),
    supabase
      .from("orders")
      .select("id, status, total_cents, currency, shipping_name, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const revenueCents = (paidOrders || []).reduce((sum, o) => sum + o.total_cents, 0);
  const currency = paidOrders?.[0]?.currency;

  const stats = [
    { label: "Products", value: productCount ?? 0, icon: Package, href: "/admin/products" },
    { label: "Categories", value: categoryCount ?? 0, icon: Tags, href: "/admin/categories" },
    { label: "Orders", value: orderCount ?? 0, icon: ShoppingBag, href: "/admin/orders" },
    {
      label: "Revenue",
      value: formatPrice(revenueCents, currency),
      icon: IndianRupee,
      href: null,
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">Admin dashboard</h1>
      <p className="mt-1 text-sm text-ink-400">Manage your store&apos;s catalog and orders.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="card p-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-dark">
              <s.icon className="h-4 w-4" />
            </span>
            <p className="mt-3 text-sm text-ink-400">{s.label}</p>
            <p className="mt-0.5 text-2xl font-bold text-ink-900">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          href="/admin/products"
          className="card group flex items-center justify-between p-6 hover:-translate-y-0.5 hover:shadow-hover"
        >
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-ink-900">
              <Package className="h-4 w-4" /> Products
            </h2>
            <p className="mt-1 text-sm text-ink-400">Add, edit, and manage stock &amp; images.</p>
          </div>
          <span className="text-ink-400 transition group-hover:translate-x-1 group-hover:text-brand-dark">
            →
          </span>
        </Link>

        <Link
          href="/admin/categories"
          className="card group flex items-center justify-between p-6 hover:-translate-y-0.5 hover:shadow-hover"
        >
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-ink-900">
              <Tags className="h-4 w-4" /> Categories
            </h2>
            <p className="mt-1 text-sm text-ink-400">Organize products into shop sections.</p>
          </div>
          <span className="text-ink-400 transition group-hover:translate-x-1 group-hover:text-brand-dark">
            →
          </span>
        </Link>

        <Link
          href="/admin/coupons"
          className="card group flex items-center justify-between p-6 hover:-translate-y-0.5 hover:shadow-hover"
        >
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-ink-900">
              <Ticket className="h-4 w-4" /> Coupons
            </h2>
            <p className="mt-1 text-sm text-ink-400">Create and manage discount codes.</p>
          </div>
          <span className="text-ink-400 transition group-hover:translate-x-1 group-hover:text-brand-dark">
            →
          </span>
        </Link>

        <Link
          href="/admin/orders"
          className="card group flex items-center justify-between p-6 hover:-translate-y-0.5 hover:shadow-hover"
        >
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-ink-900">
              <PackageSearch className="h-4 w-4" /> Orders
            </h2>
            <p className="mt-1 text-sm text-ink-400">Update order status as orders ship.</p>
          </div>
          <span className="text-ink-400 transition group-hover:translate-x-1 group-hover:text-brand-dark">
            →
          </span>
        </Link>

        <Link
          href="/admin/users"
          className="card group flex items-center justify-between p-6 hover:-translate-y-0.5 hover:shadow-hover"
        >
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-ink-900">
              <Users className="h-4 w-4" /> Users
            </h2>
            <p className="mt-1 text-sm text-ink-400">Promote or demote admins.</p>
          </div>
          <span className="text-ink-400 transition group-hover:translate-x-1 group-hover:text-brand-dark">
            →
          </span>
        </Link>
      </div>

      <div className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-ink-900">
          <PackageSearch className="h-4 w-4" /> Recent orders
        </h2>
        {!recentOrders || recentOrders.length === 0 ? (
          <p className="mt-2 text-sm text-ink-400">No orders yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {recentOrders.map((order) => (
              <li key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-mono text-sm font-medium text-ink-900">
                    #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <p className="text-xs text-ink-400">
                    {order.shipping_name || "—"} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${statusStyles[order.status] ?? "bg-ink-100 text-ink-600"}`}>
                    {order.status}
                  </span>
                  <span className="text-sm font-semibold text-ink-900">
                    {formatPrice(order.total_cents, order.currency)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
