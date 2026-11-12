/// <reference path="../pb_data/types.d.ts" />
// 301s for the old WordPress URLs (theme demo content that was dropped), so links and rankings carry over.
// Note: PocketBase handlers can't see outer variables, so each handler is self-contained.

const prefixes = ["project", "project_cat", "team", "team_cat", "career", "career_cat", "testimonials", "testimonials_cat",
  "product", "product-category", "shop", "category", "tag", "service_cat", "author", "feed", "comments", "page", "blog-single",
  "team-details", "portfolio-details", "career-details", "shop-single"]
const oldPosts = ["hello-world", "just-because-you-work-hard-successful", "solution-for-new-construction",
  "what-is-the-best-time-of-year-to-repair-your-roof", "how-much-does-a-new-roof-or-a-roof-replacement",
  "how-to-protect-your-roof-from-storm-damage", "solutions-for-construction-management-restoration",
  "just-because-you-work-hard-youll-be-successful", "just-because-you-work-hard-youll-be-successful-2",
  "is-it-time-to-switch-to-a-new-seo-tool-for-exiting-results", "the-rest-of-us-avoid-common-issues-to-get-stuck",
  "finding-hidden-gems-of-this-sort-to-play-creativity", "privacy-policy", "sample-page"]

// both "/x" and "/x/..." so the slash-less form is one 301, not 307 + 301
for (const route of [...prefixes, ...oldPosts].flatMap((p) => ["/" + p + "/", "/" + p])) {
  routerAdd("GET", route, (e) => {
    const first = e.request.url.path.split("/")[1]
    const to = {
      project: "/services/", project_cat: "/services/", service_cat: "/services/", "portfolio-details": "/services/",
      team: "/about/", team_cat: "/about/", career: "/about/", career_cat: "/about/", testimonials: "/about/",
      testimonials_cat: "/about/", "team-details": "/about/", "career-details": "/about/",
    }[first] || "/"
    return e.redirect(301, to)
  })
}

// Yoast sitemaps -> new sitemap
for (const s of ["sitemap_index", "post", "page", "product", "project", "career", "team", "testimonials", "service", "category",
  "post_tag", "product_cat", "project_cat", "career_cat", "service_cat", "team_cat", "testimonials_cat", "author"]) {
  routerAdd("GET", "/" + (s === "sitemap_index" ? s : s + "-sitemap") + ".xml", (e) => e.redirect(301, "/sitemap-index.xml"))
}

// The company profile PDF is linked from outside the site; keep its old URL working.
routerAdd("GET", "/wp-content/uploads/2025/02/Right-Standard-Company-Profile-2025.pdf", (e) => {
  const s = e.app.findFirstRecordByFilter("settings", "id != ''")
  return e.redirect(301, "/api/files/" + s.collection().id + "/" + s.id + "/" + s.get("profile_pdf"))
})

// One canonical host: rightstd.com -> www.rightstd.com
routerUse((e) => {
  if (e.request.host === "rightstd.com") return e.redirect(301, "https://www.rightstd.com" + e.request.url.requestURI())
  return e.next()
})
