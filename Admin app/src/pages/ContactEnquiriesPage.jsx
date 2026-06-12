import { useEffect, useMemo, useState } from "react";
import { apiFetch } from "../lib/api.js";
import { PageHeader } from "../components/ui/PageHeader.jsx";
import { AdminCard } from "../components/ui/AdminCard.jsx";
import { DataTable, DataRow, DataCell } from "../components/ui/DataTable.jsx";
import { LoadingState } from "../components/ui/LoadingState.jsx";
import { AdminModalLayout } from "../components/AdminModalLayout.jsx";
import { IconMail, IconPhone } from "../components/icons/AdminIcons.jsx";

function formatDateTime(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function matchesSearch(message, query) {
  const term = query.trim().toLowerCase();
  if (!term) return true;
  return [message.name, message.email, message.phone, message.subject, message.message]
    .filter(Boolean)
    .some((field) => String(field).toLowerCase().includes(term));
}

function buildReplyMailto(message) {
  const subject = `Re: ${message.subject}`;
  const body = [
    `Hi ${message.name},`,
    "",
    "---",
    `Original message (${formatDateTime(message.createdAt)}):`,
    message.message,
  ].join("\n");
  return `mailto:${message.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function ContactEnquiriesPage() {
  const [messages, setMessages] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [selectedMessage, setSelectedMessage] = useState(null);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await apiFetch("/api/admin/contact/messages");
      setMessages(data.messages ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function markRead(id) {
    try {
      await apiFetch(`/api/admin/contact/messages/${id}/read`, { method: "PATCH" });
      setMessages((current) =>
        current.map((message) => (message.id === id ? { ...message, read: true } : message))
      );
      setUnreadCount((count) => Math.max(0, count - 1));
      setSelectedMessage((current) => (current?.id === id ? { ...current, read: true } : current));
    } catch (err) {
      setError(err.message);
    }
  }

  function openMessage(message) {
    setSelectedMessage(message);
    if (!message.read) markRead(message.id);
  }

  const filteredMessages = useMemo(
    () => messages.filter((message) => matchesSearch(message, search)),
    [messages, search]
  );

  if (loading) return <LoadingState />;

  return (
    <div>
      <PageHeader
        title="Customer enquiries"
        subtitle={
          unreadCount
            ? `${unreadCount} unread · messages from the Contact Us form`
            : "Messages submitted from the website Contact Us form."
        }
        action={
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search enquiries…"
            className="admin-input w-full min-w-[200px] sm:w-56"
          />
        }
      />

      {error ? (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      ) : null}

      <AdminCard title="Enquiries">
        <DataTable
          columns={["Customer", "Subject", "Received", "Status", ""]}
          emptyMessage={search.trim() ? "No enquiries match your search" : "No enquiries yet"}
        >
          {filteredMessages.map((message) => (
            <DataRow key={message.id}>
              <DataCell>
                <div>
                  <p className="font-medium text-[var(--admin-fg)]">{message.name}</p>
                  <p className="admin-muted mt-0.5 text-xs">{message.email}</p>
                </div>
              </DataCell>
              <DataCell className="max-w-[220px]">
                <p className="truncate">{message.subject}</p>
              </DataCell>
              <DataCell className="admin-muted whitespace-nowrap text-sm">
                {formatDateTime(message.createdAt)}
              </DataCell>
              <DataCell>
                {!message.read ? (
                  <span className="inline-flex rounded-full bg-[var(--admin-tab-active-bg)] px-2.5 py-0.5 text-xs font-semibold text-[var(--admin-link)]">
                    New
                  </span>
                ) : (
                  <span className="admin-muted text-xs">Read</span>
                )}
              </DataCell>
              <DataCell className="text-right">
                <button type="button" onClick={() => openMessage(message)} className="btn-ghost">
                  View
                </button>
              </DataCell>
            </DataRow>
          ))}
        </DataTable>
      </AdminCard>

      <AdminModalLayout
        open={Boolean(selectedMessage)}
        title={selectedMessage?.name ?? "Enquiry"}
        subtitle={selectedMessage ? formatDateTime(selectedMessage.createdAt) : ""}
        titleId="enquiry-detail-title"
        onClose={() => setSelectedMessage(null)}
        maxWidthClass="max-w-lg"
        footer={
          selectedMessage ? (
            <div className="flex flex-wrap justify-end gap-2">
              <button type="button" onClick={() => setSelectedMessage(null)} className="btn-ghost">
                Close
              </button>
              <a href={buildReplyMailto(selectedMessage)} className="btn-primary">
                Reply via email
              </a>
            </div>
          ) : null
        }
      >
        {selectedMessage ? (
          <div className="space-y-4 text-sm">
            <div>
              <p className="admin-caption">Subject</p>
              <p className="mt-1 font-medium text-[var(--admin-fg)]">{selectedMessage.subject}</p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="admin-caption">Email</p>
                <a
                  href={`mailto:${selectedMessage.email}`}
                  className="admin-link mt-1 inline-flex items-center gap-2"
                >
                  <IconMail className="h-4 w-4 shrink-0" />
                  <span className="truncate">{selectedMessage.email}</span>
                </a>
              </div>
              <div>
                <p className="admin-caption">Phone</p>
                {selectedMessage.phone ? (
                  <a
                    href={`tel:${String(selectedMessage.phone).replace(/\s/g, "")}`}
                    className="admin-link mt-1 inline-flex items-center gap-2"
                  >
                    <IconPhone className="h-4 w-4 shrink-0" />
                    <span>{selectedMessage.phone}</span>
                  </a>
                ) : (
                  <p className="admin-muted mt-1">—</p>
                )}
              </div>
            </div>
            <div>
              <p className="admin-caption">Message</p>
              <p className="mt-2 whitespace-pre-wrap leading-relaxed text-[var(--admin-fg)]">
                {selectedMessage.message}
              </p>
            </div>
          </div>
        ) : null}
      </AdminModalLayout>
    </div>
  );
}
