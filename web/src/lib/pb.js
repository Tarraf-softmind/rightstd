// Build-time PocketBase reads. The site is static; PocketBase triggers a rebuild on every content change.
export const PB = process.env.PB_URL || "http://127.0.0.1:8090";

async function get(path) {
  const res = await fetch(PB + path);
  if (!res.ok) throw new Error(`PocketBase ${res.status} for ${path}`);
  return res.json();
}

export const list = async (collection, sort = "sort") =>
  (await get(`/api/collections/${collection}/records?perPage=500${sort ? `&sort=${sort}` : ""}`)).items;

export const settings = async () => (await list("settings", ""))[0];

export async function page(slug) {
  const p = (await get(`/api/collections/pages/records?filter=${encodeURIComponent(`slug="${slug}"`)}`)).items[0];
  if (!p) throw new Error(`page "${slug}" missing in PocketBase`);
  return p;
}

/** Absolute URL for build-time optimization (astro:assets). */
export const fileUrl = (rec, name) => (name ? `${PB}/api/files/${rec.collectionId}/${rec.id}/${name}` : null);
/** Same-origin URL for files served live by PocketBase (SVG logos, PDF). */
export const publicFile = (rec, name) => (name ? `/api/files/${rec.collectionId}/${rec.id}/${name}` : null);

export const plain = (html = "") => html.replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();
export const excerpt = (html, words = 10) => {
  const w = plain(html).split(" ");
  return w.length > words ? w.slice(0, words).join(" ") + "…" : w.join(" ");
};
