/// <reference path="../pb_data/types.d.ts" />
// Content schema for rightstd.com. Public read on content, public create-only on messages.
migrate((app) => {
  const img = (name, maxSelect = 1) => ({ name, type: "file", maxSelect, maxSize: 20 * 1024 * 1024, mimeTypes: ["image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif"] })
  const seo = [{ name: "seo_title", type: "text", max: 120 }, { name: "seo_description", type: "text", max: 300 }]
  const pub = { listRule: "", viewRule: "", createRule: null, updateRule: null, deleteRule: null }
  const cols = [
    { name: "settings", ...pub, fields: [
      ...["site_name", "short_name", "tagline", "phone", "email", "location"].map((n) => ({ name: n, type: "text" })),
      ...["whatsapp_url", "x_url", "linkedin_url", "instagram_url"].map((n) => ({ name: n, type: "url" })),
      img("logo"), img("logo_white"), img("favicon"), img("banner_image"),
      { name: "profile_pdf", type: "file", maxSelect: 1, maxSize: 50 * 1024 * 1024, mimeTypes: ["application/pdf"] },
    ] },
    { name: "pages", ...pub, fields: [
      { name: "slug", type: "text", required: true, presentable: true },
      { name: "title", type: "text", required: true },
      ...seo, img("hero_image"), img("image"), img("image2"),
      { name: "body", type: "editor" },
      { name: "data", type: "json", maxSize: 200000 },
    ], indexes: ["CREATE UNIQUE INDEX idx_pages_slug ON pages (slug)"] },
    { name: "services", ...pub, fields: [
      { name: "title", type: "text", required: true, presentable: true },
      { name: "slug", type: "text", required: true, pattern: "^[a-z0-9-]+$" },
      { name: "body", type: "editor", required: true },
      img("image"), img("gallery", 30),
      { name: "sort", type: "number" }, ...seo,
    ], indexes: ["CREATE UNIQUE INDEX idx_services_slug ON services (slug)"] },
    { name: "clients", ...pub, fields: [
      { name: "name", type: "text", presentable: true }, { name: "url", type: "url" }, img("logo"), { name: "sort", type: "number" },
    ] },
    { name: "showcase", ...pub, fields: [
      { name: "title", type: "text", required: true, presentable: true }, img("images", 2), { name: "sort", type: "number" },
    ] },
    { name: "messages", listRule: null, viewRule: null, createRule: "", updateRule: null, deleteRule: null, fields: [
      { name: "first_name", type: "text", required: true, max: 100 },
      { name: "last_name", type: "text", required: true, max: 100 },
      { name: "email", type: "email", required: true },
      { name: "message", type: "text", required: true, max: 5000 },
      { name: "created", type: "autodate", onCreate: true },
    ] },
  ]
  for (const c of cols) app.save(new Collection({ type: "base", ...c }))

  const s = app.settings()
  s.meta.appName = "RSC"
  s.rateLimits.enabled = true // protects the public contact form from floods
  app.save(s)
}, (app) => {
  for (const n of ["messages", "showcase", "clients", "services", "pages", "settings"]) app.delete(app.findCollectionByNameOrId(n))
})
