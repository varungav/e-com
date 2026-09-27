import { Tags, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/session";
import { createCategory, deleteCategory } from "@/lib/actions/categories";
import AdminNav from "@/components/AdminNav";
import SubmitButton from "@/components/SubmitButton";

export default async function AdminCategoriesPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  await requireAdmin("/admin/categories");
  const supabase = createClient();

  const { data: categories } = await supabase
    .from("categories")
    .select("*, products(count)")
    .order("name");

  return (
    <div className="mx-auto max-w-2xl">
      <AdminNav active="categories" />
      <h1 className="text-2xl font-bold text-ink-900">Manage categories</h1>
      <p className="mt-1 text-sm text-ink-400">
        {categories?.length ?? 0} categor{categories?.length === 1 ? "y" : "ies"} organizing your
        shop
      </p>

      {searchParams.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={createCategory} className="card mt-6 flex items-end gap-3 p-6">
        <div className="flex-1">
          <label className="label" htmlFor="name">
            New category name
          </label>
          <input className="input" id="name" name="name" placeholder="e.g. Outdoor" required />
        </div>
        <SubmitButton className="btn" pendingText="Adding...">
          Add
        </SubmitButton>
      </form>

      <div className="card mt-6 divide-y divide-ink-100">
        {(categories || []).length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-center">
            <Tags className="h-6 w-6 text-ink-400" />
            <p className="text-sm text-ink-400">No categories yet — add one above.</p>
          </div>
        ) : (
          (categories as any[]).map((c) => (
            <div key={c.id} className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-brand-dark">
                  <Tags className="h-4 w-4" />
                </span>
                <div>
                  <p className="font-medium text-ink-900">{c.name}</p>
                  <p className="text-xs text-ink-400">
                    /{c.slug} · {c.products?.[0]?.count ?? 0} product
                    {c.products?.[0]?.count === 1 ? "" : "s"}
                  </p>
                </div>
              </div>
              <form
                action={async () => {
                  "use server";
                  await deleteCategory(c.id);
                }}
              >
                <SubmitButton className="btn-danger" spinnerClassName="spinner-dark" pendingText="Deleting...">
                  <Trash2 className="h-3.5 w-3.5" /> Delete
                </SubmitButton>
              </form>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
