import Link from "next/link";
import Image from "next/image";
import { Package, Pencil, Plus, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { requireAdmin } from "@/lib/supabase/session";
import { formatPrice } from "@/lib/format";
import { deleteProduct } from "@/lib/actions/products";
import AdminNav from "@/components/AdminNav";
import SubmitButton from "@/components/SubmitButton";

export default async function AdminProductsPage() {
  await requireAdmin("/admin/products");
  const supabase = createClient();

  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <AdminNav active="products" />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-900">Manage products</h1>
          <p className="mt-1 text-sm text-ink-400">
            {products?.length ?? 0} product{products?.length === 1 ? "" : "s"} in your catalog
          </p>
        </div>
        <Link href="/admin/products/new" className="btn">
          <Plus className="h-4 w-4" /> New product
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center gap-3 py-16 text-center">
          <Package className="h-8 w-8 text-ink-400" />
          <p className="font-medium text-ink-900">No products yet</p>
          <Link href="/admin/products/new" className="btn mt-2">
            <Plus className="h-4 w-4" /> Add your first product
          </Link>
        </div>
      ) : (
        <div className="card mt-6 overflow-x-auto">
          <table className="min-w-full divide-y divide-ink-100 text-sm">
            <thead className="bg-ink-50/60">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-ink-400">Product</th>
                <th className="px-4 py-3 text-left font-medium text-ink-400">Price</th>
                <th className="px-4 py-3 text-left font-medium text-ink-400">Stock</th>
                <th className="px-4 py-3 text-left font-medium text-ink-400">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-ink-50/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-11 flex-shrink-0 overflow-hidden rounded-lg bg-ink-50">
                        {p.image_url && (
                          <Image src={p.image_url} alt={p.name} fill className="object-cover" sizes="44px" />
                        )}
                      </div>
                      <span className="font-medium text-ink-900">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-600">{formatPrice(p.price_cents, p.currency)}</td>
                  <td className="px-4 py-3">
                    <span className={p.stock <= 5 ? "font-medium text-amber-600" : "text-ink-600"}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`badge ${
                        p.is_active ? "bg-green-50 text-green-700" : "bg-ink-100 text-ink-600"
                      }`}
                    >
                      {p.is_active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <Link href={`/admin/products/${p.id}/edit`} className="btn-secondary px-3.5 py-1.5">
                        <Pencil className="h-3.5 w-3.5" /> Edit
                      </Link>
                      <form
                        action={async () => {
                          "use server";
                          await deleteProduct(p.id);
                        }}
                      >
                        <SubmitButton className="btn-danger" spinnerClassName="spinner-dark" pendingText="Deleting...">
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </SubmitButton>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
