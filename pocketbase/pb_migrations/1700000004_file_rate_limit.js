/// <reference path="../pb_data/types.d.ts" />
// A clean build (fresh server, no image cache) pulls every image from /api/files/ at once and hit the
// general "/api/" limit (300 per 10s) -> 429 -> failed build. Public images get their own high limit;
// auth, create (contact form) and batch limits stay as they were.
const LABEL = "/api/files/"
migrate((app) => {
  const s = app.settings()
  const rest = s.rateLimits.rules.filter((r) => r.label !== LABEL)
  s.rateLimits.rules = [{ label: LABEL, audience: "", duration: 10, maxRequests: 10000 }, ...rest]
  app.save(s)
}, (app) => {
  const s = app.settings()
  s.rateLimits.rules = s.rateLimits.rules.filter((r) => r.label !== LABEL)
  app.save(s)
})
