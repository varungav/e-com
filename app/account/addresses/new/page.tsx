import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { createAddress } from "@/lib/actions/addresses";
import AddressForm from "@/components/AddressForm";

export default function NewAddressPage() {
  return (
    <div className="mx-auto max-w-xl">
      <Link href="/account/addresses" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back to addresses
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Add a new address</h1>
      <AddressForm action={createAddress} submitText="Save address" />
    </div>
  );
}
