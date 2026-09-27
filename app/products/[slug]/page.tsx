import Image from "next/image";
import { notFound } from "next/navigation";
import { PackageCheck, RotateCcw, ShieldCheck, Truck } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { formatPrice } from "@/lib/format";
import ProductPurchasePanel from "@/components/ProductPurchasePanel";

const trustPoints = [
  { icon: Truck, label: "Fast delivery" },
  { icon: ShieldCheck, label: "Secure payment" },
  { icon: RotateCcw, label: "Easy 7-day returns" },
];

export default async function ProductPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();

  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .eq("is_active", true)
    .single();

  if (!product) notFound();

  return (
    <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
      <div className="card relative aspect-square w-full overflow-hidden">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-400">No image</div>
        )}
      </div>

      <div className="flex flex-col">
        <h1 className="text-3xl font-extrabold tracking-tight text-ink-900">{product.name}</h1>
        <p className="mt-3 text-2xl font-bold text-brand-dark">
          {formatPrice(product.price_cents, product.currency)}
        </p>

        {product.description && (
          <p className="mt-5 whitespace-pre-line leading-relaxed text-ink-600">
            {product.description}
          </p>
        )}

        <p className="mt-5">
          {product.stock > 0 ? (
            <span className="badge flex w-fit items-center gap-1.5 bg-green-50 text-green-700">
              <PackageCheck className="h-3.5 w-3.5" /> {product.stock} in stock
            </span>
          ) : (
            <span className="badge bg-ink-100 text-ink-600">Out of stock</span>
          )}
        </p>

        <ProductPurchasePanel
          productId={product.id}
          maxQuantity={product.stock}
          disabled={product.stock === 0}
        />

        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-ink-100 pt-6">
          {trustPoints.map(({ icon: Icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-1.5 text-center">
              <Icon className="h-5 w-5 text-brand" />
              <span className="text-xs text-ink-600">{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
