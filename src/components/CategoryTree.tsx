import { useState, useCallback } from 'react';
import type { KarakeepList, KarakeepBookmark, KarakeepSettings } from '@/types';
import { fetchBookmarksByList } from '@/api/karakeep';
import { BookmarkItem, BookmarkSkeleton } from './BookmarkItem';

interface ListState {
    open: boolean;
    loading: boolean;
    bookmarks: KarakeepBookmark[];
    loaded: boolean;
    error: string | null;
    nextCursor: string | null;
}

function CategoryNode({
    list,
    settings,
    depth,
}: {
    list: KarakeepList;
    settings: KarakeepSettings;
    depth: number;
}) {
    const [state, setState] = useState<ListState>({
        open: false,
        loading: false,
        bookmarks: [],
        loaded: false,
        error: null,
        nextCursor: null,
    });

    const hasChildren = list.children && list.children.length > 0;
    const indent = 12 + depth * 14;

    const toggle = useCallback(async () => {
        if (state.open) {
            setState((s) => ({ ...s, open: false }));
            return;
        }
        setState((s) => ({ ...s, open: true }));
        if (!state.loaded) {
            setState((s) => ({ ...s, loading: true, error: null }));
            try {
                const res = await fetchBookmarksByList(settings, list.id);
                setState((s) => ({
                    ...s,
                    loading: false,
                    loaded: true,
                    bookmarks: res.bookmarks,
                    nextCursor: res.nextCursor,
                }));
            } catch (err) {
                setState((s) => ({
                    ...s,
                    loading: false,
                    error: err instanceof Error ? err.message : 'Failed to load',
                }));
            }
        }
    }, [state.open, state.loaded, settings, list.id]);

    const loadMore = useCallback(async () => {
        if (!state.nextCursor || state.loading) return;
        setState((s) => ({ ...s, loading: true }));
        try {
            const res = await fetchBookmarksByList(settings, list.id, state.nextCursor!);
            setState((s) => ({
                ...s,
                loading: false,
                bookmarks: [...s.bookmarks, ...res.bookmarks],
                nextCursor: res.nextCursor,
            }));
        } catch {
            setState((s) => ({ ...s, loading: false }));
        }
    }, [state.nextCursor, state.loading, settings, list.id]);

    return (
        <div className="flex flex-col">
            <button
                onClick={toggle}
                style={{ paddingLeft: indent }}
                className="list-btn group flex items-center gap-[7px] pr-3 py-[7px] w-full text-left text-[12.5px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-hover)] hover:text-[var(--text-primary)] transition-colors duration-150"
            >
                <span
                    className="text-[var(--text-tertiary)] flex items-center shrink-0 transition-transform duration-200"
                    style={{
                        transform: state.open ? 'rotate(90deg)' : 'rotate(0deg)',
                    }}
                >
                    <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    >
                        <path d="m9 18 6-6-6-6" />
                    </svg>
                </span>

                <span className="text-[var(--text-tertiary)] flex items-center justify-center shrink-0 w-4 h-4">
                    {list.icon ? (
                        <span className="text-[13px] leading-none">{list.icon}</span>
                    ) : (
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                        >
                            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                        </svg>
                    )}
                </span>

                <span className="flex-1 truncate">{list.name}</span>
            </button>

            {state.open && (
                <div className="flex flex-col fade-in">
                    {state.loading && !state.loaded && (
                        <>
                            <BookmarkSkeleton indentPx={indent + 24} />
                            <BookmarkSkeleton indentPx={indent + 24} />
                            <BookmarkSkeleton indentPx={indent + 24} />
                        </>
                    )}
                    {state.error && (
                        <div
                            className="text-[11.5px] text-[var(--color-error)] opacity-80"
                            style={{ padding: `6px 12px 6px ${indent + 24}px` }}
                        >
                            {state.error}
                        </div>
                    )}
                    {!state.loading &&
                        state.loaded &&
                        state.bookmarks.length === 0 &&
                        !hasChildren && (
                            <div
                                className="text-[11.5px] text-[var(--text-tertiary)] italic"
                                style={{
                                    padding: `6px 12px 6px ${indent + 24}px`,
                                }}
                            >
                                No bookmarks in this list
                            </div>
                        )}
                    {state.bookmarks.map((bm) => (
                        <BookmarkItem key={bm.id} bookmark={bm} indentPx={indent + 24} />
                    ))}
                    {state.nextCursor && !state.loading && (
                        <button
                            onClick={loadMore}
                            className="text-[11.5px] text-[var(--text-accent)] opacity-80 hover:opacity-100 text-left transition-opacity duration-150"
                            style={{ padding: `6px 12px 6px ${indent + 24}px` }}
                        >
                            Load more
                        </button>
                    )}
                    {state.loading && state.loaded && <BookmarkSkeleton indentPx={indent + 24} />}
                    {hasChildren &&
                        list.children!.map((child) => (
                            <CategoryNode
                                key={child.id}
                                list={child}
                                settings={settings}
                                depth={depth + 1}
                            />
                        ))}
                </div>
            )}
        </div>
    );
}

interface CategoryTreeProps {
    lists: KarakeepList[];
    settings: KarakeepSettings;
    isLoading: boolean;
    error: string | null;
}

export function CategoryTree({ lists, settings, isLoading, error }: CategoryTreeProps) {
    if (isLoading) {
        return (
            <div className="flex flex-col gap-0.5 py-1.5">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-2 px-3 py-[7px]">
                        <div className="skeleton w-3 h-3 rounded-sm" />
                        <div className="skeleton w-3.5 h-3.5 rounded" />
                        <div
                            className="skeleton h-3 rounded"
                            style={{ width: `${42 + ((i * 13) % 38)}%` }}
                        />
                    </div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-[var(--text-tertiary)] text-[12.5px] text-center">
                <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                </svg>
                <span>{error}</span>
            </div>
        );
    }

    if (lists.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 px-5 py-12 text-[var(--text-tertiary)] text-[12.5px]">
                <svg
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                >
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                </svg>
                <span>No lists found</span>
            </div>
        );
    }

    return (
        <div>
            {lists.map((list, i) => (
                <div key={list.id} className="fade-in" style={{ animationDelay: `${i * 0.04}s` }}>
                    <CategoryNode list={list} settings={settings} depth={0} />
                </div>
            ))}
        </div>
    );
}
