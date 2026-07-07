# Deploying to https://abs-emon.github.io

## 1. Push the code

```bash
git init
git remote add origin https://github.com/ABS-EMON/abs-emon.github.io.git
git add .
git commit -m "Initial site: full-width slider + PWA"
git branch -M main
git push -u origin main
```

## 2. Enable GitHub Pages via Actions

1. Go to the repo **Settings → Pages**.
2. Under **Build and deployment → Source**, choose **GitHub Actions**
   (not "Deploy from a branch").
3. Push to `main` — the included workflow
   (`.github/workflows/pages.yml`) will build the Jekyll site with a
   real `bundle exec jekyll build` (so custom plugins in `_plugins/`
   also work, unlike GitHub's restricted built-in Jekyll processor)
   and publish it automatically.
4. After the workflow finishes (check the **Actions** tab), your site
   is live at **https://abs-emon.github.io**.

## What changed from the original template

- **Full-width hero slider**: the carousel now sits in a
  `.full-bleed-slider` wrapper that breaks out of the site's
  `max-width: 900px` container and always spans the full viewport
  width (see `_layouts/homelay.html` and `css/main.scss`).
- **Justified content**: body text was already justified globally;
  reinforced with a `.justify-text` class on the homepage content
  column.
- **PWA support**:
  - `manifest.json` — app name, colors, icons, start URL.
  - `sw.js` — service worker with an offline-first cache and an
    `offline.html` fallback page for navigations.
  - Icons generated at `images/icons/` (72–512px) from the existing
    lab logo — **swap these out for your own logo/branding when
    ready** (same filenames, just replace the PNGs).
  - Registered in `_includes/head.html` (manifest link, theme-color,
    apple touch icons) and `_includes/footer.html` (service worker
    registration script).
- **`_config.yml`**: `url` set to `https://abs-emon.github.io` for a
  GitHub user/org site (`baseurl` stays empty).
- **Gemfile**: simplified to plain `jekyll` (~> 4.3) instead of the
  old, unresolvable pinned `github-pages` gem lock from 2019.

## Testing the PWA

After deployment, open the site on a phone or in Chrome desktop:
- Chrome should show an "Install app" icon in the address bar.
- On mobile, "Add to Home Screen" will use the manifest + icons.
- Turning off Wi-Fi and reloading a previously-visited page should
  still work (served from the service worker cache), and unvisited
  pages will fall back to `offline.html`.

Remember: service workers only work over **HTTPS** (GitHub Pages
serves over HTTPS by default, so this is automatic) or `localhost`.
