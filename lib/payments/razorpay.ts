import { createHmac } from "node:crypto";

const RAZORPAY_API_BASE = "https://api.razorpay.com/v1";

function getCredentials() {
  const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error(
      "Razorpay isn't configured — set NEXT_PUBLIC_RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.local"
    );
  }
  return { keyId, keySecret };
}

// Creates an order via Razorpay's Orders API. This is the server-side step
// that makes the amount trustworthy: the browser only ever gets an
// order id + amount that Razorpay itself will enforce, it can never submit
// its own (tampered) amount directly.
export async function createRazorpayOrder({
  amountInSmallestUnit,
  currency,
  receipt,
}: {
  amountInSmallestUnit: number; // e.g. cents for USD, paise for INR
  currency: string;
  receipt: string;
}) {
  const { keyId, keySecret } = getCredentials();
  const auth = Buffer.from(`${keyId}:${keySecret}`).toString("base64");

  const res = await fetch(`${RAZORPAY_API_BASE}/orders`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountInSmallestUnit,
      currency,
      receipt,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Razorpay order creation failed: ${res.status} ${body}`);
  }

  return (await res.json()) as { id: string; amount: number; currency: string };
}

// Verifies the signature Razorpay's checkout handler returns after a
// successful payment. Never trust a client-reported "payment succeeded"
// without this check — anyone could otherwise call your success handler
// directly without paying.
export function verifyRazorpaySignature({
  razorpayOrderId,
  razorpayPaymentId,
  razorpaySignature,
}: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) {
  const { keySecret } = getCredentials();
  const expected = createHmac("sha256", keySecret)
    .update(`${razorpayOrderId}|${razorpayPaymentId}`)
    .digest("hex");
  return expected === razorpaySignature;
}
