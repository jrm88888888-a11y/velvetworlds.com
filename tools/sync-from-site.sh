#!/bin/bash
# Copies the game's files from the AI Study Method site folder into this folder (the velvetworlds.com site).
# The game is still developed and tested in the site folder; this folder is what gets published at velvetworlds.com.
# Run after any change to the game, the packs, auth.js or the element pictures, then commit and push THIS folder.
#   tools/sync-from-site.sh ["/path/to/AI Study Method"]
# It only copies; it never deletes. index.html, blaster/, golf/, about/, assets/, sitemap.xml, CNAME, robots.txt and 404.html belong
# to this folder and are not touched. Notes on this site: AI Study Method/_dev/velvet-worlds/velvetworlds-site-notes.md (not published).
set -euo pipefail
HERE="$(cd "$(dirname "$0")/.." && pwd)"
SITE="${1:-$HERE/../AI Study Method}"
[ -f "$SITE/velvet-worlds/app.js" ] || { echo "Site folder not found at: $SITE"; exit 1; }
copy() { mkdir -p "$HERE/$(dirname "$1")"; if [ -d "$SITE/$1" ]; then mkdir -p "$HERE/$1"; cp -Rp "$SITE/$1/." "$HERE/$1/"; else cp -p "$SITE/$1" "$HERE/$1"; fi; }
copy velvet-worlds/app.js
copy velvet-worlds/app.css
copy velvet-worlds/game
copy velvet-worlds/packs
copy velvet-worlds/img
copy classcraft/arcade/auth.js
copy classcraft/arcade/elements-data.js
copy classcraft/arcade/avatars-data.js
copy classcraft/arcade/assets
copy classcraft/quizzes/share-score.js
copy fonts
copy favicon.svg
echo "Copied. Now check index.html's ?v= tags if app.js, app.css or auth.js changed, then commit and push this folder."
