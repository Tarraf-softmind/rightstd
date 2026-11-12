#!/bin/sh
# Debounced static rebuild: calls during a build collapse into one more run. Swaps output in only after a successful build.
cd "$(dirname "$0")/../web" || exit 1
: "${PB_URL:=http://127.0.0.1:8090}"; export PB_URL  # where the build reads content from; set to the live URL on the server
touch .rebuild-pending
mkdir .rebuild-lock 2>/dev/null || exit 0
trap 'rmdir .rebuild-lock' EXIT
while [ -f .rebuild-pending ]; do
  rm .rebuild-pending; sleep 2
  npm run build && rsync -a --delete dist/ ../pocketbase/pb_public/ && echo "rebuilt $(date)"
done
