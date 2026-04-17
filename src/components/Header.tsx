interface HeaderProps {
    view: 'main' | 'settings';
    onBack: () => void;
    searchValue: string;
    onSearchChange: (v: string) => void;
    isSearching: boolean;
    onReload?: () => void;
    isReloading?: boolean;
}

export function Header({
    view,
    onBack,
    searchValue,
    onSearchChange,
    isSearching,
    onReload,
    isReloading,
}: HeaderProps) {
    return (
        <div className="shrink-0 m-3 mt-4 border-b border-[var(--border-subtle)]">
            {view === 'settings' ? (
                /* ── Settings header ── */
                <div className="flex items-center gap-2 px-3 py-2.5">
                    <button
                        onClick={onBack}
                        className="flex items-center justify-center w-7 h-7 rounded-[var(--radius-sm)] text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)] active:scale-95 transition-all duration-150 shrink-0"
                        title="Back"
                    >
                        <svg
                            width="15"
                            height="15"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="m15 18-6-6 6-6" />
                        </svg>
                    </button>
                    <span className="text-[13px] font-semibold text-[var(--text-primary)] tracking-tight">
                        Settings
                    </span>
                </div>
            ) : (
                /* ── Search header ── */
                <div className="px-3 pb-2.5 flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-2.5 transition-all duration-150 focus-within:border-[var(--border-strong)] focus-within:shadow-[0_0_0_3px_var(--accent-glow)]">
                        <span className="text-(--text-tertiary) flex items-center shrink-0">
                            {isSearching ? (
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                >
                                    <circle cx="12" cy="12" r="9" strokeOpacity="0.3" />
                                    <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round">
                                        <animateTransform
                                            attributeName="transform"
                                            type="rotate"
                                            from="0 12 12"
                                            to="360 12 12"
                                            dur="0.8s"
                                            repeatCount="indefinite"
                                        />
                                    </path>
                                </svg>
                            ) : (
                                <svg
                                    width="15"
                                    height="15"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                >
                                    <circle cx="11" cy="11" r="7" />
                                    <path d="m21 21-4.35-4.35" />
                                </svg>
                            )}
                        </span>
                        <input
                            className="flex-1 bg-transparent border-none outline-none text-[var(--text-primary)] text-[13px] py-2.5 placeholder:text-[var(--text-tertiary)]"
                            type="text"
                            placeholder="Search bookmarks…"
                            value={searchValue}
                            onChange={(e) => onSearchChange(e.target.value)}
                            spellCheck={false}
                            autoComplete="off"
                            autoFocus
                        />
                        {searchValue && (
                            <button
                                className="text-[var(--text-tertiary)] flex items-center p-0.5 rounded hover:text-[var(--text-secondary)] transition-colors duration-150 shrink-0"
                                onClick={() => onSearchChange('')}
                            >
                                <svg
                                    width="13"
                                    height="13"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                >
                                    <path d="M18 6 6 18M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>
                    {onReload && (
                        <button
                            onClick={onReload}
                            disabled={isReloading}
                            title="Reload lists"
                            className="flex items-center justify-center w-8 h-8 rounded-[var(--radius-md)] text-[var(--text-tertiary)] hover:bg-[var(--bg-elevated)] hover:text-[var(--text-secondary)] disabled:opacity-40 active:scale-95 transition-all duration-150 shrink-0"
                        >
                            <svg
                                width="14"
                                height="14"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                style={
                                    isReloading
                                        ? { animation: 'spin 0.7s linear infinite' }
                                        : undefined
                                }
                            >
                                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                                <path d="M21 3v5h-5" />
                                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                                <path d="M8 16H3v5" />
                            </svg>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
