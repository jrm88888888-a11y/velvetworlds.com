# velvetworlds.com

The game Velvet Worlds, on its own domain since 22 Nov 2026. The teaching site is aistudymethod.com.

- `index.html`, `404.html`, `CNAME`, `robots.txt`: belong to this folder.
- `velvet-worlds/`, `classcraft/`, `fonts/`, `favicon.svg`: copies from the AI Study Method site folder. Do not edit them here.
  The game is developed and tested in the site folder. To bring changes across: `tools/sync-from-site.sh`, then commit and push.
- The heavy engine files are served from Bunny (see `velvet-worlds/app.js`, `VW_ENGINE_CDN`); the copy in `velvet-worlds/game/` is the fallback.
- Sign-in: accounts live on the same server as the site's (`aism-accounts` on Bunny). A student coming from
  aistudymethod.com/velvet-worlds/ arrives with a one-use code that `index.html` swaps for a sign-in on this domain.
