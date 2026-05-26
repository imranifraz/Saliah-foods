import { useState } from "react";
import { contactInfo } from "../data/pages";
import { PageMeta } from "../components/pages/PageMeta";
import { PageShell } from "../components/pages/PageShell";
import { Reveal } from "../components/ui/Reveal";
import { ContactMap } from "../components/contact/ContactMap";

const fieldClass =
  "mt-1.5 w-full rounded-xl border border-emerald-900/10 bg-cream-50 px-4 py-3 font-body text-sm text-emerald-900 outline-none focus:border-gold-500/40 focus:ring-2 focus:ring-gold-400/20";

export function ContactUsPage() {
  const {
    title,
    subtitle,
    email,
    phone,
    phoneTel = phone,
    address,
    hours,
    subjects,
  } = contactInfo;
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <PageMeta
        title={title}
        description="Get in touch with Saliah Foods for orders, wholesale enquiries, and customer support."
      />
      <PageShell breadcrumb={title} title={title} subtitle={subtitle}>
        <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
          <Reveal>
            <div className="space-y-8">
              <div>
                <h2 className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-600">
                  Email
                </h2>
                <a
                  href={`mailto:${email}`}
                  className="mt-2 block font-body text-base text-emerald-900 hover:text-emerald-800"
                >
                  {email}
                </a>
              </div>
              <div>
                <h2 className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-600">
                  Phone
                </h2>
                <a
                  href={`tel:${phoneTel.replace(/\s/g, "")}`}
                  className="mt-2 block font-body text-base text-emerald-900 hover:text-emerald-800"
                >
                  {phone}
                </a>
              </div>
              <div>
                <h2 className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-600">
                  Address
                </h2>
                <p className="mt-2 whitespace-pre-line font-body text-base leading-relaxed text-emerald-900/70">
                  {address}
                </p>
              </div>
              <div>
                <h2 className="font-body text-[10px] font-semibold uppercase tracking-[0.25em] text-gold-600">
                  Hours
                </h2>
                <p className="mt-2 font-body text-base text-emerald-900/70">{hours}</p>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            {submitted ? (
              <div
                className="rounded-2xl border border-emerald-800/20 bg-emerald-800/5 p-8 text-center md:p-10"
                role="status"
              >
                <p className="font-display text-xl font-medium text-emerald-900">Thank you</p>
                <p className="mt-3 font-body text-sm text-emerald-900/65">
                  We have received your message and will respond within one business day.
                </p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setSubmitted(true);
                }}
                className="rounded-2xl border border-emerald-900/8 bg-white p-6 shadow-luxury md:p-8"
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label htmlFor="contact-name" className="font-body text-xs font-medium text-emerald-900">
                      Name
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      required
                      autoComplete="name"
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="font-body text-xs font-medium text-emerald-900">
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      required
                      autoComplete="email"
                      className={fieldClass}
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-phone" className="font-body text-xs font-medium text-emerald-900">
                      Phone <span className="text-emerald-900/40">(optional)</span>
                    </label>
                    <input id="contact-phone" name="phone" type="tel" autoComplete="tel" className={fieldClass} />
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-subject" className="font-body text-xs font-medium text-emerald-900">
                      Subject
                    </label>
                    <select id="contact-subject" name="subject" required className={fieldClass}>
                      {subjects.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label htmlFor="contact-message" className="font-body text-xs font-medium text-emerald-900">
                      Message
                    </label>
                    <textarea id="contact-message" name="message" required rows={5} className={fieldClass} />
                  </div>
                </div>
                <button
                  type="submit"
                  className="mt-6 w-full rounded-full gradient-gold py-3.5 font-body text-[11px] font-semibold uppercase tracking-[0.18em] text-white shadow-md shadow-gold-500/25 sm:w-auto sm:px-10"
                >
                  Send message
                </button>
              </form>
            )}
          </Reveal>
        </div>

        <ContactMap />
      </PageShell>
    </>
  );
}
