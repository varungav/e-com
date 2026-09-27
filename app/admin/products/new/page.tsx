import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/session";
import { createProduct } from "@/lib/actions/products";
import ImageInput from "@/components/ImageInput";
import SubmitButton from "@/components/SubmitButton";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  await requireAdmin("/admin/products/new");
  const supabase = createClient();

  const { data: categories } = await supabase.from("categories").select("*").order("name");

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/admin/products" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back to products
      </Link>
      <h1 className="flex items-center gap-2 text-2xl font-bold text-ink-900">
        <Package className="h-5 w-5" /> New product
      </h1>

      {searchParams.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={createProduct} encType="multipart/form-data" className="card mt-6 space-y-4 p-6">
        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input className="input" id="name" name="name" required />
        </div>

        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea className="input" id="description" name="description" rows={4} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label" htmlFor="price">
              Price (₹)
            </label>
            <input className="input" id="price" name="price" type="number" step="0.01" min="0" required />
          </div>
          <div>
            <label className="label" htmlFor="stock">
              Stock
            </label>
            <input className="input" id="stock" name="stock" type="number" min="0" required />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <label className="label" htmlFor="categoryId">
              Category
            </label>
            <Link href="/admin/categories" className="mb-1.5 text-xs font-medium text-brand hover:text-brand-dark">
              + Manage categories
            </Link>
          </div>
          <select className="input" id="categoryId" name="categoryId">
            <option value="">None</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <ImageInput name="image" label="Product image" />

        <SubmitButton pendingText="Creating...">Create product</SubmitButton>
      </form>
    </div>
  );
}
