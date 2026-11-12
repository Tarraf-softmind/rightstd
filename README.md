# rightstd.com: PocketBase + Astro

The WordPress site was rebuilt as a static Astro site, with content stored in PocketBase. One PocketBase process serves the admin, the API, the site and the 301 redirects.

```
pocketbase/   binary, pb_migrations (schema + one-time WP import), pb_hooks (redirects, 404, contact mail, auto-rebuild), pb_public (built site)
web/          Astro site (build-time reads from PocketBase, images optimized to WebP)
scripts/      WP export tools: extract-wpress.py, wp-to-json.py, build-seed.py, rebuild.sh
wp-export/    the unpacked .wpress (source data only, not deployed)
```

## Run locally
```sh
cd web && npm install && cd ../pocketbase
./pocketbase superuser upsert you@example.com 'a-strong-password'   # admin login at /_/
./pocketbase serve --indexFallback=false                            # site at http://127.0.0.1:8090
../scripts/rebuild.sh                                               # first build (later builds run automatically)
```
`--indexFallback=false` is required. Without it, unknown URLs return 200 instead of a real 404, which hurts SEO.

## Editing content
Log in at `/_/`. The collections are **services**, **pages** (home, about, services, contact; their section text lives in `data`), **clients**, **showcase** (the home tabs) and **settings** (phone, email, socials, logos, profile PDF).
Saving any record rebuilds the site in the background in about 5 seconds; the log is in `pocketbase/build.log`. A failed build leaves the live site unchanged.
Contact-form messages are saved in **messages**. To have them emailed to the address in settings, set up SMTP in **Settings → Mail**.

## Re-import from WordPress (only if needed)
```sh
python3 -I scripts/extract-wpress.py <file.wpress> wp-export
python3 -I scripts/wp-to-json.py wp-export/database.sql scripts/wp.json
python3 -I scripts/build-seed.py scripts/wp.json wp-export/uploads scripts/seed.json
cd pocketbase && rm -rf pb_data && ./pocketbase migrate up
```

## Deploy (VPS)
Copy `pocketbase/` (including `pb_data`), `web/` and `scripts/` to the server, install Node 22 or newer and `rsync`, set `PB_URL=https://www.rightstd.com` in the service environment (the auto-rebuild reads content from it), and run:
`./pocketbase serve rightstd.com www.rightstd.com --indexFallback=false` (it gets HTTPS for both from Let's Encrypt automatically; the bare domain 301s to www). Point DNS for `rightstd.com` and `www` at the server.
After the switch, submit `https://www.rightstd.com/sitemap-index.xml` in Google Search Console.
