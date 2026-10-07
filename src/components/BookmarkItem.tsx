import type { KarakeepBookmark } from '@/types';

interface BookmarkItemProps {
    bookmark: KarakeepBookmark;
    indentPx?: number;
}

export function BookmarkItem({ bookmark, indentPx = 12 }: BookmarkItemProps) {
    const content = bookmark.content;
    const url = content.url ?? bookmark.url ?? '';
    const hostname = url
        ? (() => {
              try {
                  return new URL(url).hostname;
              } catch {
                  return url;
              }
          })()
        : '';
    const title = bookmark.title ?? content.title ?? (hostname || 'Untitled');
    const favicon =
        content.favicon ??
        (hostname
            ? `https://www.google.com/s2/favicons?sz=64&domain=${encodeURIComponent(hostname)}`
            : null);

    function handleClick() {
        if (url) chrome.tabs.create({ url, active: true });
    }

    return (
        <button
            onClick={handleClick}
            title={url}
            style={{ paddingLeft: indentPx }}
            className="bookmark-item group flex items-center gap-2.5 pr-3 py-2 w-full text-left border-none bg-transparent hover:bg-[var(--bg-hover)] transition-colors duration-150 cursor-pointer"
        >
            <div className="w-8 h-8 flex items-center justify-center bg-[var(--bg-elevated)] border border-[var(--border-subtle)] rounded-[6px] shrink-0">
                {favicon ? (
                    <img
                        src={favicon}
                        width={20}
                        height={20}
                        alt=""
                        className="rounded-sm object-contain"
                        onError={(e) => {
                            (e.currentTarget as HTMLImageElement).style.display = 'none';
                            (
                                e.currentTarget.nextElementSibling as HTMLElement | null
                            )?.classList.remove('hidden');
                        }}
                    />
                ) : null}
                <span
                    className={`text-[var(--text-tertiary)] flex items-center justify-center ${favicon ? 'hidden' : 'flex'}`}
                >
                    <svg
                        width="11"
                        height="11"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                    </svg>
                </span>
            </div>

            <div className="flex-1 flex flex-col gap-0.5 min-w-0 overflow-hidden">
                <span className="text-red font-medium text-[var(--text-primary)] truncate leading-[1.4]">
                    {title}
                </span>
                <span className="text-[var(--text-tertiary)] truncate font-mono leading-[1.3]">
                    {hostname}
                </span>
            </div>

            <div className="text-[var(--text-tertiary)] shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                <svg
                    width="12"
                    height="12"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                >
                    <path d="M7 17 17 7M7 7h10v10" />
                </svg>
            </div>
        </button>
    );
}

export function BookmarkSkeleton({ indentPx = 12 }: { indentPx?: number }) {
    return (
        <div style={{ paddingLeft: indentPx }} className="flex items-center gap-2.5 pr-3 py-2">
            <div className="skeleton w-6 h-6 rounded-[6px] shrink-0 opacity-40" />
            <div className="flex flex-col gap-1.5 flex-1">
                <div className="skeleton h-2.5 w-[70%] rounded" />
                <div className="skeleton h-2 w-[45%] rounded" />
            </div>
        </div>
    );
}
