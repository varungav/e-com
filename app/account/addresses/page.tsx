import Link from "next/link";
import { redirect } from "next/navigation";
import { MapPin, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { deleteAddress, setDefaultAddress } from "@/lib/actions/addresses";
import SubmitButton from "@/components/SubmitButton";

export default async function AddressesPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?redirectTo=/account/addresses");

  const supabase = createClient();
  const { data: addresses } = await supabase
    .from("addresses")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Your addresses</h1>
          <p className="mt-1 text-sm text-ink-400">Manage where your orders get delivered.</p>
        </div>
        <Link href="/account/addresses/new" className="btn">
          <Plus className="h-4 w-4" /> Add address
        </Link>
      </div>

      {searchParams.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{searchParams.error}</p>
      )}

      {!addresses || addresses.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center gap-3 py-16 text-center">
          <MapPin className="h-8 w-8 text-ink-400" />
          <p className="font-medium text-ink-900">No saved addresses yet</p>
          <Link href="/account/addresses/new" className="btn mt-2">
            <Plus className="h-4 w-4" /> Add your first address
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {addresses.map((a) => (
            <div key={a.id} className="card relative p-5">
              {a.is_default && (
                <span className="badge absolute right-4 top-4 bg-brand-50 text-brand-dark">
                  <Star className="mr-1 h-3 w-3 fill-current" /> Default
                </span>
              )}
              <span className="badge bg-ink-100 text-ink-600">{a.label}</span>
              <p className="mt-3 font-semibold text-ink-900">{a.full_name}</p>
              <p className="text-sm text-ink-600">
                {a.line1}
                {a.line2 ? `, ${a.line2}` : ""}
              </p>
              <p className="text-sm text-ink-600">
                {a.city}, {a.state} {a.postal_code}
              </p>
              {a.phone && <p className="mt-1 text-sm text-ink-400">Phone: {a.phone}</p>}

              <div className="mt-4 flex flex-wrap items-center gap-2">
                <Link href={`/account/addresses/${a.id}/edit`} className="btn-secondary px-3.5 py-1.5">
                  <Pencil className="h-3.5 w-3.5" /> Edit
                </Link>
                {!a.is_default && (
                  <form
                    action={async () => {
                      "use server";
                      await setDefaultAddress(a.id);
                    }}
                  >
                    <SubmitButton className="btn-secondary px-3.5 py-1.5" spinnerClassName="spinner-dark">
                      Set as default
                    </SubmitButton>
                  </form>
                )}
                <form
                  action={async () => {
                    "use server";
                    await deleteAddress(a.id);
                  }}
                >
                  <SubmitButton className="btn-danger" spinnerClassName="spinner-dark" pendingText="Removing...">
                    <Trash2 className="h-3.5 w-3.5" /> Remove
                  </SubmitButton>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
