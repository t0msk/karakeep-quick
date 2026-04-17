import { useState, useEffect, useRef, useCallback } from 'react';
import type { KarakeepList, KarakeepBookmark, KarakeepSettings } from '@/types';
import { getSettings, fetchLists, searchBookmarks } from '@/api/karakeep';
import { Header } from '@/components/Header';
import { CategoryTree } from '@/components/CategoryTree';
import { SearchResults } from '@/components/SearchResults';
import { SettingsPanel } from '@/components/SettingsPanel';
import { Footer } from '@/components/Footer';
import '@/styles/globals.css';

type ContentView = 'loading' | 'setup' | 'lists' | 'search' | 'settings';

export default function App() {
    const [view, setView] = useState<ContentView>('loading');
    const [prevView, setPrevView] = useState<ContentView>('lists');
    const [settings, setSettings] = useState<KarakeepSettings>({
        apiUrl: '',
        apiKey: '',
    });
    const [query, setQuery] = useState('');
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const [lists, setLists] = useState<KarakeepList[]>([]);
    const [listsLoading, setListsLoading] = useState(false);
    const [listsError, setListsError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<KarakeepBookmark[]>([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);

    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const loadLists = useCallback(async (s: KarakeepSettings) => {
        setListsLoading(true);
        setListsError(null);
        try {
            const data = await fetchLists(s);
            setLists(data);
        } catch (err) {
            setListsError(err instanceof Error ? err.message : 'Failed to load lists');
        } finally {
            setListsLoading(false);
        }
    }, []);

    useEffect(() => {
        getSettings().then((s) => {
            setSettings(s);
            if (!s.apiUrl || !s.apiKey) {
                setView('setup');
            } else {
                setView('lists');
                loadLists(s);
            }
        });
    }, [loadLists]);

    // Debounce search query
    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => setDebouncedQuery(query), 320);
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, [query]);

    // Execute search
    useEffect(() => {
        if (view === 'settings' || view === 'setup') return;
        if (!debouncedQuery.trim()) {
            setView('lists');
            setSearchResults([]);
            return;
        }
        setView('search');
        setSearchLoading(true);
        setSearchError(null);
        searchBookmarks(settings, debouncedQuery.trim())
            .then((res) => setSearchResults(res.bookmarks))
            .catch((err) => setSearchError(err instanceof Error ? err.message : 'Search failed'))
            .finally(() => setSearchLoading(false));
    }, [debouncedQuery, settings]); // eslint-disable-line react-hooks/exhaustive-deps

    function openSettings() {
        setPrevView(view === 'settings' ? 'lists' : view);
        setView('settings');
    }

    function closeSettings() {
        setView(prevView === 'settings' || prevView === 'loading' ? 'lists' : prevView);
    }

    function handleSettingsSaved(newSettings: KarakeepSettings) {
        setSettings(newSettings);
        setView('lists');
        loadLists(newSettings);
    }

    const isSettings = view === 'settings' || view === 'setup';

    return (
        <div
            className="flex flex-col bg-[var(--bg-base)] overflow-hidden relative" // pridaj relative
            style={{
                width: 'var(--popup-width)',
                height: 'var(--popup-height)',
                maxHeight: 'var(--popup-height)', // vynútiť maximum
            }}
        >
            {/* Header — switches between search bar and settings back-button */}
            <Header
                view={isSettings ? 'settings' : 'main'}
                onBack={closeSettings}
                searchValue={query}
                onSearchChange={setQuery}
                isSearching={searchLoading}
                onReload={() => loadLists(settings)}
                isReloading={listsLoading}
            />

            {/* Main scrollable content */}
            <main className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden">
                {/* ── Setup prompt (no credentials yet) ── */}
                {view === 'setup' && (
                    <div className="flex flex-col items-center justify-center gap-3 flex-1 px-7 py-8 text-center fade-in">
                        <div className="w-14 h-14 bg-[var(--accent-dim)] border border-[var(--accent-border)] rounded-[14px] flex items-center justify-center mb-1">
                            <svg
                                width="32"
                                height="32"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="var(--accent)"
                                strokeWidth="1.3"
                                strokeLinecap="round"
                            >
                                <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                            </svg>
                        </div>
                        <h2 className="text-[15px] font-semibold text-[var(--text-primary)] tracking-tight">
                            Connect Karakeep
                        </h2>
                        <p className="text-[12.5px] text-[var(--text-tertiary)] leading-relaxed max-w-[220px]">
                            Add your API URL and key to get started.
                        </p>
                        <button
                            onClick={openSettings}
                            className="mt-1 px-[18px] py-2 bg-[var(--accent)] text-[var(--accent-text-on)] rounded-[var(--radius-md)] text-[12.5px] font-semibold tracking-tight hover:opacity-85 active:scale-97 transition-all duration-150 cursor-pointer"
                        >
                            Open Settings
                        </button>
                    </div>
                )}

                {/* ── Initial loading spinner ── */}
                {view === 'loading' && (
                    <div className="flex flex-col items-center justify-center gap-3 flex-1 px-7 py-8 text-center fade-in">
                        <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="var(--accent)"
                            strokeWidth="2.5"
                        >
                            <circle cx="12" cy="12" r="9" strokeOpacity="0.2" />
                            <path d="M12 3a9 9 0 0 1 9 9" strokeLinecap="round">
                                <animateTransform
                                    attributeName="transform"
                                    type="rotate"
                                    from="0 12 12"
                                    to="360 12 12"
                                    dur="0.7s"
                                    repeatCount="indefinite"
                                />
                            </path>
                        </svg>
                    </div>
                )}

                {/* ── Category list tree ── */}
                {view === 'lists' && (
                    <CategoryTree
                        lists={lists}
                        settings={settings}
                        isLoading={listsLoading}
                        error={listsError}
                    />
                )}

                {/* ── Search results ── */}
                {view === 'search' && (
                    <SearchResults
                        bookmarks={searchResults}
                        isLoading={searchLoading}
                        error={searchError}
                        query={debouncedQuery}
                    />
                )}

                {/* ── Inline Settings panel ── */}
                {view === 'settings' && (
                    <div className="fade-in h-full">
                        <SettingsPanel onSaved={handleSettingsSaved} />
                    </div>
                )}
            </main>

            {/* Footer — hide settings button when already on settings */}
            <Footer settings={settings} onSettings={openSettings} showSettings={!isSettings} />
        </div>
    );
}
