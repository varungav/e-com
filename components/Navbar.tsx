import { Suspense } from "react";
import Link from "next/link";
import { LayoutDashboard, LogIn, ShoppingBag, ShoppingCart, UserRound } from "lucide-react";
import { getCurrentUser, getCurrentProfile } from "@/lib/supabase/session";
import { signOut } from "@/lib/actions/auth";
import CartBadge from "@/components/CartBadge";
import SubmitButton from "@/components/SubmitButton";

export default async function Navbar() {
  const user = await getCurrentUser();

  let isAdmin = false;
  if (user) {
    const profile = await getCurrentProfile();
    isAdmin = profile?.role === "admin";
  }

  return (
    <header className="sticky top-0 z-40 border-b border-ink-100/80 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-bold text-white shadow-soft">
            E
          </span>
          <span className="text-lg font-bold tracking-tight text-ink-900">E-Com</span>
        </Link>

        <nav className="flex items-center gap-1 text-sm sm:gap-2">
          <Link href="/" className="btn-ghost hidden sm:inline-flex">
            Home
          </Link>
          <Link href="/shop" className="btn-ghost">
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Shop</span>
          </Link>

          {isAdmin && (
            <Link href="/admin" className="btn-ghost">
              <LayoutDashboard className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Link>
          )}

          <Link href="/cart" className="btn-ghost relative">
            <ShoppingCart className="h-4 w-4" />
            <span className="hidden sm:inline">Cart</span>
            <Suspense fallback={null}>
              <CartBadge />
            </Suspense>
          </Link>

          {user ? (
            <>
              <Link href="/account" className="btn-ghost">
                <UserRound className="h-4 w-4" />
                <span className="hidden sm:inline">Account</span>
              </Link>
              <form action={signOut}>
                <SubmitButton
                  className="btn-secondary ml-1"
                  spinnerClassName="spinner-dark"
                  pendingText="Signing out..."
                >
                  Sign out
                </SubmitButton>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-ghost">
                <LogIn className="h-4 w-4" />
                <span className="hidden sm:inline">Log in</span>
              </Link>
              <Link href="/signup" className="btn ml-1">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
