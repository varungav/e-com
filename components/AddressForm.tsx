import { INDIAN_STATES } from "@/lib/indianStates";
import SubmitButton from "@/components/SubmitButton";
import type { Address } from "@/lib/supabase/types";

const LABELS = ["Home", "Work", "Other"];

export default function AddressForm({
  action,
  address,
  submitText = "Save address",
}: {
  action: (formData: FormData) => void;
  address?: Address;
  submitText?: string;
}) {
  return (
    <form action={action} className="card space-y-4 p-6">
      <div>
        <label className="label" htmlFor="label">
          Address type
        </label>
        <div className="flex gap-2">
          {LABELS.map((l) => (
            <label
              key={l}
              className="flex-1 cursor-pointer rounded-xl border border-ink-100 px-3 py-2 text-center text-sm has-[:checked]:border-brand has-[:checked]:bg-brand-50 has-[:checked]:font-semibold has-[:checked]:text-brand-dark"
            >
              <input
                type="radio"
                name="label"
                value={l}
                defaultChecked={(address?.label ?? "Home") === l}
                className="sr-only"
              />
              {l}
            </label>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="fullName">
            Full name
          </label>
          <input
            className="input"
            id="fullName"
            name="fullName"
            defaultValue={address?.full_name}
            required
          />
        </div>
        <div>
          <label className="label" htmlFor="phone">
            Phone number
          </label>
          <input
            className="input"
            id="phone"
            name="phone"
            type="tel"
            defaultValue={address?.phone ?? ""}
          />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="line1">
          Address line 1
        </label>
        <input
          className="input"
          id="line1"
          name="line1"
          placeholder="Flat, house no., building"
          defaultValue={address?.line1}
          required
        />
      </div>

      <div>
        <label className="label" htmlFor="line2">
          Address line 2 <span className="font-normal text-ink-400">(optional)</span>
        </label>
        <input
          className="input"
          id="line2"
          name="line2"
          placeholder="Area, street, landmark"
          defaultValue={address?.line2 ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="city">
            City
          </label>
          <input className="input" id="city" name="city" defaultValue={address?.city} required />
        </div>
        <div>
          <label className="label" htmlFor="state">
            State
          </label>
          <select className="input" id="state" name="state" defaultValue={address?.state ?? ""} required>
            <option value="" disabled>
              Select state
            </option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label" htmlFor="postalCode">
            PIN code
          </label>
          <input
            className="input"
            id="postalCode"
            name="postalCode"
            inputMode="numeric"
            pattern="[0-9]{6}"
            title="6-digit PIN code"
            defaultValue={address?.postal_code}
            required
          />
        </div>
      </div>

      <SubmitButton>{submitText}</SubmitButton>
    </form>
  );
}
