import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-ink-100 bg-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
              E
            </span>
            <span className="text-sm font-semibold text-ink-900">E-Com</span>
          </div>

          <p className="text-xs text-ink-400">
            Built with Next.js &amp; Supabase — demo store, no real payments are processed.
          </p>

          <div className="flex gap-5 text-sm text-ink-400">
            <Link href="/shop" className="hover:text-ink-900">
              Shop
            </Link>
            <Link href="/cart" className="hover:text-ink-900">
              Cart
            </Link>
            <Link href="/account" className="hover:text-ink-900">
              Account
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
