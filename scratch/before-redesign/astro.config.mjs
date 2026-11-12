import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const pb = new URL(process.env.PB_URL || "http://127.0.0.1:8090");

export default defineConfig({
  site: "https://www.rightstd.com",
  trailingSlash: "always", // same URLs as the old WordPress site
  build: { format: "directory" },
  integrations: [sitemap()],
  // images are pulled from PocketBase at build time and optimized into /_astro
  image: { remotePatterns: [{ protocol: pb.protocol.slice(0, -1), hostname: pb.hostname, port: pb.port }] },
});
