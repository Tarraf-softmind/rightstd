/// <reference path="../pb_data/types.d.ts" />
// One-time import of the WordPress content (scripts/seed.json, built by scripts/build-seed.py).
// Skipped when the seed file is absent, e.g. on a server that receives a copied pb_data.
migrate((app) => {
  const path = $os.getenv("RSC_SEED") || "../scripts/seed.json"
  let seed
  try { seed = JSON.parse(toString($os.readFile(path))) } catch (_) { console.log("seed: no " + path + ", skipping"); return }

  const file = (p) => (p ? $filesystem.fileFromPath(p) : null)
  const put = (collection, data) => {
    const r = new Record(app.findCollectionByNameOrId(collection))
    for (const [k, v] of Object.entries(data)) {
      if (typeof v === "string" && v.startsWith("/") && /\.\w+$/.test(v)) r.set(k, file(v))
      else if (Array.isArray(v) && v.length && typeof v[0] === "string" && v[0].startsWith("/")) r.set(k, v.map(file))
      else r.set(k, v)
    }
    app.save(r)
  }
  put("settings", seed.settings)
  seed.pages.forEach((p) => put("pages", p))
  seed.services.forEach((s) => put("services", s))
  seed.clients.forEach((c) => put("clients", c))
  seed.showcase.forEach((s) => put("showcase", s))

  // self-check
  const n = (c) => app.countRecords(c)
  if (n("services") !== 15 || n("pages") !== 4 || n("settings") !== 1) throw new Error("seed: unexpected record counts")
}, (app) => {
  for (const c of ["settings", "pages", "services", "clients", "showcase"]) app.db().newQuery("DELETE FROM " + c).execute()
})
