import type {
    KarakeepSettings,
    BookmarkListResponse,
    ListsResponse,
    KarakeepList,
    KarakeepBookmark,
} from '@/types';

// ─── Storage ──────────────────────────────────────────────────────

export async function getSettings(): Promise<KarakeepSettings> {
    return new Promise((resolve) => {
        chrome.storage.local.get(['apiUrl', 'apiKey', 'adaptiveHeight'], (result) => {
            resolve({
                apiUrl: (result.apiUrl as string) || '',
                apiKey: (result.apiKey as string) || '',
                adaptiveHeight: (result.adaptiveHeight as boolean) || false,
            });
        });
    });
}

export async function saveSettings(settings: KarakeepSettings): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set(settings, resolve);
    });
}

// ─── Host permissions ─────────────────────────────────────────────
// The extension only declares an optional host permission, so access
// to a given Karakeep instance's origin must be granted at runtime.

function originPatternFor(apiUrl: string): string {
    return `${new URL(apiUrl).origin}/*`;
}

export async function hasHostPermission(apiUrl: string): Promise<boolean> {
    try {
        return await chrome.permissions.contains({ origins: [originPatternFor(apiUrl)] });
    } catch {
        return false;
    }
}

export async function requestHostPermission(apiUrl: string): Promise<boolean> {
    try {
        return await chrome.permissions.request({ origins: [originPatternFor(apiUrl)] });
    } catch {
        return false;
    }
}

// ─── Core fetch helper ────────────────────────────────────────────

async function apiFetch<T>(
    settings: KarakeepSettings,
    path: string,
    params?: Record<string, string>,
    init?: { method?: string; body?: unknown },
): Promise<T> {
    const base = settings.apiUrl.replace(/\/$/, '');
    const url = new URL(`${base}/api/v1${path}`);
    if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
        method: init?.method ?? 'GET',
        headers: {
            Authorization: `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
        },
        body: init?.body !== undefined ? JSON.stringify(init.body) : undefined,
    });

    if (!res.ok) {
        const text = await res.text().catch(() => res.statusText);
        throw new Error(`API ${res.status}: ${text}`);
    }

    return res.json() as Promise<T>;
}

// ─── Lists ────────────────────────────────────────────────────────

export async function fetchLists(settings: KarakeepSettings): Promise<KarakeepList[]> {
    const data = await apiFetch<ListsResponse>(settings, '/lists');
    const lists = data.lists ?? [];

    // Build nested tree from flat list
    const map = new Map<string, KarakeepList>();
    const roots: KarakeepList[] = [];

    lists.forEach((l) => map.set(l.id, { ...l, children: [] }));
    map.forEach((l) => {
        if (l.parentId && map.has(l.parentId)) {
            map.get(l.parentId)!.children!.push(l);
        } else {
            roots.push(l);
        }
    });

    return roots;
}

// ─── Bookmarks by list ────────────────────────────────────────────

export async function fetchBookmarksByList(
    settings: KarakeepSettings,
    listId: string,
    cursor?: string,
): Promise<BookmarkListResponse> {
    const params: Record<string, string> = { limit: '50' };
    if (cursor) params.cursor = cursor;
    return apiFetch<BookmarkListResponse>(
        settings,
        `/lists/${encodeURIComponent(listId)}/bookmarks`,
        params,
    );
}

// ─── Search ───────────────────────────────────────────────────────
//
// Plain free-text terms are matched against Karakeep's Meilisearch index,
// which is updated asynchronously by a background worker — a bookmark's
// title can take a while to become searchable there, or may not be
// re-indexed at all if it was renamed after the page was first saved.
// Karakeep's `title:"…"` qualifier instead does a direct, synchronous
// substring match against the title column, so it's always up to date.
// We OR the two together so a query still matches a word that's visibly
// in the title even when the async index hasn't caught up.

function buildSearchQuery(query: string): string {
    const quoted = query.replace(/"/g, "'");
    return `${query} or title:"${quoted}"`;
}

export async function searchBookmarks(
    settings: KarakeepSettings,
    query: string,
    cursor?: string,
): Promise<BookmarkListResponse> {
    const params: Record<string, string> = {
        q: buildSearchQuery(query),
        limit: '30',
        sortOrder: 'relevance',
    };
    if (cursor) params.cursor = cursor;
    return apiFetch<BookmarkListResponse>(settings, '/bookmarks/search', params);
}

// ─── Create bookmark ──────────────────────────────────────────────

export async function createBookmark(
    settings: KarakeepSettings,
    url: string,
    title?: string | null,
): Promise<KarakeepBookmark> {
    return apiFetch<KarakeepBookmark>(settings, '/bookmarks', undefined, {
        method: 'POST',
        body: { type: 'link', url, title: title ?? undefined },
    });
}
