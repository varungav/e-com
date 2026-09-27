import Link from "next/link";
import { Search } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import SortSelect from "@/components/SortSelect";
import FilterPanel from "@/components/FilterPanel";

export default async function ShopPage({
  searchParams,
}: {
  searchParams: { category?: string; sort?: string; minPrice?: string; maxPrice?: string; q?: string };
}) {
  const supabase = createClient();

  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false }),
    supabase.from("categories").select("*").order("name"),
  ]);

  let filtered = products || [];

  if (searchParams.category) {
    filtered = filtered.filter((p) => p.category_id === searchParams.category);
  }
  if (searchParams.q) {
    const q = searchParams.q.toLowerCase();
    filtered = filtered.filter(
      (p) => p.name.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q)
    );
  }
  const minPrice = Number(searchParams.minPrice);
  const maxPrice = Number(searchParams.maxPrice);
  if (searchParams.minPrice && !Number.isNaN(minPrice)) {
    filtered = filtered.filter((p) => p.price_cents / 100 >= minPrice);
  }
  if (searchParams.maxPrice && !Number.isNaN(maxPrice)) {
    filtered = filtered.filter((p) => p.price_cents / 100 <= maxPrice);
  }

  switch (searchParams.sort) {
    case "price-asc":
      filtered = [...filtered].sort((a, b) => a.price_cents - b.price_cents);
      break;
    case "price-desc":
      filtered = [...filtered].sort((a, b) => b.price_cents - a.price_cents);
      break;
    case "name":
      filtered = [...filtered].sort((a, b) => a.name.localeCompare(b.name));
      break;
    default:
      break; // already newest-first from the query
  }

  const activeFilterCount = [
    searchParams.category,
    searchParams.q,
    searchParams.minPrice,
    searchParams.maxPrice,
  ].filter(Boolean).length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-ink-900">Shop</h1>
        <p className="mt-1 text-ink-400">Every product we carry, in one place.</p>
      </div>

      <FilterPanel activeCount={activeFilterCount} defaultOpen={activeFilterCount > 0}>
        <form action="/shop" method="get" className="card p-4">
          <label className="label flex items-center gap-1.5" htmlFor="q">
            <Search className="h-3.5 w-3.5" /> Search
          </label>
          {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
          <input
            className="input"
            id="q"
            name="q"
            placeholder="Search products..."
            defaultValue={searchParams.q}
          />
        </form>

        <form action="/shop" method="get" className="card p-4">
          <label className="label" htmlFor="category">
            Category
          </label>
          {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}
          <select className="input" id="category" name="category" defaultValue={searchParams.category || ""}>
            <option value="">All categories</option>
            {(categories || []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <button type="submit" className="btn-secondary mt-3 w-full justify-center">
            Apply
          </button>
        </form>

        <form action="/shop" method="get" className="card p-4">
          <label className="label">Price range</label>
          {searchParams.category && <input type="hidden" name="category" value={searchParams.category} />}
          {searchParams.q && <input type="hidden" name="q" value={searchParams.q} />}
          <div className="flex items-center gap-2">
            <input
              className="input"
              type="number"
              name="minPrice"
              placeholder="Min"
              min={0}
              defaultValue={searchParams.minPrice}
            />
            <span className="text-ink-400">–</span>
            <input
              className="input"
              type="number"
              name="maxPrice"
              placeholder="Max"
              min={0}
              defaultValue={searchParams.maxPrice}
            />
          </div>
          <button type="submit" className="btn-secondary mt-3 w-full justify-center">
            Apply
          </button>
        </form>
      </FilterPanel>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-400">
          {filtered.length} product{filtered.length === 1 ? "" : "s"}
          {searchParams.q && (
            <>
              {" "}
              for &ldquo;<span className="text-ink-900">{searchParams.q}</span>&rdquo;
            </>
          )}
        </p>
        <div className="flex items-center gap-3">
          {activeFilterCount > 0 && (
            <Link href="/shop" className="text-sm font-medium text-red-600 hover:text-red-700">
              Clear filters
            </Link>
          )}
          <SortSelect />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card flex flex-col items-center gap-2 py-16 text-center">
          <p className="font-medium text-ink-900">No products found</p>
          <p className="text-sm text-ink-400">Try adjusting your filters, or check back soon.</p>
          {activeFilterCount > 0 && (
            <Link href="/shop" className="btn-secondary mt-3">
              Clear filters
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
