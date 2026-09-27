import Link from "next/link";
import Image from "next/image";
import { ArrowRight, LogIn, ShieldCheck, ShoppingCart, Tag, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { formatPrice } from "@/lib/format";
import { removeFromCart } from "@/lib/actions/cart";
import CartQuantityStepper from "@/components/CartQuantityStepper";
import SubmitButton from "@/components/SubmitButton";

export default async function CartPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="mx-auto max-w-md py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-dark">
          <ShoppingCart className="h-6 w-6" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Your cart</h1>
        <p className="mt-2 text-ink-400">Log in to see what&apos;s waiting for you.</p>
        <Link href="/login?redirectTo=/cart" className="btn mt-5">
          <LogIn className="h-4 w-4" /> Log in
        </Link>
      </div>
    );
  }

  const supabase = createClient();
  const { data: cartItems } = await supabase
    .from("cart_items")
    .select("id, quantity, product:products(id, name, slug, price_cents, currency, image_url, stock)")
    .eq("user_id", user.id)
    .order("created_at");

  const items = (cartItems || []) as unknown as Array<{
    id: string;
    quantity: number;
    product: {
      id: string;
      name: string;
      slug: string;
      price_cents: number;
      currency: string;
      image_url: string | null;
      stock: number;
    } | null;
  }>;

  const validItems = items.filter((i) => i.product);
  const itemCount = validItems.reduce((sum, i) => sum + i.quantity, 0);
  const total = validItems.reduce((sum, i) => sum + i.product!.price_cents * i.quantity, 0);
  const currency = validItems[0]?.product?.currency;

  return (
    <div>
      <h1 className="text-2xl font-bold text-ink-900">
        Your cart {itemCount > 0 && <span className="text-ink-400">({itemCount})</span>}
      </h1>

      {searchParams.error && (
        <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      {validItems.length === 0 ? (
        <div className="card mt-6 flex flex-col items-center gap-3 py-16 text-center">
          <ShoppingCart className="h-8 w-8 text-ink-400" />
          <p className="font-medium text-ink-900">Your cart is empty</p>
          <Link href="/shop" className="btn mt-2">
            Continue shopping <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            {validItems.map((item) => (
              <div
                key={item.id}
                className="card flex flex-col items-start gap-4 p-4 sm:flex-row sm:items-center"
              >
                <Link
                  href={`/products/${item.product!.slug}`}
                  className="relative h-20 w-20 flex-shrink-0 overflow-hidden rounded-xl bg-ink-50"
                >
                  {item.product!.image_url && (
                    <Image
                      src={item.product!.image_url}
                      alt={item.product!.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  )}
                </Link>

                <div className="flex-1">
                  <Link
                    href={`/products/${item.product!.slug}`}
                    className="font-semibold text-ink-900 hover:text-brand-dark"
                  >
                    {item.product!.name}
                  </Link>
                  <p className="text-sm text-ink-400">
                    {formatPrice(item.product!.price_cents, item.product!.currency)} each
                  </p>
                  <p className="mt-1 text-sm font-semibold text-ink-900 sm:hidden">
                    {formatPrice(item.product!.price_cents * item.quantity, item.product!.currency)}
                  </p>
                </div>

                <CartQuantityStepper
                  cartItemId={item.id}
                  initialQuantity={item.quantity}
                  maxQuantity={item.product!.stock}
                />

                <span className="hidden w-24 text-right font-semibold text-ink-900 sm:block">
                  {formatPrice(item.product!.price_cents * item.quantity, item.product!.currency)}
                </span>

                <form
                  action={async () => {
                    "use server";
                    await removeFromCart(item.id);
                  }}
                >
                  <SubmitButton
                    className="flex h-9 w-9 items-center justify-center rounded-full text-ink-400 transition hover:bg-red-50 hover:text-red-600"
                    spinnerClassName="spinner-dark"
                  >
                    <Trash2 className="h-4 w-4" />
                  </SubmitButton>
                </form>
              </div>
            ))}
          </div>

          <div className="card h-fit p-6">
            <h2 className="font-semibold text-ink-900">Order summary</h2>
            <div className="mt-4 flex justify-between text-sm text-ink-600">
              <span>Subtotal ({itemCount} item{itemCount === 1 ? "" : "s"})</span>
              <span className="font-semibold text-ink-900">{formatPrice(total, currency)}</span>
            </div>
            <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-400">
              <Tag className="h-3.5 w-3.5" /> Promo codes can be applied at checkout
            </p>
            <Link href="/checkout" className="btn mt-6 w-full">
              Proceed to checkout <ArrowRight className="h-4 w-4" />
            </Link>
            <p className="mt-4 flex items-center justify-center gap-1.5 text-xs text-ink-400">
              <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> Secure checkout via Razorpay
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
