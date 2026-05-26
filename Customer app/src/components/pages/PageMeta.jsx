import { useEffect } from "react";

const defaultTitle = "Saliah Foods — Premium Dates & Natural Wellness Foods";
const defaultDescription =
  "Shop premium Kimia, Ajwa and Safawi dates, date syrup, amla candy, rose gulkand, honey blends and mixed fruit jam from Saliah Foods.";

export function PageMeta({ title, description }) {
  useEffect(() => {
    document.title = `${title} | Saliah Foods`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta && description) meta.setAttribute("content", description);

    return () => {
      document.title = defaultTitle;
      const metaEl = document.querySelector('meta[name="description"]');
      if (metaEl) metaEl.setAttribute("content", defaultDescription);
    };
  }, [title, description]);

  return null;
}
