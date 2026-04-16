export interface KarakeepSettings {
    apiUrl: string;
    apiKey: string;
}

export interface KarakeepList {
    id: string;
    name: string;
    icon: string | null;
    parentId: string | null;
    children?: KarakeepList[];
}

export interface KarakeepTag {
    id: string;
    name: string;
    attachedBookmarks: number;
}

export interface KarakeepBookmarkContent {
    type: 'link' | 'text' | 'asset' | 'unknown';
    url?: string;
    title?: string | null;
    description?: string | null;
    imageUrl?: string | null;
    favicon?: string | null;
}

export interface KarakeepBookmark {
    id: string;
    url?: string;
    title: string | null;
    note?: string | null;
    content: KarakeepBookmarkContent;
    tags: KarakeepTag[];
    lists: KarakeepList[];
    createdAt: string;
    favourited: boolean;
    archived: boolean;
}

export interface BookmarkListResponse {
    bookmarks: KarakeepBookmark[];
    nextCursor: string | null;
}

export interface ListsResponse {
    lists: KarakeepList[];
}

export interface TagsResponse {
    tags: KarakeepTag[];
}
