import Link from "next/link";
import { redirect } from "next/navigation";
import { KeyRound, MapPin, PackageSearch, User } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/session";
import { formatPrice } from "@/lib/format";

const statusStyles: Record<string, string> = {
  paid: "bg-green-50 text-green-700",
  pending: "bg-amber-50 text-amber-700",
  shipped: "bg-brand-50 text-brand-dark",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: { message?: string };
}) {
  const user = await getCurrentUser();

  if (!user) redirect("/login?redirectTo=/account");

  const supabase = createClient();
  const [profile, { data: orders }, { count: addressCount }] = await Promise.all([
    getCurrentProfile(),
    supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase.from("addresses").select("*", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-ink-900">My account</h1>

      {searchParams.message && (
        <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
          {searchParams.message}
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card p-6">
          <h2 className="flex items-center gap-2 font-semibold text-ink-900">
            <User className="h-4 w-4" /> Profile
          </h2>
          <div className="mt-3 space-y-1 text-sm text-ink-600">
            <p>
              Name: <span className="text-ink-900">{profile?.full_name || "—"}</span>
            </p>
            <p>
              Email: <span className="text-ink-900">{user.email}</span>
            </p>
            <p>
              Role:{" "}
              <span className="badge bg-ink-100 text-ink-600 align-middle">{profile?.role}</span>
            </p>
          </div>
          <Link
            href="/account/update-password"
            className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:text-brand-dark"
          >
            <KeyRound className="h-3.5 w-3.5" /> Change password
          </Link>
        </div>

        <Link
          href="/account/addresses"
          className="card group flex flex-col justify-between p-6 hover:-translate-y-0.5 hover:shadow-hover"
        >
          <div>
            <h2 className="flex items-center gap-2 font-semibold text-ink-900">
              <MapPin className="h-4 w-4" /> Addresses
            </h2>
            <p className="mt-2 text-sm text-ink-400">
              {addressCount ?? 0} saved address{addressCount === 1 ? "" : "es"}
            </p>
          </div>
          <span className="mt-3 text-sm font-medium text-brand group-hover:text-brand-dark">
            Manage addresses →
          </span>
        </Link>
      </div>

      <div className="card mt-6 p-6">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-ink-900">
            <PackageSearch className="h-4 w-4" /> Recent orders
          </h2>
          <Link href="/account/orders" className="text-sm font-medium text-brand hover:text-brand-dark">
            View all →
          </Link>
        </div>
        {!orders || orders.length === 0 ? (
          <p className="mt-2 text-sm text-ink-400">You haven&apos;t placed any orders yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {orders.map((order) => (
              <li key={order.id} className="flex items-center justify-between py-3">
                <div>
                  <Link
                    href={`/account/orders/${order.id}`}
                    className="font-medium text-brand hover:text-brand-dark"
                  >
                    Order #{order.id.slice(0, 8).toUpperCase()}
                  </Link>
                  <p className="mt-0.5 text-xs text-ink-400">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`badge ${statusStyles[order.status] ?? "bg-ink-100 text-ink-600"}`}
                  >
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
