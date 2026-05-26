import { Link } from "react-router-dom";
import { formatAddressSummary } from "../../data/profile";
import { INDIAN_STATES } from "../../data/checkout";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-cream-200/90 bg-cream-50/80 px-4 py-3 font-body text-sm text-emerald-900 outline-none transition-colors focus:border-emerald-900/20 focus:ring-2 focus:ring-gold-400/15";

const labelClass = "font-body text-[11px] font-medium uppercase tracking-[0.14em] text-emerald-900/50";

export function CheckoutAddressSection({
  savedAddresses,
  addressMode,
  onAddressModeChange,
  selectedAddressId,
  onSelectAddress,
  newForm,
  onNewFieldChange,
  saveNewToProfile,
  onSaveNewToProfileChange,
  errors = {},
}) {
  const hasSavedAddresses = savedAddresses.length > 0;

  return (
    <section className="rounded-2xl border border-cream-200/80 bg-white/90 p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-lg text-emerald-900">Delivery address</h2>
          <p className="mt-1 font-body text-[12px] text-emerald-900/40">
            {hasSavedAddresses ? "Choose a saved address from your profile" : "Add your delivery address"}
          </p>
        </div>
        {hasSavedAddresses ? (
          <Link
            to="/account"
            className="font-body text-[11px] uppercase tracking-[0.14em] text-emerald-800/55 transition-colors hover:text-emerald-900"
          >
            Manage profile
          </Link>
        ) : null}
      </div>

      {hasSavedAddresses ? (
        <>
          <div className="mt-5 space-y-2.5" role="radiogroup" aria-label="Saved addresses">
            {savedAddresses.map((address) => {
              const selected = addressMode === "saved" && selectedAddressId === address.id;
              return (
                <label
                  key={address.id}
                  className={`flex cursor-pointer gap-3 rounded-xl border px-4 py-3.5 transition-colors ${
                    selected
                      ? "border-emerald-900/25 bg-emerald-900/[0.03]"
                      : "border-cream-200/80 bg-cream-50/40 hover:border-emerald-900/12"
                  }`}
                >
                  <input
                    type="radio"
                    name="savedAddress"
                    checked={selected}
                    onChange={() => {
                      onAddressModeChange("saved");
                      onSelectAddress(address.id);
                    }}
                    className="mt-1 accent-emerald-900"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-body text-sm font-medium text-emerald-900">{address.label}</span>
                      {address.isDefault ? (
                        <span className="rounded-full bg-gold-500/15 px-2 py-0.5 font-body text-[9px] uppercase tracking-[0.12em] text-emerald-900/55">
                          Default
                        </span>
                      ) : null}
                    </span>
                    <span className="mt-1 block font-body text-[13px] text-emerald-900/70">{address.fullName}</span>
                    <span className="mt-0.5 block font-body text-[12px] leading-relaxed text-emerald-900/45">
                      {formatAddressSummary(address)}
                    </span>
                    <span className="mt-1 block font-body text-[12px] text-emerald-900/40">{address.phone}</span>
                  </span>
                </label>
              );
            })}
          </div>

          {errors.selectedAddressId ? (
            <p className="mt-2 font-body text-[12px] text-red-700/80">{errors.selectedAddressId}</p>
          ) : null}

          <button
            type="button"
            className={`mt-4 w-full rounded-xl border px-4 py-3 text-left font-body text-[13px] transition-colors ${
              addressMode === "new"
                ? "border-emerald-900/25 bg-emerald-900/[0.03] text-emerald-900"
                : "border-cream-200/80 bg-cream-50/40 text-emerald-900/55 hover:border-emerald-900/12 hover:text-emerald-900"
            }`}
            onClick={() => onAddressModeChange(addressMode === "new" ? "saved" : "new")}
          >
            {addressMode === "new" ? "← Use saved address" : "+ Add new address"}
          </button>
        </>
      ) : null}

      {(!hasSavedAddresses || addressMode === "new") && (
        <div className={`grid gap-4 sm:grid-cols-2 ${hasSavedAddresses ? "mt-5 border-t border-cream-200/60 pt-5" : "mt-5"}`}>
          <div className="sm:col-span-2">
            <label htmlFor="addressLabel" className={labelClass}>
              Address label
            </label>
            <input
              id="addressLabel"
              type="text"
              placeholder="Home, Office, etc."
              className={fieldClass}
              value={newForm.addressLabel}
              onChange={(e) => onNewFieldChange("addressLabel", e.target.value)}
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="fullName" className={labelClass}>
              Full name
            </label>
            <input
              id="fullName"
              type="text"
              autoComplete="name"
              className={fieldClass}
              value={newForm.fullName}
              onChange={(e) => onNewFieldChange("fullName", e.target.value)}
            />
            {errors.fullName ? <p className="mt-1 font-body text-[12px] text-red-700/80">{errors.fullName}</p> : null}
          </div>
          <div>
            <label htmlFor="email" className={labelClass}>
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              className={fieldClass}
              value={newForm.email}
              onChange={(e) => onNewFieldChange("email", e.target.value)}
            />
            {errors.email ? <p className="mt-1 font-body text-[12px] text-red-700/80">{errors.email}</p> : null}
          </div>
          <div>
            <label htmlFor="phone" className={labelClass}>
              Phone
            </label>
            <input
              id="phone"
              type="tel"
              autoComplete="tel"
              placeholder="10-digit mobile"
              className={fieldClass}
              value={newForm.phone}
              onChange={(e) => onNewFieldChange("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
            {errors.phone ? <p className="mt-1 font-body text-[12px] text-red-700/80">{errors.phone}</p> : null}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="addressLine1" className={labelClass}>
              Address line 1
            </label>
            <input
              id="addressLine1"
              type="text"
              autoComplete="address-line1"
              className={fieldClass}
              value={newForm.addressLine1}
              onChange={(e) => onNewFieldChange("addressLine1", e.target.value)}
            />
            {errors.addressLine1 ? (
              <p className="mt-1 font-body text-[12px] text-red-700/80">{errors.addressLine1}</p>
            ) : null}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="addressLine2" className={labelClass}>
              Address line 2 <span className="normal-case tracking-normal text-emerald-900/30">(optional)</span>
            </label>
            <input
              id="addressLine2"
              type="text"
              autoComplete="address-line2"
              className={fieldClass}
              value={newForm.addressLine2}
              onChange={(e) => onNewFieldChange("addressLine2", e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="city" className={labelClass}>
              City
            </label>
            <input
              id="city"
              type="text"
              autoComplete="address-level2"
              className={fieldClass}
              value={newForm.city}
              onChange={(e) => onNewFieldChange("city", e.target.value)}
            />
            {errors.city ? <p className="mt-1 font-body text-[12px] text-red-700/80">{errors.city}</p> : null}
          </div>
          <div>
            <label htmlFor="state" className={labelClass}>
              State
            </label>
            <select
              id="state"
              className={fieldClass}
              value={newForm.state}
              onChange={(e) => onNewFieldChange("state", e.target.value)}
            >
              <option value="">Select state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>
                  {state}
                </option>
              ))}
            </select>
            {errors.state ? <p className="mt-1 font-body text-[12px] text-red-700/80">{errors.state}</p> : null}
          </div>
          <div>
            <label htmlFor="pincode" className={labelClass}>
              PIN code
            </label>
            <input
              id="pincode"
              type="text"
              inputMode="numeric"
              autoComplete="postal-code"
              className={fieldClass}
              value={newForm.pincode}
              onChange={(e) => onNewFieldChange("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
            {errors.pincode ? <p className="mt-1 font-body text-[12px] text-red-700/80">{errors.pincode}</p> : null}
          </div>

          <div className="sm:col-span-2">
            <label className="flex cursor-pointer items-center gap-2.5">
              <input
                type="checkbox"
                checked={saveNewToProfile}
                onChange={(e) => onSaveNewToProfileChange(e.target.checked)}
                className="accent-emerald-900"
              />
              <span className="font-body text-[13px] text-emerald-900/60">Save this address to my profile</span>
            </label>
          </div>
        </div>
      )}
    </section>
  );
}
