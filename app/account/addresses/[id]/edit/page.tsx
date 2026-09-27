import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUser } from "@/lib/supabase/session";
import { updateAddress } from "@/lib/actions/addresses";
import AddressForm from "@/components/AddressForm";

export default async function EditAddressPage({ params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) redirect(`/login?redirectTo=/account/addresses/${params.id}/edit`);

  const supabase = createClient();
  const { data: address } = await supabase
    .from("addresses")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!address) notFound();

  const updateWithId = updateAddress.bind(null, address.id);

  return (
    <div className="mx-auto max-w-xl">
      <Link href="/account/addresses" className="mb-4 inline-flex items-center gap-1.5 text-sm text-ink-400 hover:text-ink-900">
        <ArrowLeft className="h-4 w-4" /> Back to addresses
      </Link>
      <h1 className="mb-6 text-2xl font-bold text-ink-900">Edit address</h1>
      <AddressForm action={updateWithId} address={address} submitText="Save changes" />
    </div>
  );
}
