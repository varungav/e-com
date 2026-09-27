import Link from "next/link";
import { signIn } from "@/lib/actions/auth";
import SubmitButton from "@/components/SubmitButton";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string; redirectTo?: string };
}) {
  return (
    <div className="mx-auto max-w-sm py-8">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-soft">
          E
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Welcome back</h1>
        <p className="mt-1 text-sm text-ink-400">Log in to continue shopping.</p>
      </div>

      {searchParams.message && (
        <p className="mb-4 rounded-xl bg-green-50 p-3 text-sm text-green-700">
          {searchParams.message}
        </p>
      )}
      {searchParams.error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={signIn} className="card space-y-4 p-6">
        <input type="hidden" name="redirectTo" value={searchParams.redirectTo || "/account"} />

        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input className="input" id="email" name="email" type="email" required />
        </div>

        <div>
          <label className="label" htmlFor="password">
            Password
          </label>
          <input className="input" id="password" name="password" type="password" required />
        </div>

        <SubmitButton pendingText="Logging in...">Log in</SubmitButton>
      </form>

      <div className="mt-5 flex justify-between text-sm">
        <Link href="/signup" className="font-medium text-brand hover:text-brand-dark">
          Create an account
        </Link>
        <Link href="/forgot-password" className="font-medium text-brand hover:text-brand-dark">
          Forgot password?
        </Link>
      </div>
    </div>
  );
}
