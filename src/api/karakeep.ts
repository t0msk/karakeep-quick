import type { KarakeepSettings, BookmarkListResponse, ListsResponse, KarakeepList } from '@/types';

// ─── Storage ──────────────────────────────────────────────────────

export async function getSettings(): Promise<KarakeepSettings> {
    return new Promise((resolve) => {
        chrome.storage.local.get(['apiUrl', 'apiKey'], (result) => {
            resolve({
                apiUrl: (result.apiUrl as string) || '',
                apiKey: (result.apiKey as string) || '',
            });
        });
    });
}

export async function saveSettings(settings: KarakeepSettings): Promise<void> {
    return new Promise((resolve) => {
        chrome.storage.local.set(settings, resolve);
    });
}

// ─── Core fetch helper ────────────────────────────────────────────

async function apiFetch<T>(
    settings: KarakeepSettings,
    path: string,
    params?: Record<string, string>,
): Promise<T> {
    const base = settings.apiUrl.replace(/\/$/, '');
    const url = new URL(`${base}/api/v1${path}`);
    if (params) {
        Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
    }

    const res = await fetch(url.toString(), {
        headers: {
            Authorization: `Bearer ${settings.apiKey}`,
            'Content-Type': 'application/json',
        },
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

export async function searchBookmarks(
    settings: KarakeepSettings,
    query: string,
    cursor?: string,
): Promise<BookmarkListResponse> {
    const params: Record<string, string> = {
        q: query,
        limit: '30',
        sortOrder: 'relevance',
    };
    if (cursor) params.cursor = cursor;
    return apiFetch<BookmarkListResponse>(settings, '/bookmarks/search', params);
}
