import { PageMeta } from "../components/pages/PageMeta";
import { AccountShell } from "../components/account/AccountShell";

export function AccountPage() {
  return (
    <>
      <PageMeta title="My account" description="Manage your Saliah Foods profile, orders, addresses, wishlist, and notifications." />
      <AccountShell />
    </>
  );
}
