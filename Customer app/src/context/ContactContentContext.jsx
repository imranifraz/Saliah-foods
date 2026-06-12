import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { contactInfo as FALLBACK_CONTACT } from "../data/pages.js";
import { fetchCmsPage } from "../services/cmsPageApi.js";

function mapContactPage(page) {
  const body = page?.body ?? {};
  return {
    title: page?.title ?? FALLBACK_CONTACT.title,
    subtitle: page?.subtitle ?? FALLBACK_CONTACT.subtitle,
    email: body.email || FALLBACK_CONTACT.email,
    phone: body.phone || FALLBACK_CONTACT.phone,
    phoneTel: body.phoneTel || body.phone || FALLBACK_CONTACT.phoneTel,
    address: body.address || FALLBACK_CONTACT.address,
    hours: body.hours || FALLBACK_CONTACT.hours,
    subjects: Array.isArray(body.subjects) && body.subjects.length ? body.subjects : FALLBACK_CONTACT.subjects,
    formSuccessMessage: body.formSuccessMessage || FALLBACK_CONTACT.formSuccessMessage,
    mapEmbedUrl: body.mapEmbedUrl || "",
    googleMapsUrl: body.googleMapsUrl || "",
    placeLabel: body.placeLabel || "Saliah Dates",
  };
}

const ContactContentContext = createContext(null);

export function ContactContentProvider({ children }) {
  const [contact, setContact] = useState(() => mapContactPage(null));
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const page = await fetchCmsPage("contact");
      setContact(mapContactPage(page));
    } catch {
      setContact(mapContactPage(null));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo(
    () => ({
      contact,
      loading,
      refresh,
    }),
    [contact, loading, refresh]
  );

  return <ContactContentContext.Provider value={value}>{children}</ContactContentContext.Provider>;
}

export function useContactContent() {
  const ctx = useContext(ContactContentContext);
  if (!ctx) {
    throw new Error("useContactContent must be used within ContactContentProvider");
  }
  return ctx;
}
