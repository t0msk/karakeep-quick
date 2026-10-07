# Publishing to the Chrome Web Store

This guide walks through publishing (and updating) Karakeep Quick on the
Chrome Web Store.

---

## 1. One-time setup

1. Create/sign in with the Google account you want to publish under.
2. Go to the [Chrome Web Store Developer Dashboard](https://chromewebstore.google.com/u/0/developer/dashboard)
   and pay the one-time **$5 USD registration fee** (per developer account,
   not per extension).
3. Accept the Developer Agreement.

You only do this once, ever — not per release.

---

## 2. Prepare assets

### 2.1 Build

```bash
npm install
npm run typecheck
npm run lint
npm run build
```

This produces a clean `dist/` folder. Zip **its contents** (not the folder
itself — `manifest.json` must sit at the zip's root):

```bash
cd dist
zip -r ../karakeep-quick-extension.zip . -x '.*'
cd ..
```

Sanity-check the zip before uploading:

```bash
unzip -l karakeep-quick-extension.zip   # manifest.json should be at the top level
```

### 2.2 Store listing images

The Web Store requires marketing assets beyond the extension's own icons.
None of these are currently in the repo — produce them before your first
submission:

| Asset | Size | Required? |
|---|---|---|
| Store icon | 128×128 PNG | Yes — reuse `public/icons/icon128.png` |
| Screenshots | 1280×800 or 640×400 PNG/JPEG, 1–5 images | Yes |
| Small promo tile | 440×280 | Recommended |
| Marquee promo tile | 1400×560 | Only if you want featured placement |

For screenshots, capture the actual popup — lists view, search results, and
the settings panel — in both light and dark themes if you can. The
placeholder image currently in `README.md` is **not** store-ready; replace
it with a real screenshot at the same time if you want the README and store
listing to match.

### 2.3 Privacy policy (required)

Because the extension requests `storage`, `activeTab`, and an **optional
host permission** to reach your self-hosted Karakeep instance, the Web Store
requires a privacy policy URL in the listing. [`PRIVACY.md`](PRIVACY.md) in
this repo already covers this — in the dashboard's privacy policy field,
link to it via GitHub's rendered view, e.g.
`https://github.com/t0msk/karakeep-quick/blob/main/PRIVACY.md`.

If you fork this project or change what data the extension touches (new
API calls, new third-party services, etc.), update `PRIVACY.md` to match
before submitting — reviewers check the policy against the code's actual
behavior, and it currently documents two things specifically:

- All bookmark/list/search/save requests go straight from the browser to
  **your own Karakeep instance** — no server operated by the developer is
  involved.
- **Exception:** when a bookmark has no favicon cached by Karakeep, the
  popup falls back to loading `https://www.google.com/s2/favicons?...`
  for that bookmark's hostname (see `src/components/BookmarkItem.tsx`),
  which sends that hostname (not your Karakeep URL, API key, or bookmark
  content) to Google.

---

## 3. Create the store listing

1. In the [Developer Dashboard](https://chromewebstore.google.com/u/0/developer/dashboard),
   click **New item** and upload `karakeep-quick-extension.zip`.
2. Fill in the **Store listing** tab:
   - **Description** — what it does, that it requires a self-hosted Karakeep
     instance, and a link to [karakeep.app](https://karakeep.app) for people
     who don't have one yet.
   - **Category** — Productivity (or Tools).
   - **Language**.
   - Screenshots and promo images from step 2.2.
3. Fill in the **Privacy practices** tab:
   - **Single purpose description** — e.g. "Browse, search, and save
     bookmarks from the user's self-hosted Karakeep instance."
   - **Permission justifications** (required for every permission declared
     in `manifest.json`):
     - `storage` — persist the configured instance URL, API key, and the
       adaptive-height preference.
     - `activeTab` — read the active tab's URL/title only when the user
       explicitly clicks "save current tab."
     - Host permission (optional, requested at runtime) — needed to call
       the REST API of the Karakeep instance the user configures; scoped to
       that single origin, not `<all_urls>` at install time.
   - **Data usage** checkboxes — answer based on the disclosures in 2.3
     (no sale of data, no use for unrelated purposes, etc.).
   - Link the privacy policy from step 2.3.
4. Set **Visibility** (Public, Unlisted, or Private/Trusted testers) and
   **Distribution** (countries).
5. Click **Submit for review**.

---

## 4. Review

- First-time submissions, and any submission that touches host permissions,
  tend to get closer scrutiny — expect anywhere from a few hours to
  several days.
- Common rejection reasons to avoid (already handled by this codebase, but
  re-check after changes):
  - Requesting broader permissions than the code actually uses (keep
    `optional_host_permissions` instead of a blanket `host_permissions`).
  - Missing or inaccurate privacy policy / permission justifications.
  - Obfuscated or minified source without a clear way to review it — Vite's
    default build output is minified; if asked, you can point reviewers to
    this public GitHub repo as the source.
  - Using "Karakeep" in the name/branding in a way that implies official
    affiliation — the listing description should make clear this is an
    independent, unofficial client.

---

## 5. Publishing updates

1. Bump the version in **both** `public/manifest.json` and `package.json`
   (Chrome requires a strictly higher `version` than the last published
   one).
2. Repeat the build + zip steps from section 2.1.
3. In the Developer Dashboard, open the existing item → **Package** tab →
   upload the new zip → **Submit for review**.
4. Updates go through review again, but typically faster than the first
   submission once your listing is established.

---

## 6. Local sanity check before every submission

```bash
npm run typecheck && npm run lint && npm run build
```

Then load the freshly built `dist/` folder as an unpacked extension
(`chrome://extensions` → Developer mode → Load unpacked) and manually
verify: setup flow, settings save + permission prompt, list browsing,
search, save-current-tab, and both light/dark themes — before uploading.
