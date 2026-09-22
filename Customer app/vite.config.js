import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { ViteImageOptimizer } from "vite-plugin-image-optimizer";

function googleTagsPlugin(env) {
  const gtmId = String(env.VITE_GTM_ID ?? "").trim();
  const ga4Id = String(env.VITE_GA4_MEASUREMENT_ID ?? "").trim();
  const siteVerification = String(env.VITE_GOOGLE_SITE_VERIFICATION ?? "").trim();

  return {
    name: "google-tags",
    transformIndexHtml(html) {
      const headTags = [];

      if (siteVerification) {
        headTags.push(
          `<meta name="google-site-verification" content="${siteVerification}" />`
        );
      }

      if (gtmId) {
        headTags.push(
          `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${gtmId}');</script>
<!-- End Google Tag Manager -->`
        );
      }

      // Direct GA4 only when GTM is not used (avoids double-counting).
      if (ga4Id && !gtmId) {
        headTags.push(
          `<!-- Google Analytics (GA4) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${ga4Id}"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga4Id}');</script>
<!-- End Google Analytics -->`
        );
      }

      let output = html;
      if (headTags.length) {
        output = output.replace("</head>", `${headTags.join("\n    ")}\n  </head>`);
      }

      if (gtmId) {
        output = output.replace(
          "<body>",
          `<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${gtmId}" height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->`
        );
      }

      return output;
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    server: {
      port: 5180,
      strictPort: false,
      proxy: {
        "/api": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
        "/uploads": {
          target: "http://localhost:3001",
          changeOrigin: true,
        },
        // Do not proxy /assets — serve from Customer app/public/assets via Vite.
        // Backend still serves /assets in production; proxying in dev caused blank
        // images whenever the API was slow or restarted.
      },
    },
    plugins: [
      react(),
      tailwindcss(),
      googleTagsPlugin(env),
      ViteImageOptimizer({
        png: false,
        jpeg: { quality: 82 },
        webp: { quality: 82 },
      }),
    ],
    build: {
      modulePreload: {
        polyfill: false,
        resolveDependencies(filename, deps) {
          // Invoice PDF libs must never preload on marketing pages.
          return deps.filter(
            (dep) =>
              !dep.includes("pdf-") &&
              !dep.includes("jspdf") &&
              !dep.includes("html2canvas") &&
              !dep.includes("purify")
          );
        },
      },
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              if (id.includes("jspdf") || id.includes("html2canvas")) return;
              if (id.includes("framer-motion")) return "motion";
              if (id.includes("react-router")) return "router";
              if (id.includes("@fontsource")) return "fonts";
              if (id.includes("react-dom") || id.includes("/react/")) return "vendor";
            }
          },
        },
      },
      cssMinify: true,
      minify: "esbuild",
    },
  };
});
