import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
/* Only the weights we actually need — each extra file blocks first paint. */
import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/playfair-display/latin-400.css";
import "@fontsource/playfair-display/latin-500.css";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
