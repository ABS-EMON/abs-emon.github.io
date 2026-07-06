DEEP LEARNING MODEL TREE — GitHub Pages Deployment Guide
==========================================================

WHAT'S IN THIS ZIP
-------------------
index.html              - the app (tree visual, hover effects, search, animations)
manifest.json           - PWA manifest (lets users "install" the app)
sw.js                   - service worker (offline caching)
icon-192.png            - app icon (small)
icon-512.png            - app icon (large)
icon-512-maskable.png   - app icon (Android adaptive/maskable version)

All 6 files must be uploaded together, in the SAME folder. They reference
each other with relative paths (./manifest.json, ./sw.js, ./icon-192.png).


OPTION A — Deploy at the root of abs-emon.github.io (recommended)
-------------------------------------------------------------------
1. Go to your repo: https://github.com/ABS-EMON/abs-emon.github.io
2. Click "Add file" > "Upload files"
3. Drag in all 6 files from this zip
4. IMPORTANT: if you previously had a file called
   "deeplearning model.html", delete it (or rename/replace it) so it
   doesn't conflict — index.html at the repo root becomes your homepage.
5. Commit the changes (commit directly to the `main` branch)
6. Wait ~30-60 seconds for GitHub Pages to rebuild
7. Visit: https://abs-emon.github.io/
   Your tree app now loads directly at the root URL.


OPTION B — Deploy in a subfolder (keeps your existing homepage untouched)
----------------------------------------------------------------------------
1. In your repo, create a new folder, e.g. "dl-tree"
2. Upload all 6 files into that folder (so paths look like
   dl-tree/index.html, dl-tree/manifest.json, etc.)
3. Commit the changes
4. Visit: https://abs-emon.github.io/dl-tree/


USING GIT ON YOUR PC (alternative to the web upload)
-------------------------------------------------------
    git clone https://github.com/ABS-EMON/abs-emon.github.io.git
    cd abs-emon.github.io
    # copy the 6 files from this zip into the repo folder (root or a subfolder)
    git add .
    git commit -m "Add Deep Learning Model Tree PWA"
    git push origin main


HOW TO INSTALL THE APP (for your users)
-------------------------------------------
- Android (Chrome): visit the page, tap the "Install app" banner, or
  Menu (⋮) > "Install app" / "Add to Home screen"
- iPhone (Safari): visit the page, tap Share, then "Add to Home Screen"
  (iOS does not show an automatic install banner — this step is manual)
- Windows/Mac (Chrome or Edge): an install icon (⊕) appears in the
  address bar — click it, then "Install"


UPDATING THE APP LATER
--------------------------
The service worker (sw.js) caches files aggressively for offline use.
If you edit index.html after users have already installed the app,
open sw.js and bump the cache name, e.g.:

    const CACHE_NAME = 'dl-model-tree-v1';   ->   'dl-model-tree-v2';

Then re-upload sw.js along with your updated index.html. This forces
installed copies of the app to fetch the new version instead of
serving stale cached content.


NOTES
-----
- GitHub Pages serves everything over HTTPS automatically, which is
  required for the service worker / install prompt to work. No
  extra configuration needed on your end.
- Everything is a single static site — no build step, no server code.
- Search bar, category expand/collapse, model tags, and connector
  lines are all handled client-side in index.html — nothing else
  to configure.
