import { defineConfig, fontProviders } from "astro/config";
import sitemap from "@astrojs/sitemap";

const pb = new URL(process.env.PB_URL || "http://127.0.0.1:8090");

export default defineConfig({
  site: "https://www.rightstd.com",
  trailingSlash: "always", // same URLs as the old WordPress site
  build: { format: "directory" },
  integrations: [sitemap()],
  // Archivo, self-hosted at build time. One variable file: weight 400-800 and the width axis (condensed headlines, normal body).
  fonts: [{
    provider: fontProviders.google(),
    name: "Archivo",
    cssVariable: "--font-archivo",
    weights: ["400 800"],
    styles: ["normal"],
    subsets: ["latin"],
    stretch: "62% 100%",
    options: { experimental: { variableAxis: { wdth: [["62", "100"]] } } },
  }],
  // images are pulled from PocketBase at build time and optimized into /_astro
  image: { remotePatterns: [{ protocol: pb.protocol.slice(0, -1), hostname: pb.hostname, port: pb.port }] },
});
