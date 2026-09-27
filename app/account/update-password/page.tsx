import { updatePassword } from "@/lib/actions/account";
import SubmitButton from "@/components/SubmitButton";

export default function UpdatePasswordPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="mx-auto max-w-sm py-8">
      <div className="mb-8 text-center">
        <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand text-sm font-bold text-white shadow-soft">
          E
        </span>
        <h1 className="mt-4 text-2xl font-bold text-ink-900">Choose a new password</h1>
      </div>

      {searchParams.error && (
        <p className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700">
          {searchParams.error}
        </p>
      )}

      <form action={updatePassword} className="card space-y-4 p-6">
        <div>
          <label className="label" htmlFor="password">
            New password
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

        <SubmitButton pendingText="Updating...">Update password</SubmitButton>
      </form>
    </div>
  );
}
