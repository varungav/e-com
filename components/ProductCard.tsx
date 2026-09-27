import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Product } from "@/lib/supabase/types";
import QuickAddButton from "@/components/QuickAddButton";

export default function ProductCard({ product }: { product: Product }) {
  const lowStock = product.stock > 0 && product.stock <= 5;

  return (
    <Link
      href={`/products/${product.slug}`}
      className="card group flex flex-col overflow-hidden hover:-translate-y-0.5 hover:shadow-hover"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-ink-50">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition duration-300 group-hover:scale-[1.05]"
            sizes="(max-width: 768px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-ink-400">
            No image
          </div>
        )}

        {product.stock === 0 ? (
          <span className="badge absolute left-3 top-3 bg-ink-900/85 text-white">
            Out of stock
          </span>
        ) : (
          lowStock && (
            <span className="badge absolute left-3 top-3 bg-amber-100 text-amber-700">
              Only {product.stock} left
            </span>
          )
        )}

        {product.stock > 0 && <QuickAddButton productId={product.id} />}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-4">
        <h3 className="line-clamp-1 font-semibold text-ink-900">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-1 text-xs text-ink-400">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-3">
          <span className="text-base font-bold text-brand-dark">
            {formatPrice(product.price_cents, product.currency)}
          </span>
          <span className="rounded-full bg-ink-50 px-3 py-1 text-xs font-medium text-ink-600 transition group-hover:bg-brand-50 group-hover:text-brand-dark">
            View →
          </span>
        </div>
      </div>
    </Link>
  );
}
