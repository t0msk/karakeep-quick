# Privacy Policy — Karakeep Quick

**Last updated: 2026-10-07**

Karakeep Quick is a browser extension that lets you browse, search, and
save bookmarks from your own self-hosted [Karakeep](https://karakeep.app)
instance. This policy explains what data the extension stores, what it
transmits, and to whom.

Karakeep Quick is an independent, community-built client and is **not**
officially affiliated with or endorsed by the Karakeep project.

---

## Summary

- Your Karakeep instance URL and API key never leave your device except to
  talk directly to the instance **you** configured.
- The extension's developer does not operate any server, does not collect
  analytics, and has no access to your data.
- The only third party ever contacted is Google's public favicon service,
  and only to fetch a small site icon — never your bookmarks, credentials,
  or instance URL.

---

## Data stored locally

The extension uses `chrome.storage.local` (storage that stays on your
device, scoped to the extension) to save:

- Your Karakeep instance URL
- Your Karakeep API key
- The "adaptive height" display preference

None of this is synced to a Google account, sent to the extension's
developer, or shared with any analytics provider — nothing is sent anywhere
except in the API requests described below. You can clear it at any time
by removing the extension or clearing its data via `chrome://extensions`.

---

## Data transmitted, and to whom

### Your Karakeep instance (data you control)

Every bookmark, list, and search action in the popup sends a direct HTTPS
request from your browser to the Karakeep instance URL you configured,
authenticated with your API key:

- Fetching your lists and bookmarks
- Searching your bookmarks
- Saving the currently open tab as a new bookmark

These requests never pass through any server operated by the extension's
developer. They go straight from your browser to your instance, the same
as if you'd typed the URL into the address bar yourself.

### Google Favicon service (third party)

When a bookmark has no favicon already cached by Karakeep, the popup falls
back to loading an icon from:

```
https://www.google.com/s2/favicons?sz=64&domain=<hostname-of-the-bookmark>
```

This sends only the **hostname of the bookmarked page** (e.g. `github.com`)
to Google, so it can return that site's icon. It does **not** send your
Karakeep URL, API key, bookmark titles/notes, or any other bookmark
content. This request is subject to
[Google's own privacy policy](https://policies.google.com/privacy).

### Nothing else

No analytics, telemetry, crash reporting, or advertising SDKs are included.
The extension makes no network requests beyond the two cases above.

---

## Permissions explained

| Permission | Why it's needed |
|---|---|
| `storage` | Save your instance URL, API key, and display preference locally. |
| `activeTab` | Read the active tab's URL and title, only at the moment you click "save current tab." |
| Host permission (optional, requested at runtime) | Lets the browser send requests to the specific Karakeep instance origin you configure. It is requested only for that one origin — not for all websites — and only after you enter a URL and save settings. |

---

## Data retention and deletion

Since all data lives in your browser's local storage and on your own
Karakeep instance, you are in full control:

- **Remove the extension's local data**: `chrome://extensions` → Karakeep
  Quick → Details → Clear data, or simply uninstall the extension.
- **Remove bookmark data**: managed entirely through your own Karakeep
  instance, independent of this extension.

---

## Children's privacy

Karakeep Quick is a general-purpose developer/productivity tool not
directed at children and does not knowingly collect data from children.

---

## Changes to this policy

If this policy changes, the update will be reflected in this file with a
new "Last updated" date, in the same GitHub repository.

---

## Contact

Questions or concerns: open an issue at
[github.com/t0msk/karakeep-quick](https://github.com/t0msk/karakeep-quick/issues).
