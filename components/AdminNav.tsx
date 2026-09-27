import Link from "next/link";
import { ArrowLeft, Package, PackageSearch, Tags, Ticket, Users } from "lucide-react";

export default function AdminNav({
  active,
}: {
  active: "products" | "categories" | "coupons" | "orders" | "users";
}) {
  const tabs = [
    { key: "products", label: "Products", href: "/admin/products", icon: Package },
    { key: "categories", label: "Categories", href: "/admin/categories", icon: Tags },
    { key: "coupons", label: "Coupons", href: "/admin/coupons", icon: Ticket },
    { key: "orders", label: "Orders", href: "/admin/orders", icon: PackageSearch },
    { key: "users", label: "Users", href: "/admin/users", icon: Users },
  ] as const;

  return (
    <div className="mb-6 flex flex-wrap items-center gap-2">
      <Link href="/admin" className="btn-ghost">
        <ArrowLeft className="h-4 w-4" /> Dashboard
      </Link>
      <div className="mx-1 h-5 w-px bg-ink-100" />
      {tabs.map((tab) => (
        <Link
          key={tab.key}
          href={tab.href}
          className={`pill inline-flex items-center gap-1.5 ${
            active === tab.key
              ? "bg-brand text-white shadow-soft"
              : "bg-white text-ink-600 ring-1 ring-inset ring-ink-100 hover:bg-ink-50"
          }`}
        >
          <tab.icon className="h-3.5 w-3.5" />
          {tab.label}
        </Link>
      ))}
    </div>
  );
}
