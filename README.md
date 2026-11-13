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
**Arabic:** the site is bilingual. English is at `/`, Arabic at `/ar/` (same page structure, mirrored right-to-left), and a header link switches between them. Every translatable field has an Arabic twin ending in `_ar` (`title_ar`, `body_ar`, `seo_title_ar`, …). `data_ar` holds only the translated strings, in the same shape as `data`; links and icons come from `data`. An empty `_ar` field shows the English text, so a new service appears in Arabic once its `title_ar`/`body_ar` are filled. Fixed UI text (menu, buttons, form labels) lives in `web/src/lib/i18n.js`.
Saving any record rebuilds the site in the background in about 5 seconds; the log is in `pocketbase/build.log`. A failed build leaves the live site unchanged.
Contact-form messages are saved in **messages**. To have them emailed to the address in settings, set up SMTP in **Settings → Mail**.

## Re-import from WordPress (only if needed)
```sh
python3 -I scripts/extract-wpress.py <file.wpress> wp-export
python3 -I scripts/wp-to-json.py wp-export/database.sql scripts/wp.json
python3 -I scripts/build-seed.py scripts/wp.json wp-export/uploads scripts/seed.json
cd pocketbase && rm -rf pb_data && ./pocketbase migrate up
```

## Move to another PC
GitHub holds the code **and** the content: `pocketbase/pb_data/data.db` + `pb_data/storage/` (images) are committed. Keep the repo **private**: `data.db` holds the admin password hashes. To push content edits, stop PocketBase first, then commit `pocketbase/pb_data`.

Still gitignored, get them yourself:

| What | Why | How |
|---|---|---|
| `pocketbase/pocketbase` | the binary (OS-specific) | download PocketBase **0.40.6** for the new OS from github.com/pocketbase/pocketbase/releases and put it in `pocketbase/` |
| `wp-export/` (~540 MB) | WP re-import only | skip unless you plan to re-import |

```sh
git clone git@github.com:Tarraf-softmind/rightstd.git && cd rightstd
# drop the binary into pocketbase/
cd web && npm install && cd ../pocketbase
./pocketbase serve --indexFallback=false   # then ../scripts/rebuild.sh in another terminal
```
Your admin login lives in `pb_data`, so it comes along. Install the `pbc` CLI on the new PC and run `pbc login` to deploy from there.

## Deploy (PocketBase Cloud)
Deploys go straight from your PC to PocketBase Cloud with the `pbc` CLI. GitHub has no part in them (see the warning below).

`pocketbase/pbc.json` pins PocketBase 0.40.6. The first time, create the instance from a backup of the local `pb_data` (content + images); after that, ship code and the built site with one command:
```sh
pbc login
# first time only: backup zip of pb_data (server stopped, without backups/), then
cd pocketbase && pbc pocketbase create <name> --backup ../backup.zip
# every update (edit content locally or in the admin, then):
SITE_URL=https://megln4gobkw6myx.pwz5.pocketbasecloud.com ../scripts/rebuild.sh && pbc pocketbase deploy
```
`SITE_URL` must be the host people actually open: link-preview images (`og:image`) and canonical URLs are absolute, so building for `www.rightstd.com` while it still serves the old site gives previews with no image. Drop `SITE_URL` once DNS for www.rightstd.com points at the instance.
There is no Node or rsync on the instance, so saving content in its admin does **not** rebuild the site; rebuild and redeploy as above. Do not connect the GitHub repo for push deploys: `pb_public/` is gitignored and a deploy replaces it wholesale, which would publish an empty site.

## Deploy (VPS)
Clone the repo on the server (it brings `pb_data`), download the Linux build of PocketBase 0.40.6 into `pocketbase/` (`uname -m`: `x86_64` → `linux_amd64`, `aarch64` → `linux_arm64`):
```sh
cd pocketbase && curl -LO https://github.com/pocketbase/pocketbase/releases/download/v0.40.6/pocketbase_0.40.6_linux_amd64.zip && unzip -o pocketbase_0.40.6_linux_amd64.zip pocketbase && rm pocketbase_0.40.6_linux_amd64.zip
```
Install Node 22 or newer and `rsync`, run `npm install` in `web/`, set `PB_URL=https://www.rightstd.com` in the service environment (the auto-rebuild reads content from it), and run:
`./pocketbase serve rightstd.com www.rightstd.com --indexFallback=false` (it gets HTTPS for both from Let's Encrypt automatically; the bare domain 301s to www). Point DNS for `rightstd.com` and `www` at the server.
After the switch, submit `https://www.rightstd.com/sitemap-index.xml` in Google Search Console.
