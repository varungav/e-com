"use server";

import { createClient } from "@/lib/supabase/server";
import { createRazorpayOrder, verifyRazorpaySignature } from "@/lib/payments/razorpay";
import { validatePromoCode } from "@/lib/actions/promo";

type CheckoutLine = {
  quantity: number;
  product: { id: string; name: string; price_cents: number; currency: string; stock: number };
};

// `source` selects where the checkout's line items come from:
//  - "cart": the user's persisted cart_items (cleared after payment)
//  - "buyNow": a single product/quantity picked straight from a product
//    page's "Buy Now" button — the cart is never read or touched.
export type CheckoutSource =
  | { mode: "cart" }
  | { mode: "buyNow"; productId: string; quantity: number };

async function getCheckoutLines(userId: string, source: CheckoutSource) {
  const supabase = createClient();

  let validItems: CheckoutLine[];

  if (source.mode === "buyNow") {
    const { data: product } = await supabase
      .from("products")
      .select("id, name, price_cents, currency, stock")
      .eq("id", source.productId)
      .eq("is_active", true)
      .single();

    if (!product) throw new Error("That product is no longer available.");
    if (product.stock < source.quantity) throw new Error(`Not enough stock for ${product.name}.`);

    validItems = [{ quantity: source.quantity, product }];
  } else {
    const { data: cartItems } = await supabase
      .from("cart_items")
      .select("quantity, product:products(id, name, price_cents, currency, stock)")
      .eq("user_id", userId);

    const items = (cartItems || []) as unknown as Array<{
      quantity: number;
      product: CheckoutLine["product"] | null;
    }>;

    validItems = items.filter((i): i is CheckoutLine => Boolean(i.product)) as CheckoutLine[];

    if (validItems.length === 0) throw new Error("Your cart is empty.");

    for (const item of validItems) {
      if (item.product.stock < item.quantity) {
        throw new Error(`Not enough stock for ${item.product.name}.`);
      }
    }
  }

  const currencies = new Set(validItems.map((i) => i.product.currency));
  if (currencies.size > 1) {
    throw new Error("Cart has mixed currencies — this isn't supported yet.");
  }

  const subtotalCents = validItems.reduce((sum, i) => sum + i.product.price_cents * i.quantity, 0);
  const currency = validItems[0].product.currency;

  return { supabase, validItems, subtotalCents, currency };
}

// Step 1: create a Razorpay order server-side, from the *actual* database
// prices (plus any validated promo discount) — never trust an amount the
// browser might send.
export async function createCheckoutOrder({
  promoCode,
  source = { mode: "cart" },
}: {
  promoCode?: string;
  source?: CheckoutSource;
} = {}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not signed in.");

  const { subtotalCents, currency } = await getCheckoutLines(user.id, source);

  let discountCents = 0;
  if (promoCode) {
    const result = await validatePromoCode(promoCode, subtotalCents);
    discountCents = result.discountCents;
  }

  const totalCents = subtotalCents - discountCents;

  // A 100%-off promo can bring the total to zero — Razorpay rejects orders
  // below its minimum amount, and there's nothing to actually charge anyway,
  // so skip creating a Razorpay order and let the client place it directly.
  if (totalCents <= 0) {
    return {
      isFreeOrder: true as const,
      razorpayOrderId: null,
      amount: 0,
      currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      subtotalCents,
      discountCents,
      totalCents: 0,
    };
  }

  const razorpayOrder = await createRazorpayOrder({
    amountInSmallestUnit: totalCents,
    currency,
    receipt: `order_${user.id}_${Date.now()}`,
  });

  return {
    isFreeOrder: false as const,
    razorpayOrderId: razorpayOrder.id,
    amount: razorpayOrder.amount,
    currency: razorpayOrder.currency,
    keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    subtotalCents,
    discountCents,
    totalCents,
  };
}

// For a 100%-off promo (see createCheckoutOrder above): places the order
// directly, with no Razorpay round-trip at all. Re-validates the discount
// server-side and refuses if it no longer covers the full total — never
// trust the client's claim that this order is free.
export async function placeFreeOrder({
  addressId,
  promoCode,
  source = { mode: "cart" },
}: {
  addressId: string;
  promoCode?: string;
  source?: CheckoutSource;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not signed in.");

  const { data: address } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .single();

  if (!address) throw new Error("Shipping address not found.");

  const { validItems, subtotalCents, currency } = await getCheckoutLines(user.id, source);

  let discountCents = 0;
  let normalizedPromo: string | null = null;
  if (promoCode) {
    const result = await validatePromoCode(promoCode, subtotalCents);
    discountCents = result.discountCents;
    normalizedPromo = result.code;
  }

  const totalCents = subtotalCents - discountCents;
  if (totalCents > 0) {
    throw new Error("This order isn't fully covered by the promo code — please pay to continue.");
  }

  const composedAddress = [address.line1, address.line2, `${address.city}, ${address.state} ${address.postal_code}`]
    .filter(Boolean)
    .join("\n");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "paid",
      subtotal_cents: subtotalCents,
      discount_cents: discountCents,
      promo_code: normalizedPromo,
      total_cents: totalCents,
      currency,
      shipping_name: address.full_name,
      shipping_phone: address.phone,
      shipping_line1: address.line1,
      shipping_line2: address.line2,
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_postal_code: address.postal_code,
      shipping_address: composedAddress,
      razorpay_order_id: null,
      razorpay_payment_id: null,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error("We couldn't record your order. Please contact support.");
  }

  const orderItemsPayload = validItems.map((i) => ({
    order_id: order.id,
    product_id: i.product.id,
    product_name: i.product.name,
    unit_price_cents: i.product.price_cents,
    quantity: i.quantity,
  }));

  await supabase.from("order_items").insert(orderItemsPayload);

  for (const item of validItems) {
    await supabase
      .from("products")
      .update({ stock: item.product.stock - item.quantity })
      .eq("id", item.product.id);
  }

  if (source.mode === "cart") {
    await supabase.from("cart_items").delete().eq("user_id", user.id);
  }

  return { orderId: order.id as string };
}

// Step 2: called from the client after Razorpay's checkout reports success.
// Verifies the payment signature before creating anything — this is the
// step that actually proves the payment happened; do not skip it.
export async function confirmPayment({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
  addressId,
  promoCode,
  source = { mode: "cart" },
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
  addressId: string;
  promoCode?: string;
  source?: CheckoutSource;
}) {
  const isValid = verifyRazorpaySignature({ razorpayOrderId, razorpayPaymentId, razorpaySignature });
  if (!isValid) {
    throw new Error("Payment verification failed. Please contact support before retrying.");
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("Not signed in.");

  const { data: address } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", addressId)
    .eq("user_id", user.id)
    .single();

  if (!address) throw new Error("Shipping address not found.");

  const { validItems, subtotalCents, currency } = await getCheckoutLines(user.id, source);

  let discountCents = 0;
  let normalizedPromo: string | null = null;
  if (promoCode) {
    const result = await validatePromoCode(promoCode, subtotalCents);
    discountCents = result.discountCents;
    normalizedPromo = result.code;
  }

  const totalCents = subtotalCents - discountCents;

  const composedAddress = [address.line1, address.line2, `${address.city}, ${address.state} ${address.postal_code}`]
    .filter(Boolean)
    .join("\n");

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .insert({
      user_id: user.id,
      status: "paid",
      subtotal_cents: subtotalCents,
      discount_cents: discountCents,
      promo_code: normalizedPromo,
      total_cents: totalCents,
      currency,
      shipping_name: address.full_name,
      shipping_phone: address.phone,
      shipping_line1: address.line1,
      shipping_line2: address.line2,
      shipping_city: address.city,
      shipping_state: address.state,
      shipping_postal_code: address.postal_code,
      shipping_address: composedAddress,
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
    })
    .select("id")
    .single();

  if (orderError || !order) {
    throw new Error("Payment succeeded, but we couldn't record your order. Please contact support.");
  }

  const orderItemsPayload = validItems.map((i) => ({
    order_id: order.id,
    product_id: i.product.id,
    product_name: i.product.name,
    unit_price_cents: i.product.price_cents,
    quantity: i.quantity,
  }));

  await supabase.from("order_items").insert(orderItemsPayload);

  for (const item of validItems) {
    await supabase
      .from("products")
      .update({ stock: item.product.stock - item.quantity })
      .eq("id", item.product.id);
  }

  // Only the persisted cart gets cleared — a "Buy Now" purchase never
  // touched it in the first place.
  if (source.mode === "cart") {
    await supabase.from("cart_items").delete().eq("user_id", user.id);
  }

  return { orderId: order.id as string };
}
