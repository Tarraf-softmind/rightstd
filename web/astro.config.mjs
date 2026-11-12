import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

const pb = new URL(process.env.PB_URL || "http://127.0.0.1:8090");

export default defineConfig({
  site: "https://www.rightstd.com",
  trailingSlash: "always", // same URLs as the old WordPress site
  build: { format: "directory" },
  // English at the root, Arabic under /ar/ (see src/lib/i18n.js); the sitemap gets hreflang pairs
  integrations: [sitemap({
    i18n: { defaultLocale: "en", locales: { en: "en-US", ar: "ar-SA" } },
    filter: (page) => !/\/404\/?$/.test(page),
  })],
  // Red Hat Display (headings) + Red Hat Text (body), self-hosted at build time; not preloaded so the hero photo wins LCP.
  // Cairo covers Arabic pages only (Red Hat has no Arabic glyphs).
  fonts: [
    { provider: fontProviders.google(), name: "Red Hat Display", cssVariable: "--font-display", weights: ["600 800"], styles: ["normal"], subsets: ["latin"] },
    { provider: fontProviders.google(), name: "Red Hat Text", cssVariable: "--font-text", weights: ["400 600"], styles: ["normal"], subsets: ["latin"] },
    { provider: fontProviders.google(), name: "Cairo", cssVariable: "--font-arabic", weights: ["400 800"], styles: ["normal"], subsets: ["arabic", "latin"] },
  ],
  // images are pulled from PocketBase at build time and optimized into /_astro
  image: { remotePatterns: [{ protocol: pb.protocol.slice(0, -1), hostname: pb.hostname, port: pb.port }] },
});
