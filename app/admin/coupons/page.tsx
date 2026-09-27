import { Ticket, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/session";
import {
  createPromoCode,
  deletePromoCode,
  togglePromoActive,
} from "@/lib/actions/promo";
import AdminNav from "@/components/AdminNav";
import SubmitButton from "@/components/SubmitButton";
import { formatPrice } from "@/lib/format";

export default async function AdminCouponsPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  await requireAdmin("/admin/coupons");
  const supabase = createClient();

  const { data: coupons } = await supabase
    .from("promo_codes")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <AdminNav active="coupons" />
      <h1 className="text-2xl font-bold text-ink-900">Manage coupons</h1>
      <p className="mt-1 text-sm text-ink-400">
        {coupons?.length ?? 0} coupon{coupons?.length === 1 ? "" : "s"} configured
      </p>

      {searchParams.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{searchParams.error}</p>
      )}

      <form action={createPromoCode} className="card mt-6 grid grid-cols-1 gap-4 p-6 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="code">
            Code
          </label>
          <input
            className="input uppercase"
            id="code"
            name="code"
            placeholder="e.g. WELCOME10"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <input
            className="input"
            id="description"
            name="description"
            placeholder="e.g. 10% off first order"
          />
        </div>

        <div>
          <label className="label" htmlFor="discount_type">
            Discount type
          </label>
          <select className="input" id="discount_type" name="discount_type" defaultValue="percent">
            <option value="percent">Percent off</option>
            <option value="fixed">Fixed amount off (₹)</option>
          </select>
        </div>

        <div>
          <label className="label" htmlFor="discount_value">
            Discount value
          </label>
          <input
            className="input"
            id="discount_value"
            name="discount_value"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 10"
            required
          />
        </div>

        <div>
          <label className="label" htmlFor="max_discount_cents">
            Max discount (₹, optional — for percent codes)
          </label>
          <input
            className="input"
            id="max_discount_cents"
            name="max_discount_cents"
            type="number"
            min="0"
            step="0.01"
            placeholder="e.g. 200"
          />
        </div>

        <div>
          <label className="label" htmlFor="min_order_cents">
            Minimum order value (₹)
          </label>
          <input
            className="input"
            id="min_order_cents"
            name="min_order_cents"
            type="number"
            min="0"
            step="0.01"
            defaultValue={0}
          />
        </div>

        <div>
          <label className="label" htmlFor="expires_at">
            Expires on (optional)
          </label>
          <input className="input" id="expires_at" name="expires_at" type="date" />
        </div>

        <div className="flex items-end sm:col-span-2">
          <SubmitButton className="btn" pendingText="Adding...">
            Add coupon
          </SubmitButton>
        </div>
      </form>

      <div className="card mt-6 divide-y divide-ink-100">
        {(coupons || []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Ticket className="h-6 w-6 text-ink-400" />
            <p className="text-sm text-ink-400">No coupons yet — add one above.</p>
          </div>
        ) : (
          (coupons as any[]).map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-4 p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-dark">
                  <Ticket className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-mono font-medium text-ink-900">
                    {c.code}{" "}
                    <span
                      className={`badge ml-1 ${
                        c.is_active ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {c.is_active ? "Active" : "Disabled"}
                    </span>
                  </p>
                  <p className="text-xs text-ink-400">
                    {c.discount_type === "percent"
                      ? `${c.discount_value}% off`
                      : `${formatPrice(c.discount_value)} off`}
                    {c.max_discount_cents ? ` · up to ${formatPrice(c.max_discount_cents)}` : ""}
                    {c.min_order_cents ? ` · min ${formatPrice(c.min_order_cents)}` : ""}
                    {c.expires_at
                      ? ` · expires ${new Date(c.expires_at).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}`
                      : ""}
                  </p>
                  {c.description && <p className="text-xs text-ink-400">{c.description}</p>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <form
                  action={async () => {
                    "use server";
                    await togglePromoActive(c.id, !c.is_active);
                  }}
                >
                  <SubmitButton className="btn-ghost" spinnerClassName="spinner-dark">
                    {c.is_active ? "Disable" : "Enable"}
                  </SubmitButton>
                </form>
                <form
                  action={async () => {
                    "use server";
                    await deletePromoCode(c.id);
                  }}
                >
                  <SubmitButton className="btn-danger" spinnerClassName="spinner-dark" pendingText="Deleting...">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
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
