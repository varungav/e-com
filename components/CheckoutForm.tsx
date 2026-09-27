"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle2, MapPin, Plus, Tag, X } from "lucide-react";
import {
  createCheckoutOrder,
  confirmPayment,
  placeFreeOrder,
  type CheckoutSource,
} from "@/lib/actions/payment";
import { validatePromoCode } from "@/lib/actions/promo";
import { openRazorpayCheckout } from "@/lib/payments/razorpayClient";
import { formatPrice } from "@/lib/format";
import type { Address } from "@/lib/supabase/types";

export default function CheckoutForm({
  addresses,
  customerEmail,
  subtotalCents,
  currency,
  source,
}: {
  addresses: Address[];
  customerEmail: string;
  subtotalCents: number;
  currency: string;
  source: CheckoutSource;
}) {
  const router = useRouter();
  const [selectedAddressId, setSelectedAddressId] = useState(
    addresses.find((a) => a.is_default)?.id ?? addresses[0]?.id ?? ""
  );
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountCents: number } | null>(
    null
  );
  const [promoStatus, setPromoStatus] = useState<"idle" | "checking">("idle");
  const [promoError, setPromoError] = useState("");
  const [status, setStatus] = useState<"idle" | "creating" | "paying" | "confirming">("idle");
  const [error, setError] = useState("");

  const isBusy = status !== "idle";
  const discountCents = appliedPromo?.discountCents ?? 0;
  const totalCents = subtotalCents - discountCents;
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);

  async function handleApplyPromo() {
    setPromoError("");
    if (!promoInput.trim()) return;
    setPromoStatus("checking");
    try {
      const result = await validatePromoCode(promoInput, subtotalCents);
      setAppliedPromo(result);
    } catch (err) {
      setAppliedPromo(null);
      setPromoError(err instanceof Error ? err.message : "Couldn't apply that code.");
    } finally {
      setPromoStatus("idle");
    }
  }

  async function handlePay() {
    setError("");

    if (!selectedAddressId) {
      setError("Please select a shipping address.");
      return;
    }

    setStatus("creating");
    let order;
    try {
      order = await createCheckoutOrder({ promoCode: appliedPromo?.code, source });
    } catch (err) {
      setStatus("idle");
      setError(err instanceof Error ? err.message : "Couldn't start checkout. Please try again.");
      return;
    }

    if (order.isFreeOrder) {
      setStatus("confirming");
      try {
        const result = await placeFreeOrder({
          addressId: selectedAddressId,
          promoCode: appliedPromo?.code,
          source,
        });
        router.push(`/order-confirmation/${result.orderId}`);
      } catch (err) {
        setStatus("idle");
        setError(err instanceof Error ? err.message : "Couldn't place your order. Please try again.");
      }
      return;
    }

    if (!order.keyId) {
      setStatus("idle");
      setError(
        "Payments aren't configured yet — set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local."
      );
      return;
    }

    setStatus("paying");
    await openRazorpayCheckout({
      keyId: order.keyId,
      amount: order.amount,
      currency: order.currency,
      razorpayOrderId: order.razorpayOrderId,
      name: "E-Com",
      description: `Order total ${formatPrice(order.totalCents, currency)}`,
      prefill: { name: selectedAddress?.full_name, email: customerEmail, contact: selectedAddress?.phone ?? undefined },
      onSuccess: async (response) => {
        setStatus("confirming");
        try {
          const result = await confirmPayment({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
            addressId: selectedAddressId,
            promoCode: appliedPromo?.code,
            source,
          });

          if (!result?.orderId) {
            throw new Error(
              "Your payment went through, but we didn't get a confirmation back from the server. Please refresh and check /account/orders before retrying — you may have already been charged."
            );
          }

          router.push(`/order-confirmation/${result.orderId}`);
        } catch (err) {
          setStatus("idle");
          setError(
            err instanceof Error ? err.message : "Payment succeeded but confirming it failed."
          );
        }
      },
      onFailure: (message) => {
        setStatus("idle");
        setError(message);
      },
    });
  }

  const buttonLabel =
    status === "creating"
      ? "Preparing payment..."
      : status === "paying"
      ? "Waiting for payment..."
      : status === "confirming"
      ? "Confirming payment..."
      : totalCents <= 0
      ? "Place order"
      : `Pay ${formatPrice(totalCents, currency)} securely`;

  return (
    <div className="mt-6 space-y-6">
      {/* Address selection */}
      <div className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-semibold text-ink-900">
            <MapPin className="h-4 w-4" /> Deliver to
          </h2>
          <Link href="/account/addresses/new?redirectTo=/checkout" className="text-sm font-medium text-brand hover:text-brand-dark">
            <Plus className="mr-1 inline h-3.5 w-3.5" /> Add new
          </Link>
        </div>

        {addresses.length === 0 ? (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            You don&apos;t have a saved address yet.{" "}
            <Link href="/account/addresses/new?redirectTo=/checkout" className="font-semibold underline">
              Add one
            </Link>{" "}
            to continue.
          </p>
        ) : (
          <div className="space-y-2">
            {addresses.map((a) => (
              <label
                key={a.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition ${
                  selectedAddressId === a.id
                    ? "border-brand bg-brand-50"
                    : "border-ink-100 hover:border-ink-200"
                }`}
              >
                <input
                  type="radio"
                  name="addressId"
                  value={a.id}
                  checked={selectedAddressId === a.id}
                  onChange={() => setSelectedAddressId(a.id)}
                  className="mt-1"
                />
                <div className="text-sm">
                  <span className="badge mr-2 bg-ink-100 text-ink-600">{a.label}</span>
                  <span className="font-medium text-ink-900">{a.full_name}</span>
                  <p className="text-ink-600">
                    {a.line1}
                    {a.line2 ? `, ${a.line2}` : ""}, {a.city}, {a.state} {a.postal_code}
                  </p>
                  {a.phone && <p className="text-ink-400">Phone: {a.phone}</p>}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Promo code */}
      <div className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 font-semibold text-ink-900">
          <Tag className="h-4 w-4" /> Promo code
        </h2>

        {appliedPromo ? (
          <div className="flex items-center justify-between rounded-xl bg-green-50 p-3 text-sm text-green-700">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="h-4 w-4" /> {appliedPromo.code} applied — you saved{" "}
              {formatPrice(appliedPromo.discountCents, currency)}
            </span>
            <button
              type="button"
              onClick={() => {
                setAppliedPromo(null);
                setPromoInput("");
              }}
              className="text-green-700 hover:text-green-900"
              aria-label="Remove promo code"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div>
            <div className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="e.g. WELCOME10"
                value={promoInput}
                onChange={(e) => setPromoInput(e.target.value.toUpperCase())}
                disabled={promoStatus === "checking"}
              />
              <button
                type="button"
                onClick={handleApplyPromo}
                disabled={promoStatus === "checking" || !promoInput.trim()}
                className="btn-secondary"
              >
                {promoStatus === "checking" && <span className="spinner-dark" aria-hidden="true" />}
                Apply
              </button>
            </div>
            {promoError && <p className="mt-2 text-sm text-red-600">{promoError}</p>}
            <p className="mt-2 text-xs text-ink-400">Try WELCOME10 or FLAT200.</p>
          </div>
        )}
      </div>

      {/* Order total + pay */}
      <div className="card p-6">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-ink-600">
            <span>Subtotal</span>
            <span>{formatPrice(subtotalCents, currency)}</span>
          </div>
          {discountCents > 0 && (
            <div className="flex justify-between text-green-700">
              <span>Discount ({appliedPromo?.code})</span>
              <span>−{formatPrice(discountCents, currency)}</span>
            </div>
          )}
          <div className="flex justify-between border-t border-ink-100 pt-2 text-base font-semibold text-ink-900">
            <span>Total</span>
            <span>{formatPrice(totalCents, currency)}</span>
          </div>
        </div>

        {error && <p className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}

        <button
          type="button"
          onClick={handlePay}
          className="btn mt-4 w-full"
          disabled={isBusy || addresses.length === 0}
          aria-busy={isBusy}
        >
          {isBusy && <span className="spinner" aria-hidden="true" />}
          {buttonLabel}
        </button>

        <p className="mt-3 text-center text-xs text-ink-400">
          Payments are processed securely by Razorpay — your card/UPI details never touch this
          site.
        </p>
      </div>
    </div>
  );
}
