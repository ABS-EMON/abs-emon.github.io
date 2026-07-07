3D SOLAR SYSTEM EXPLORER — GitHub Pages Deployment Guide
============================================================

WHAT'S IN THIS FOLDER
-----------------------
index.html              - the app shell (UI, layout, PWA tags)
app.js                  - all 3D scene logic (planets, moons, camera, tour)
solar-data.js           - all planet/moon facts and visual configuration
three.min.js            - the 3D engine (Three.js, vendored locally so the
                          app works fully offline once installed)
manifest.json           - PWA manifest (lets users "install" the app)
sw.js                   - service worker (offline caching)
icon-192.png / icon-512.png / icon-512-maskable.png  - app icons

All 9 files must be uploaded together, in the SAME folder — they
reference each other with relative paths.


WHAT THIS APP DOES
----------------------
- Full 3D solar system: Sun, 8 planets, Pluto (dwarf planet), and
  14 major moons, all with real astronomical facts (diameter,
  distance, orbital period, day length, gravity, temperature).
- Each body orbits the Sun and spins on its own axis (day/night
  rotation), including retrograde rotation for Venus and Uranus,
  and correct axial tilts.
- Saturn has rings. Every planet and moon has an orbit path line.
- Click / tap any planet — in the 3D scene, or in the sidebar list
  — to fly the camera to it and open an info panel with facts.
- "Start Tour" auto-flies through every body in order with a
  running caption, like a guided space tour.
- Speed slider (time-lapse control), Play/Pause, orbit-path toggle,
  label toggle, and Reset View.
- Fully responsive: touch drag to orbit the camera, pinch to zoom,
  and the sidebar/info panel adapt to phone, tablet, and desktop.
- Works offline once installed, since the whole 3D engine is
  bundled locally — no CDN or internet connection needed after
  first load.

Note: distances and planet sizes are compressed/exaggerated for
visualization (a true-to-scale solar system would make most
planets invisible dots many kilometers apart on your screen) —
this is called out in general astronomy visualizations and is
standard practice. All of the numeric facts shown in the info
panel (diameter, gravity, temperature, etc.) are real values.


OPTION A — Deploy at the root of abs-emon.github.io
-------------------------------------------------------
1. Go to your repo: https://github.com/ABS-EMON/abs-emon.github.io
2. Click "Add file" > "Upload files"
3. Drag in all 9 files from this folder (not the folder itself —
   the files need to land directly in the repo root)
4. If you want this to be your homepage, make sure there isn't
   already a conflicting index.html at the root — delete or
   rename the old one first.
5. Commit to `main`
6. Wait ~30-60 seconds for GitHub Pages to rebuild
7. Visit: https://abs-emon.github.io/


OPTION B — Deploy in a subfolder (recommended if you already
have other projects at the root, like the deep learning tree)
-------------------------------------------------------------------
1. In your repo, create a new folder, e.g. "solar-system"
2. Upload all 9 files into that folder
3. Commit
4. Visit: https://abs-emon.github.io/solar-system/


USING GIT ON YOUR PC (alternative to the web upload)
---------------------------------------------------------
    git clone https://github.com/ABS-EMON/abs-emon.github.io.git
    cd abs-emon.github.io
    mkdir solar-system
    # copy all 9 files from this folder into solar-system/
    git add .
    git commit -m "Add 3D Solar System Explorer PWA"
    git push origin main


HOW TO INSTALL THE APP (for your users)
-------------------------------------------
- Android (Chrome): visit the page, tap "Install app" banner, or
  Menu (⋮) > "Install app" / "Add to Home screen"
- iPhone (Safari): visit the page, tap Share, then "Add to Home
  Screen" (manual — iOS doesn't show an automatic install banner)
- Windows/Mac (Chrome or Edge): click the install icon (⊕) in the
  address bar, then "Install"


CONTROLS CHEAT-SHEET
-------------------------
- Drag (mouse or one finger)     -> rotate camera around focus point
- Scroll wheel / pinch           -> zoom in/out
- Click/tap a planet or moon     -> focus camera + show facts
- Click a body in the sidebar    -> same as above, jump directly
- "Start Tour"                   -> auto-visits every body in order
- Speed slider                   -> speeds up/slows down orbital motion
- 🛰 button                       -> toggle orbit path lines
- 🏷 button                       -> toggle name labels
- ☰ button                       -> show/hide the sidebar list


UPDATING THE APP LATER
--------------------------
The service worker caches files aggressively for offline use. If
you edit index.html, app.js, or solar-data.js after users have
installed the app, open sw.js and bump the cache name:

    const CACHE_NAME = 'solar-system-v1';   ->   'solar-system-v2';

Then re-upload sw.js along with your changed files, so installed
copies fetch the new version instead of serving stale content.


NOTES
-----
- GitHub Pages serves everything over HTTPS automatically, which
  is required for the service worker / install prompt to work.
- Everything is static — no build step, no server code required.
- three.min.js is the MIT-licensed Three.js library, vendored
  locally into this folder so the whole app (including the very
  first load) works without any external CDN dependency.
