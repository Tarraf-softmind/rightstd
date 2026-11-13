# rightstd

Content lives in PocketBase (`pocketbase/pb_data`, committed). The site in `web/` is an Astro static build that reads from it.

## Run on a new machine

1. Download PocketBase **0.40.6** for your OS from https://github.com/pocketbase/pocketbase/releases and put the `pocketbase` binary in `pocketbase/`.
2. Start it: `cd pocketbase && ./pocketbase serve` (admin UI: http://127.0.0.1:8090/_/).
3. Build the site into PocketBase: `sh scripts/rebuild.sh` (needs Node; run `npm install` in `web/` first). Site is then at http://127.0.0.1:8090/.

Dev mode instead of step 3: `cd web && npm run dev`.

Data changes are local until you commit `pocketbase/pb_data` again (stop PocketBase first so `data.db` is fully written).
