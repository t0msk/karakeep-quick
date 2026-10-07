import { useState, useEffect } from 'react';
import { getSettings, saveSettings, requestHostPermission } from '@/api/karakeep';
import type { KarakeepSettings } from '@/types';

interface SettingsPanelProps {
    onSaved: (settings: KarakeepSettings) => void;
}

export function SettingsPanel({ onSaved }: SettingsPanelProps) {
    const [apiUrl, setApiUrl] = useState('');
    const [apiKey, setApiKey] = useState('');
    const [adaptiveHeight, setAdaptiveHeight] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<'ok' | 'fail' | null>(null);

    useEffect(() => {
        getSettings().then((s) => {
            setApiUrl(s.apiUrl);
            setApiKey(s.apiKey);
            setAdaptiveHeight(s.adaptiveHeight ?? false);
        });
    }, []);

    async function handleSave() {
        const url = apiUrl.trim(),
            key = apiKey.trim();
        if (!url || !key) {
            setError('Both API URL and API Key are required.');
            return;
        }
        try {
            new URL(url);
        } catch {
            setError('Enter a valid URL (e.g. https://karakeep.example.com)');
            return;
        }
        const granted = await requestHostPermission(url);
        if (!granted) {
            setError('Permission to access this host was denied. Allow it to connect.');
            return;
        }
        setError(null);
        const newSettings = { apiUrl: url, apiKey: key, adaptiveHeight };
        await saveSettings(newSettings);
        setSaved(true);
        setTimeout(() => {
            setSaved(false);
            onSaved(newSettings);
        }, 900);
    }

    async function handleTest() {
        const url = apiUrl.trim(),
            key = apiKey.trim();
        if (!url || !key) return;
        setTesting(true);
        setTestResult(null);
        try {
            const granted = await requestHostPermission(url);
            if (!granted) {
                setTestResult('fail');
                return;
            }
            const res = await fetch(`${url.replace(/\/$/, '')}/api/v1/lists`, {
                headers: { Authorization: `Bearer ${key}` },
            });
            setTestResult(res.ok ? 'ok' : 'fail');
        } catch {
            setTestResult('fail');
        } finally {
            setTesting(false);
        }
    }

    return (
        <div className="flex flex-col gap-0 h-full overflow-y-auto">
            {/* API section */}
            <div className="px-4 pt-3 pb-4 flex flex-col gap-3.5">
                <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[var(--text-tertiary)]">
                    API Connection
                </p>

                {/* URL field */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="s-apiUrl"
                        className="text-[12px] font-medium text-[var(--text-secondary)]"
                    >
                        Karakeep Instance URL
                    </label>
                    <input
                        id="s-apiUrl"
                        type="url"
                        placeholder="https://karakeep.example.com"
                        value={apiUrl}
                        onChange={(e) => {
                            setApiUrl(e.target.value);
                            setTestResult(null);
                        }}
                        spellCheck={false}
                        autoComplete="off"
                        className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-primary)] text-[12.5px] font-mono outline-none w-full transition-all duration-150 placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:shadow-[0_0_0_3px_var(--accent-glow)]"
                    />
                </div>

                {/* Key field */}
                <div className="flex flex-col gap-1.5">
                    <label
                        htmlFor="s-apiKey"
                        className="text-[12px] font-medium text-[var(--text-secondary)]"
                    >
                        API Key
                    </label>
                    <input
                        id="s-apiKey"
                        type="password"
                        placeholder="kk_••••••••••••••••••••••••"
                        value={apiKey}
                        onChange={(e) => {
                            setApiKey(e.target.value);
                            setTestResult(null);
                        }}
                        spellCheck={false}
                        autoComplete="off"
                        className="bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] px-3 py-2 text-[var(--text-primary)] text-[12.5px] font-mono outline-none w-full transition-all duration-150 placeholder:text-[var(--text-tertiary)] focus:border-[var(--border-strong)] focus:shadow-[0_0_0_3px_var(--accent-glow)]"
                    />
                    <span className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                        Generate API Key in Karakeep → Settings → API Keys
                    </span>
                </div>

                {error && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-[var(--radius-sm)] text-[12px] text-[var(--color-error)]">
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="shrink-0"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" />
                        </svg>
                        {error}
                    </div>
                )}

                {testResult === 'ok' && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--success-bg)] border border-[var(--success-border)] rounded-[var(--radius-sm)] text-[12px] text-[var(--color-success)]">
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            className="shrink-0"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="9 12 11 14 15 10" />
                        </svg>
                        Connected successfully!
                    </div>
                )}
                {testResult === 'fail' && (
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-[var(--error-bg)] border border-[var(--error-border)] rounded-[var(--radius-sm)] text-[12px] text-[var(--color-error)]">
                        <svg
                            width="13"
                            height="13"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            className="shrink-0"
                        >
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" />
                        </svg>
                        Connection failed. Check URL and API key.
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-2 pt-0.5">
                    <button
                        onClick={handleTest}
                        disabled={testing || !apiUrl || !apiKey}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-[var(--radius-md)] text-[12.5px] font-medium text-[var(--text-secondary)] hover:bg-[var(--bg-active)] hover:border-[var(--border-strong)] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 cursor-pointer"
                    >
                        {testing ? (
                            <>
                                <svg
                                    width="12"
                                    height="12"
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
                                            dur="0.7s"
                                            repeatCount="indefinite"
                                        />
                                    </path>
                                </svg>
                                Testing…
                            </>
                        ) : (
                            'Test connection'
                        )}
                    </button>

                    <button
                        onClick={handleSave}
                        className="flex items-center gap-1.5 px-3.5 py-2 bg-[var(--accent)] text-[var(--accent-text-on)] rounded-[var(--radius-md)] text-[12.5px] font-semibold hover:opacity-85 active:scale-[0.97] transition-all duration-150 cursor-pointer"
                    >
                        {saved ? (
                            <>
                                <svg
                                    width="12"
                                    height="12"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                >
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                                Saved
                            </>
                        ) : (
                            'Save settings'
                        )}
                    </button>
                </div>
            </div>

            <div className="mx-4 h-px bg-[var(--border-subtle)]" />

            {/* Appearance section */}
            <div className="px-4 pt-3 pb-3 flex flex-col gap-2">
                <p className="text-[11px] font-semibold tracking-[0.06em] uppercase text-[var(--text-tertiary)]">
                    Appearance
                </p>
                <button
                    onClick={() => setAdaptiveHeight((v) => !v)}
                    className="flex items-center justify-between gap-3 px-0 py-1.5 w-full text-left bg-transparent border-none cursor-pointer group"
                >
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[12.5px] font-medium text-[var(--text-primary)]">
                            Adaptive height
                        </span>
                        <span className="text-[11px] text-[var(--text-tertiary)] leading-relaxed">
                            Popup expands to 80% of screen height
                        </span>
                    </div>
                    {/* Toggle switch */}
                    <div
                        className="relative shrink-0 w-8 h-[18px] rounded-full transition-colors duration-200"
                        style={{
                            background: adaptiveHeight ? 'var(--accent)' : 'var(--border-default)',
                        }}
                    >
                        <div
                            className="absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-transform duration-200"
                            style={{
                                transform: adaptiveHeight ? 'translateX(18px)' : 'translateX(2px)',
                            }}
                        />
                    </div>
                </button>
            </div>

            <div className="mx-4 h-px bg-[var(--border-subtle)]" />

            <div className="px-4 py-3 text-center">
                <span className="text-[11px] text-[var(--text-tertiary)] font-mono">
                    Karakeep Quick Extension v1.0.0
                </span>
            </div>
        </div>
    );
}
