import { getContactMapConfig } from "../../data/contactMap";

export function ContactMap({ config: configProp }) {
  const config = configProp ?? getContactMapConfig();

  return (
    <section className="contact-map" aria-labelledby="contact-map-title">
      <div className="contact-map__head">
        <h2 id="contact-map-title" className="contact-map__title">
          Find us on Google Maps
        </h2>
        <p className="contact-map__desc">
          Visit {config.placeLabel} at Krishnapuram, Ariyakulam — Dharmapuri, Tamil Nadu 635202.
        </p>
      </div>

      <div className="contact-map__frame contact-map__frame--google">
        <iframe
          title={`Google Map — ${config.placeLabel}`}
          src={config.embedSrc}
          className="contact-map__iframe"
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="contact-map__footer">
        <a
          href={config.googleMapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="contact-map__link"
        >
          Open in Google Maps
          <span aria-hidden>↗</span>
        </a>
      </div>
    </section>
  );
}
