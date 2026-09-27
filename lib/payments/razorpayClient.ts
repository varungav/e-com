// Client-side Razorpay Checkout loader. Only ever imported from a
// "use client" component — never from server code.

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

let scriptPromise: Promise<boolean> | null = null;

function loadRazorpayScript() {
  if ((window as any).Razorpay) return Promise.resolve(true);
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.onload = () => resolve(true);
    script.onerror = () => reject(new Error("Failed to load Razorpay checkout script"));
    document.body.appendChild(script);
  });

  return scriptPromise;
}

export async function openRazorpayCheckout({
  keyId,
  amount,
  currency,
  razorpayOrderId,
  name,
  description,
  prefill,
  onSuccess,
  onFailure,
}: {
  keyId: string;
  amount: number;
  currency: string;
  razorpayOrderId: string;
  name: string;
  description: string;
  prefill: { name?: string; email?: string; contact?: string };
  onSuccess: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  onFailure: (message: string) => void;
}) {
  try {
    await loadRazorpayScript();
  } catch {
    onFailure("Couldn't reach the payment gateway. Check your connection and try again.");
    return;
  }

  const razorpay = new (window as any).Razorpay({
    key: keyId,
    amount,
    currency,
    order_id: razorpayOrderId,
    name,
    description,
    prefill,
    theme: { color: "#111827" },
    handler: (response: any) => onSuccess(response),
    modal: {
      ondismiss: () => onFailure("Payment cancelled."),
    },
  });

  razorpay.on("payment.failed", (response: any) => {
    onFailure(response?.error?.description || "Payment failed. Please try again.");
  });

  razorpay.open();
}
