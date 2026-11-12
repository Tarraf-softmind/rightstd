/// <reference path="../pb_data/types.d.ts" />
// Real 404 status + the site's 404 page for unknown URLs (run serve with --indexFallback=false), so Google never sees soft 404s.
routerUse((e) => {
  // Astro's hashed assets never change: let browsers cache them for a year
  if (e.request.url.path.startsWith("/_astro/")) e.response.header().set("Cache-Control", "public, max-age=31536000, immutable")
  try {
    return e.next()
  } catch (err) {
    const path = e.request.url.path
    if (e.request.method !== "GET" || path.startsWith("/api/") || path.startsWith("/_/") || (err.status ?? err.value?.status) !== 404) throw err
    const page = /^\/ar(\/|$)/.test(path) ? "ar/404/index.html" : "404.html" // Arabic 404 under /ar/
    return e.html(404, toString($os.readFile(__hooks + "/../pb_public/" + page)))
  }
})
