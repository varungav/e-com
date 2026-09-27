import Link from "next/link";
import { signUp } from "@/lib/actions/auth";
import SubmitButton from "@/components/SubmitButton";

export default function SignupPage({
  searchParams,
}: {
  searchParams: { error?: string; message?: string };
}) {
  return (
    <div className="mx-auto max-w-sm py-8">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-soft">
          E
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Create your account</h1>
        <p className="mt-1 text-sm text-ink-400">Join to start shopping.</p>
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

      <form action={signUp} className="card space-y-4 p-6">
        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input className="input" id="fullName" name="fullName" type="text" required />
        </div>

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
          <input
            className="input"
            id="password"
            name="password"
            type="password"
            minLength={6}
            required
          />
        </div>

        <SubmitButton pendingText="Creating account...">Sign up</SubmitButton>
      </form>

      <p className="mt-5 text-center text-sm text-ink-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand hover:text-brand-dark">
          Log in
        </Link>
      </p>
    </div>
  );
}
