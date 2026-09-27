import { ShieldCheck, UserPlus, Users as UsersIcon } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/session";
import { setUserRole } from "@/lib/actions/users";
import AdminNav from "@/components/AdminNav";
import SubmitButton from "@/components/SubmitButton";

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  const { user: currentUser } = await requireAdmin("/admin/users");
  const supabase = createClient();

  const { data: admins } = await supabase.rpc("admin_list_admins");

  return (
    <div className="mx-auto max-w-2xl">
      <AdminNav active="users" />
      <h1 className="flex items-center gap-2 text-2xl font-bold text-ink-900">
        <UsersIcon className="h-5 w-5" /> Manage admins
      </h1>
      <p className="mt-1 text-sm text-ink-400">
        Promote any signed-up user to admin by email — no SQL required.
      </p>

      {searchParams.message && (
        <p className="mt-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
          {searchParams.message}
        </p>
      )}
      {searchParams.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{searchParams.error}</p>
      )}

      <form action={setUserRole} className="card mt-6 space-y-4 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-ink-900">
          <UserPlus className="h-4 w-4" /> Change a user&apos;s role
        </h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto]">
          <div>
            <label className="label" htmlFor="email">
              User&apos;s email
            </label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              placeholder="someone@example.com"
              required
            />
            <p className="mt-1 text-xs text-ink-400">
              They must have already signed up in the app at least once.
            </p>
          </div>
          <div>
            <label className="label" htmlFor="role">
              Role
            </label>
            <select className="input" id="role" name="role" defaultValue="admin">
              <option value="admin">Admin</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>
        <SubmitButton pendingText="Updating...">Update role</SubmitButton>
      </form>

      <div className="card mt-6 p-6">
        <h2 className="flex items-center gap-2 font-semibold text-ink-900">
          <ShieldCheck className="h-4 w-4" /> Current admins
        </h2>
        {!admins || admins.length === 0 ? (
          <p className="mt-2 text-sm text-ink-400">No admins found.</p>
        ) : (
          <ul className="mt-3 divide-y divide-ink-100">
            {admins.map((admin) => (
              <li key={admin.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-ink-900">
                    {admin.full_name || admin.email}
                    {admin.id === currentUser.id && (
                      <span className="badge ml-2 bg-brand-50 text-brand-dark">You</span>
                    )}
                  </p>
                  <p className="text-xs text-ink-400">{admin.email}</p>
                </div>
                <form action={setUserRole}>
                  <input type="hidden" name="email" value={admin.email} />
                  <input type="hidden" name="role" value="customer" />
                  <SubmitButton
                    className="btn-danger"
                    spinnerClassName="spinner-dark"
                    pendingText="Removing..."
                  >
                    Remove admin
                  </SubmitButton>
                </form>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
