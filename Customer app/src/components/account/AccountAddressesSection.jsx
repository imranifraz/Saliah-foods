import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useProfile } from "../../context/ProfileContext";
import { formatAddressSummary } from "../../data/profile";
import { getEmptyCheckoutForm, INDIAN_STATES, validateAddressForm } from "../../data/checkout";
import {
  AccountBtn,
  AccountCard,
  AccountEmptyState,
  AccountField,
  AccountInput,
  AccountSectionHeader,
  AccountSelect,
} from "./AccountUI";
import { ADDRESS_TYPE_OPTIONS } from "./accountUtils";

function AddressForm({ initial, onSubmit, onCancel, title }) {
  const { user } = useAuth();
  const [form, setForm] = useState({
    ...getEmptyCheckoutForm(),
    addressLabel: initial?.label ?? "Home",
    fullName: initial?.fullName ?? user?.fullName ?? "",
    email: initial?.email ?? user?.email ?? "",
    phone: initial?.phone ?? user?.phone ?? "",
    addressLine1: initial?.addressLine1 ?? "",
    addressLine2: initial?.addressLine2 ?? "",
    city: initial?.city ?? "",
    state: initial?.state ?? "",
    pincode: initial?.pincode ?? "",
  });
  const [errors, setErrors] = useState({});

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const nextErrors = validateAddressForm(form);
    if (!form.addressLabel.trim()) nextErrors.addressLabel = "Please select an address type";
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }
    onSubmit({
      label: form.addressLabel.trim(),
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      addressLine1: form.addressLine1.trim(),
      addressLine2: form.addressLine2.trim(),
      city: form.city.trim(),
      state: form.state,
      pincode: form.pincode.trim(),
    });
  };

  return (
    <AccountCard className="mt-6">
      <h3 className="font-display text-lg text-emerald-900">{title}</h3>
      <form onSubmit={handleSubmit} className="mt-6">
        <div className="account-form-grid">
          <AccountField id="addressLabel" label="Address type" error={errors.addressLabel} className="sm:col-span-2">
            <AccountSelect
              id="addressLabel"
              value={form.addressLabel}
              onChange={(e) => updateField("addressLabel", e.target.value)}
            >
              {ADDRESS_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </AccountSelect>
          </AccountField>

          <AccountField id="fullName" label="Full name" error={errors.fullName} className="sm:col-span-2">
            <AccountInput id="fullName" value={form.fullName} onChange={(e) => updateField("fullName", e.target.value)} />
          </AccountField>

          <AccountField id="email" label="Email" error={errors.email}>
            <AccountInput id="email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} />
          </AccountField>

          <AccountField id="phone" label="Phone" error={errors.phone}>
            <AccountInput
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
            />
          </AccountField>

          <AccountField id="addressLine1" label="Address line 1" error={errors.addressLine1} className="sm:col-span-2">
            <AccountInput id="addressLine1" value={form.addressLine1} onChange={(e) => updateField("addressLine1", e.target.value)} />
          </AccountField>

          <AccountField id="addressLine2" label="Address line 2 (optional)" className="sm:col-span-2">
            <AccountInput id="addressLine2" value={form.addressLine2} onChange={(e) => updateField("addressLine2", e.target.value)} />
          </AccountField>

          <AccountField id="city" label="City" error={errors.city}>
            <AccountInput id="city" value={form.city} onChange={(e) => updateField("city", e.target.value)} />
          </AccountField>

          <AccountField id="state" label="State" error={errors.state}>
            <AccountSelect id="state" value={form.state} onChange={(e) => updateField("state", e.target.value)}>
              <option value="">Select state</option>
              {INDIAN_STATES.map((state) => (
                <option key={state} value={state}>{state}</option>
              ))}
            </AccountSelect>
          </AccountField>

          <AccountField id="pincode" label="PIN code" error={errors.pincode}>
            <AccountInput
              id="pincode"
              value={form.pincode}
              onChange={(e) => updateField("pincode", e.target.value.replace(/\D/g, "").slice(0, 6))}
            />
          </AccountField>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <AccountBtn variant="primary" type="submit">Save address</AccountBtn>
          <AccountBtn variant="ghost" onClick={onCancel}>Cancel</AccountBtn>
        </div>
      </form>
    </AccountCard>
  );
}

export function AccountAddressesSection() {
  const { addresses, addAddress, updateAddress, setDefaultAddress, removeAddress } = useProfile();
  const [mode, setMode] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const editingAddress = addresses.find((a) => a.id === editingId) ?? null;

  return (
    <div>
      <AccountSectionHeader
        title="Saved addresses"
        description="Manage delivery locations for faster checkout across India."
        action={
          mode !== "add" && !editingAddress ? (
            <AccountBtn variant="primary" onClick={() => setMode("add")}>
              Add new address
            </AccountBtn>
          ) : null
        }
      />

      {addresses.length === 0 && mode !== "add" ? (
        <AccountCard>
          <AccountEmptyState
            title="No saved addresses"
            description="Add your home or office address for seamless delivery on your next Saliah order."
          />
          <div className="mt-4 text-center">
            <AccountBtn variant="primary" onClick={() => setMode("add")}>Add new address</AccountBtn>
          </div>
        </AccountCard>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {addresses.map((address) => (
            <article
              key={address.id}
              className={`account-address-card ${address.isDefault ? "account-address-card--default" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-display text-base text-emerald-900">{address.label}</h3>
                {address.isDefault ? (
                  <span className="account-badge account-badge--processing">Default</span>
                ) : null}
              </div>
              <p className="mt-3 font-body text-sm font-medium text-emerald-900/75">{address.fullName}</p>
              <p className="mt-2 font-body text-sm leading-relaxed text-emerald-900/48">
                {formatAddressSummary(address)}
              </p>
              <p className="mt-2 font-body text-sm text-emerald-900/40">+91 {address.phone}</p>

              <div className="mt-5 flex flex-wrap gap-2 border-t border-cream-200/60 pt-4">
                <AccountBtn
                  variant="ghost"
                  className="account-btn--sm"
                  onClick={() => { setEditingId(address.id); setMode("edit"); }}
                >
                  Edit
                </AccountBtn>
                {!address.isDefault ? (
                  <AccountBtn variant="soft" className="account-btn--sm" onClick={() => setDefaultAddress(address.id)}>
                    Set as default
                  </AccountBtn>
                ) : null}
                {addresses.length > 1 ? (
                  <AccountBtn variant="danger" className="account-btn--sm" onClick={() => removeAddress(address.id)}>
                    Delete
                  </AccountBtn>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}

      {mode === "add" ? (
        <AddressForm
          title="Add new address"
          onSubmit={(data) => { addAddress(data); setMode(null); }}
          onCancel={() => setMode(null)}
        />
      ) : null}

      {mode === "edit" && editingAddress ? (
        <AddressForm
          title="Edit address"
          initial={editingAddress}
          onSubmit={(data) => {
            updateAddress(editingId, data);
            setMode(null);
            setEditingId(null);
          }}
          onCancel={() => { setMode(null); setEditingId(null); }}
        />
      ) : null}
    </div>
  );
}
