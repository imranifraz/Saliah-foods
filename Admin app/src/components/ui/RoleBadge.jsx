export function RoleBadge({ role }) {
  const isAdmin = role === "admin";
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${
        isAdmin
          ? "bg-gold-300/50 text-gold-600"
          : "bg-emerald-800/10 text-emerald-800"
      }`}
    >
      {role ?? "customer"}
    </span>
  );
}
