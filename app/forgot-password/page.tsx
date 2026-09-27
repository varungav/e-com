import { requestPasswordReset } from "@/lib/actions/auth";
import SubmitButton from "@/components/SubmitButton";

export default function ForgotPasswordPage({
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
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Reset your password</h1>
        <p className="mt-1 text-sm text-ink-400">We&apos;ll email you a reset link.</p>
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

      <form action={requestPasswordReset} className="card space-y-4 p-6">
        <div>
          <label className="label" htmlFor="email">
            Email
          </label>
          <input className="input" id="email" name="email" type="email" required />
        </div>

        <SubmitButton pendingText="Sending...">Send reset link</SubmitButton>
      </form>
    </div>
  );
}
