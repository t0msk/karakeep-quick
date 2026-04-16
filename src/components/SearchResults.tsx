import type { KarakeepBookmark } from '@/types';
import { BookmarkItem, BookmarkSkeleton } from './BookmarkItem';

interface SearchResultsProps {
    bookmarks: KarakeepBookmark[];
    isLoading: boolean;
    error: string | null;
    query: string;
}

export function SearchResults({ bookmarks, isLoading, error, query }: SearchResultsProps) {
    if (isLoading) {
        return (
            <div>
                {[...Array(6)].map((_, i) => (
                    <BookmarkSkeleton key={i} />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center gap-2.5 px-5 py-12 text-[var(--text-tertiary)] text-[12.5px] text-center">
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

    if (bookmarks.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center gap-2.5 px-5 py-12 text-[var(--text-tertiary)] text-[12.5px] text-center">
                <svg
                    width="26"
                    height="26"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                >
                    <circle cx="11" cy="11" r="7" />
                    <path d="m21 21-4.35-4.35" />
                </svg>
                <span>
                    No results for{' '}
                    <em className="text-[var(--text-accent-soft)] not-italic">"{query}"</em>
                </span>
            </div>
        );
    }

    return (
        <div>
            <div className="text-[11px] text-[var(--text-tertiary)] font-mono px-3 pt-[7px] pb-[5px] tracking-wide uppercase">
                {bookmarks.length} result{bookmarks.length !== 1 ? 's' : ''}
            </div>
            {bookmarks.map((bm, i) => (
                <div key={bm.id} className="fade-in" style={{ animationDelay: `${i * 0.03}s` }}>
                    <BookmarkItem bookmark={bm} />
                </div>
            ))}
        </div>
    );
}
