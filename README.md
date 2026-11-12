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

## Move to another PC
GitHub holds the code only. These stay on this machine because they're gitignored, so copy them yourself (USB, Drive, etc.):

| What | Why | How |
|---|---|---|
| `pocketbase/pb_data/` (~80 MB) | all content + images | **required**: zip it with the server stopped |
| `pocketbase/pocketbase` | the binary | download PocketBase **0.40.6** for the new OS from github.com/pocketbase/pocketbase/releases and put it in `pocketbase/` |
| `wp-export/` (~540 MB) | WP re-import only | skip unless you plan to re-import |

You can't rebuild `pb_data` from the repo on another machine: `scripts/seed.json` points at image paths on the original PC.

```sh
git clone git@github.com:Tarraf-softmind/rightstd.git && cd rightstd
# unzip pb_data into pocketbase/pb_data, drop the binary into pocketbase/
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
Copy `pocketbase/` (including `pb_data`), `web/` and `scripts/` to the server, install Node 22 or newer and `rsync`, set `PB_URL=https://www.rightstd.com` in the service environment (the auto-rebuild reads content from it), and run:
`./pocketbase serve rightstd.com www.rightstd.com --indexFallback=false` (it gets HTTPS for both from Let's Encrypt automatically; the bare domain 301s to www). Point DNS for `rightstd.com` and `www` at the server.
After the switch, submit `https://www.rightstd.com/sitemap-index.xml` in Google Search Console.
