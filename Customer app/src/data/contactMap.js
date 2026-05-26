/**
 * Saliah Dates — Google Maps embed (from Google Maps → Share → Embed a map).
 * This URL loads inside an iframe on third-party sites (unlike ?output=embed links).
 */

export const MAP_CENTER = { lat: 12.2051153, lng: 78.2433487 };

export const ADDRESS_QUERY =
  "Krishnapuram (Po), Ariyakulam (Vill), Dharmapuri (Tk), Dharmapuri, Tamil Nadu 635202, India";

/** Shared link from Google */
export const GOOGLE_MAPS_SHARE_URL = "https://share.google/Q3pYDDiAIUHe9y53K";

/** Open in Google Maps (place page) */
export const GOOGLE_MAPS_PLACE_URL =
  "https://www.google.com/maps/place/Saliah+Dates/@12.2051153,78.2433487,17z/data=!3m1!4b1!4m6!3m5!1s0x3bac15feeee3de55:0xd6dec5f913775d19!8m2!3d12.2051153!4d78.2433487!16s%2Fg%2F11b6209ykn";

/** Official Google Maps embed iframe src (medium size) */
export const GOOGLE_MAPS_EMBED_SRC =
  "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3899.6365508516665!2d78.2433487!3d12.2051153!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bac15feeee3de55%3A0xd6dec5f913775d19!2sSaliah+Dates!5e0!3m2!1sen!2sin!4v1747843200000!5m2!1sen!2sin";

export function getGoogleMapsEmbedSrc() {
  const fromEnv = import.meta.env.VITE_GOOGLE_MAPS_EMBED_URL?.trim();
  return fromEnv || GOOGLE_MAPS_EMBED_SRC;
}

export function getContactMapConfig() {
  return {
    embedSrc: getGoogleMapsEmbedSrc(),
    googleMapsUrl: GOOGLE_MAPS_PLACE_URL,
    googleShareUrl: GOOGLE_MAPS_SHARE_URL,
    placeLabel: "Saliah Dates",
  };
}
